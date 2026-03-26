const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const { verifyToken } = require('../middleware/auth');

// Get subscription details
router.get('/', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT plan_type, status, current_period_end FROM subscriptions WHERE user_id = $1',
      [req.userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Subscription not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch subscription' });
  }
});

// Get available plans
router.get('/plans', (req, res) => {
  const plans = [
    {
      name: 'Free',
      type: 'free',
      price: 0,
      features: [
        'Up to 2 connected accounts',
        'Basic posting (draft only)',
        'No scheduling',
        'No AI features'
      ]
    },
    {
      name: 'Pro',
      type: 'pro',
      price: 6.99,
      billingCycle: 'month',
      features: [
        'Up to 10 connected accounts',
        'All platforms (Instagram, TikTok, LinkedIn, YouTube, Facebook, Twitter)',
        'Schedule posts in advance',
        'Bulk publishing',
        'Basic analytics',
        'Email support'
      ]
    },
    {
      name: 'Enterprise',
      type: 'enterprise',
      price: 29.99,
      billingCycle: 'month',
      features: [
        'Unlimited connected accounts',
        'All Pro features',
        'Team collaboration',
        'Advanced analytics & reporting',
        'Custom integrations',
        'Priority support',
        'API access'
      ]
    }
  ];
  res.json(plans);
});

module.exports = router;
