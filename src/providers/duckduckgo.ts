import { fetchProviderJson } from '../index.ts'
import type { Suggestions } from '../index.ts'

type DuckduckgoAPI = {
	phrase: string
}[]

export async function duckduckgo(q: string, lang: string): Promise<Suggestions> {
	// DuckDuckGo region codes are `<country>-<language>`, e.g. cn-zh.
	const region = lang === 'zh-CN' ? 'cn-zh' : lang
	const url = `https://duckduckgo.com/ac/?q=${encodeURIComponent(q)}&kl=${encodeURIComponent(region)}`
	const json = await fetchProviderJson<DuckduckgoAPI>(url, lang)

	if (json) {
		return Object.values(json).map((item) => ({ text: item.phrase }))
	}

	return []
}
