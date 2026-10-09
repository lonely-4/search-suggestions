import handler from './index.ts'

export async function responseAsHttp(request: Request): Promise<Response> {
	const url = new URL(request.url)
	const params = new URLSearchParams(url.searchParams)

	const result = await handler({
		q: params.get('q') ?? '',
		lang: params.get('l') ?? 'en',
		with: params.get('with') ?? 'duckduckgo',
	})

	return new Response(JSON.stringify(result), {
		headers: {
			'Content-Type': 'application/json',
			'Access-Control-Allow-Origin': '*',
		},
	})
}
