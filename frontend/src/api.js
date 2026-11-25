import axios from 'axios'
import { reactive } from 'vue'

export const SERVER = 'http://localhost:3000'

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

const api = axios.create({ baseURL: SERVER + '/api' })
api.interceptors.request.use((config) => {
  config.headers.Authorization = 'Bearer ' + auth.token
  return config
})

export function errorText(err) {
  if (!err.response) return 'เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ กรุณาตรวจสอบว่า Backend ทำงานอยู่'
  return err.response.data.message
}

export const roleName = { admin: 'ผู้ดูแลระบบ', user: 'ผู้แจ้งซ่อม', tech: 'ช่างซ่อม' }
export const statusName = { pending: 'รอดำเนินการ', doing: 'กำลังซ่อม', done: 'ซ่อมเสร็จ' }

export default api
