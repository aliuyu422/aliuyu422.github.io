import { defineConfig } from 'vitepress'
import nav from './nav.mjs'
import sidebar from './sidebar.mjs'
// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "首页",
  description: "永远努力热爱生活的精神小伙！",
  srcDir: 'docs',
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: nav,
    sidebar:sidebar,
    socialLinks: [
      { icon: 'github', link: 'https://github.com/aliuyu422' }
    ]
  }
})
