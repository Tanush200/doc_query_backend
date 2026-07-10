const express = require('express');
const router = express.Router();
const upload = require('../middleware/multer');
const { uploadDocument } = require('../controllers/upload.controller');

router.post('/', upload.single('pdf'), uploadDocument);
module.exports = router;
