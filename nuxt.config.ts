export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  pages: true,
  modules: [
    '@nuxt/icon',
    '@nuxt/image',
    '@nuxt/eslint',
    '@pinia/nuxt',
  ],
  css: [
    'vuetify/styles',
    '@mdi/font/css/materialdesignicons.css',
    '@fontsource/inter/400.css',
    '@fontsource/inter/700.css',
    '@/assets/main.css',
  ],
  build: {
    transpile: ['vuetify'],
  },
  vite: {
    define: {
      'process.env.DEBUG': false,
    },
  },
  runtimeConfig: {
    public: {
      apiBase: process.env.VITE_API_BASE_URL || 'http://localhost:3001',
    }
  }
});
