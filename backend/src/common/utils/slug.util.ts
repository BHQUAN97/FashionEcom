/**
 * Tao slug tu tieng Viet — bo dau, lowercase, thay khoang trang bang dau gach
 * VD: "Áo Polo Nam Cao Cấp" → "ao-polo-nam-cao-cap"
 */
export function createSlug(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Bo dau
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Chi giu chu, so, khoang trang, gach
    .replace(/[\s_]+/g, '-') // Khoang trang → gach
    .replace(/-+/g, '-') // Gop nhieu gach
    .replace(/^-|-$/g, ''); // Bo gach dau/cuoi
}
