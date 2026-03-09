export const prerender = false

import Anthropic from '@anthropic-ai/sdk'
import type { APIRoute } from 'astro'

export const POST: APIRoute = async ({ request }) => {
  const { question, rulesContent, history } = await request.json()

  if (!question || !rulesContent) {
    return new Response(JSON.stringify({ error: '缺少必要参数' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const apiKey = import.meta.env.CLAUDE_API_KEY
  const baseURL = import.meta.env.CLAUDE_BASE_URL

  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'API key 未配置' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const client = new Anthropic({
    apiKey,
    ...(baseURL ? { baseURL } : {}),
  })

  const model = import.meta.env.CLAUDE_MODEL || 'claude-sonnet-4-6-20250514'

  const messages = [
    ...(history || []),
    { role: 'user' as const, content: question },
  ]

  const response = await client.messages.create({
    model,
    max_tokens: 1024,
    system: `你是桌游规则助手。基于以下规则内容回答问题。
回答时必须引用相关规则原文（用 > 引用格式）。
如果规则中没有相关内容，明确说明。
保持回答简洁准确。

规则内容：
${rulesContent}`,
    messages,
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''

  return new Response(JSON.stringify({ answer: text }), {
    headers: { 'Content-Type': 'application/json' },
  })
}
