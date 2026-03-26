const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const router = express.Router();
const pool = require('../db/pool');
const { verifyToken } = require('../middleware/auth');

// Create checkout session
router.post('/checkout', verifyToken, async (req, res) => {
  try {
    const userId = req.userId;
    const { planType } = req.body; // 'pro' or 'enterprise'

    // Get user
    const userResult = await pool.query('SELECT email FROM users WHERE id = $1', [userId]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userEmail = userResult.rows[0].email;

    // Define price IDs (replace with your actual Stripe price IDs)
    const priceIds = {
      pro: 'price_pro_monthly', // Replace with actual Stripe price ID
      enterprise: 'price_enterprise_monthly' // Replace with actual Stripe price ID
    };

    if (!priceIds[planType]) {
      return res.status(400).json({ error: 'Invalid plan type' });
    }

    // Create or get Stripe customer
    let stripeCustomerId;
    const subResult = await pool.query(
      'SELECT stripe_customer_id FROM subscriptions WHERE user_id = $1',
      [userId]
    );

    if (subResult.rows[0]?.stripe_customer_id) {
      stripeCustomerId = subResult.rows[0].stripe_customer_id;
    } else {
      const customer = await stripe.customers.create({ email: userEmail });
      stripeCustomerId = customer.id;
      await pool.query(
        'UPDATE subscriptions SET stripe_customer_id = $1 WHERE user_id = $2',
        [stripeCustomerId, userId]
      );
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceIds[planType],
          quantity: 1
        }
      ],
      success_url: `${process.env.FRONTEND_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/pricing`,
      metadata: { userId, planType }
    });

    res.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).json({ error: 'Checkout failed' });
  }
});

// Get subscription details
router.get('/subscription', verifyToken, async (req, res) => {
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

// Webhook handler for Stripe events
router.post('/webhook', express.raw({type: 'application/json'}), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  // Handle events
  switch (event.type) {
    case 'customer.subscription.updated':
    case 'customer.subscription.created':
      const subscription = event.data.object;
      const customerId = subscription.customer;

      // Find user by Stripe customer ID
      const userResult = await pool.query(
        'SELECT user_id FROM subscriptions WHERE stripe_customer_id = $1',
        [customerId]
      );

      if (userResult.rows[0]) {
        const userId = userResult.rows[0].user_id;
        await pool.query(
          `UPDATE subscriptions 
           SET stripe_subscription_id = $1, plan_type = $2, status = $3, 
               current_period_start = $4, current_period_end = $5
           WHERE user_id = $6`,
          [
            subscription.id,
            subscription.metadata.planType || 'pro',
            subscription.status,
            new Date(subscription.current_period_start * 1000),
            new Date(subscription.current_period_end * 1000),
            userId
          ]
        );
      }
      break;

    case 'customer.subscription.deleted':
      const deletedSub = event.data.object;
      await pool.query(
        `UPDATE subscriptions 
         SET plan_type = 'free', status = 'canceled'
         WHERE stripe_subscription_id = $1`,
        [deletedSub.id]
      );
      break;
  }

  // Log webhook
  await pool.query(
    'INSERT INTO webhook_logs (event_type, source, payload) VALUES ($1, $2, $3)',
    [event.type, 'stripe', JSON.stringify(event)]
  );

  res.json({received: true});
});

module.exports = router;
