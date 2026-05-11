<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 via-white to-teal-50 dark:from-gray-950 dark:via-gray-900 dark:to-teal-950 px-4 py-8">
    <div class="w-full max-w-md">
      <div class="text-center mb-8">
        <NuxtLink to="/" class="group inline-flex flex-col items-center justify-center w-full">
          <div class="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 shadow-lg shadow-teal-500/30 transition group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-teal-500/50">
            <div class="h-6 w-6 rounded bg-slate-900/90" />
          </div>
          <h1 class="text-3xl font-bold text-teal-700 dark:text-teal-300 transition group-hover:text-teal-600 dark:group-hover:text-teal-200">HiveAI</h1>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Data Intelligence Platform</p>
        </NuxtLink>
      </div>
      <div class="card p-6 sm:p-8">
        <slot />
      </div>
    </div>
  </div>
</template>
