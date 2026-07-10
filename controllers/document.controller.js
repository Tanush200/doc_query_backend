const fs = require('fs');
const Document = require('../models/Document.model');
const ChatHistory = require('../models/ChatHistory.model');
const { deleteFromImageKit } = require('../services/imagekit.service');

const getDocument = async (req, res, next) => {
    try {
        const document = await Document.findOne().select('-chunks');
        if (!document)
            return res.status(404).json({ success: false, message: 'No document uploaded', document: null });

        res.json({
            success: true,
            document: {
                id: document._id,
                originalName: document.originalName,
                fileSize: document.fileSize,
                totalPages: document.totalPages,
                wordCount: document.wordCount,
                readingTime: document.readingTime,
                uploadedAt: document.uploadedAt,
                imagekitUrl: document.imagekitUrl,
            },
        });
    } catch (error) { next(error); }
};

const deleteDocument = async (req, res, next) => {
    try {
        const document = await Document.findOne();
        if (!document)
            return res.status(404).json({ success: false, message: 'No document to delete' });

        if (document.imagekitFileId) await deleteFromImageKit(document.imagekitFileId);

        const local = `./uploads/${document.filename}`;
        if (fs.existsSync(local)) fs.unlinkSync(local);

        await Document.deleteMany();
        await ChatHistory.deleteMany();

        res.json({ success: true, message: 'Document and chat history deleted' });
    } catch (error) { next(error); }
};

module.exports = { getDocument, deleteDocument };
