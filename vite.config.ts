import { resolve } from "node:path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { csfOrder } from "./preview/vite-plugin-csf-order.ts"

const root = import.meta.dirname
const r = (path: string) => resolve(root, path)

// https://vite.dev/config/
export default defineConfig({
  root: r("preview"),
  publicDir: r("public"),
  plugins: [csfOrder(), react(), tailwindcss()],
  resolve: {
    // @/ 只代表用户项目里看到的路径，全部指向 registry 源码；~/ 是预览站内部代码
    // 与 tsconfig.paths.json（scripts/gen-paths.ts 生成）保持一致
    alias: [
      { find: /^@\/components\/ui\/([^/]+)$/, replacement: r("registry/ui/$1/$1") },
      { find: /^@\/components\/([^/]+)$/, replacement: r("registry/blocks/$1/$1") },
      { find: /^@\/lib\/([^/]+)$/, replacement: r("registry/lib/$1/$1") },
      { find: /^~\//, replacement: r("preview/src") + "/" },
    ],
  },
  build: {
    outDir: r("dist"),
    emptyOutDir: true,
    // 文档站 + iframe 单格两个入口
    rollupOptions: {
      input: { main: r("preview/index.html"), frame: r("preview/frame.html") },
    },
  },
})
