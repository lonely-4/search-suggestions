import { expect } from '@std/expect'
import { testResponse } from './index.test.ts'
import handler from '../src/index.ts'
import { normalizeLang } from '../src/locales.ts'

const providers = ['google', 'bing', 'duckduckgo', 'baidu']

Deno.test('Fallback to auto on bad lang parameter', async () => {
	for (const provider of providers) {
		const res = await handler({
			q: 'minecraft',
			lang: 'zesglljesh',
			with: provider,
		})
		testResponse(res)
	}
})

Deno.test('Correct french in description', async () => {
	const providersWithDesc = ['google'] //, 'bing']

	for (const provider of providersWithDesc) {
		const res = await handler({ q: 'minecraft', lang: 'fr', with: provider })
		const hasAccentAigu = JSON.stringify(res).includes('é')

		expect(hasAccentAigu).toBe(true)
	}
})

Deno.test('Simplified Chinese aliases', () => {
	for (const lang of ['zh', 'zh-CN', 'zh-cn', 'zh-Hans', 'zh_CN', 'zh-Hans-CN']) {
		expect(normalizeLang(lang)).toBe('zh-CN')
	}

	expect(normalizeLang('fr')).toBe('fr')
	expect(normalizeLang('zh-TW')).toBe('zh-TW')
	expect(normalizeLang('')).toBe('')
})

Deno.test('Simplified Chinese suggestions', async () => {
	for (const provider of providers) {
		const res = await handler({ q: 'minecraft', lang: 'zh-CN', with: provider })
		testResponse(res)
		expect(/[\u4e00-\u9fff]/.test(JSON.stringify(res))).toBe(true)
	}

	const aliased = await handler({ q: 'minecraft', lang: 'zh', with: 'bing' })
	expect(JSON.stringify(aliased)).toContain('官网')
})
