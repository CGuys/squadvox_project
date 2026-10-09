import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'
import { UnifiedViteWeappTailwindcssPlugin as uvtw } from 'weapp-tailwindcss/vite'
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'

const isH5 = process.env.UNI_PLATFORM === 'h5'

export default defineConfig({
  css: {
    postcss: {
      plugins: [
        tailwindcss(),
        autoprefixer()
      ]
    }
  },
  plugins: [
    uni(),
    !isH5 && uvtw()
  ],
})
