/** Cau hinh chung cho storefront */

export const CONFIG = {
  SITE_NAME: 'Fashion Ecom',
  SITE_DESC: 'Thoi trang nam cao cap',
  HOTLINE: '1900-xxxx',
  EMAIL: 'support@fashionecom.vn',

  // Nguong mien phi van chuyen (VND)
  FREE_SHIP_THRESHOLD: 500000,
  // Phi van chuyen mac dinh (VND)
  DEFAULT_SHIPPING_FEE: 30000,

  // Cart
  MAX_QTY_PER_ITEM: 10,

  // Search
  SEARCH_DEBOUNCE_MS: 300,
  SEARCH_MIN_CHARS: 2,

  // Pagination
  DEFAULT_PAGE_SIZE: 12,

  // Bank transfer info — hien thi khi checkout
  // BAO MAT: STK da duoc xoa, lay tu API /payments/methods (da che bot)
  BANK_INFO: {
    bank_name: 'Vietcombank',
    account_name: 'CONG TY TNHH FASHION ECOM',
    account_number: '******7890',
    branch: 'Ho Chi Minh',
  },
} as const;
