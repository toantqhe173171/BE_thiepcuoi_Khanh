const mongoose = require('mongoose');

const wishSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    message: {
        type: String,
        required: true,
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Gán cố định vào bảng (collection) riêng 'wishes_nhagai' để tách biệt dữ liệu hoàn toàn với Nhà Trai
module.exports = mongoose.model('WishBride', wishSchema, 'wishes_nhagai');
