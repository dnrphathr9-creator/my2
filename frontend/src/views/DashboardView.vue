<script setup>
import { ref, onMounted } from 'vue'
import api, { auth, errorText, roleName, statusName } from '../api'

const summary = ref({ total: 0, pending: 0, doing: 0, done: 0 })
const latest = ref([])
const error = ref('')

// สีป้ายสถานะ
const statusColor = { pending: 'badge-warning', doing: 'badge-info', done: 'badge-success' }

// การ์ดสรุป 4 ใบ: ชื่อ, ค่าใน summary, สีตัวเลข
const cards = [
  { label: 'ทั้งหมด', key: 'total', color: '' },
  { label: 'รอดำเนินการ', key: 'pending', color: 'text-warning' },
  { label: 'กำลังซ่อม', key: 'doing', color: 'text-info' },
  { label: 'ซ่อมเสร็จ', key: 'done', color: 'text-success' },
]

onMounted(async () => {
  try {
    const res = await api.get('/dashboard')
    summary.value = res.data.data.summary
    latest.value = res.data.data.latest
  } catch (err) {
    error.value = errorText(err)
  }
})
</script>

<template>
  <div class="flex flex-col gap-4">
    <h2 class="text-2xl font-bold">สวัสดี {{ auth.user.full_name }} ({{ roleName[auth.user.role] }})</h2>

    <div v-if="error" class="alert alert-error">{{ error }}</div>

    <!-- การ์ดสรุปจำนวน -->
    <div class="grid grid-cols-2 gap-4 md:grid-cols-4">
      <div v-for="c in cards" :key="c.key" class="card bg-base-100 shadow">
        <div class="card-body">
          <p>{{ c.label }}</p>
          <p class="text-4xl font-bold" :class="c.color">{{ summary[c.key] }}</p>
        </div>
      </div>
    </div>

    <!-- รายการล่าสุด -->
    <div class="card bg-base-100 shadow">
      <div class="card-body">
        <div class="flex items-center justify-between">
          <h3 class="card-title">รายการล่าสุด</h3>
          <RouterLink to="/requests" class="btn btn-sm">ดูทั้งหมด</RouterLink>
        </div>
        <div class="overflow-x-auto">
          <table class="table">
            <thead>
              <tr>
                <th>หัวข้อ</th>
                <th>ประเภท</th>
                <th>สถานะ</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in latest" :key="item.id">
                <td>{{ item.title }}</td>
                <td>{{ item.category_name }}</td>
                <td><span class="badge whitespace-nowrap" :class="statusColor[item.status]">{{ statusName[item.status] }}</span></td>
              </tr>
              <tr v-if="latest.length === 0">
                <td colspan="3" class="text-center">ยังไม่มีรายการ</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>
