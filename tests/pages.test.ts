import { expect } from '@std/expect'
import worker from '../src/worker.ts'
import app from '../src/server.ts'

function get(path: string, accept = '*/*') {
	return worker.fetch(new Request('http://localhost' + path, { headers: { Accept: accept } }))
}

function getApp(path: string, accept = '*/*') {
	return app.fetch(new Request('https://suggestions.example' + path, { headers: { Accept: accept } }))
}

Deno.test('Homepage for browsers', async () => {
	const response = await get('/', 'text/html')
	expect(response.status).toBe(200)
	expect(response.headers.get('content-type')).toContain('text/html')
	const html = await response.text()
	expect(html).toContain('搜索建议')
	expect(html).toContain('prefers-color-scheme: dark')
	expect(html).toContain('href="/docs"')
})

Deno.test('API stays JSON without an html accept header', async () => {
	const response = await get('/')
	expect(response.headers.get('content-type')).toContain('application/json')
	expect(await response.json()).toEqual([])
})

Deno.test('Query still returns JSON to browsers', async () => {
	const response = await get('/?q=', 'text/html')
	expect(response.headers.get('content-type')).toContain('application/json')
})

Deno.test('OpenAPI document', async () => {
	const response = await get('/openapi.json')
	expect(response.status).toBe(200)
	const spec = await response.json() as {
		openapi: string
		paths: { '/': { get: { parameters: { name: string }[] } } }
	}
	expect(spec.openapi).toBe('3.0.3')
	expect(spec.paths['/'].get.parameters.map((item) => item.name)).toEqual(['q', 'l', 'with'])
})

Deno.test('Swagger docs', async () => {
	const response = await get('/docs')
	expect(response.status).toBe(200)
	const html = await response.text()
	expect(html).toContain('swagger-ui-bundle.js')
	expect(html).toContain("url: '/openapi.json'")
	expect(html).toContain('prefers-color-scheme: dark')

	const slash = await get('/docs/')
	expect(slash.status).toBe(200)
})

Deno.test('Unknown path', async () => {
	const response = await get('/missing')
	expect(response.status).toBe(404)
})

Deno.test('Vercel paths for the homepage, docs, and spec', async () => {
	const home = await getApp('/api', 'text/html')
	expect(home.headers.get('content-type')).toContain('text/html')
	expect(await home.text()).toContain('搜索建议')

	const docs = await getApp('/api/docs')
	expect(docs.status).toBe(200)
	expect(await docs.text()).toContain('swagger-ui-bundle.js')

	const spec = await getApp('/openapi.json')
	expect(spec.status).toBe(200)
	expect((await spec.json() as { openapi: string }).openapi).toBe('3.0.3')

	const api = await getApp('/api')
	expect(api.headers.get('content-type')).toContain('application/json')
	expect(await api.json()).toEqual([])
})
