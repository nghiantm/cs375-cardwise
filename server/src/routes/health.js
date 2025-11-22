const express = require('express');

const router = express.Router();

/**
 * GET /api/health
 * Returns a simple JSON object indicating the service status and version.
 */
router.get('/health', (req, res) => {
  res.json({ status: 'ok', version: 'v1' });
});

module.exports = router;