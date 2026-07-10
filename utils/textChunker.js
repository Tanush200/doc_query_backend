const chunkText = (text, chunkSize = 600) => {
    const words = text.replace(/\s+/g, ' ').trim().split(' ').filter(Boolean);
    const chunks = [];

    for (let i = 0, idx = 0; i < words.length; i += chunkSize, idx++) {
        const slice = words.slice(i, i + chunkSize).join(' ');
        if (slice.trim()) chunks.push({ chunkIndex: idx, text: slice });
    }

    return chunks;
};

const countWords = (text) =>
    text.replace(/\s+/g, ' ').trim().split(' ').filter(Boolean).length;

const estimateReadingTime = (wordCount) => Math.ceil(wordCount / 200);

module.exports = { chunkText, countWords, estimateReadingTime };
