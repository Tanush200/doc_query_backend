const mongoose = require('mongoose');

const chatHistorySchema = new mongoose.Schema({
    documentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document', required: true },
    question: { type: String, required: true, trim: true },
    answer: { type: String, required: true },
    relevantChunks: { type: [Number], default: [] },
    createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('ChatHistory', chatHistorySchema);
