/**
 * Whitelist validation cho sort field — chong SQL injection qua orderBy()
 * Chi cho phep sort theo cac column da dinh nghia truoc
 */

const SORT_WHITELISTS: Record<string, string[]> = {
  product: ['createdDate', 'catProductName', 'catProductCode', 'catProductStatus', 'modifiedDate'],
  order: ['createdDate', 'salOrderCode', 'salOrderStatus', 'salOrderTotal', 'modifiedDate'],
  user: ['createdDate', 'sysUserEmail', 'sysUserRole', 'sysUserStatus'],
  customer: ['sysCustomerName', 'sysCustomerMobile', 'sysCustomerTier', 'sysCustomerLoyaltyPoint'],
  inventory: ['invInventoryLevelAvailable'],
  campaign: ['createdDate', 'prmSaleCampaignStartDate', 'prmSaleCampaignEndDate', 'prmSaleCampaignStatus'],
};

/**
 * Validate va tra ve sort field an toan
 * @param field - Gia tri tu query.sort
 * @param entity - Ten entity (product, order, user, customer)
 * @param defaultField - Field mac dinh neu invalid
 * @returns Field da validate hoac default
 */
export function safeSortField(field: string | undefined, entity: string, defaultField: string): string {
  if (!field) return defaultField;

  const whitelist = SORT_WHITELISTS[entity];
  if (!whitelist) return defaultField;

  // Chi cho phep alphanumeric va camelCase — chan moi ky tu dac biet
  if (!/^[a-zA-Z][a-zA-Z0-9]*$/.test(field)) return defaultField;

  return whitelist.includes(field) ? field : defaultField;
}

/**
 * Validate sort order — chi cho phep ASC hoac DESC
 */
export function safeSortOrder(order: string | undefined): 'ASC' | 'DESC' {
  if (!order) return 'DESC';
  const upper = order.toUpperCase();
  return upper === 'ASC' ? 'ASC' : 'DESC';
}
