const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const { PrismaMariaDb } = require('@prisma/adapter-mariadb');

require('dotenv').config();

const app = express();

// สร้าง Adapter เชื่อมต่อ MySQL
const adapter = new PrismaMariaDb({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    connectionLimit: 5
});

const prisma = new PrismaClient({ adapter });
const PORT = 3001;

app.use(cors());
app.use(express.json());

// ==========================================
// AUTHENTICATION ROUTES
// ==========================================

// สมัครสมาชิก (Register)
app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await prisma.user.create({
            data: { username, password: hashedPassword }
        });
        res.status(201).json({ success: true, message: 'สมัครสมาชิกสำเร็จ!' });
    } catch (error) {
        res.status(500).json({ message: 'Username นี้มีผู้ใช้งานแล้วหรือเกิดข้อผิดพลาด', error: error.message });
    }
});

// ล็อกอิน (Login)
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await prisma.user.findUnique({ where: { username } });
        if (user && await bcrypt.compare(password, user.password)) {
            res.status(200).json({ success: true, message: 'เข้าสู่ระบบสำเร็จ', token: 'jwt-token-xyz' });
        } else {
            res.status(401).json({ success: false, message: 'Username หรือ Password ไม่ถูกต้อง' });
        }
    } catch (error) {
        res.status(500).json({ message: 'เกิดข้อผิดพลาดจากเซิร์ฟเวอร์', error: error.message });
    }
});

// ==========================================
// TRANSACTIONS ROUTES
// ==========================================

// ดึงข้อมูลทั้งหมด
app.get('/api/transactions', async (req, res) => {
    try {
        const transactions = await prisma.transaction.findMany({ orderBy: { createdAt: 'desc' } });
        res.status(200).json(transactions || []);
    } catch (error) {
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูล', error: error.message });
    }
});

// เพิ่มข้อมูลธุรกรรม
app.post('/api/transactions', async (req, res) => {
    const { title, amount, type, date } = req.body;
    try {
        const newTransaction = await prisma.transaction.create({
            data: { 
                title, 
                amount: parseFloat(amount), 
                type, 
                date: date || new Date().toISOString().split('T')[0] 
            }
        });
        res.status(201).json(newTransaction);
    } catch (error) {
        res.status(500).json({ message: 'ไม่สามารถบันทึกข้อมูลได้', error: error.message });
    }
});

// ลบข้อมูลธุรกรรม
app.delete('/api/transactions/:id', async (req, res) => {
    const { id } = req.params;
    try {
        // ตรวจสอบก่อนว่า ID นี้มีอยู่จริงไหมก่อนลบ
        await prisma.transaction.delete({ where: { id: id } });
        res.status(200).json({ success: true, message: 'ลบรายการสำเร็จ' });
    } catch (error) {
        res.status(404).json({ message: 'ไม่พบรายการที่ต้องการลบ', error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Real Backend API connected with MySQL running on http://localhost:${PORT}`);
});