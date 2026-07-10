const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 5000,
        });
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ MongoDB Error: ${error.message}`);
        if (error.message.includes('whitelist') || error.message.includes('Could not connect')) {
            console.error('👉 Fix: MongoDB Atlas → Network Access → Add IP 0.0.0.0/0');
        }
        process.exit(1);
    }
};

module.exports = connectDB;
