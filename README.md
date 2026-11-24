# ระบบแจ้งซ่อม (Repair Request System)

ระบบแจ้งซ่อมอุปกรณ์ภายในวิทยาลัย ผู้แจ้งซ่อมแจ้งปัญหาพร้อมแนบรูป ช่างซ่อมอัปเดตสถานะงาน ผู้ดูแลระบบจัดการรายการทั้งหมด

| ส่วน | เทคโนโลยี |
|---|---|
| Frontend | Vue 3, Vue Router, Axios, Tailwind CSS, DaisyUI |
| Backend | Node.js, Express, JWT (jsonwebtoken), bcryptjs, multer |
| Database | MySQL 8.4 |
| DevOps | Docker, Docker Compose, GitLab CI/CD, Caddy |

## วิธีรัน (เครื่องพัฒนา)

```bash
docker compose up -d                 # เปิด MySQL + phpMyAdmin
cd backend && npm install && node app.js
cd frontend && npm install && npm run dev
```

เปิด http://localhost:5173 ผู้ใช้ทดสอบ รหัสผ่าน `1234` ทุกคน

| username | สิทธิ์ (role) | ทำอะไรได้ |
|---|---|---|
| admin | admin ผู้ดูแลระบบ | ทุกอย่าง รวมถึงลบรายการ |
| user1, user2 | user ผู้แจ้งซ่อม | แจ้งซ่อม แก้ไข ดูเฉพาะรายการของตนเอง |
| tech1 | tech ช่างซ่อม | ดูทุกรายการ เปลี่ยนสถานะ |

ทดสอบ: `cd backend && npm test` (Unit Test)

---

## API

Base URL: `http://localhost:3000/api` (Production: `https://api.mydomain.lab/api`)

### รูปแบบ Response

ทุก API ตอบเป็น JSON รูปแบบเดียวกัน

```json
{ "status": "success", "message": "ข้อความอธิบายผล", "data": { } }
```

```json
{ "status": "error", "message": "ข้อความอธิบายข้อผิดพลาด" }
```

### HTTP Status Code

| Code | ความหมาย | ตัวอย่าง message |
|---|---|---|
| 200 | สำเร็จ | ดึงข้อมูลสำเร็จ |
| 201 | สร้างข้อมูลสำเร็จ | บันทึกข้อมูลสำเร็จ |
| 400 | ข้อมูลไม่ครบหรือไม่ถูกต้อง | หัวข้อต้องมีอย่างน้อย 3 ตัวอักษร |
| 401 | ยังไม่เข้าสู่ระบบ / token ไม่ถูกต้องหรือหมดอายุ / รหัสผ่านผิด | กรุณาเข้าสู่ระบบ |
| 403 | เข้าสู่ระบบแล้วแต่ไม่มีสิทธิ์ | ไม่มีสิทธิ์ใช้งาน |
| 404 | ไม่พบข้อมูล หรือไม่พบ API | ไม่พบข้อมูล |
| 500 | ข้อผิดพลาดที่เซิร์ฟเวอร์ | เกิดข้อผิดพลาดที่เซิร์ฟเวอร์ |

### ความปลอดภัย

- เข้าสู่ระบบด้วย `POST /api/auth/login` ได้ **JWT token** ที่ลงนาม (sign) ด้วย `JWT_SECRET` อายุ 8 ชั่วโมง
- API อื่นทุกตัวต้องส่ง header `Authorization: Bearer <token>` ถ้าไม่ส่งหรือ token ไม่ถูกต้อง ได้ **401**
- ตรวจสิทธิ์ตาม role ด้วย middleware `allow(...)` ถ้าไม่มีสิทธิ์ได้ **403**
- รหัสผ่านเก็บแบบเข้ารหัสด้วย bcrypt คำสั่ง SQL ใช้ `?` (parameterized query) ป้องกัน SQL Injection
- ไฟล์แนบจำกัดขนาด 2 MB

### สรุป Endpoint

| Method | Endpoint | สิทธิ์ | ใช้ทำ |
|---|---|---|---|
| POST | `/api/auth/login` | ทุกคน | เข้าสู่ระบบ |
| GET | `/api/dashboard` | ทุก role | สรุปจำนวนตามสถานะ + 5 รายการล่าสุด |
| GET | `/api/categories` | ทุก role | ประเภทงานซ่อม |
| GET | `/api/requests` | ทุก role | รายการแจ้งซ่อม ค้นหา กรอง แบ่งหน้า |
| GET | `/api/requests/:id` | ทุก role | ดู 1 รายการ |
| POST | `/api/requests` | user, admin | แจ้งซ่อมพร้อมแนบรูป |
| PUT | `/api/requests/:id` | user (ของตนเอง), admin | แก้ไขรายการ / เปลี่ยนรูป |
| PATCH | `/api/requests/:id/status` | tech, admin | เปลี่ยนสถานะ |
| DELETE | `/api/requests/:id` | admin | ลบรายการ |

---

### POST /api/auth/login

เข้าสู่ระบบ

**Body (JSON)**

| ชื่อ | ชนิด | บังคับ | คำอธิบาย |
|---|---|---|---|
| username | string | ✓ | ชื่อผู้ใช้ |
| password | string | ✓ | รหัสผ่าน |

```json
{ "username": "user1", "password": "1234" }
```

**200**

```json
{
  "status": "success",
  "message": "เข้าสู่ระบบสำเร็จ",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": { "id": 2, "full_name": "สมชาย ใจดี", "role": "user" }
  }
}
```

**400** `กรุณากรอกชื่อผู้ใช้และรหัสผ่าน` · **401** `ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง`

---

### GET /api/dashboard

สรุปจำนวนรายการตามสถานะ และ 5 รายการล่าสุด (user เห็นเฉพาะของตนเอง)

**Header** `Authorization: Bearer <token>`

**200**

```json
{
  "status": "success",
  "message": "ดึงข้อมูลสำเร็จ",
  "data": {
    "summary": { "total": 3, "pending": 2, "doing": 1, "done": 0 },
    "latest": [
      { "id": 3, "title": "ปริ้นเตอร์กระดาษติด", "status": "doing", "created_at": "2026-11-24T05:10:00.000Z", "category_name": "คอมพิวเตอร์" }
    ]
  }
}
```

**401** `กรุณาเข้าสู่ระบบ`

---

### GET /api/categories

ประเภทงานซ่อมทั้งหมด

**200**

```json
{ "status": "success", "message": "ดึงข้อมูลสำเร็จ", "data": [ { "id": 1, "name": "คอมพิวเตอร์" } ] }
```

---

### GET /api/requests

รายการแจ้งซ่อม หน้าละ 5 รายการ (user เห็นเฉพาะของตนเอง)

**Query**

| ชื่อ | ชนิด | บังคับ | คำอธิบาย |
|---|---|---|---|
| search | string | | ค้นหาในหัวข้อ |
| status | string | | pending / doing / done |
| category_id | number | | รหัสประเภท |
| page | number | | หน้าที่ต้องการ (เริ่มที่ 1) |

ตัวอย่าง: `GET /api/requests?search=คอม&status=pending&page=1`

**200**

```json
{
  "status": "success",
  "message": "ดึงข้อมูลสำเร็จ",
  "data": {
    "items": [
      {
        "id": 1, "user_id": 2, "category_id": 1, "title": "คอมพิวเตอร์เปิดไม่ติด",
        "detail": "ห้อง 302", "image": "1764000000000.png", "status": "pending",
        "created_at": "2026-11-24T05:00:00.000Z", "category_name": "คอมพิวเตอร์", "full_name": "สมชาย ใจดี"
      }
    ],
    "page": 1,
    "totalPages": 1
  }
}
```

---

### GET /api/requests/:id

ดู 1 รายการ (ใช้ในหน้าแก้ไข)

**Path** `id` รหัสรายการ

**200** `data` เป็นข้อมูล 1 รายการ · **404** `ไม่พบข้อมูล`

---

### POST /api/requests

แจ้งซ่อมพร้อมแนบรูป · สิทธิ์ user, admin

**Body (multipart/form-data)**

| ชื่อ | ชนิด | บังคับ | คำอธิบาย |
|---|---|---|---|
| title | string | ✓ | อย่างน้อย 3 ตัวอักษร |
| category_id | number | ✓ | รหัสประเภท |
| detail | string | | รายละเอียด |
| image | file | | รูปภาพ ไม่เกิน 2 MB |

**201** `บันทึกข้อมูลสำเร็จ` · **400** `หัวข้อต้องมีอย่างน้อย 3 ตัวอักษร` / `กรุณาเลือกประเภท` / `ไฟล์ต้องมีขนาดไม่เกิน 2MB` · **403** `ไม่มีสิทธิ์ใช้งาน` (tech)

---

### PUT /api/requests/:id

แก้ไขรายการ ถ้าแนบรูปใหม่จะใช้รูปใหม่แทน · สิทธิ์ user (เฉพาะของตนเอง), admin

**Path** `id` · **Body (multipart/form-data)** เหมือน POST

**200** `แก้ไขข้อมูลสำเร็จ` · **400** ข้อมูลไม่ถูกต้อง · **403** ไม่มีสิทธิ์ · **404** `ไม่พบข้อมูล` (ไม่มีรายการ หรือเป็นของคนอื่น)

---

### PATCH /api/requests/:id/status

เปลี่ยนสถานะ · สิทธิ์ tech, admin

**Path** `id` · **Body (JSON)**

```json
{ "status": "doing" }
```

**200** `เปลี่ยนสถานะสำเร็จ` · **400** `สถานะไม่ถูกต้อง` · **403** ไม่มีสิทธิ์ · **404** `ไม่พบข้อมูล`

---

### DELETE /api/requests/:id

ลบรายการ · สิทธิ์ admin

**Path** `id`

**200** `ลบข้อมูลสำเร็จ` · **403** ไม่มีสิทธิ์ · **404** `ไม่พบข้อมูล`

---

## การทดสอบ

| ชนิด | ทำที่ | คำสั่ง |
|---|---|---|
| Unit Test | `backend/test/validate.test.js` ทดสอบฟังก์ชันตรวจข้อมูล 4 กรณี | `npm test` |
| Integration Test | Pipeline stage test: เปิด backend จาก image แล้วเรียก API ต้องได้ 401 | อัตโนมัติเมื่อ push |
| E2E | E2E-001: เปิดหน้า Login → กรอก user1 / 1234 → กดเข้าสู่ระบบ → เห็นหน้า Dashboard | ทดสอบผ่านเบราว์เซอร์ |
