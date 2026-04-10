/** Route constants — Vietnamese slugs */

export const ROUTES = {
  HOME: '/',
  PRODUCTS: '/san-pham',
  PRODUCT_DETAIL: (slug: string) => `/san-pham/${slug}`,
  CATEGORY: (slug: string) => `/danh-muc/${slug}`,
  SEARCH: '/tim-kiem',
  CART: '/gio-hang',
  CHECKOUT: '/thanh-toan',
  CHECKOUT_SUCCESS: '/thanh-toan/thanh-cong',
  LOGIN: '/dang-nhap',
  REGISTER: '/dang-ky',
  FORGOT_PASSWORD: '/quen-mat-khau',
  ACCOUNT: '/tai-khoan',
  ORDERS: '/tai-khoan/don-hang',
  ORDER_DETAIL: (code: string) => `/tai-khoan/don-hang/${code}`,
  WISHLIST: '/tai-khoan/yeu-thich',
  ADDRESSES: '/tai-khoan/dia-chi',
} as const;
