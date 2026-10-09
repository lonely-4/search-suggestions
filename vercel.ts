import { routes, type VercelConfig } from '@vercel/config/v1'

// Zero-config Node.js Function in /api. The public API stays at `/`.
export const config: VercelConfig = {
	framework: null,
	fluid: true,
	buildCommand: '',
	installCommand: 'npm install',
	rewrites: [routes.rewrite('/', '/api')],
}
