<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import api, { errorText, saveLogin } from '../api'

const router = useRouter()
const username = ref('')
const password = ref('')
const error = ref('')

async function login() {
  error.value = ''
  if (!username.value || !password.value) {
    error.value = 'กรุณากรอกชื่อผู้ใช้และรหัสผ่าน'
    return
  }
  try {
    const res = await api.post('/auth/login', {
      username: username.value,
      password: password.value,
    })
    saveLogin(res.data.data.token, res.data.data.user)
    router.push('/')
  } catch (err) {
    error.value = errorText(err)
  }
}
</script>

<template>
  <div class="card mx-auto mt-16 max-w-sm bg-base-100 shadow">
    <form class="card-body gap-3" @submit.prevent="login">
      <h2 class="card-title justify-center text-2xl">เข้าสู่ระบบ</h2>
      <input v-model="username" class="input w-full" placeholder="ชื่อผู้ใช้" />
      <input v-model="password" class="input w-full" type="password" placeholder="รหัสผ่าน" />
      <div v-if="error" class="alert alert-error">{{ error }}</div>
      <button type="submit" class="btn btn-primary w-full">เข้าสู่ระบบ</button>
    </form>
  </div>
</template>
