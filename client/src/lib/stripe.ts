import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe with public key
const stripePromise = import.meta.env.VITE_STRIPE_PUBLIC_KEY 
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY)
  : Promise.resolve(null);

if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  console.warn('Missing Stripe public key. Checkout functionality will not work properly.');
}

export { stripePromise };
