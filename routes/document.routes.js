const express = require('express');
const router = express.Router();
const { getDocument, deleteDocument } = require('../controllers/document.controller');

router.get('/', getDocument);
router.delete('/', deleteDocument);
module.exports = router;
