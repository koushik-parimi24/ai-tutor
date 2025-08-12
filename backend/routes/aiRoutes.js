const express = require('express');
const {
  createDiagram,
  createRoadmap,
  createResources,
  handleChat,
  getChatHistoryEndpoint,
  healthCheck
} = require('../controllers/aiController');

const router = express.Router();

/**
 * @route   POST /api/ai/diagram
 * @desc    Generate a Mermaid.js diagram from content
 * @access  Public
 * @body    { content: string, type?: string }
 */
router.post('/diagram', createDiagram);

/**
 * @route   POST /api/ai/roadmap
 * @desc    Generate a learning roadmap from content
 * @access  Public
 * @body    { content: string, duration?: string }
 */
router.post('/roadmap', createRoadmap);

/**
 * @route   POST /api/ai/resources
 * @desc    Generate learning resources from content
 * @access  Public
 * @body    { content: string, count?: number }
 */
router.post('/resources', createResources);

/**
 * @route   POST /api/ai/chat
 * @desc    Handle chat conversation with AI tutor
 * @access  Public
 * @body    { message: string, sessionId?: string, fileId?: string, includeHistory?: boolean }
 */
router.post('/chat', handleChat);

/**
 * @route   GET /api/ai/chat/:sessionId
 * @desc    Get chat history for a session
 * @access  Public
 * @params  sessionId: string
 * @query   limit?: number
 */
router.get('/chat/:sessionId', getChatHistoryEndpoint);

/**
 * @route   GET /api/ai/health
 * @desc    Health check for AI services
 * @access  Public
 */
router.get('/health', healthCheck);

module.exports = router;
