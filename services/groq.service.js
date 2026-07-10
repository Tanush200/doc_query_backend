const groq = require('../config/groq');

const generateAnswer = async (question, relevantChunks) => {
    const context = relevantChunks
        .map((c, i) => `[Section ${i + 1}]:\n${c.text}`)
        .join('\n\n---\n\n');

    const systemPrompt = `You are DocQuery, an intelligent AI assistant that answers questions based on the document sections provided below.

INSTRUCTIONS:
- Read all the document sections carefully before answering.
- Answer the question using information from the document sections.
- If the document sections contain partial information, use what is available and be helpful.
- Only say you cannot find information if the topic is completely absent from ALL provided sections.
- Use clean, well-formatted Markdown in your response.
- Be thorough and accurate. Cite relevant details from the document when useful.
- Do NOT make up information that is not present in the document.`;

    const userMessage = `DOCUMENT SECTIONS:\n\n${context}\n\n---\n\nQUESTION: ${question}\n\nPlease answer based on the document sections above.`;

    try {
        const completion = await groq.chat.completions.create({
            model: 'llama-3.1-8b-instant',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user',   content: userMessage  },
            ],
            temperature: 0.2,
            max_tokens: 1024,
        });

        return completion.choices[0]?.message?.content || 'Unable to generate a response.';
    } catch (error) {
        const err = new Error(`Groq API Error: ${error.message}`);
        err.statusCode = 502;
        throw err;
    }
};

const generateSuggestedQuestions = async (chunks) => {
    // Use a spread of chunks — beginning, middle, and end — for better coverage
    const total = chunks.length;
    const selected = [
        chunks[0],
        chunks[Math.floor(total / 2)],
        chunks[total - 1],
    ].filter(Boolean);

    const sample = selected.map((c) => c.text).join('\n\n').substring(0, 2500);

    const prompt = `Based on the document excerpt below, generate exactly 5 specific and interesting questions that a user might want to ask about this document.
Return ONLY a valid JSON array of 5 strings. No explanation, no markdown, just the JSON array.

Document excerpt:
${sample}`;

    try {
        const completion = await groq.chat.completions.create({
            model: 'llama-3.1-8b-instant',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7,
            max_tokens: 400,
        });

        const content = completion.choices[0]?.message?.content || '[]';
        const match   = content.match(/\[[\s\S]*\]/);
        return match ? JSON.parse(match[0]) : [];
    } catch {
        return [];
    }
};

module.exports = { generateAnswer, generateSuggestedQuestions };