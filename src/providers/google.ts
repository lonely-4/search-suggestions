import { fetchProviderText } from '../index.ts'
import type { Suggestions } from '../index.ts'

type GoogleDefinition = {
	l: {
		il: {
			t: {
				t: string
			}[]
		}
	}[]
}

type GoogleAPI = [
	[[string, number, number[], {
		zi: string
		zs: string
		ansa: GoogleDefinition
	}]],
]

export async function google(q: string, lang: string): Promise<Suggestions> {
	const hl = encodeURIComponent(lang)
	const gl = lang === 'zh-CN' ? '&gl=cn' : ''
	const url = `https://www.google.com/complete/search?q=${encodeURIComponent(q)}&hl=${hl}&client=gws-wiz${gl}`
	let text = (await fetchProviderText(url, lang)) ?? ''

	try {
		text = text.replace('window.google.ac.h(', '')
		text = text.slice(0, text.length - 1)
		const json = JSON.parse(text) as GoogleAPI

		if (json) {
			return json[0].map((item) => {
				const wordDefinition = item[3]?.ansa?.l[1]?.il?.t[0]?.t // bruh

				const text = item[0]
					.replaceAll('<b>', '')
					.replaceAll('</b>', '')
					.replaceAll('&#39;', "'")
				const desc = (wordDefinition ?? item[3]?.zi ?? '').replaceAll('&#39;', "'")
				const image = item[3]?.zs

				return { text, image, desc }
			})
		}
	} catch (_) {
		console.warn('Failed while parsing Google response')
	}

	return []
}
