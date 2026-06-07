# 🚀 Finance Management System (Full-Stack)
แอปพลิเคชันจัดการธุรกรรมทางการเงิน พัฒนาด้วยเทคโนโลยีสมัยใหม่ รองรับการสมัครสมาชิกและจัดการข้อมูลส่วนตัว

## 🛠 Tech Stack
* Database: MySQL / MariaDB
* Frontend: React, Vite, React Router, Context API
* Backend: Node.js, Express, Prisma (v7), Bcrypt

## Required
* MySQL
* Node.js
* Express
* Prisma (latest)
* JWT & bcryptjs
* Vscode
    * Thunder Client (For API Testing)

## Develop

### 📂 Backend Setup

```bash
npm init -y
npm install express bcrypt @prisma/client @prisma/adapter-mariadb mariadb dotenv cors
npm install -D prisma
npx prisma init
```
*(อย่าลืมตั้งค่า `DATABASE_URL` ในไฟล์ `.env` ให้เรียบร้อย)*

### Update schema

1. Run this command `npx prisma migrate dev --name init`
2. ล้างฐานข้อมูลเก่า `npx prisma migrate reset `

### Create Folder
```bash
touch server.js config.js routes.js
mkdir controllers models middlewares
touch controllers/authController.js middlewares/middleware.js models/userModel.js
```

## Running

### Schema

```bash
npx prisma generate
npx prisma db push (ใช้ db push จะสะดวกกว่า migrate ตอนที่เราแค่เพิ่มฟิลด์เล็กๆ)
```

### Server

```bash
node server.js
```

### API Endpoints

**1. Register** (`POST http://localhost:3000/api/register`)
```json
{
  "username": "testuser",
  "password": "password123"
}
```

**2. Login** (`POST http://localhost:3000/api/login`)
```json
{
  "username": "testuser",
  "password": "password123"
}
```

**3. Protected** (`GET http://localhost:3000/api/protected`)
* **Header:** `Authorization: <วาง_accessToken_ตรงนี้>`

**4. Refresh Token** (`POST http://localhost:3000/api/refresh`)
* **Body:** {

            } ไม่ต้องส่งข้อมูลใดๆ (ปล่อยว่าง)
* **การทำงาน:** ระบบจะอ่านค่า `refreshToken` จาก HttpOnly Cookie ที่ถูกแนบมาโดยอัตโนมัติ และคืนค่า `accessToken` ใบใหม่กลับมาให้แบบ JSON

**5. Logout** (`POST http://localhost:3000/api/logout`)
* **Header:** `Authorization: <วาง_accessToken_ตรงนี้>`
(ทดสอบความปลอดภัย: หลังจาก Logout สำเร็จ หากพยายามยิง API ในข้อ 4 อีกครั้ง ระบบจะแจ้ง 403 Forbidden ทันที!)