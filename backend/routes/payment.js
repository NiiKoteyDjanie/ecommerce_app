const express = require('express');
const router = express.Router();
const https = require('https');
const { protect, buyerOnly } = require('../middleware/auth');

// @route  POST /api/payment/initialize
// @desc   Initialize a Paystack transaction, returns an authorization URL
router.post('/initialize', protect, buyerOnly, async (req, res) => {
  const { email, amount, orderId } = req.body;
  // Paystack amount is in pesewas (Ghana) or kobo (Nigeria) — multiply by 100
  const amountInPesewas = Math.round(amount * 100);

  const params = JSON.stringify({
    email,
    amount: amountInPesewas,
    currency: 'GHS',                    // Ghana Cedis
    reference: `order_${orderId}_${Date.now()}`,
    metadata: { orderId },
    callback_url: 'http://localhost:5173/payment/verify',
  });

  const options = {
    hostname: 'api.paystack.co',
    port: 443,
    path: '/transaction/initialize',
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
  };

  const paystackReq = https.request(options, (paystackRes) => {
    let data = '';
    paystackRes.on('data', chunk => data += chunk);
    paystackRes.on('end', () => {
      const parsed = JSON.parse(data);
      if (parsed.status) {
        res.json({
          authorizationUrl: parsed.data.authorization_url,
          reference: parsed.data.reference,
        });
      } else {
        res.status(400).json({ message: parsed.message });
      }
    });
  });

  paystackReq.on('error', (e) => res.status(500).json({ message: e.message }));
  paystackReq.write(params);
  paystackReq.end();
});

// @route  GET /api/payment/verify/:reference
// @desc   Verify a Paystack transaction after redirect
router.get('/verify/:reference', protect, async (req, res) => {
  const options = {
    hostname: 'api.paystack.co',
    port: 443,
    path: `/transaction/verify/${req.params.reference}`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
    },
  };

  const paystackReq = https.request(options, (paystackRes) => {
    let data = '';
    paystackRes.on('data', chunk => data += chunk);
    paystackRes.on('end', () => {
      const parsed = JSON.parse(data);
      if (parsed.status && parsed.data.status === 'success') {
        res.json({ success: true, data: parsed.data });
      } else {
        res.json({ success: false, message: 'Payment not successful' });
      }
    });
  });

  paystackReq.on('error', e => res.status(500).json({ message: e.message }));
  paystackReq.end();
});

module.exports = router;