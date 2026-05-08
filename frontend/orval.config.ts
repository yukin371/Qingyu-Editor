import { defineConfig } from 'orval'

const orvalInput = './.orval/swagger.yaml'

export default defineConfig({
  reader: {
    input: {
      target: orvalInput,
      filters: {
        paths: ['^/api/v1/reader/', '^/api/v1/bookstore/'],
      },
    },
    output: {
      mode: 'single',
      client: 'axios',
      target: 'src/modules/reader/api/generated/reader.ts',
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

  bookstore: {
    input: {
      target: orvalInput,
      filters: {
        paths: ['^/api/v1/bookstore/'],
      },
    },
    output: {
      mode: 'single',
      client: 'axios',
      target: 'src/modules/bookstore/api/generated/bookstore.ts',
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

  admin: {
    input: {
      target: orvalInput,
      filters: {
        paths: ['^/api/v1/admin/'],
      },
    },
    output: {
      mode: 'single',
      client: 'axios',
      target: 'src/modules/admin/api/generated/admin.ts',
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

  social: {
    input: {
      target: orvalInput,
      filters: {
        paths: ['^/api/v1/social/'],
      },
    },
    output: {
      mode: 'single',
      client: 'axios',
      target: 'src/modules/social/api/generated/social.ts',
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

  ai: {
    input: {
      target: orvalInput,
      filters: {
        paths: ['^/api/v1/ai/'],
      },
    },
    output: {
      mode: 'single',
      client: 'axios',
      target: 'src/modules/ai/api/generated/ai.ts',
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

  finance: {
    input: {
      target: orvalInput,
      filters: {
        paths: ['^/api/v1/finance/'],
      },
    },
    output: {
      mode: 'single',
      client: 'axios',
      target: 'src/modules/finance/api/generated/finance.ts',
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

  notification: {
    input: {
      target: orvalInput,
      filters: {
        paths: ['^/api/v1/notifications'],
      },
    },
    output: {
      mode: 'single',
      client: 'axios',
      target: 'src/modules/notification/api/generated/notification.ts',
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
