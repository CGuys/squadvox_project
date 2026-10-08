import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'
import { UnifiedViteWeappTailwindcssPlugin as uvtw } from 'weapp-tailwindcss/vite'

const isH5 = process.env.UNI_PLATFORM === 'h5'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    uni(),
    !isH5 && uvtw()
  ],
})
