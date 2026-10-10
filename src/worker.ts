import handler from './index.ts'
import spec from '../openapi.json' with { type: 'json' }
import home from './home.html' with { type: 'text' }
import docs from './docs.html' with { type: 'text' }
import type {} from '@cloudflare/workers-types'

const jsonHeaders = {
	'Content-Type': 'application/json; charset=utf-8',
	'Access-Control-Allow-Origin': '*',
}

const htmlHeaders = {
	'Content-Type': 'text/html; charset=utf-8',
}

export default {
	async fetch(request: Request) {
		const upgradeHeader = request.headers.get('Upgrade') === 'websocket'
		const url = new URL(request.url)

		if (request.method === 'GET' && !upgradeHeader) {
			if (url.pathname === '/openapi.json') {
				return new Response(JSON.stringify(spec), { headers: jsonHeaders })
			}

			if (url.pathname === '/docs' || url.pathname === '/docs/') {
				return new Response(docs, { headers: htmlHeaders })
			}

			if (url.pathname === '/' && !url.searchParams.has('q') && wantsHtml(request)) {
				return new Response(home, { headers: htmlHeaders })
			}

			if (url.pathname !== '/') {
				return new Response('', { status: 404 })
			}

			return await responseAsHttp(request)
		}

		if ((request.method === 'WS' || (request.method === 'GET' && upgradeHeader)) && url.pathname === '/') {
			return createWebsocket()
		}

		return new Response('', { status: 405 })
	},
}

function wantsHtml(request: Request): boolean {
	return (request.headers.get('Accept') ?? '').includes('text/html')
}

async function responseAsHttp(request: Request): Promise<Response> {
	const url = new URL(request.url)
	const params = new URLSearchParams(url.searchParams)

	const result = await handler({
		q: params.get('q') ?? '',
		lang: params.get('l') ?? 'en',
		with: params.get('with') ?? 'duckduckgo',
	})

	return new Response(JSON.stringify(result), { headers: jsonHeaders })
}

function createWebsocket() {
	let subRequestCount = 0
	const webSocketPair = new WebSocketPair()
	const [client, server] = Object.values(webSocketPair)

	server.accept()

	server.addEventListener(
		'message',
		debounce((e) => {
			const event = e as MessageEvent

			if (subRequestCount++ === 50) {
				subRequestCount = 0
				server.send(JSON.stringify({ error: 'subrequest limit reached' }))
				server.close()
				return
			}

			try {
				const data = JSON.parse(event.data.toString() ?? '{}')

				const response = handler({
					q: data.q ?? '',
					with: data.with ?? '',
					lang: data.lang ?? '',
				})

				response.then((response) => {
					server.send(JSON.stringify(response))
				})
			} catch (error) {
				console.error(error)
				server.send('{error: ' + error + '}')
			}
		}, 150),
	)

	return new Response(null, {
		//@ts-ignore -> 'webSocket' does not exist in type 'ResponseInit'
		//			 -> Cloudflare workers handles websocket but not in types ?
		webSocket: client,
		status: 101,
	})
}

function debounce(callback: (...args: unknown[]) => unknown, delay: number) {
	let timer: ReturnType<typeof setTimeout> | undefined

	return function (...args: unknown[]) {
		clearTimeout(timer)
		timer = setTimeout(() => callback(...args), delay)
	}
}
