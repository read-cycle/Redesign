import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: (content, filename) => {
          if (filename.replace(/\\/g, '/').endsWith('/main.scss')) {
            return content; // Don't inject into main.scss
          }
        
          return `@use "@/styles/main.scss" as *;\n${content}`;
        }
      }
    }
  }
})