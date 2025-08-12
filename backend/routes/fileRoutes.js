const express = require('express');
const { 
  upload, 
  uploadAndProcessFile, 
  getFileInfo, 
  deleteFile, 
  healthCheck 
} = require('../controllers/fileController');

const router = express.Router();

/**
 * @route   POST /api/upload
 * @desc    Upload and process a file (PDF, DOCX, TXT)
 * @access  Public
 */
router.post('/', upload.single('file'), uploadAndProcessFile);

/**
 * @route   GET /api/upload/:fileId
 * @desc    Get file information and metadata
 * @access  Public
 */
router.get('/:fileId', getFileInfo);

/**
 * @route   DELETE /api/upload/:fileId
 * @desc    Delete a file and its metadata
 * @access  Public
 */
router.delete('/:fileId', deleteFile);

/**
 * @route   GET /api/upload/health
 * @desc    Health check for file upload system
 * @access  Public
 */
router.get('/system/health', healthCheck);

module.exports = router;
