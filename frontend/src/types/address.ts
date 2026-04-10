/** Dia chi giao hang */

export interface Address {
  id: string;
  name: string;
  phone: string;
  province: string;
  province_code: string;
  district: string;
  district_code: string;
  ward: string;
  ward_code: string;
  address_line: string;
  is_default: boolean;
}

export interface Province {
  code: string;
  name: string;
}

export interface District {
  code: string;
  name: string;
  province_code: string;
}

export interface Ward {
  code: string;
  name: string;
  district_code: string;
}
