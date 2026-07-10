const fs = require('fs')
const Document = require('../models/Document.model');
const ChatHistory = require('../models/ChatHistory.model');

const parsePDF = require('../utils/pdfParser');
const { chunkText, countWords, estimateReadingTime } = require('../utils/textChunker');

const { uploadToImageKit } = require('../services/imagekit.service');
const { generateSuggestedQuestions } = require('../services/groq.service')


const uploadDocument = async (req, res, next) => {
    const filePath = req.file?.path;

    try {
        if (!req.file) {
            const err = new Error('No file uploaded');
            err.statusCode = 400;
            return next(err);
        }

        await Document.deleteMany();
        await ChatHistory.deleteMany();

        const { text, numPages } = await parsePDF(filePath);

        if (!text || text.trim().length < 10) {
            if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
            const err = new Error('Could not extract text. PDF may be image-based or corrupted.');
            err.statusCode = 422;
            return next(err);
        }

        const chunks = chunkText(text);
        const wordCount = countWords(text);
        const readingTime = estimateReadingTime(wordCount);

        const { fileId: imagekitFileId, url: imagekitUrl } = await uploadToImageKit(filePath, req.file.originalname);

        const document = await Document.create({
            filename: req.file.filename,
            originalName: req.file.originalname,
            fileSize: req.file.size,
            totalPages: numPages,
            wordCount,
            readingTime,
            imagekitFileId,
            imagekitUrl,
            chunks,
        });

        let suggestedQuestions = [];
        try { suggestedQuestions = await generateSuggestedQuestions(chunks); } catch { /**/ }
        if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
        res.status(201).json({
            success: true,
            message: 'Document uploaded and processed successfully',
            document: {
                id: document._id,
                originalName: document.originalName,
                fileSize: document.fileSize,
                totalPages: document.totalPages,
                wordCount: document.wordCount,
                readingTime: document.readingTime,
                totalChunks: chunks.length,
                uploadedAt: document.uploadedAt,
            },
            suggestedQuestions,
        });
    } catch (error) {
        if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
        next(error);
    }
}

module.exports = { uploadDocument };

