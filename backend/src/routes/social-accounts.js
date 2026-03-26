const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const { verifyToken } = require('../middleware/auth');

// Get user's connected social accounts
router.get('/', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, platform, account_name, profile_url, is_active, created_at 
       FROM social_accounts WHERE user_id = $1 ORDER BY created_at DESC`,
      [req.userId]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch social accounts' });
  }
});

// Connect new social account (OAuth callback handler)
router.post('/connect', verifyToken, async (req, res) => {
  try {
    const { platform, access_token, account_name, profile_url } = req.body;

    // Validate platform
    const validPlatforms = ['instagram', 'tiktok', 'linkedin', 'youtube', 'facebook', 'twitter'];
    if (!validPlatforms.includes(platform)) {
      return res.status(400).json({ error: 'Invalid platform' });
    }

    // Check subscription allows this many accounts
    const subResult = await pool.query(
      'SELECT plan_type FROM subscriptions WHERE user_id = $1',
      [req.userId]
    );
    const planType = subResult.rows[0]?.plan_type;
    
    // Limits: free=2, pro=10, enterprise=unlimited
    if (planType === 'free') {
      const countResult = await pool.query(
        'SELECT COUNT(*) FROM social_accounts WHERE user_id = $1',
        [req.userId]
      );
      if (parseInt(countResult.rows[0].count) >= 2) {
        return res.status(403).json({ error: 'Free plan limited to 2 accounts' });
      }
    } else if (planType === 'pro') {
      const countResult = await pool.query(
        'SELECT COUNT(*) FROM social_accounts WHERE user_id = $1',
        [req.userId]
      );
      if (parseInt(countResult.rows[0].count) >= 10) {
        return res.status(403).json({ error: 'Pro plan limited to 10 accounts' });
      }
    }

    // Insert social account
    const result = await pool.query(
      `INSERT INTO social_accounts 
       (user_id, platform, access_token, account_name, profile_url) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id, platform, account_name`,
      [req.userId, platform, access_token, account_name, profile_url]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Connect error:', error);
    res.status(500).json({ error: 'Failed to connect account' });
  }
});

// Disconnect social account
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'DELETE FROM social_accounts WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, req.userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Account not found' });
    }
    res.json({ message: 'Account disconnected' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to disconnect account' });
  }
});

// TODO: OAuth handlers for each platform (Instagram, TikTok, etc.)

module.exports = router;
