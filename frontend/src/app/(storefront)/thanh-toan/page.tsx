'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/lib/constants/routes';
import { useCartStore } from '@/lib/stores/cart.store';
import { useCheckoutStore } from '@/lib/stores/checkout.store';
import { useAuthStore } from '@/lib/stores/auth.store';
import { CheckoutStepIndicator } from '@/components/checkout/checkout-step-indicator';
import { CheckoutReview } from '@/components/checkout/checkout-review';
import { CheckoutShipping } from '@/components/checkout/checkout-shipping';
import { CheckoutPayment } from '@/components/checkout/checkout-payment';
import { OrderSummaryPanel } from '@/components/checkout/order-summary-panel';
import { useStoreHydrated } from '@/lib/hooks/use-store-hydrated';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4300/api';

/**
 * Checkout page — /thanh-toan
 * 3 steps: review -> shipping -> payment
 * Validate cart voi server truoc khi dat hang
 */
export default function CheckoutPage() {
  const hydrated = useStoreHydrated();
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);
  const { step, setStep, shipping, reset } = useCheckoutStore();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated());
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Doi Zustand hydrate xong — tranh SSR mismatch va false-negative auth check
  if (!hydrated) {
    return (
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-12">
        <div className="h-6 w-32 bg-gray-100 rounded animate-pulse mb-6" />
        <div className="h-40 bg-gray-50 rounded-lg animate-pulse" />
      </div>
    );
  }

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

  const handleSubmit = async () => {
    setSubmitError('');
    setSubmitting(true);

    try {
      // Buoc 1: Validate gia cart voi server
      const validateRes = await fetch(`${API_BASE}/products/cart/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
        body: JSON.stringify({
          items: items.map((i) => ({ variantId: i.variantId, qty: i.qty })),
        }),
      });

      if (!validateRes.ok) {
        throw new Error('Không thể xác minh giỏ hàng. Vui lòng thử lại.');
      }

      const validateData = await validateRes.json();
      const invalidItems = validateData.data?.items?.filter((i: { valid: boolean }) => !i.valid) || [];
      if (invalidItems.length > 0) {
        throw new Error(`Có ${invalidItems.length} sản phẩm không còn hàng hoặc đã thay đổi. Vui lòng quay lại giỏ hàng.`);
      }

      // Buoc 2: Tao don hang (khi co checkout API se gui serverSubtotal + shippingFee)
      // TODO: Khi co /checkout/create API, gui shipping info + items + payment method
      // Hien tai clear cart va redirect, don se duoc tao tu BE sau
      clearCart();
      reset();
      router.push(ROUTES.CHECKOUT_SUCCESS);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Đã xảy ra lỗi');
    } finally {
      setSubmitting(false);
    }
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

      {/* Goi y dang nhap — khong bat buoc, chi la suggestion */}
      {!isAuthenticated && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex flex-wrap items-center justify-between gap-2 text-sm">
          <span className="text-blue-800">Đăng nhập để theo dõi đơn hàng và tích điểm thành viên.</span>
          <div className="flex gap-2">
            <a href={ROUTES.LOGIN} className="px-3 py-1.5 text-blue-700 font-semibold hover:underline">
              Đăng nhập
            </a>
            <a href={ROUTES.REGISTER} className="px-3 py-1.5 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 transition">
              Tạo tài khoản
            </a>
          </div>
        </div>
      )}

      <CheckoutStepIndicator currentStep={step} className="mb-6" />

      <div className="md:flex md:gap-8">
        {/* Main content */}
        <div className="flex-1">
          {/* Mobile: collapsible order summary — Baymard: KH can thay don hang khi checkout */}
          <details className="md:hidden mb-4 bg-gray-50 rounded-lg border">
            <summary className="flex items-center justify-between px-4 py-3 cursor-pointer text-sm font-semibold">
              <span>Xem đơn hàng ({items.length} sản phẩm)</span>
              <svg className="w-4 h-4 text-gray-500 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </summary>
            <div className="px-4 pb-3">
              <OrderSummaryPanel />
            </div>
          </details>

          {step === 'review' && <CheckoutReview />}
          {step === 'shipping' && <CheckoutShipping />}
          {step === 'payment' && <CheckoutPayment />}

          {/* Submit error */}
          {submitError && (
            <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">{submitError}</div>
          )}

          {/* Navigation buttons */}
          <div className="flex gap-3 mt-6 mb-24 md:mb-6">
            {step !== 'review' && (
              <button
                onClick={handleBack}
                disabled={submitting}
                className="flex-1 py-3 border border-gray-300 text-sm font-semibold rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
              >
                QUAY LẠI
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={(step === 'shipping' && !canProceedShipping) || submitting}
              className="flex-1 py-3 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition disabled:opacity-50"
            >
              {submitting ? 'Đang xử lý...' : getNextLabel()}
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
