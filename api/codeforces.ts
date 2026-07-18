// Vercel edge function: GET /api/codeforces?cf=<method>&<params...>
// Proxies the public Codeforces API (avoids CORS). Example:
//   /api/codeforces?cf=user.info&handles=tourist
//   /api/codeforces?cf=user.status&handle=tourist&from=1&count=10000

export default async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url)
  const method = url.searchParams.get('cf')
  if (!method) return new Response('Missing cf method', { status: 400 })
  url.searchParams.delete('cf')

  const target = `https://codeforces.com/api/${method}?${url.searchParams.toString()}`
  const upstream = await fetch(target, {
    headers: { 'User-Agent': 'LeetCity/1.0' },
  })
  const text = await upstream.text()
  return new Response(text, {
    status: upstream.status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 's-maxage=600, stale-while-revalidate=3600',
    },
  })
}

export const config = { runtime: 'edge' }
