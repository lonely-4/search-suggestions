import { expect } from '@std/expect'
import { testPresentation, testResponse } from './index.test.ts'
import handler from '../src/index.ts'

Deno.test('Google', async () => {
	const response = await handler({ q: 'hello', with: 'google', lang: '' })
	testResponse(response)
	testPresentation(response)
})

Deno.test('Bing', async () => {
	const response = await handler({ q: 'hello', with: 'bing', lang: '' })
	testResponse(response)
	testPresentation(response)
})

Deno.test('Duckduckgo', async () => {
	const response = await handler({ q: 'hello', with: 'ddg', lang: '' })
	testResponse(response)
})

Deno.test('Baidu', async () => {
	const response = await handler({ q: 'hello', with: 'baidu', lang: 'zh-CN' })
	testResponse(response)
})

Deno.test('Removed engines return nothing', async () => {
	for (const provider of ['yahoo', 'qwant', 'brave']) {
		const response = await handler({ q: 'hello', with: provider, lang: 'zh-CN' })
		expect(response).toEqual([])
	}
})
