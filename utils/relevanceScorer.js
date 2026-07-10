/**
 * Improved relevance scorer with:
 * - Stemming-style partial word matching (handles plurals, verb forms)
 * - Smarter fallback: spread chunks across the whole document instead of just the first N
 * - Higher topN default (6) for more context
 */

const normalize = (str) =>
    str.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter((w) => w.length > 1);

// Simple stem: strip common suffixes so "running" matches "run", etc.
const stem = (word) =>
    word
        .replace(/ing$/, '')
        .replace(/tion$/, '')
        .replace(/tions$/, '')
        .replace(/ness$/, '')
        .replace(/ment$/, '')
        .replace(/ly$/, '')
        .replace(/ed$/, '')
        .replace(/er$/, '')
        .replace(/s$/, '');

const scoreChunk = (chunkText, question) => {
    const qWords   = normalize(question);
    const cWords   = normalize(chunkText);
    const cWordSet = new Set(cWords);
    const cStemSet = new Set(cWords.map(stem));

    let score = 0;

    for (const word of qWords) {
        if (cWordSet.has(word))       score += 3; // exact match
        else if (cStemSet.has(stem(word))) score += 1; // stem match
    }

    // Bigram bonus
    for (let i = 0; i < qWords.length - 1; i++) {
        const bigram = `${qWords[i]} ${qWords[i + 1]}`;
        if (chunkText.toLowerCase().includes(bigram)) score += 6;
    }

    return score;
};

/**
 * Find the topN most relevant chunks.
 * Fallback: when nothing scores, spread chunks evenly across the document
 * instead of blindly returning only the first N chunks.
 */
const findRelevantChunks = (chunks, question, topN = 6) => {
    if (!chunks || chunks.length === 0) return [];

    const scored = chunks
        .map((chunk) => ({
            chunkIndex: chunk.chunkIndex,
            text: chunk.text,
            score: scoreChunk(chunk.text, question),
        }))
        .sort((a, b) => b.score - a.score);

    const top = scored.slice(0, topN);

    // If nothing matched, spread selections evenly across the whole document
    if (top.every((c) => c.score === 0)) {
        const step = Math.max(1, Math.floor(chunks.length / topN));
        const spread = [];
        for (let i = 0; i < chunks.length && spread.length < topN; i += step) {
            spread.push(chunks[i]);
        }
        return spread;
    }

    return top;
};

module.exports = { findRelevantChunks };
