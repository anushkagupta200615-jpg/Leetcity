// Codeforces support was removed. This endpoint is retired — safe to delete.
export default async function handler(): Promise<Response> {
  return new Response('Gone', { status: 410 })
}

export const config = { runtime: 'edge' }
