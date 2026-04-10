/** Khach hang */

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  date_of_birth: string | null;
  gender: 'male' | 'female' | 'other' | null;
  avatar: string | null;
  created_at: string;
}
