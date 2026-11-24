import axios from 'axios'
import { reactive } from 'vue'

// ที่อยู่ของ Backend (ตอนพัฒนาใช้ localhost:3000, ตอน build ขึ้น Production ใช้ค่าจาก .env.production)
export const SERVER = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

// ข้อมูลผู้ที่เข้าสู่ระบบ (อ่านจากเบราว์เซอร์ รีเฟรชหน้าแล้วไม่หลุด)
export const auth = reactive({
  token: localStorage.getItem('token'),
  user: JSON.parse(localStorage.getItem('user')),
})

export function saveLogin(token, user) {
  auth.token = token
  auth.user = user
  localStorage.setItem('token', token)
  localStorage.setItem('user', JSON.stringify(user))
}

export function logout() {
  auth.token = null
  auth.user = null
  localStorage.clear()
}

// ตัวเรียก API: แนบ token ให้อัตโนมัติทุกครั้ง
const api = axios.create({ baseURL: SERVER + '/api' })
api.interceptors.request.use((config) => {
  config.headers.Authorization = 'Bearer ' + auth.token
  return config
})

// แปลง error เป็นข้อความภาษาไทยที่ผู้ใช้อ่านเข้าใจ
export function errorText(err) {
  if (!err.response) return 'เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ กรุณาตรวจสอบว่า Backend ทำงานอยู่'
  return err.response.data.message
}

export const roleName = { admin: 'ผู้ดูแลระบบ', user: 'ผู้แจ้งซ่อม', tech: 'ช่างซ่อม' }
export const statusName = { pending: 'รอดำเนินการ', doing: 'กำลังซ่อม', done: 'ซ่อมเสร็จ' }

export default api
