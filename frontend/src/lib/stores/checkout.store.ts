import { create } from 'zustand';
import type { PaymentMethod } from '@/types/order';

export type CheckoutStep = 'review' | 'shipping' | 'payment';

interface ShippingInfo {
  name: string;
  phone: string;
  province: string;
  province_code: string;
  district: string;
  district_code: string;
  ward: string;
  ward_code: string;
  address_line: string;
  note: string;
}

interface CheckoutState {
  step: CheckoutStep;
  shipping: ShippingInfo;
  paymentMethod: PaymentMethod;
  shippingFee: number;
  setStep: (step: CheckoutStep) => void;
  setShipping: (info: Partial<ShippingInfo>) => void;
  setPaymentMethod: (method: PaymentMethod) => void;
  setShippingFee: (fee: number) => void;
  reset: () => void;
}

const defaultShipping: ShippingInfo = {
  name: '',
  phone: '',
  province: '',
  province_code: '',
  district: '',
  district_code: '',
  ward: '',
  ward_code: '',
  address_line: '',
  note: '',
};

export const useCheckoutStore = create<CheckoutState>((set) => ({
  step: 'review',
  shipping: defaultShipping,
  paymentMethod: 'cod',
  shippingFee: 30000,

  setStep: (step) => set({ step }),
  setShipping: (info) =>
    set((state) => ({ shipping: { ...state.shipping, ...info } })),
  setPaymentMethod: (paymentMethod) => set({ paymentMethod }),
  setShippingFee: (shippingFee) => set({ shippingFee }),
  reset: () => set({ step: 'review', shipping: defaultShipping, paymentMethod: 'cod', shippingFee: 30000 }),
}));
