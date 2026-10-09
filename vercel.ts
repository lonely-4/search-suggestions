import { routes, type VercelConfig } from '@vercel/config/v1'

// Bundled Node.js Function at api/index.js. The public API stays at `/`.
export const config: VercelConfig = {
	framework: null,
	fluid: true,
	buildCommand: '',
	installCommand: 'npm install',
	rewrites: [routes.rewrite('/', '/api')],
}
