const express = require('express');
const {
  storeEmbeddings,
  queryEmbeddings,
  getEmbeddingStats,
  deleteEmbeddings,
  healthCheck
} = require('../controllers/vectorController');

const router = express.Router();

/**
 * @route   POST /api/vector/store
 * @desc    Store text embeddings for vector search
 * @access  Public
 * @body    { text: string, fileId: string, metadata?: object }
 */
router.post('/store', storeEmbeddings);

/**
 * @route   POST /api/vector/query
 * @desc    Query vector database for similar content
 * @access  Public
 * @body    { query: string, fileId?: string, limit?: number, minSimilarity?: number }
 */
router.post('/query', queryEmbeddings);

/**
 * @route   GET /api/vector/stats/:fileId
 * @desc    Get embedding statistics for a file
 * @access  Public
 * @params  fileId: string
 */
router.get('/stats/:fileId', getEmbeddingStats);

/**
 * @route   DELETE /api/vector/:fileId
 * @desc    Delete embeddings for a file
 * @access  Public
 * @params  fileId: string
 */
router.delete('/:fileId', deleteEmbeddings);

/**
 * @route   GET /api/vector/health
 * @desc    Health check for vector services
 * @access  Public
 */
router.get('/health', healthCheck);

module.exports = router;
