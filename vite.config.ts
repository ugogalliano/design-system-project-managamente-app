import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    vue(),
    dts({
      insertTypesEntry: true,
      tsconfigPath: './tsconfig.json',
      entryRoot: 'src',
      exclude: ['tests/**', '**/*.stories.ts', '**/*.spec.ts'],
      outDir: 'dist',
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'PmDesignSystem',
      fileName: 'pm-design-system',
      formats: ['es', 'umd'],
    },
    rollupOptions: {
      external: ['vue', 'reka-ui', 'vee-validate', 'zod', '@vee-validate/zod'],
      output: {
        globals: {
          vue: 'Vue',
          'reka-ui': 'RekaUI',
          'vee-validate': 'VeeValidate',
          zod: 'Zod',
          '@vee-validate/zod': 'VeeValidateZod',
        },
        assetFileNames: assetInfo => {
          if (assetInfo.name === 'style.css') return 'style.css'
          return assetInfo.name ?? '[name][extname]'
        },
      },
    },
    cssCodeSplit: false,
  },
})
