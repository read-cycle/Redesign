import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  base: '/Redesign/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: (content, filename) => {
          if (filename.replace(/\\/g, '/').endsWith('/global.scss')) {
            return content;
          }
          return `@use "@/styles/global.scss" as *;\n${content}`;
        }
      }
    }
  }
})