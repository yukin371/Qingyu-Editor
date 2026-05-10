import { defineConfig } from 'orval'

const orvalInput = './.orval/swagger.yaml'

export default defineConfig({
  writer: {
    input: {
      target: orvalInput,
      filters: {
        paths: ['^/api/v1/writer/', '^/api/v1/projects', '^/api/v1/documents', '^/api/v1/user/shortcuts'],
      },
    },
    output: {
      mode: 'single',
      client: 'axios',
      target: 'src/modules/writer/api/generated/writer.ts',
      schemas: 'src/api/generated/model.ts',
      override: {
        mutator: {
          path: 'src/core/config/orval-mutator.ts',
          name: 'orvalMutator',
        },
      },
    },
    hooks: {
      afterAllFilesWrite:
        'prettier --write "src/**/api/generated/**/*.{ts,tsx}" "src/api/generated/**/*.{ts,tsx}"',
    },
  },
})
