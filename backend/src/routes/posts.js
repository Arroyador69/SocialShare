const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const { verifyToken } = require('../middleware/auth');

// Get user's posts
router.get('/', verifyToken, async (req, res) => {
  try {
    const { status, limit = 20, offset = 0 } = req.query;
    
    let query = 'SELECT id, title, status, scheduled_for, created_at FROM posts WHERE user_id = $1';
    const params = [req.userId];

    if (status) {
      query += ` AND status = $${params.length + 1}`;
      params.push(status);
    }

    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// Create new post
router.post('/', verifyToken, async (req, res) => {
  try {
    const { title, content, media_urls, scheduled_for, platforms } = req.body;

    if (!content || !platforms || platforms.length === 0) {
      return res.status(400).json({ error: 'Content and platforms required' });
    }

    // Check subscription limit
    const subResult = await pool.query(
      'SELECT plan_type FROM subscriptions WHERE user_id = $1',
      [req.userId]
    );
    const planType = subResult.rows[0]?.plan_type;
    
    if (planType === 'free') {
      return res.status(403).json({ error: 'Free plan cannot create posts. Upgrade to Pro.' });
    }

    // Create post
    const result = await pool.query(
      `INSERT INTO posts (user_id, title, content, media_urls, scheduled_for, status) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING id`,
      [req.userId, title, content, media_urls || [], scheduled_for || null, 'draft']
    );

    const postId = result.rows[0].id;

    // Connect platforms
    for (const platformId of platforms) {
      await pool.query(
        `INSERT INTO post_platforms (post_id, social_account_id, platform) 
         VALUES ($1, $2, (SELECT platform FROM social_accounts WHERE id = $2))`,
        [postId, platformId]
      );
    }

    res.status(201).json({ id: postId, message: 'Post created' });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// Update post
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, media_urls, scheduled_for } = req.body;

    const result = await pool.query(
      `UPDATE posts 
       SET title = $1, content = $2, media_urls = $3, scheduled_for = $4, updated_at = NOW()
       WHERE id = $5 AND user_id = $6 AND status = 'draft'
       RETURNING id`,
      [title, content, media_urls, scheduled_for, id, req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found or cannot be edited' });
    }

    res.json({ message: 'Post updated' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update post' });
  }
});

// Publish post (move from draft to scheduled/published)
router.post('/:id/publish', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `UPDATE posts 
       SET status = 'published', posted_at = NOW(), updated_at = NOW()
       WHERE id = $1 AND user_id = $2
       RETURNING id`,
      [id, req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // TODO: Actually publish to connected social platforms

    res.json({ message: 'Post published' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to publish post' });
  }
});

// Delete post
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'DELETE FROM posts WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, req.userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json({ message: 'Post deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

module.exports = router;
