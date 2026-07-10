// pdf-parse v1.1.1 — simple async function API
const pdfParse = require('pdf-parse');
const fs = require('fs');


const parsePDF = async (filePath) => {
    try {
        const dataBuffer = fs.readFileSync(filePath);
        const data = await pdfParse(dataBuffer);
        return { text: data.text, numPages: data.numpages };
    } catch (error) {
        console.error('PDF parse error:', error.message);
        const err = new Error(
            'Failed to parse PDF. Make sure the file is a valid, text-based PDF (not scanned/image-only).'
        );
        err.statusCode = 422;
        throw err;
    }
};

module.exports = parsePDF;