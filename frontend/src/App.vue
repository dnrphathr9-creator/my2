<script setup>
import { useRouter } from 'vue-router'
import { auth, logout, roleName } from './api'

const router = useRouter()

async function onLogout() {
  await router.push('/login')
  logout()
}
</script>

<template>
  <div class="min-h-screen bg-base-200">
    <div v-if="auth.user" class="navbar bg-primary text-primary-content px-4">
      <div class="flex-1 text-lg font-bold">ระบบแจ้งซ่อม</div>
      <span class="mr-3">{{ auth.user.full_name }} ({{ roleName[auth.user.role] }})</span>
      <button class="btn btn-sm" @click="onLogout">ออกจากระบบ</button>
    </div>
    <main class="mx-auto max-w-5xl p-4">
      <RouterView />
    </main>
  </div>
</template>
