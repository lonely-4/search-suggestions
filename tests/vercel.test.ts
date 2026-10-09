import { expect } from '@std/expect'
import app from '../src/server.ts'

Deno.test('vercel function returns an empty list when q is missing', async () => {
	const response = await app.fetch(new Request('https://suggestions.example/'))
	expect(response.status).toBe(200)
	expect(response.headers.get('content-type')).toBe('application/json')
	expect(response.headers.get('access-control-allow-origin')).toBe('*')
	expect(await response.json()).toEqual([])
})

Deno.test('vercel function rejects unsupported methods', async () => {
	const response = await app.fetch(new Request('https://suggestions.example/', { method: 'POST' }))
	expect(response.status).toBe(405)
})

Deno.test('vercel function answers CORS preflight', async () => {
	const response = await app.fetch(new Request('https://suggestions.example/', { method: 'OPTIONS' }))
	expect(response.status).toBe(204)
	expect(response.headers.get('access-control-allow-methods')).toContain('GET')
})

Deno.test('vercel function does not accept Cloudflare-style websocket upgrades', async () => {
	const response = await app.fetch(
		new Request('https://suggestions.example/', { headers: { Upgrade: 'websocket' } }),
	)
	expect(response.status).toBe(501)
})
