import Stripe from "stripe"
import dotenv from "dotenv"

dotenv.config()

const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);

const createPaymentIntent = async (req, res) => {
    try {
        const { amount, currency = 'usd', metadata = {} } = req.body;
        // Validate amount — must be a positive integer in smallest currency unit
        // e.g. $19.99 = 1999 cents
        if (!amount || amount <= 0) {
            return res.status(400).json({ error: 'Invalid amount' });
        }
        // Create the PaymentIntent via Stripe SDK
        const paymentIntent = await stripeInstance.paymentIntents.create({
            amount: Math.round(amount), // Always integer (cents)
            currency, // 'usd', 'eur', 'gbp', etc.
            automatic_payment_methods: { enabled: true },
            metadata, // Custom data e.g. { orderId: '123' }
        });
        // Return ONLY the client_secret to the frontend
        // Never send the full paymentIntent object!
        res.json({ clientSecret: paymentIntent.client_secret });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

const payRouter = (app) => {
    app.post("/pay/create-payment-intent", createPaymentIntent);
}

export default payRouter;
