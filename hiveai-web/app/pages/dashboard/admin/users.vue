<template>
  <div>
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Users</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400">Manage platform users</p>
      </div>
    </div>

    <!-- Filters -->
    <div class="mt-6 card p-4">
      <div class="flex flex-col sm:flex-row gap-3">
        <div class="flex-1">
          <input
            v-model="search"
            type="text"
            class="input-field"
            placeholder="Search by name or email..."
            @input="debouncedFetch"
          />
        </div>
        <select v-model="roleFilter" @change="fetchUsers" class="input-field sm:w-40">
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="client">Client</option>
          <option value="worker">Worker</option>
          <option value="reviewer">Reviewer</option>
        </select>
        <select v-model="statusFilter" @change="fetchUsers" class="input-field sm:w-40">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="suspended">Suspended</option>
          <option value="banned">Banned</option>
        </select>
      </div>
    </div>

    <!-- Users Table -->
    <div class="mt-4 card overflow-hidden">
      <SharedSkeletonLoader v-if="loading" type="table" :rows="5" class="p-4" />
      <SharedEmptyState v-else-if="!users.length" title="No users found" message="Try adjusting your filters" icon="pi pi-users" />
      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 dark:bg-gray-800/50">
            <tr>
              <th class="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Name</th>
              <th class="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400 hidden sm:table-cell">Email</th>
              <th class="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Role</th>
              <th class="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Status</th>
              <th class="text-right px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-800">
            <tr v-for="user in users" :key="user._id" class="hover:bg-gray-50 dark:hover:bg-gray-800/50">
              <td class="px-4 py-3">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center flex-shrink-0">
                    <span class="text-indigo-600 dark:text-indigo-300 text-xs font-medium">
                      {{ user.firstName[0] }}{{ user.lastName[0] }}
                    </span>
                  </div>
                  <div class="min-w-0">
                    <p class="font-medium text-gray-900 dark:text-white truncate">{{ user.firstName }} {{ user.lastName }}</p>
                    <p class="text-xs text-gray-500 sm:hidden truncate">{{ user.email }}</p>
                  </div>
                </div>
              </td>
              <td class="px-4 py-3 text-gray-600 dark:text-gray-400 hidden sm:table-cell">{{ user.email }}</td>
              <td class="px-4 py-3"><SharedStatusBadge :status="user.role" /></td>
              <td class="px-4 py-3"><SharedStatusBadge :status="user.status" /></td>
              <td class="px-4 py-3 text-right">
                <div class="flex items-center justify-end gap-1">
                  <button
                    v-if="user.status === 'pending'"
                    @click="approveUser(user._id)"
                    class="p-1.5 rounded text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/20"
                    title="Approve"
                  >
                    <i class="pi pi-check-circle text-sm"></i>
                  </button>
                  <button
                    v-if="user.status === 'active'"
                    @click="updateStatus(user._id, 'suspended')"
                    class="p-1.5 rounded text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                    title="Suspend"
                  >
                    <i class="pi pi-ban text-sm"></i>
                  </button>
                  <button
                    v-if="user.status === 'suspended'"
                    @click="updateStatus(user._id, 'active')"
                    class="p-1.5 rounded text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                    title="Activate"
                  >
                    <i class="pi pi-check text-sm"></i>
                  </button>
                  <button
                    v-if="user.status !== 'banned'"
                    @click="updateStatus(user._id, 'banned')"
                    class="p-1.5 rounded text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                    title="Ban"
                  >
                    <i class="pi pi-times text-sm"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-800">
        <p class="text-sm text-gray-500 dark:text-gray-400">
          Page {{ page }} of {{ totalPages }} ({{ total }} users)
        </p>
        <div class="flex gap-2">
          <button @click="page > 1 && (page--, fetchUsers())" :disabled="page <= 1" class="btn-secondary text-sm py-1.5 px-3">
            Previous
          </button>
          <button @click="page < totalPages && (page++, fetchUsers())" :disabled="page >= totalPages" class="btn-secondary text-sm py-1.5 px-3">
            Next
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { User } from '~/types/user'

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
})

const { get, patch, post, loading } = useApi()
const toast = useToast()

const users = ref<User[]>([])
const search = ref('')
const roleFilter = ref('')
const statusFilter = ref('')
const page = ref(1)
const total = ref(0)
const totalPages = ref(0)

let debounceTimer: ReturnType<typeof setTimeout>
const debouncedFetch = () => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    page.value = 1
    fetchUsers()
  }, 300)
}

const fetchUsers = async () => {
  try {
    const params: Record<string, unknown> = { page: page.value, limit: 20 }
    if (search.value) params.search = search.value
    if (roleFilter.value) params.role = roleFilter.value
    if (statusFilter.value) params.status = statusFilter.value

    const response = await get<User[]>('/users', params)
    users.value = response.data || []
    total.value = response.meta?.total || 0
    totalPages.value = response.meta?.totalPages || 0
  } catch {
    toast.error('Failed to load users')
  }
}

const updateStatus = async (userId: string, status: string) => {
  try {
    await patch(`/users/${userId}/status`, { status })
    toast.success('User status updated')
    await fetchUsers()
  } catch {
    toast.error('Failed to update user status')
  }
}

const approveUser = async (userId: string) => {
  try {
    await post(`/users/${userId}/approve`)
    toast.success('User approved successfully')
    await fetchUsers()
  } catch {
    toast.error('Failed to approve user')
  }
}

onMounted(fetchUsers)
</script>
