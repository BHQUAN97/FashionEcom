'use client';

import { AuthLayout } from '@/components/auth/auth-layout';
import { RegisterForm } from '@/components/auth/register-form';

/** Register page — /dang-ky */
export default function RegisterPage() {
  return (
    <AuthLayout>
      <RegisterForm />
    </AuthLayout>
  );
}
