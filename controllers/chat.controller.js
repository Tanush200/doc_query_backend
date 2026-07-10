const Document    = require('../models/Document.model');
const ChatHistory = require('../models/ChatHistory.model');
const { findRelevantChunks } = require('../utils/relevanceScorer');
const { generateAnswer }     = require('../services/groq.service');

const chat = async (req, res, next) => {
    try {
        const { question } = req.body;

        if (!question?.trim()) {
            const err = new Error('Question is required');
            err.statusCode = 400;
            return next(err);
        }
        if (question.trim().length > 1000) {
            const err = new Error('Question too long (max 1000 chars)');
            err.statusCode = 400;
            return next(err);
        }

        const document = await Document.findOne();
        if (!document) {
            const err = new Error('No document uploaded. Please upload a PDF first.');
            err.statusCode = 404;
            return next(err);
        }

        if (!document.chunks || document.chunks.length === 0) {
            const err = new Error('Document has no text content. Please re-upload the PDF.');
            err.statusCode = 422;
            return next(err);
        }

        // Convert Mongoose DocumentArray to plain objects so spread works correctly
        // Mongoose subdocuments do NOT spread their schema fields with { ...doc }
        const plainChunks = document.chunks.map((c) => ({
            chunkIndex: c.chunkIndex,
            text: c.text || '',
        }));

        console.log(`📄 Document has ${plainChunks.length} chunks. First chunk preview: "${plainChunks[0]?.text?.substring(0, 80)}..."`);

        const relevantChunks = findRelevantChunks(plainChunks, question.trim(), 6);

        console.log(`🔍 Found ${relevantChunks.length} relevant chunks for: "${question.trim()}"`);
        console.log(`   Chunk indices: [${relevantChunks.map(c => c.chunkIndex).join(', ')}]`);

        const answer = await generateAnswer(question.trim(), relevantChunks);

        const entry = await ChatHistory.create({
            documentId:     document._id,
            question:       question.trim(),
            answer,
            relevantChunks: relevantChunks.map((c) => c.chunkIndex),
        });

        res.json({
            success: true,
            question: question.trim(),
            answer,
            id: entry._id,
            createdAt: entry.createdAt,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { chat };
