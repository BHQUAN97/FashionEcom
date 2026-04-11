/**
 * Utility tao ma entity tu dong theo pattern: PREFIX-YYYYMMDD-XXX
 * Dung chung cho RMA, PO, GRN, WTR va cac entity khac
 */
export async function generateEntityCode(
  prefix: string,
  repo: { count: (options?: any) => Promise<number> },
  padLength = 3,
): Promise<string> {
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const count = await repo.count();
  return `${prefix}-${today}-${String(count + 1).padStart(padLength, '0')}`;
}
