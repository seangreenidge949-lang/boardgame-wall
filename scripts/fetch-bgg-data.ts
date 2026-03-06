/**
 * BGG Top 100 数据爬取脚本
 * 从 BGG 排行页获取 Top 100 游戏 ID，再通过 XML API v2 获取详情
 */

import { writeFileSync, mkdirSync } from 'fs'
import { resolve, dirname } from 'path'

const BGG_BROWSE = 'https://boardgamegeek.com/browse/boardgame/page/'
const BGG_API = 'https://boardgamegeek.com/xmlapi2/thing'
const BATCH_SIZE = 20
const DELAY_MS = 5000
const OUTPUT = resolve(dirname(new URL(import.meta.url).pathname), '../data/games.json')

interface GameData {
  id: number
  rank: number
  name: string
  nameCn: string
  year: number
  rating: number
  thumbnail: string
  image: string
  players: string
  playingTime: string
  comment: string
}

// Chinese names for well-known games
const CN_NAMES: Record<number, string> = {
  174430: '暗黑地牢',
  161936: '瘟疫危机：传承 第一季',
  224517: '黄铜：伯明翰',
  167791: '历史巨轮：文明新篇章',
  187645: '星际殖民',
  233078: '糖果甜心',
  342942: '方舟：觉醒',
  220308: '地鼠大冒险',
  12333: '镰刀战争',
  169786: '旷野传说',
  291457: '暮光帝国 第四版',
  115746: '战争指环 第二版',
  28720: '波多黎各',
  3076: '卡坦岛',
  30549: '卡卡颂',
  822: '卡坦岛',
  36218: '多米尼恩',
  68448: '七大奇迹',
  31260: '农场主',
  120677: '特鲁瓦',
  182028: '深水区的领主',
  205637: '方舟新星',
  316554: '达尔文之旅',
  366013: '地下城',
}

// One-line comments for top games
const COMMENTS: Record<number, string> = {
  174430: '黑暗幻想的极致体验，每一次副本都是心跳与策略的博弈',
  161936: '改写桌游历史的传承机制，每一局都在书写独特的故事',
  224517: '工业革命时代的经济博弈，每一条运河都通向胜利',
  167791: '人类文明的缩影，用卡牌书写从古至今的辉煌史诗',
  187645: '星际探索的终极沙盒，在未知星球上建立你的帝国',
  233078: '甜蜜外表下藏着硬核策略，工人放置的巅峰之作',
  342942: '沉睡千年的方舟苏醒，合作冒险的全新标杆',
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

async function fetchWithRetry(url: string, retries = 3): Promise<string> {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'BoardgameWall/1.0 (data fetcher)' },
      })
      if (res.status === 429) {
        console.log(`  Rate limited, waiting ${(i + 1) * 10}s...`)
        await sleep((i + 1) * 10000)
        continue
      }
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`)
      }
      return await res.text()
    } catch (e) {
      if (i === retries - 1) throw e
      console.log(`  Retry ${i + 1}/${retries}...`)
      await sleep(3000)
    }
  }
  throw new Error('Max retries')
}

/** Parse BGG browse pages to get top 100 game IDs and ranks */
async function fetchTopIds(): Promise<{ id: number; rank: number }[]> {
  console.log('📋 Fetching BGG Top 100 ranking...')
  const results: { id: number; rank: number }[] = []

  for (let page = 1; page <= 2; page++) {
    console.log(`  Page ${page}/2...`)
    const html = await fetchWithRetry(`${BGG_BROWSE}${page}`)

    // Extract game IDs from href="/boardgame/ID/" patterns
    const linkPattern = /\/boardgame\/(\d+)\//g
    const rankPattern = /collection_rank"[^>]*>\s*(\d+)\s*</g
    const ids: number[] = []
    const ranks: number[] = []

    let m
    while ((m = linkPattern.exec(html)) !== null) {
      const id = parseInt(m[1])
      if (!ids.includes(id)) ids.push(id)
    }
    while ((m = rankPattern.exec(html)) !== null) {
      ranks.push(parseInt(m[1]))
    }

    // Pair IDs with ranks
    for (let i = 0; i < Math.min(ids.length, ranks.length); i++) {
      results.push({ id: ids[i], rank: ranks[i] })
    }

    if (page < 2) await sleep(2000)
  }

  // Deduplicate and sort
  const seen = new Set<number>()
  const unique = results.filter(r => {
    if (seen.has(r.id)) return false
    seen.add(r.id)
    return true
  })
  unique.sort((a, b) => a.rank - b.rank)

  console.log(`  Found ${unique.length} games`)
  return unique.slice(0, 100)
}

/** Fetch game details from BGG XML API v2 */
async function fetchGameDetails(items: { id: number; rank: number }[]): Promise<GameData[]> {
  const games: GameData[] = []
  const batches: { id: number; rank: number }[][] = []

  for (let i = 0; i < items.length; i += BATCH_SIZE) {
    batches.push(items.slice(i, i + BATCH_SIZE))
  }

  for (let b = 0; b < batches.length; b++) {
    const batch = batches[b]
    const ids = batch.map((i) => i.id).join(',')
    console.log(`🔍 Batch ${b + 1}/${batches.length}: fetching ${batch.length} games...`)

    const xml = await fetchWithRetry(`${BGG_API}?id=${ids}&stats=1`)

    // Split into individual <item> blocks
    const itemPattern = /<item\s[^>]*>([\s\S]*?)<\/item>/g
    let itemMatch
    while ((itemMatch = itemPattern.exec(xml)) !== null) {
      const block = itemMatch[0]
      const idMatch = block.match(/id="(\d+)"/)
      if (!idMatch) continue

      const id = parseInt(idMatch[1])
      const rankEntry = batch.find((i) => i.id === id)
      if (!rankEntry) continue

      // Primary name
      const nameMatch = block.match(/<name\s+type="primary"\s+value="([^"]*)"/)
      const name = nameMatch?.[1] || 'Unknown'

      // Year
      const yearMatch = block.match(/<yearpublished\s+value="(\d+)"/)
      const year = yearMatch ? parseInt(yearMatch[1]) : 0

      // Images
      const thumbMatch = block.match(/<thumbnail>(.*?)<\/thumbnail>/)
      const thumbnail = thumbMatch?.[1]?.trim() || ''
      const imgMatch = block.match(/<image>(.*?)<\/image>/)
      const image = imgMatch?.[1]?.trim() || ''

      // Rating
      const avgMatch = block.match(/<average\s+value="([^"]*)"/)
      const rating = avgMatch ? parseFloat(avgMatch[1]) : 0

      // Players
      const minP = block.match(/<minplayers\s+value="(\d+)"/)
      const maxP = block.match(/<maxplayers\s+value="(\d+)"/)
      const minPlayers = minP ? parseInt(minP[1]) : 0
      const maxPlayers = maxP ? parseInt(maxP[1]) : 0
      const players = minPlayers === maxPlayers ? `${minPlayers}` : `${minPlayers}-${maxPlayers}`

      // Playing time
      const timeMatch = block.match(/<playingtime\s+value="(\d+)"/)
      const playingTime = timeMatch?.[1] || '0'

      games.push({
        id,
        rank: rankEntry.rank,
        name,
        nameCn: CN_NAMES[id] || '',
        year,
        rating: Math.round(rating * 10) / 10,
        thumbnail,
        image,
        players,
        playingTime,
        comment: COMMENTS[id] || generateComment(name, rating),
      })
    }

    if (b < batches.length - 1) {
      console.log(`  Waiting ${DELAY_MS / 1000}s...`)
      await sleep(DELAY_MS)
    }
  }

  games.sort((a, b) => a.rank - b.rank)
  return games
}

/** Generate a generic comment based on game name and rating */
function generateComment(name: string, rating: number): string {
  if (rating >= 8.5) return `评分高达 ${rating}，${name} 是桌游界的殿堂级作品`
  if (rating >= 8.0) return `${name} 以出色的机制设计赢得了全球玩家的喜爱`
  if (rating >= 7.5) return `${name} 是策略与趣味的完美结合`
  return `${name} 为桌游世界带来了独特的体验`
}

async function main() {
  console.log('🎲 BoardGameGeek Top 100 数据爬取')
  console.log('='.repeat(40))

  const topIds = await fetchTopIds()
  if (topIds.length === 0) {
    console.error('❌ 未能获取排名数据，使用备用 ID 列表')
    const fallbackIds = [
      174430, 161936, 224517, 167791, 187645, 233078, 342942, 220308,
      291457, 115746, 182028, 169786, 205637, 316554, 366013, 192291,
      312484, 246900, 284083, 266192, 164928, 173346, 237182, 193738,
      199792, 295770, 162886, 276025, 251247, 266810, 124361, 15987,
      28720, 72125, 12333, 36218, 68448, 31260, 3076, 30549,
      121921, 35677, 2651, 822, 13, 9209, 40834, 37111, 43015, 25613,
    ]
    for (let i = 0; i < fallbackIds.length; i++) {
      topIds.push({ id: fallbackIds[i], rank: i + 1 })
    }
  }

  const games = await fetchGameDetails(topIds)

  mkdirSync(dirname(OUTPUT), { recursive: true })
  writeFileSync(OUTPUT, JSON.stringify(games, null, 2), 'utf-8')

  console.log('='.repeat(40))
  console.log(`✅ 完成！已保存 ${games.length} 个游戏到 data/games.json`)
}

main().catch((e) => {
  console.error('❌ 爬取失败:', e)
  process.exit(1)
})
