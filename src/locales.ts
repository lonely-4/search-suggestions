// Aliases that should all resolve to Simplified Chinese.
const SIMPLIFIED_CHINESE = new Set(['zh', 'zh-cn', 'zh-hans', 'zh-hans-cn'])

export function normalizeLang(lang: string): string {
	const key = lang.trim().toLowerCase().replaceAll('_', '-')

	if (SIMPLIFIED_CHINESE.has(key)) {
		return 'zh-CN'
	}

	return lang.trim()
}
