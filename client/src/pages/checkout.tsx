import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useCartStore, useAuthStore } from '@/lib/store';
import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { motion } from 'framer-motion';
import { ChevronRight, ShoppingBag, CreditCard, CheckCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Helmet } from 'react-helmet';

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  console.warn('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = import.meta.env.VITE_STRIPE_PUBLIC_KEY ? 
  loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY) : 
  Promise.resolve(null);

// Shipping form schema
const shippingSchema = z.object({
  name: z.string().min(2, 'Please enter your full name'),
  email: z.string().email('Please enter a valid email'),
  address: z.string().min(5, 'Please enter your full address'),
  city: z.string().min(2, 'Please enter your city'),
  postalCode: z.string().min(4, 'Please enter a valid postal code'),
  country: z.string().min(2, 'Please enter your country'),
  phone: z.string().min(8, 'Please enter a valid phone number')
});

type ShippingFormData = z.infer<typeof shippingSchema>;

// Checkout steps
enum CheckoutStep {
  CART_REVIEW = 'cart_review',
  SHIPPING = 'shipping',
  PAYMENT = 'payment',
  CONFIRMATION = 'confirmation'
}

const CheckoutPage = () => {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<CheckoutStep>(CheckoutStep.CART_REVIEW);
  const [shippingData, setShippingData] = useState<ShippingFormData | null>(null);
  
  return (
    <>
      <Helmet>
        <title>Checkout | DRBijuteria</title>
        <meta name="description" content="Complete your purchase securely with DRBijuteria." />
      </Helmet>
      
      <div className="container mx-auto px-4 py-8 md:py-16">
        <h1 className="font-serif text-3xl md:text-4xl mb-6 text-center">Checkout</h1>
        
        {/* Checkout Progress */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center max-w-3xl w-full">
            <CheckoutProgressStep 
              icon={<ShoppingBag />}
              title="Cart"
              isActive={currentStep === CheckoutStep.CART_REVIEW}
              isCompleted={currentStep !== CheckoutStep.CART_REVIEW}
              onClick={() => currentStep !== CheckoutStep.CONFIRMATION && setCurrentStep(CheckoutStep.CART_REVIEW)}
            />
            <div className="w-10 h-[2px] bg-light-gray"></div>
            <CheckoutProgressStep 
              icon={<ChevronRight />}
              title="Shipping"
              isActive={currentStep === CheckoutStep.SHIPPING}
              isCompleted={currentStep === CheckoutStep.PAYMENT || currentStep === CheckoutStep.CONFIRMATION}
              onClick={() => currentStep !== CheckoutStep.CART_REVIEW && currentStep !== CheckoutStep.CONFIRMATION && setCurrentStep(CheckoutStep.SHIPPING)}
            />
            <div className="w-10 h-[2px] bg-light-gray"></div>
            <CheckoutProgressStep 
              icon={<CreditCard />}
              title="Payment"
              isActive={currentStep === CheckoutStep.PAYMENT}
              isCompleted={currentStep === CheckoutStep.CONFIRMATION}
              onClick={() => currentStep === CheckoutStep.CONFIRMATION && setCurrentStep(CheckoutStep.PAYMENT)}
            />
            <div className="w-10 h-[2px] bg-light-gray"></div>
            <CheckoutProgressStep 
              icon={<CheckCircle />}
              title="Confirmation"
              isActive={currentStep === CheckoutStep.CONFIRMATION}
              isCompleted={false}
            />
          </div>
        </div>
        
        {/* Checkout Steps */}
        {currentStep === CheckoutStep.CART_REVIEW && (
          <CartReview onProceed={() => setCurrentStep(CheckoutStep.SHIPPING)} />
        )}
        
        {currentStep === CheckoutStep.SHIPPING && (
          <ShippingForm 
            onBack={() => setCurrentStep(CheckoutStep.CART_REVIEW)}
            onProceed={(data) => {
              setShippingData(data);
              setCurrentStep(CheckoutStep.PAYMENT);
            }}
          />
        )}
        
        {currentStep === CheckoutStep.PAYMENT && (
          <PaymentStep 
            onBack={() => setCurrentStep(CheckoutStep.SHIPPING)}
            onSuccess={() => setCurrentStep(CheckoutStep.CONFIRMATION)}
            shippingData={shippingData}
          />
        )}
        
        {currentStep === CheckoutStep.CONFIRMATION && (
          <OrderConfirmation />
        )}
      </div>
    </>
  );
};

const CheckoutProgressStep = ({ 
  icon, 
  title, 
  isActive, 
  isCompleted,
  onClick
}: { 
  icon: React.ReactNode, 
  title: string, 
  isActive: boolean, 
  isCompleted: boolean,
  onClick?: () => void
}) => {
  return (
    <div 
      className={`flex flex-col items-center ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <div 
        className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-colors
        ${isActive ? 'bg-black text-white' : isCompleted ? 'bg-pastel-rose text-black' : 'bg-light-gray text-medium-gray'}`}
      >
        {icon}
      </div>
      <span className={`text-sm ${isActive ? 'font-medium' : ''}`}>{title}</span>
    </div>
  );
};

const CartReview = ({ onProceed }: { onProceed: () => void }) => {
  const { items, totalPrice } = useCartStore();
  const [, navigate] = useLocation();
  
  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto text-center py-12">
        <ShoppingBag className="h-12 w-12 mx-auto text-medium-gray mb-4" />
        <h2 className="font-serif text-2xl mb-4">Your cart is empty</h2>
        <p className="text-medium-gray mb-6">Add some items to your cart before proceeding to checkout.</p>
        <Button onClick={() => navigate('/')} className="bg-black text-white hover:bg-black/90">
          Continue Shopping
        </Button>
      </div>
    );
  }
  
  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white p-6 md:p-8 shadow-sm border border-light-gray mb-6">
        <h2 className="font-serif text-xl md:text-2xl mb-6">Review Your Cart</h2>
        
        <div className="divide-y divide-light-gray">
          {items.map(item => (
            <div key={item.id} className="py-4 flex">
              <img 
                src={item.product.images[0]} 
                alt={item.product.name} 
                className="w-20 h-20 object-cover"
              />
              <div className="ml-4 flex-grow">
                <h3 className="font-serif text-lg mb-1">{item.product.name}</h3>
                <div className="flex justify-between">
                  <span className="text-medium-gray">Qty: {item.quantity}</span>
                  <span className="font-medium">€{(item.product.price * item.quantity).toFixed(2)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 pt-6 border-t border-light-gray">
          <div className="flex justify-between mb-2">
            <span className="text-medium-gray">Subtotal</span>
            <span className="font-medium">€{totalPrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-medium-gray">Shipping</span>
            <span>{totalPrice >= 100 ? 'Free' : '€10.00'}</span>
          </div>
          <div className="flex justify-between mb-6 text-lg font-medium mt-4 pt-4 border-t border-light-gray">
            <span>Total</span>
            <span>€{(totalPrice >= 100 ? totalPrice : totalPrice + 10).toFixed(2)}</span>
          </div>
        </div>
      </div>
      
      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={() => navigate('/')}
          className="border-black"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Continue Shopping
        </Button>
        <Button onClick={onProceed} className="bg-black text-white hover:bg-black/90">
          Proceed to Shipping
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

const ShippingForm = ({ 
  onBack, 
  onProceed 
}: { 
  onBack: () => void, 
  onProceed: (data: ShippingFormData) => void 
}) => {
  const { user } = useAuthStore();
  
  const { register, handleSubmit, formState: { errors } } = useForm<ShippingFormData>({
    resolver: zodResolver(shippingSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      address: user?.address || '',
      phone: user?.phone || '',
      city: '',
      postalCode: '',
      country: 'Portugal'
    }
  });
  
  const onSubmit = (data: ShippingFormData) => {
    onProceed(data);
  };
  
  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white p-6 md:p-8 shadow-sm border border-light-gray mb-6">
        <h2 className="font-serif text-xl md:text-2xl mb-6">Shipping Information</h2>
        
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                {...register('name')}
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
              )}
            </div>
            
            <div className="md:col-span-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                {...register('address')}
                className={errors.address ? 'border-red-500' : ''}
              />
              {errors.address && (
                <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                {...register('city')}
                className={errors.city ? 'border-red-500' : ''}
              />
              {errors.city && (
                <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="postalCode">Postal Code</Label>
              <Input
                id="postalCode"
                {...register('postalCode')}
                className={errors.postalCode ? 'border-red-500' : ''}
              />
              {errors.postalCode && (
                <p className="text-red-500 text-xs mt-1">{errors.postalCode.message}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                {...register('country')}
                className={errors.country ? 'border-red-500' : ''}
              />
              {errors.country && (
                <p className="text-red-500 text-xs mt-1">{errors.country.message}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                {...register('phone')}
                className={errors.phone ? 'border-red-500' : ''}
              />
              {errors.phone && (
                <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>
              )}
            </div>
          </div>
          
          <div className="flex justify-between">
            <Button 
              type="button"
              variant="outline" 
              onClick={onBack}
              className="border-black"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Cart
            </Button>
            <Button 
              type="submit" 
              className="bg-black text-white hover:bg-black/90"
            >
              Continue to Payment
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

const PaymentStep = ({ 
  onBack, 
  onSuccess,
  shippingData
}: { 
  onBack: () => void, 
  onSuccess: () => void,
  shippingData: ShippingFormData | null
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [clientSecret, setClientSecret] = useState("");
  const { items, totalPrice, clearCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const { toast } = useToast();
  
  useEffect(() => {
    // Create PaymentIntent as soon as the page loads
    const createPaymentIntent = async () => {
      try {
        setIsLoading(true);
        
        if (!isAuthenticated) {
          toast({
            variant: 'destructive',
            title: 'Authentication Required',
            description: 'Please log in to complete your purchase.',
          });
          
          return;
        }
        
        const finalAmount = totalPrice >= 100 ? totalPrice : totalPrice + 10;
        
        const res = await apiRequest("POST", "/api/create-payment-intent", { 
          amount: finalAmount,
          shippingData 
        });
        
        const data = await res.json();
        
        setClientSecret(data.clientSecret);
      } catch (error: any) {
        toast({
          variant: 'destructive',
          title: 'Payment Error',
          description: error.message || 'An error occurred while setting up payment.',
        });
      } finally {
        setIsLoading(false);
      }
    };

    createPaymentIntent();
  }, [isAuthenticated, totalPrice, toast, shippingData]);
  
  // Options for the Stripe Elements
  const options = {
    clientSecret,
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: '#1A1A1A',
        colorBackground: '#ffffff',
        colorText: '#1A1A1A',
        colorDanger: '#FF5252',
        fontFamily: 'Montserrat, sans-serif',
        fontSizeBase: '16px',
        borderRadius: '4px',
      },
    },
  };
  
  if (isLoading || !clientSecret) {
    return (
      <div className="max-w-3xl mx-auto text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black mx-auto mb-4"></div>
        <p>Preparing your payment...</p>
      </div>
    );
  }
  
  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white p-6 md:p-8 shadow-sm border border-light-gray mb-6">
        <h2 className="font-serif text-xl md:text-2xl mb-6">Payment Information</h2>
        
        <Elements stripe={stripePromise} options={options}>
          <CheckoutForm 
            onBack={onBack} 
            onSuccess={() => {
              clearCart();
              onSuccess();
            }} 
          />
        </Elements>
      </div>
    </div>
  );
};

const CheckoutForm = ({ 
  onBack, 
  onSuccess 
}: { 
  onBack: () => void, 
  onSuccess: () => void 
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout`, // Stripe will redirect here after payment
      },
      redirect: 'if_required'
    });

    if (error) {
      setErrorMessage(error.message || 'An unexpected error occurred.');
      toast({
        variant: 'destructive',
        title: 'Payment Failed',
        description: error.message || 'Something went wrong with your payment.',
      });
      setIsProcessing(false);
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      toast({
        title: 'Payment Successful',
        description: 'Thank you for your purchase!',
      });
      onSuccess();
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-6 space-y-4">
        <PaymentElement />
        
        {errorMessage && (
          <div className="text-red-500 text-sm mt-2">
            {errorMessage}
          </div>
        )}
      </div>
      
      <p className="text-sm text-medium-gray mb-6">
        All payments are processed securely. Your card information is never stored on our servers.
      </p>
      
      <div className="flex justify-between">
        <Button 
          type="button"
          variant="outline" 
          onClick={onBack}
          disabled={isProcessing}
          className="border-black"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Shipping
        </Button>
        <Button 
          type="submit" 
          disabled={!stripe || isProcessing}
          className="bg-black text-white hover:bg-black/90"
        >
          {isProcessing ? 'Processing...' : 'Complete Payment'}
        </Button>
      </div>
    </form>
  );
};

const OrderConfirmation = () => {
  const [, navigate] = useLocation();
  
  return (
    <div className="max-w-3xl mx-auto text-center">
      <div className="bg-white p-6 md:p-8 shadow-sm border border-light-gray mb-6">
        <div className="w-16 h-16 bg-pastel-rose rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="h-8 w-8 text-black" />
        </div>
        
        <h2 className="font-serif text-2xl md:text-3xl mb-4">Thank You for Your Order!</h2>
        <p className="text-medium-gray mb-6">
          Your order has been successfully placed. We've sent a confirmation email with all the details.
        </p>
        
        <div className="border-y border-light-gray py-6 mb-6">
          <p className="font-medium mb-1">Order Number</p>
          <p className="text-medium-gray mb-4">#{Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}</p>
          
          <p className="font-medium mb-1">Estimated Delivery</p>
          <p className="text-medium-gray">
            {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>
        
        <Button onClick={() => navigate('/profile')} className="bg-black text-white hover:bg-black/90 mb-4">
          View Order in Your Account
        </Button>
        <p>
          <button 
            onClick={() => navigate('/')} 
            className="text-medium-gray hover:text-black underline transition-colors"
          >
            Continue Shopping
          </button>
        </p>
      </div>
    </div>
  );
};

export default CheckoutPage;
