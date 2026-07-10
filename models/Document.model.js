const mongoose = require('mongoose');

const chunkSchema = new mongoose.Schema({
    chunkIndex: { type: Number, required: true },
    text: { type: String, required: true },
});

const documentSchema = new mongoose.Schema({
    filename: { type: String, required: true },
    originalName: { type: String, required: true },
    fileSize: { type: Number, required: true },
    totalPages: { type: Number, default: 0 },
    wordCount: { type: Number, default: 0 },
    readingTime: { type: Number, default: 0 },
    imagekitFileId: { type: String, default: null },
    imagekitUrl: { type: String, default: null },
    uploadedAt: { type: Date, default: Date.now },
    chunks: [chunkSchema],
}, { timestamps: true });

module.exports = mongoose.model('Document', documentSchema);
