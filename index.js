const express = require('express');
const cors = require('cors');

// Load .env only if not in Render
if (!process.env.RENDER) {
  require('dotenv').config({ debug: true });
}

// Initialize Stripe after dotenv
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

console.log('Stripe Key:', process.env.STRIPE_SECRET_KEY?.slice(0, 8) + '...');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'Server is running', stripeKeySet: !!process.env.STRIPE_SECRET_KEY });
});

// Create PaymentIntent
app.post('/create-payment-intent', async (req, res) => {
  if (!process.env.STRIPE_SECRET_KEY) {
    console.error('STRIPE_SECRET_KEY is not set');
    return res.status(500).json({ error: 'Server configuration error: Missing Stripe key' });
  }

  const { amount, currency } = req.body;

  if (!amount || !currency) {
    console.error('Missing amount or currency:', req.body);
    return res.status(400).json({ error: 'Missing amount or currency' });
  }

  if (typeof amount !== 'number' || amount <= 0) {
    console.error('Invalid amount:', amount);
    return res.status(400).json({ error: 'Amount must be a positive number' });
  }

  if (currency !== 'vnd') {
    console.error('Unsupported currency:', currency);
    return res.status(400).json({ error: 'Only VND is supported' });
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount), // VND, no decimals
      currency,
      payment_method_types: ['card'],
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error('Error creating PaymentIntent:', error.message, error.stack);
    res.status(500).json({ error: error.message });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${port}`);
});