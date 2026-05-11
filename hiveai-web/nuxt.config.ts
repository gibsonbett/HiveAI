export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: [
    '@pinia/nuxt',
    '@vueuse/nuxt',
    '@nuxtjs/tailwindcss',
  ],

  css: [
    'primeicons/primeicons.css',
    '~/assets/css/main.css',
  ],

  runtimeConfig: {
    public: {
      apiUrl: import.meta.env.NUXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1',
      socketUrl: import.meta.env.NUXT_PUBLIC_SOCKET_URL || 'http://localhost:5000',
      appName: 'HiveAI',
    },
  },

  app: {
    head: {
      title: 'HiveAI',
      meta: [
        { name: 'description', content: 'AI Data Annotation & Task Marketplace Platform' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ],
    },
  },
})
