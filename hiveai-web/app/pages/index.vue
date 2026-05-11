<template>
  <div class="relative overflow-hidden bg-slate-950 text-slate-100">
    <div class="absolute inset-0 pointer-events-none">
      <div class="absolute -top-24 right-[-8rem] h-80 w-80 rounded-full bg-teal-500/25 blur-3xl" />
      <div class="absolute top-52 -left-24 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
      <div class="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-teal-700/20 to-transparent" />
    </div>

    <header class="sticky top-0 z-50 border-b border-white/10 bg-slate-950/95 backdrop-blur-md">
      <div class="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <div class="flex items-center gap-3">
          <div class="h-10 w-10 rounded-xl bg-gradient-to-br from-teal-400 to-cyan-500 p-2 shadow-lg shadow-teal-500/30">
            <div class="h-full w-full rounded-md bg-slate-900/95" />
          </div>
          <div class="hidden sm:block">
            <p class="text-lg font-semibold tracking-wide">HiveAI</p>
            <p class="text-xs text-slate-300">Data Intelligence Studio</p>
          </div>
        </div>
        <div class="hidden items-center gap-6 md:flex">
          <a href="#offer" class="text-sm text-slate-300 transition hover:text-white">What we offer</a>
          <a href="#process" class="text-sm text-slate-300 transition hover:text-white">How it works</a>
          <a href="#roles" class="text-sm text-slate-300 transition hover:text-white">Roles</a>
        </div>
        <div class="flex items-center gap-2 sm:gap-3">
          <NuxtLink to="/auth/login" class="btn-ghost-light text-xs sm:text-sm px-3 sm:px-4 py-2">Log in</NuxtLink>
          <NuxtLink to="/auth/register" class="btn-primary text-xs sm:text-sm px-3 sm:px-4 py-2">Join HiveAI</NuxtLink>
        </div>
      </div>
    </header>

    <section class="relative z-10 mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:grid lg:grid-cols-2 lg:gap-10 lg:px-8 lg:py-24">
      <div class="flex flex-col justify-center">
        <p class="inline-flex w-fit items-center gap-2 rounded-full border border-teal-300/30 bg-teal-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-teal-200">
          Built for speed and quality
        </p>
        <h1 class="mt-6 text-3xl font-black leading-tight text-white sm:text-4xl lg:text-5xl">
          Turn raw data into
          <span class="bg-gradient-to-r from-teal-300 via-cyan-300 to-emerald-200 bg-clip-text text-transparent">production-ready AI assets</span>
        </h1>
        <p class="mt-5 text-sm leading-relaxed text-slate-300 sm:text-base lg:text-lg max-w-xl">
          HiveAI connects clients, skilled workers, and expert reviewers in one secure workflow. Launch projects fast, maintain quality control, and scale your AI operations with confidence.
        </p>
        <div class="mt-8 flex flex-col gap-3 sm:flex-row sm:gap-4">
          <NuxtLink to="/auth/register" class="btn-primary px-6 py-3 text-center font-semibold">Create your account</NuxtLink>
          <NuxtLink to="/auth/login" class="btn-ghost-light px-6 py-3 text-center font-semibold">I already have an account</NuxtLink>
        </div>
        <div class="mt-8 grid grid-cols-3 gap-3 sm:gap-4 max-w-xl">
          <div class="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur">
            <p class="text-xs uppercase tracking-wide text-slate-400">Quality reviews</p>
            <p class="mt-1 text-2xl font-bold text-teal-200">98%</p>
          </div>
          <div class="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur">
            <p class="text-xs uppercase tracking-wide text-slate-400">Faster delivery</p>
            <p class="mt-1 text-2xl font-bold text-cyan-200">3x</p>
          </div>
          <div class="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur">
            <p class="text-xs uppercase tracking-wide text-slate-400">Global talent</p>
            <p class="mt-1 text-2xl font-bold text-emerald-200">24/7</p>
          </div>
        </div>
      </div>

      <div class="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/20 backdrop-blur-sm">
        <div class="grid gap-4 sm:grid-cols-2">
          <div class="rounded-2xl border border-teal-400/25 bg-slate-900/60 p-4">
            <p class="text-xs text-teal-200">Client control</p>
            <h3 class="mt-1 text-lg font-semibold">Project Visibility</h3>
            <p class="mt-2 text-sm text-slate-300">Track progress, quality scores, and budgets from one unified dashboard.</p>
          </div>
          <div class="rounded-2xl border border-cyan-400/25 bg-slate-900/60 p-4">
            <p class="text-xs text-cyan-200">Worker growth</p>
            <h3 class="mt-1 text-lg font-semibold">Consistent Earnings</h3>
            <p class="mt-2 text-sm text-slate-300">Take tasks matched to your skills and build a strong trust score.</p>
          </div>
          <div class="rounded-2xl border border-emerald-400/25 bg-slate-900/60 p-4 sm:col-span-2">
            <p class="text-xs text-emerald-200">Review excellence</p>
            <h3 class="mt-1 text-lg font-semibold">Quality-first Pipeline</h3>
            <p class="mt-2 text-sm text-slate-300">Reviewers keep quality high while real-time notifications keep teams aligned.</p>
          </div>
        </div>
      </div>
    </section>

    <section id="offer" class="relative z-10 border-y border-white/10 bg-slate-900/60">
      <div class="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p class="text-sm font-semibold uppercase tracking-[0.2em] text-teal-200">What we offer</p>
            <h2 class="mt-2 text-3xl font-bold text-white">Everything needed to run modern data operations</h2>
          </div>
          <NuxtLink to="/auth/register" class="text-sm font-medium text-teal-200 hover:text-white">Start in minutes</NuxtLink>
        </div>

        <div id="roles" class="mt-10 grid gap-5 md:grid-cols-3">
          <article class="rounded-2xl border border-white/10 bg-white/5 p-6">
            <i class="pi pi-briefcase text-2xl text-teal-200" />
            <h3 class="mt-4 text-xl font-semibold">For Workers</h3>
            <p class="mt-2 text-sm text-slate-300">Work on real annotation tasks, track performance, and get paid securely.</p>
          </article>
          <article class="rounded-2xl border border-white/10 bg-white/5 p-6">
            <i class="pi pi-database text-2xl text-cyan-200" />
            <h3 class="mt-4 text-xl font-semibold">For Clients</h3>
            <p class="mt-2 text-sm text-slate-300">Upload projects, monitor quality metrics, and scale output without friction.</p>
          </article>
          <article class="rounded-2xl border border-white/10 bg-white/5 p-6">
            <i class="pi pi-check-circle text-2xl text-emerald-200" />
            <h3 class="mt-4 text-xl font-semibold">For Reviewers</h3>
            <p class="mt-2 text-sm text-slate-300">Ensure quality standards and help deliver trusted AI datasets.</p>
          </article>
        </div>
      </div>
    </section>

    <section id="process" class="relative z-10">
      <div class="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <p class="text-sm font-semibold uppercase tracking-[0.2em] text-teal-200">How it works</p>
        <h2 class="mt-2 text-3xl font-bold text-white">Simple flow, enterprise-ready control</h2>
        <div class="mt-10 grid gap-5 md:grid-cols-3">
          <div class="rounded-2xl border border-white/10 bg-white/5 p-6">
            <span class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-teal-500/20 text-sm font-bold text-teal-200">1</span>
            <h3 class="mt-4 text-lg font-semibold">Sign up by role</h3>
            <p class="mt-2 text-sm text-slate-300">Choose worker, client, or reviewer and complete the role-specific signup form.</p>
          </div>
          <div class="rounded-2xl border border-white/10 bg-white/5 p-6">
            <span class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-cyan-500/20 text-sm font-bold text-cyan-200">2</span>
            <h3 class="mt-4 text-lg font-semibold">Admin approval</h3>
            <p class="mt-2 text-sm text-slate-300">Your signup is reviewed. Admins receive in-app and email notifications to approve quickly.</p>
          </div>
          <div class="rounded-2xl border border-white/10 bg-white/5 p-6">
            <span class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20 text-sm font-bold text-emerald-200">3</span>
            <h3 class="mt-4 text-lg font-semibold">Start collaborating</h3>
            <p class="mt-2 text-sm text-slate-300">Receive approval email, log in, and access your role dashboard immediately.</p>
          </div>
        </div>
      </div>
    </section>

    <section class="relative z-10 border-t border-white/10 bg-slate-900/70">
      <div class="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-4 px-4 py-10 text-center sm:flex-row sm:px-6 sm:text-left lg:px-8">
        <div>
          <h3 class="text-2xl font-bold text-white">Ready to build with HiveAI?</h3>
          <p class="mt-1 text-sm text-slate-300">Create your account today. Your approval request is processed quickly.</p>
        </div>
        <div class="flex gap-3">
          <NuxtLink to="/auth/register" class="btn-primary">Sign up</NuxtLink>
          <NuxtLink to="/auth/login" class="btn-ghost-light">Log in</NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const authStore = useAuthStore()
const validRoles = new Set(['admin', 'client', 'worker', 'reviewer'])

if (authStore.isAuthenticated && authStore.userRole && validRoles.has(authStore.userRole)) {
  navigateTo(`/dashboard/${authStore.userRole}`)
}
</script>
