import handler from './index.ts'
import spec from '../openapi.json' with { type: 'json' }
import home from './home.html' with { type: 'text' }
import docs from './docs.html' with { type: 'text' }

const cors = {
	'Access-Control-Allow-Origin': '*',
}

const jsonHeaders = {
	'Content-Type': 'application/json; charset=utf-8',
	...cors,
}

const htmlHeaders = {
	'Content-Type': 'text/html; charset=utf-8',
	...cors,
}

export async function responseAsHttp(request: Request): Promise<Response> {
	const url = new URL(request.url)
	const page = staticPage(url, request)
	if (page) return page

	if (!isSuggestPath(url.pathname)) {
		return new Response('', { status: 404, headers: cors })
	}

	const params = url.searchParams
	const result = await handler({
		q: params.get('q') ?? '',
		lang: params.get('l') ?? 'en',
		with: params.get('with') ?? 'duckduckgo',
	})

	return new Response(JSON.stringify(result), { headers: jsonHeaders })
}

function staticPage(url: URL, request: Request): Response | undefined {
	if (url.pathname === '/openapi.json' || url.pathname === '/api/openapi.json') {
		return new Response(JSON.stringify(spec), { headers: jsonHeaders })
	}

	if (url.pathname === '/docs' || url.pathname === '/docs/' || url.pathname === '/api/docs' || url.pathname === '/api/docs/') {
		return new Response(docs, { headers: htmlHeaders })
	}

	if (isSuggestPath(url.pathname) && !url.searchParams.has('q') && wantsHtml(request)) {
		return new Response(home, { headers: htmlHeaders })
	}
}

function isSuggestPath(pathname: string): boolean {
	return pathname === '/' || pathname === '/api' || pathname === '/api/'
}

function wantsHtml(request: Request): boolean {
	return (request.headers.get('Accept') ?? '').includes('text/html')
}
