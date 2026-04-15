import Link from 'next/link';

/** Khuyen mai hub — links den cac trang con */
export default function PromotionsPage() {
  const sections = [
    { href: '/admin/khuyen-mai/chuong-trinh-sale', title: 'Chuong trinh Sale', desc: 'Tao va quan ly cac dot sale theo thoi gian, set gia per variant' },
    { href: '/admin/khuyen-mai/flash-sale', title: 'Flash Sale', desc: 'Sale chop nhoang, gioi han so luong va thoi gian ngan' },
    { href: '/admin/khuyen-mai/ma-giam', title: 'Ma giam gia', desc: 'Voucher/coupon ap dung tai checkout' },
    { href: '/admin/khuyen-mai/loyalty', title: 'Loyalty', desc: 'Chuong trinh tich diem va phan hang khach hang' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Khuyen mai</h1>
      <div className="grid md:grid-cols-2 gap-4">
        {sections.map((s) => (
          <Link key={s.href} href={s.href}
            className="block bg-white border rounded-lg p-6 hover:border-gray-400 transition">
            <h2 className="font-medium mb-1">{s.title}</h2>
            <p className="text-sm text-gray-500">{s.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
