// Vercel serverless function: POST /api/leetcode
// Forwards GraphQL requests to LeetCode with the headers it expects,
// so the browser never hits CORS. In local dev you don't need this —
// vite.config.ts proxies the same path.
//
// Deploy: push this repo to Vercel; the /api directory is picked up
// automatically. Consider adding KV caching per username later.

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  const body = await req.text()

  const upstream = await fetch('https://leetcode.com/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Referer: 'https://leetcode.com',
      Origin: 'https://leetcode.com',
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36',
    },
    body,
  })

  const text = await upstream.text()
  return new Response(text, {
    status: upstream.status,
    headers: {
      'Content-Type': 'application/json',
      // Cache identical queries at the edge for an hour.
      'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400',
    },
  })
}

export const config = { runtime: 'edge' }
