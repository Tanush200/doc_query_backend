const imagekit = require('../config/imagekit');
const fs = require('fs');

// Safely check if ImageKit credentials are configured
const isImageKitConfigured = () => {
    return (
        process.env.IMAGEKIT_PUBLIC_KEY &&
        process.env.IMAGEKIT_PRIVATE_KEY &&
        process.env.IMAGEKIT_URL_ENDPOINT &&
        !process.env.IMAGEKIT_PUBLIC_KEY.includes('your_') &&
        !process.env.IMAGEKIT_PRIVATE_KEY.includes('your_')
    );
};

const uploadToImageKit = async (filePath, fileName) => {
    // Skip if credentials are not set — never block the upload flow
    if (!isImageKitConfigured()) {
        console.log('ImageKit: credentials not configured, skipping upload.');
        return { fileId: null, url: null };
    }

    try {
        const base64 = fs.readFileSync(filePath).toString('base64');

        // Wrap in a timeout so a hanging connection never blocks
        const uploadPromise = imagekit.upload({
            file: base64,
            fileName,
            folder: '/docquery/pdfs',
        });

        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('ImageKit upload timed out')), 15000)
        );

        const response = await Promise.race([uploadPromise, timeoutPromise]);
        return { fileId: response.fileId, url: response.url };
    } catch (error) {
        // ECONNRESET, timeout, auth errors — all are non-fatal
        console.error('ImageKit upload skipped:', error.message);
        return { fileId: null, url: null };
    }
};

const deleteFromImageKit = async (fileId) => {
    if (!fileId || !isImageKitConfigured()) return;
    try {
        await imagekit.deleteFile(fileId);
    } catch (error) {
        console.error('ImageKit delete error:', error.message);
    }
};

module.exports = { uploadToImageKit, deleteFromImageKit };
