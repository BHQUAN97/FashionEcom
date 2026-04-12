'use client';

import { useRouter } from 'next/navigation';
import { ROUTES } from '@/lib/constants/routes';
import { useCartStore } from '@/lib/stores/cart.store';
import { useCheckoutStore } from '@/lib/stores/checkout.store';
import { CheckoutStepIndicator } from '@/components/checkout/checkout-step-indicator';
import { CheckoutReview } from '@/components/checkout/checkout-review';
import { CheckoutShipping } from '@/components/checkout/checkout-shipping';
import { CheckoutPayment } from '@/components/checkout/checkout-payment';
import { OrderSummaryPanel } from '@/components/checkout/order-summary-panel';

/**
 * Checkout page — /thanh-toan
 * 3 steps: review -> shipping -> payment
 */
export default function CheckoutPage() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);
  const { step, setStep, shipping, reset } = useCheckoutStore();

  // Redirect neu gio hang trong
  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-12 text-center">
        <p className="text-gray-500">Giỏ hàng trống. Vui lòng thêm sản phẩm trước khi thanh toán.</p>
      </div>
    );
  }

  const handleNext = () => {
    if (step === 'review') setStep('shipping');
    else if (step === 'shipping') setStep('payment');
    else if (step === 'payment') handleSubmit();
  };

  const handleBack = () => {
    if (step === 'shipping') setStep('review');
    else if (step === 'payment') setStep('shipping');
  };

  const handleSubmit = () => {
    // Mock submit — clear cart, redirect to success
    clearCart();
    reset();
    router.push(ROUTES.CHECKOUT_SUCCESS);
  };

  // Validate shipping truoc khi cho next
  const canProceedShipping =
    shipping.name && shipping.phone && shipping.province_code && shipping.district_code && shipping.address_line;

  const getNextLabel = () => {
    if (step === 'review') return 'TIẾP TỤC';
    if (step === 'shipping') return 'CHỌN THANH TOÁN';
    return 'ĐẶT HÀNG';
  };

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-4">
      <h1 className="text-lg md:text-2xl font-bold mb-4">Thanh toán</h1>

      <CheckoutStepIndicator currentStep={step} className="mb-6" />

      <div className="md:flex md:gap-8">
        {/* Main content */}
        <div className="flex-1">
          {step === 'review' && <CheckoutReview />}
          {step === 'shipping' && <CheckoutShipping />}
          {step === 'payment' && <CheckoutPayment />}

          {/* Navigation buttons */}
          <div className="flex gap-3 mt-6">
            {step !== 'review' && (
              <button
                onClick={handleBack}
                className="flex-1 py-3 border border-gray-300 text-sm font-semibold rounded-lg hover:bg-gray-50 transition"
              >
                QUAY LẠI
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={step === 'shipping' && !canProceedShipping}
              className="flex-1 py-3 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition disabled:opacity-50"
            >
              {getNextLabel()}
            </button>
          </div>
        </div>

        {/* Order summary — desktop sidebar */}
        <div className="hidden md:block md:w-80 flex-shrink-0">
          <div className="sticky top-20">
            <OrderSummaryPanel />
          </div>
        </div>
      </div>
    </div>
  );
}
