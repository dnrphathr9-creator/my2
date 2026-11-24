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
      <div class="flex flex-1 items-center gap-1">
        <span class="mr-2 hidden text-lg font-bold md:inline">ระบบแจ้งซ่อม</span>
        <RouterLink to="/" class="btn btn-sm">หน้าหลัก</RouterLink>
        <RouterLink to="/requests" class="btn btn-sm">รายการแจ้งซ่อม</RouterLink>
      </div>
      <span class="mr-3 hidden md:inline">{{ auth.user.full_name }} ({{ roleName[auth.user.role] }})</span>
      <button class="btn btn-sm" @click="onLogout">ออกจากระบบ</button>
    </div>
    <main class="mx-auto max-w-5xl p-4">
      <RouterView />
    </main>
  </div>
</template>
