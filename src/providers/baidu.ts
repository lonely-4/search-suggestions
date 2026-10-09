import { fetchProviderJson } from '../index.ts'
import type { Suggestions } from '../index.ts'

type BaiduSugrec = {
	g?: {
		q?: string
	}[]
}

export async function baidu(q: string, lang: string): Promise<Suggestions> {
	const url = `https://www.baidu.com/sugrec?prod=pc&wd=${encodeURIComponent(q)}`
	const json = await fetchProviderJson<BaiduSugrec>(url, lang)

	if (!json?.g) {
		return []
	}

	return json.g.flatMap((item) => (item.q ? [{ text: item.q }] : []))
}
