<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api, { SERVER, errorText } from '../api'

const route = useRoute()
const router = useRouter()
const id = route.params.id // มี id = หน้าแก้ไข, ไม่มี id = หน้าเพิ่ม

const categories = ref([])
const title = ref('')
const detail = ref('')
const categoryId = ref('')
const oldImage = ref('')
const file = ref(null)
const error = ref('')

function pickFile(e) {
  file.value = e.target.files[0]
}

async function save() {
  error.value = ''
  if (title.value.trim().length < 3) {
    error.value = 'หัวข้อต้องมีอย่างน้อย 3 ตัวอักษร'
    return
  }
  if (!categoryId.value) {
    error.value = 'กรุณาเลือกประเภท'
    return
  }
  if (file.value && file.value.size > 2 * 1024 * 1024) {
    error.value = 'ไฟล์รูปต้องมีขนาดไม่เกิน 2MB'
    return
  }

  const form = new FormData()
  form.append('title', title.value)
  form.append('detail', detail.value)
  form.append('category_id', categoryId.value)
  if (file.value) form.append('image', file.value)

  try {
    const res = id ? await api.put('/requests/' + id, form) : await api.post('/requests', form)
    alert(res.data.message)
    router.push('/requests')
  } catch (err) {
    error.value = errorText(err)
  }
}

onMounted(async () => {
  const res = await api.get('/categories')
  categories.value = res.data.data
  if (id) {
    const r = await api.get('/requests/' + id)
    title.value = r.data.data.title
    detail.value = r.data.data.detail || ''
    categoryId.value = r.data.data.category_id
    oldImage.value = r.data.data.image
  }
})
</script>

<template>
  <div class="card mx-auto max-w-lg bg-base-100 shadow">
    <form class="card-body gap-3" @submit.prevent="save">
      <h2 class="card-title text-2xl">{{ id ? 'แก้ไขรายการแจ้งซ่อม' : 'แจ้งซ่อมใหม่' }}</h2>

      <label class="font-medium">หัวข้อ *</label>
      <input v-model="title" class="input w-full" placeholder="เช่น คอมพิวเตอร์เปิดไม่ติด" />

      <label class="font-medium">ประเภท *</label>
      <select v-model="categoryId" class="select w-full">
        <option value="">-- เลือกประเภท --</option>
        <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
      </select>

      <label class="font-medium">รายละเอียด</label>
      <textarea v-model="detail" class="textarea w-full" rows="3"></textarea>

      <label class="font-medium">รูปภาพ (ไม่เกิน 2MB)</label>
      <img v-if="oldImage" class="h-24 w-24 rounded object-cover" :src="SERVER + '/uploads/' + oldImage" />
      <input type="file" accept="image/*" class="file-input w-full" @change="pickFile" />

      <div v-if="error" class="alert alert-error">{{ error }}</div>

      <div class="flex gap-2">
        <button type="submit" class="btn btn-primary">บันทึก</button>
        <RouterLink to="/requests" class="btn">ยกเลิก</RouterLink>
      </div>
    </form>
  </div>
</template>
