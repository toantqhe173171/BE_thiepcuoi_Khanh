require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const Wish = require('./models/Wish');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Endpoint kiểm tra hoạt động & giữ server không ngủ (Ping/Pong)
app.get('/ping', (req, res) => {
    res.status(200).send('pong');
});

// Connect to MongoDB Atlas
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
    console.error("LỖI: Chưa cấu hình MONGODB_URI trong file .env");
    process.exit(1);
}

mongoose.connect(MONGODB_URI)
    .then(() => console.log('✅ Kết nối MongoDB thành công'))
    .catch(err => console.error('❌ Lỗi kết nối CSDL:', err));

// API 1: Lấy danh sách lời chúc
app.get('/api/wishes', async (req, res) => {
    try {
        const wishes = await Wish.find().sort({ createdAt: -1 }).limit(50);
        res.json(wishes);
    } catch (error) {
        console.error("Lỗi GET wishes:", error);
        res.status(500).json({ error: 'Lỗi server khi lấy lời chúc' });
    }
});

// API 2: Gửi lời chúc mới
app.post('/api/wishes', async (req, res) => {
    try {
        const { name, message } = req.body;

        if (!name || !message) {
            return res.status(400).json({ error: 'Vui lòng nhập đầy đủ tên và lời chúc' });
        }

        const newWish = new Wish({ name, message });
        await newWish.save();

        res.status(201).json({ success: true, wish: newWish });
    } catch (error) {
        console.error("Lỗi POST wish:", error);
        res.status(500).json({ error: 'Lỗi server khi lưu lời chúc' });
    }
});


// Khởi chạy Server
app.listen(PORT, () => {
    console.log(`🚀 Server Wedding đang chạy tại http://localhost:${PORT}`);

    // Cơ chế tự động ping định kỳ mỗi 13 phút để giữ server Render không ngủ
    const SERVER_URL = process.env.RENDER_EXTERNAL_URL || 'https://be-thiepcuoi-khanh.onrender.com';
    setInterval(() => {
        fetch(`${SERVER_URL}/ping`)
            .then(res => res.text())
            .then(txt => console.log(`[Keep-Alive] Ping thành công tới ${SERVER_URL}/ping lúc ${new Date().toLocaleTimeString('vi-VN')}: ${txt}`))
            .catch(err => console.log(`[Keep-Alive] Lỗi ping:`, err.message));
    }, 13 * 60 * 1000); // Mỗi 13 phút (trước mốc 15 phút của Render)
});
