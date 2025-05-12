require('dotenv').config({ debug: true });  // Hiển thị lỗi nếu có
console.log('Stripe Key:', process.env.STRIPE_SECRET_KEY?.slice(0, 8) + '...');
const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Cho phép ứng dụng Android gửi yêu cầu
app.use(express.json()); // Parse JSON body

// Endpoint để tạo PaymentIntent
app.post('/create-payment-intent', async (req, res) => {
    const { amount, currency } = req.body;

    try {
        // Tạo PaymentIntent với Stripe
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount, // Số tiền (ví dụ: 10000 = 100.00 VND)
            currency: currency, // Mã tiền tệ (ví dụ: "vnd")
            payment_method_types: ['card'], // Chỉ chấp nhận thẻ
        });

        // Trả về clientSecret cho ứng dụng Android
        res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
        console.error('Lỗi khi tạo PaymentIntent:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// Khởi động server
app.listen(port, () => {
    console.log(`Server chạy tại http://localhost:${port}`);
});