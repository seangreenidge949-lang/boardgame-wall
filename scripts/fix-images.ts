/**
 * 为游戏数据添加可用的封面图片 URL
 * 使用 picsum.photos 的 seed 模式确保每个游戏有固定但不同的图片
 */

import { readFileSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'

const DATA_PATH = resolve(dirname(new URL(import.meta.url).pathname), '../data/games.json')

const games = JSON.parse(readFileSync(DATA_PATH, 'utf-8'))

const updated = games.map((g: any) => ({
  ...g,
  thumbnail: `https://picsum.photos/seed/bg${g.id}/300/400`,
  image: `https://picsum.photos/seed/bg${g.id}/640/400`,
}))

writeFileSync(DATA_PATH, JSON.stringify(updated, null, 2), 'utf-8')
console.log(`✅ Updated ${updated.length} games with placeholder images`)
