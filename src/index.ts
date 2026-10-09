import { baidu } from './providers/baidu.ts'
import { bing } from './providers/bing.ts'
import { duckduckgo } from './providers/duckduckgo.ts'
import { google } from './providers/google.ts'
import { normalizeLang } from './locales.ts'

export type Suggestions = {
	text: string
	desc?: string
	image?: string
}[]

const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/114.0'

export function providerHeaders(lang = ''): Record<string, string> {
	const acceptLanguage = lang === 'zh-CN' ? 'zh-CN,zh;q=0.9' : lang ? `${lang};q=0.9` : 'en-US,en;q=1'

	return {
		'Accept-Language': acceptLanguage,
		'User-Agent': USER_AGENT,
	}
}

export default async function handler(args = { q: '', with: '', lang: '' }): Promise<Suggestions> {
	const { q } = args
	const lang = normalizeLang(args.lang ?? '')

	if (!q) {
		return []
	}

	switch (args.with) {
		case 'ddg':
		case 'duckduckgo':
			return await duckduckgo(q, lang)
		case 'google':
			return await google(q, lang)
		case 'bing':
			return await bing(q, lang)
		case 'baidu':
			return await baidu(q, lang)
		default:
			return []
	}
}

//
//	Helpers
//

export async function fetchProviderJson<T>(url: string, lang = ''): Promise<T | undefined> {
	try {
		const response = await fetch(url, { headers: providerHeaders(lang) })
		try {
			return await response.json() as T
		} catch (_) {
			console.warn(`Cannot parse ${url} as JSON`)
		}
	} catch (_) {
		console.warn(`Cannot reach ${url}`)
	}
}

export async function fetchProviderText(url: string, lang = ''): Promise<string | undefined> {
	try {
		const response = await fetch(url, { headers: providerHeaders(lang) })
		try {
			return await response.text()
		} catch (_) {
			console.warn(`Cannot get ${url} as text`)
		}
	} catch (_) {
		console.warn(`Cannot reach ${url}`)
	}
}
