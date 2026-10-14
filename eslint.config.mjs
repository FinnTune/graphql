import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'

const eslintConfig = defineConfig([
  ...nextVitals,
  globalIgnores([
    'src/lib/graphql/operations.ts',
    'src/lib/graphql/schema-types.ts',
    'attempts/**',
    'playwright-report/**',
    'test-results/**',
    '.next/**',
    'out/**',
    'build/**',
    'coverage/**',
    'next-env.d.ts',
  ]),
])

export default eslintConfig
