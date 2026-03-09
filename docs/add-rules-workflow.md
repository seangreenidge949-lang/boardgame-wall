# boardgame-wall 批量添加桌游规则 — 标准流程

## 核心路径（4 步）

### Step 1：获取规则原文

**优先级**：
1. 用户直接提供规则书图片/PDF → 最可靠
2. 出版商官网 PDF → `WebSearch` 搜 `"{游戏英文名}" official rulebook PDF site:zmangames.com OR site:riograndegames.com OR site:boardgamegeek.com`
3. BGG 文件区 → `https://boardgamegeek.com/boardgame/{bggId}/files` 通常有官方规则 PDF
4. 中文规则 → 搜 `"{中文名}" 规则书 PDF` 或 `"{中文名}" 完整规则`

**处理方式**：
- PDF → `pdftotext` 提取全文（Bash 工具）
- 图片 → 直接用 Read 工具读取图片，Claude 多模态识别
- 网页 → WebFetch 抓取

### Step 2：生成三层内容

参考已有文件大小基准：幽港迷城 32KB、波多黎各 26KB、瘟疫危机 19KB。

| 字段 | 字数 | 要求 |
|------|------|------|
| `summary` | 200-400 字 | 让人想玩的 hook；突出独特机制、适合人群、单局时间；Markdown 加粗重点 |
| `detailed` | 1500-2000 字 | 从未玩过的人读完能上手；结构：设置 → 回合流程 → 核心机制 → 胜负条件；用表格列角色/建筑 |
| `fullText` | 完整 | 规则书原文的忠实中文整理；含全部数值表格、角色列表、边角规则、FAQ；Markdown 格式 |

**内容规范**：
- 中文为主，专业术语附英文：`爆发（Outbreak）`
- `summary` 不要学术化，要有感染力
- `detailed` 省略组件清单和冷门变体，聚焦可玩性
- `fullText` 完整保留所有数值、所有规则细节

### Step 3：写入文件

```bash
# 1. 创建规则 JSON（Write 工具）
~/boardgame-wall/data/rules/{bggId}.json

# 2. 更新 games.json（先 Read 再 Edit）
# 用 Grep 找到目标行号，Read 该区域，然后 Edit
grep -n '"hasRules": false' 附近找到对应 ID 的行

# 3. 验证
python3 -c "import json; json.load(open('data/rules/{bggId}.json'))" && echo "OK"
python3 -c "import json; games=json.load(open('data/games.json')); print([(g['id'],g['hasRules']) for g in games if g['id']=={bggId}])"
```

### Step 4：验证清单

- [ ] JSON 格式合法（python3 解析无报错）
- [ ] `gameId` 与文件名一致
- [ ] `hasRules` 已改为 `true`
- [ ] `images` 字段存在（即使为空数组）
- [ ] `fullText` 含完整规则（非摘要）

## 批量执行优化

### 并行写入
一次可同时处理 2-3 款游戏（Write 工具支持并行），但 games.json 的 Edit 需串行。

### Prompt 模板（给 Claude 的指令）

```
请为以下桌游创建完整规则 JSON：

游戏：{中文名}（{英文名}）
BGG ID：{bggId}
规则来源：{来源描述}

要求：
1. 参考 ~/boardgame-wall/data/rules/174430.json 的格式
2. summary 200-400字，让人想玩
3. detailed 1500-2000字，读完能上手
4. fullText 完整规则的中文 Markdown 整理
5. images 暂为空数组
6. 写入 ~/boardgame-wall/data/rules/{bggId}.json
7. 更新 games.json 中 hasRules 为 true
8. 运行验证命令确认
```

### 优先级建议

按以下顺序处理效率最高：
1. **规则简单的经典游戏**（卡坦岛、车票之旅、卡卡颂）→ 规则网上容易找，内容短
2. **热门中等复杂度**（方舟动物园、展翅翱翔、七大奇迹对决）→ 中文资源多
3. **重度策略游戏**（历史巨轮、沙丘帝国、暮光挣扎）→ 规则长，fullText 工作量大

## 关键文件

- 规则 JSON 目录：`~/boardgame-wall/data/rules/`
- 游戏列表：`~/boardgame-wall/data/games.json`
- 参考文件：`~/boardgame-wall/data/rules/174430.json`（幽港迷城，质量标杆）

## 耗时估算

| 复杂度 | 代表游戏 | 预计耗时/款 |
|--------|----------|------------|
| 轻量（规则 <10 页） | 卡坦岛、矮人矿坑 | 5-10 分钟 |
| 中等（10-20 页） | 方舟动物园、瘟疫危机 | 10-20 分钟 |
| 重度（>20 页） | 幽港迷城、历史巨轮 | 20-40 分钟 |

**瓶颈在规则获取，不在 JSON 生成**。如果用户能提前准备好规则书图片/PDF，单次对话可批量处理 3-5 款。
