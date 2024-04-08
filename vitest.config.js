import { configDefaults, defineConfig } from 'vitest/config'

export default defineConfig({
    test: {
        includeSource: ['src/**/*.{js}'],
    },
    define: {
        'import.meta.vitest': 'undefined',
    },
})