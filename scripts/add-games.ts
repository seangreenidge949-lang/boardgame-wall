/**
 * 批量添加新桌游脚本
 * 输入：中文桌游名列表 → Claude 翻译 → BGG 搜索 → 获取详情 → 合并到 games.json
 *
 * 使用方式：
 *   1. 在下方 GAMES_TO_ADD 数组中填入想添加的桌游中文名
 *   2. 设置环境变量 CLAUDE_API_KEY（可选 CLAUDE_BASE_URL）
 *   3. 运行：npx tsx scripts/add-games.ts
 *
 * 注意：使用 Playwright 绕过 BGG 的 Cloudflare 保护
 */

import { readFileSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import Anthropic from '@anthropic-ai/sdk'
import { chromium, type Browser, type Page } from 'playwright'

// ============================================================
// 🎯 在这里填入要添加的桌游中文名
// ============================================================
const GAMES_TO_ADD: string[] = [
  '潮汐之刃2',
  'Trismegistus The Ultimate Formula',
  '卓越的洛伦佐合集版',
  '奥丁的盛宴',
]

// ============================================================

const BGG_API = 'https://boardgamegeek.com/xmlapi2'
const BATCH_SIZE = 20
const DATA_FILE = resolve(dirname(new URL(import.meta.url).pathname), '../data/games.json')

interface GameData {
  id: number
  rank: number
  name: string
  nameCn: string
  year: number
  rating: number
  players: string
  playingTime: string
  comment: string
  thumbnail: string
  image: string
  hasRules: boolean
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

// ----------------------------------------------------------
// Playwright BGG 访问层
// ----------------------------------------------------------
let _browser: Browser | null = null
let _page: Page | null = null

async function getBrowserPage(): Promise<Page> {
  if (!_browser) {
    console.log('🌐 启动浏览器...')
    _browser = await chromium.launch({ headless: true })
    _page = await _browser.newPage()
  }
  return _page!
}

async function closeBrowser(): Promise<void> {
  if (_browser) {
    await _browser.close()
    _browser = null
    _page = null
  }
}

/**
 * 用 Playwright 访问 BGG API URL，返回 XML 文本
 * Cloudflare challenge 由浏览器自动完成
 */
async function fetchBggXml(url: string, retries = 3): Promise<string> {
  const page = await getBrowserPage()

  for (let i = 0; i < retries; i++) {
    try {
      const response = await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 })
      if (!response) throw new Error('No response')

      const status = response.status()
      if (status === 429) {
        console.log(`  ⏳ 限流，等待 ${(i + 1) * 10}s...`)
        await sleep((i + 1) * 10000)
        continue
      }

      // BGG XML API 返回的 XML 被浏览器包裹在 <html><body><pre> 中
      const content = await page.content()
      const preMatch = content.match(/<pre[^>]*>([\s\S]*?)<\/pre>/i)
      if (preMatch) {
        return preMatch[1]
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&amp;/g, '&')
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
      }

      // 有些情况下 XML 直接在 body 中
      const bodyMatch = content.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
      if (bodyMatch) {
        return bodyMatch[1]
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&amp;/g, '&')
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
      }

      return content
    } catch (e) {
      if (i === retries - 1) throw e
      console.log(`  🔄 重试 ${i + 1}/${retries}...`)
      await sleep(3000)
    }
  }
  throw new Error('Max retries')
}

// ----------------------------------------------------------
// Step 1: 中文名 → 英文名（Claude API）
// ----------------------------------------------------------
async function translateNames(
  cnNames: string[],
  client: Anthropic
): Promise<Map<string, string>> {
  console.log(`\n🌐 翻译 ${cnNames.length} 个中文桌游名...`)

  const response = await client.messages.create({
    model: process.env.CLAUDE_MODEL || 'claude-sonnet-4-5',
    max_tokens: 2048,
    messages: [
      {
        role: 'user',
        content: `你是桌游专家。请将以下中文桌游名翻译为 BoardGameGeek (BGG) 上使用的官方英文名。

要求：
- 返回 JSON 数组，每项格式 {"cn": "中文名", "en": "English Name"}
- 使用 BGG 上的精确名称（注意副标题、版本号等）
- 如果输入本身就是英文名，直接保留
- 例如：璀璨宝石 → Splendor，农场主 → Agricola，花砖物语 → Azul

桌游列表：
${cnNames.map((n, i) => `${i + 1}. ${n}`).join('\n')}

只返回 JSON 数组，不要其他内容。`,
      },
    ],
  })

  const text =
    response.content[0].type === 'text' ? response.content[0].text : ''

  const jsonMatch = text.match(/\[[\s\S]*\]/)
  if (!jsonMatch) {
    throw new Error(`Claude 翻译返回格式异常:\n${text}`)
  }

  const translations: { cn: string; en: string }[] = JSON.parse(jsonMatch[0])
  const result = new Map<string, string>()
  for (const t of translations) {
    result.set(t.cn, t.en)
    console.log(`  ${t.cn} → ${t.en}`)
  }
  return result
}

// ----------------------------------------------------------
// Step 2: 英文名 → BGG ID（BGG Search API via Playwright）
// ----------------------------------------------------------
async function searchBggId(englishName: string): Promise<number | null> {
  const exactUrl = `${BGG_API}/search?query=${encodeURIComponent(englishName)}&type=boardgame&exact=1`
  const exactXml = await fetchBggXml(exactUrl)

  let idMatch = exactXml.match(/<item\s[^>]*id="(\d+)"/)
  if (idMatch) return parseInt(idMatch[1])

  console.log(`  ⚠️ 精确搜索 "${englishName}" 无结果，尝试模糊搜索...`)
  await sleep(2000)
  const fuzzyUrl = `${BGG_API}/search?query=${encodeURIComponent(englishName)}&type=boardgame`
  const fuzzyXml = await fetchBggXml(fuzzyUrl)

  idMatch = fuzzyXml.match(/<item\s[^>]*id="(\d+)"/)
  if (idMatch) return parseInt(idMatch[1])

  return null
}

// ----------------------------------------------------------
// Step 3: 批量获取游戏详情（via Playwright）
// ----------------------------------------------------------
async function fetchGameDetails(
  items: { id: number; nameCn: string }[]
): Promise<GameData[]> {
  const games: GameData[] = []
  const batches: { id: number; nameCn: string }[][] = []

  for (let i = 0; i < items.length; i += BATCH_SIZE) {
    batches.push(items.slice(i, i + BATCH_SIZE))
  }

  for (let b = 0; b < batches.length; b++) {
    const batch = batches[b]
    const ids = batch.map((i) => i.id).join(',')
    console.log(
      `\n🔍 批次 ${b + 1}/${batches.length}: 获取 ${batch.length} 个游戏详情...`
    )

    const xml = await fetchBggXml(`${BGG_API}/thing?id=${ids}&stats=1`)

    const itemPattern = /<item\s[^>]*>([\s\S]*?)<\/item>/g
    let itemMatch
    while ((itemMatch = itemPattern.exec(xml)) !== null) {
      const block = itemMatch[0]
      const idMatch = block.match(/id="(\d+)"/)
      if (!idMatch) continue

      const id = parseInt(idMatch[1])
      const entry = batch.find((i) => i.id === id)
      if (!entry) continue

      const nameMatch = block.match(
        /<name\s+type="primary"\s+value="([^"]*)"/
      )
      const name = nameMatch?.[1] || 'Unknown'

      const yearMatch = block.match(/<yearpublished\s+value="(\d+)"/)
      const year = yearMatch ? parseInt(yearMatch[1]) : 0

      const thumbMatch = block.match(/<thumbnail>(.*?)<\/thumbnail>/)
      const thumbnail = thumbMatch?.[1]?.trim() || ''
      const imgMatch = block.match(/<image>(.*?)<\/image>/)
      const image = imgMatch?.[1]?.trim() || ''

      const avgMatch = block.match(/<average\s+value="([^"]*)"/)
      const rating = avgMatch ? parseFloat(avgMatch[1]) : 0

      const minP = block.match(/<minplayers\s+value="(\d+)"/)
      const maxP = block.match(/<maxplayers\s+value="(\d+)"/)
      const minPlayers = minP ? parseInt(minP[1]) : 0
      const maxPlayers = maxP ? parseInt(maxP[1]) : 0
      const players =
        minPlayers === maxPlayers
          ? `${minPlayers}`
          : `${minPlayers}-${maxPlayers}`

      const timeMatch = block.match(/<playingtime\s+value="(\d+)"/)
      const playingTime = timeMatch?.[1] || '0'

      const rankMatch = block.match(
        /<rank[^>]*name="boardgame"[^>]*value="(\d+)"/
      )
      const rank = rankMatch ? parseInt(rankMatch[1]) : 99999

      games.push({
        id,
        rank,
        name,
        nameCn: entry.nameCn,
        year,
        rating: Math.round(rating * 10) / 10,
        players,
        playingTime,
        comment: '',
        thumbnail,
        image,
        hasRules: false,
      })
    }

    if (b < batches.length - 1) {
      await sleep(3000)
    }
  }

  return games
}

// ----------------------------------------------------------
// Step 4: 生成中文评语（Claude API）
// ----------------------------------------------------------
async function generateComments(
  games: GameData[],
  client: Anthropic
): Promise<void> {
  console.log(`\n💬 为 ${games.length} 个游戏生成中文评语...`)

  const gameList = games
    .map(
      (g) =>
        `- ${g.nameCn}（${g.name}，${g.year}年，评分 ${g.rating}，${g.players}人，${g.playingTime}分钟）`
    )
    .join('\n')

  const response = await client.messages.create({
    model: process.env.CLAUDE_MODEL || 'claude-sonnet-4-5',
    max_tokens: 4096,
    messages: [
      {
        role: 'user',
        content: `你是资深桌游评论家。请为以下桌游各写一句中文评语（15-30字），风格生动有趣，突出游戏核心特色。

${gameList}

返回 JSON 数组，格式 [{"name": "英文名", "comment": "评语"}]。只返回 JSON，不要其他内容。`,
      },
    ],
  })

  const text =
    response.content[0].type === 'text' ? response.content[0].text : ''
  const jsonMatch = text.match(/\[[\s\S]*\]/)
  if (!jsonMatch) {
    console.log('  ⚠️ 评语生成格式异常，使用默认评语')
    for (const g of games) {
      g.comment = generateDefaultComment(g.name, g.rating)
    }
    return
  }

  const comments: { name: string; comment: string }[] = JSON.parse(
    jsonMatch[0]
  )
  const commentMap = new Map(comments.map((c) => [c.name, c.comment]))

  for (const g of games) {
    g.comment =
      commentMap.get(g.name) || generateDefaultComment(g.name, g.rating)
    console.log(`  ${g.nameCn}: ${g.comment}`)
  }
}

function generateDefaultComment(name: string, rating: number): string {
  if (rating >= 8.5) return `评分高达 ${rating}，${name} 是桌游界的殿堂级作品`
  if (rating >= 8.0)
    return `${name} 以出色的机制设计赢得了全球玩家的喜爱`
  if (rating >= 7.5) return `${name} 是策略与趣味的完美结合`
  return `${name} 为桌游世界带来了独特的体验`
}

// ----------------------------------------------------------
// Main
// ----------------------------------------------------------
async function main() {
  if (GAMES_TO_ADD.length === 0) {
    console.log('⚠️ GAMES_TO_ADD 为空，请在脚本中添加要新增的桌游中文名')
    process.exit(0)
  }

  console.log('🎲 批量添加桌游（Playwright 模式）')
  console.log('='.repeat(50))
  console.log(`📋 待添加: ${GAMES_TO_ADD.length} 个游戏`)

  const existing: GameData[] = JSON.parse(readFileSync(DATA_FILE, 'utf-8'))
  const existingIds = new Set(existing.map((g) => g.id))
  const existingNamesCn = new Set(existing.map((g) => g.nameCn))

  const toAdd: string[] = []
  for (const name of GAMES_TO_ADD) {
    if (existingNamesCn.has(name)) {
      console.log(`  ⏭️ "${name}" 已存在，跳过`)
    } else {
      toAdd.push(name)
    }
  }

  if (toAdd.length === 0) {
    console.log('\n✅ 所有游戏已存在于列表中，无需添加')
    process.exit(0)
  }

  console.log(`\n📝 去重后需添加: ${toAdd.length} 个游戏`)

  const apiKey = process.env.CLAUDE_API_KEY
  if (!apiKey) {
    console.error('❌ 请设置环境变量 CLAUDE_API_KEY')
    process.exit(1)
  }
  const client = new Anthropic({
    apiKey,
    baseURL: process.env.CLAUDE_BASE_URL || undefined,
  })

  try {
    const translations = await translateNames(toAdd, client)

    console.log(`\n🔎 搜索 BGG ID...`)
    const foundItems: { id: number; nameCn: string }[] = []
    const notFound: string[] = []

    for (const cnName of toAdd) {
      const enName = translations.get(cnName)
      if (!enName) {
        console.log(`  ❌ "${cnName}" 无翻译结果`)
        notFound.push(cnName)
        continue
      }

      const bggId = await searchBggId(enName)
      if (bggId === null) {
        console.log(`  ❌ "${cnName}"（${enName}）在 BGG 上未找到`)
        notFound.push(cnName)
      } else if (existingIds.has(bggId)) {
        console.log(`  ⏭️ "${cnName}"（ID: ${bggId}）已存在（ID 重复），跳过`)
      } else {
        console.log(`  ✅ ${cnName} → ${enName} → BGG ID: ${bggId}`)
        foundItems.push({ id: bggId, nameCn: cnName })
      }

      await sleep(2000)
    }

    if (foundItems.length === 0) {
      console.log('\n❌ 未找到任何可添加的游戏')
      if (notFound.length > 0) {
        console.log(`  未找到: ${notFound.join(', ')}`)
      }
      process.exit(1)
    }

    const newGames = await fetchGameDetails(foundItems)
    await generateComments(newGames, client)

    console.log('\n📝 合并数据...')
    const merged = [...existing, ...newGames]
    merged.sort((a, b) => a.rank - b.rank)

    const seen = new Set<number>()
    const deduped = merged.filter((g) => {
      if (seen.has(g.id)) return false
      seen.add(g.id)
      return true
    })

    writeFileSync(DATA_FILE, JSON.stringify(deduped, null, 2), 'utf-8')

    console.log('\n' + '='.repeat(50))
    console.log(`✅ 完成！`)
    console.log(`  原有: ${existing.length} 个游戏`)
    console.log(`  新增: ${newGames.length} 个游戏`)
    console.log(`  总计: ${deduped.length} 个游戏`)

    if (notFound.length > 0) {
      console.log(`\n⚠️ 以下游戏未找到:`)
      for (const name of notFound) {
        console.log(`  - ${name}`)
      }
    }

    console.log('\n📋 新增游戏列表:')
    for (const g of newGames) {
      console.log(
        `  ${g.nameCn}（${g.name}）- 排名 #${g.rank}，评分 ${g.rating}`
      )
    }
  } finally {
    await closeBrowser()
  }
}

main().catch(async (e) => {
  await closeBrowser()
  console.error('❌ 执行失败:', e)
  process.exit(1)
})
