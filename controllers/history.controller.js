const ChatHistory = require('../models/ChatHistory.model');
const Document = require('../models/Document.model');

const getHistory = async (req, res, next) => {
    try {
        const document = await Document.findOne();
        if (!document) return res.json({ success: true, history: [] });

        const history = await ChatHistory.find({ documentId: document._id })
            .sort({ createdAt: 1 })
            .select('-relevantChunks');

        res.json({ success: true, history });
    } catch (error) { next(error); }
};

const clearHistory = async (req, res, next) => {
    try {
        const document = await Document.findOne();
        if (document) await ChatHistory.deleteMany({ documentId: document._id });
        res.json({ success: true, message: 'Chat history cleared' });
    } catch (error) { next(error); }
};

module.exports = { getHistory, clearHistory };
