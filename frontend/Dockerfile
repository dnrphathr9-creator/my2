# ขั้นที่ 1: build หน้าเว็บด้วย Node
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# ขั้นที่ 2: ใช้ nginx ส่งไฟล์ที่ build แล้ว
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
