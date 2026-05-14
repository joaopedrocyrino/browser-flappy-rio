import { defineConfig } from 'vite'

// `base: './'` keeps asset paths relative so the build works from any path
// (repo root, GH Pages subpath, subdomain like flappy.cyrino.dev).
export default defineConfig({
  base: './',
  server: {
    port: 5181,
  },
})
