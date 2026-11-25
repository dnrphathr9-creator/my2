<script setup>
import { ref, onMounted } from 'vue'
import api, { SERVER, errorText, auth, statusName } from '../api'

const items = ref([])
const categories = ref([])
const search = ref('')
const status = ref('')
const categoryId = ref('')
const page = ref(1)
const totalPages = ref(1)
const message = ref('')
const error = ref('')

// สีป้ายสถานะ
const statusColor = { pending: 'badge-warning', doing: 'badge-info', done: 'badge-success' }

// โหลดรายการหน้าที่ p (ค่าเริ่มต้นหน้า 1) พร้อมเงื่อนไขค้นหา
async function load(p = 1) {
  page.value = p
  error.value = ''
  try {
    const res = await api.get('/requests', {
      params: { search: search.value, status: status.value, category_id: categoryId.value, page: page.value },
    })
    items.value = res.data.data.items
    totalPages.value = res.data.data.totalPages
  } catch (err) {
    error.value = errorText(err)
  }
}

async function changeStatus(item) {
  try {
    const res = await api.patch(`/requests/${item.id}/status`, { status: item.status })
    message.value = res.data.message
  } catch (err) {
    error.value = errorText(err)
  }
}

async function remove(item) {
  if (!confirm(`ยืนยันการลบ "${item.title}" ?`)) return
  try {
    const res = await api.delete(`/requests/${item.id}`)
    message.value = res.data.message
    load(page.value)
  } catch (err) {
    error.value = errorText(err)
  }
}

onMounted(async () => {
  load()
  const res = await api.get('/categories')
  categories.value = res.data.data
})
</script>

<template>
  <div class="card bg-base-100 shadow">
    <div class="card-body">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <h2 class="card-title text-2xl">รายการแจ้งซ่อม</h2>
        <RouterLink v-if="auth.user.role !== 'tech'" to="/new" class="btn btn-primary">+ แจ้งซ่อม</RouterLink>
      </div>

      <div class="grid gap-2 md:grid-cols-4">
        <input v-model="search" class="input w-full" placeholder="ค้นหาหัวข้อ" @keyup.enter="load(1)" />
        <select v-model="status" class="select w-full">
          <option value="">ทุกสถานะ</option>
          <option v-for="(name, key) in statusName" :key="key" :value="key">{{ name }}</option>
        </select>
        <select v-model="categoryId" class="select w-full">
          <option value="">ทุกประเภท</option>
          <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
        </select>
        <button class="btn btn-primary" @click="load(1)">ค้นหา</button>
      </div>

      <div v-if="message" class="alert alert-success">{{ message }}</div>
      <div v-if="error" class="alert alert-error">{{ error }}</div>

      <div class="overflow-x-auto">
        <table class="table min-w-[720px]">
          <thead>
            <tr>
              <th>รูป</th>
              <th>หัวข้อ</th>
              <th>ประเภท</th>
              <th>ผู้แจ้ง</th>
              <th>สถานะ</th>
              <th>จัดการ</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in items" :key="item.id" class="hover">
              <td>
                <a v-if="item.image" :href="SERVER + '/uploads/' + item.image" target="_blank">
                  <img class="h-14 w-14 rounded object-cover" :src="SERVER + '/uploads/' + item.image" />
                </a>
              </td>
              <td>
                {{ item.title }}
                <div class="text-sm opacity-60">{{ item.detail }}</div>
              </td>
              <td>{{ item.category_name }}</td>
              <td>{{ item.full_name }}</td>
              <td>
                <select v-if="auth.user.role !== 'user'" v-model="item.status" class="select select-sm" @change="changeStatus(item)">
                  <option v-for="(name, key) in statusName" :key="key" :value="key">{{ name }}</option>
                </select>
                <span v-else class="badge" :class="statusColor[item.status]">{{ statusName[item.status] }}</span>
              </td>
              <td class="space-x-1 whitespace-nowrap">
                <RouterLink v-if="auth.user.role !== 'tech'" :to="'/edit/' + item.id" class="btn btn-sm">แก้ไข</RouterLink>
                <button v-if="auth.user.role === 'admin'" class="btn btn-sm btn-error" @click="remove(item)">ลบ</button>
              </td>
            </tr>
            <tr v-if="items.length === 0">
              <td colspan="6" class="text-center opacity-60">ไม่พบข้อมูล</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="flex items-center justify-center gap-3">
        <button class="btn" :disabled="page <= 1" @click="load(page - 1)">ก่อนหน้า</button>
        <span>หน้า {{ page }} / {{ totalPages }}</span>
        <button class="btn" :disabled="page >= totalPages" @click="load(page + 1)">ถัดไป</button>
      </div>
    </div>
  </div>
</template>
