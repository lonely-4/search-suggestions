import { responseAsHttp } from '../src/http.ts'

const cors = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'GET, OPTIONS',
	'Access-Control-Allow-Headers': 'Content-Type',
}

export default {
	async fetch(request: Request): Promise<Response> {
		if (request.headers.get('Upgrade') === 'websocket') {
			return Response.json(
				{ error: 'WebSocket suggestions are served by the Cloudflare deployment' },
				{ status: 501, headers: cors },
			)
		}

		if (request.method === 'OPTIONS') {
			return new Response(null, { status: 204, headers: cors })
		}

		if (request.method !== 'GET') {
			return new Response('', { status: 405, headers: cors })
		}

		return responseAsHttp(request)
	},
}
