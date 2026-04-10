'use client';

import { useCheckoutStore } from '@/lib/stores/checkout.store';

/** Checkout shipping form — ten, SDT, dia chi 3 cap (tinh/huyen/xa) */
export function CheckoutShipping() {
  const { shipping, setShipping } = useCheckoutStore();

  const inputClass =
    'w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black';

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-sm">Thong tin giao hang</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Ho ten *</label>
          <input
            type="text"
            value={shipping.name}
            onChange={(e) => setShipping({ name: e.target.value })}
            placeholder="Nguyen Van A"
            className={inputClass}
            required
          />
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">So dien thoai *</label>
          <input
            type="tel"
            value={shipping.phone}
            onChange={(e) => setShipping({ phone: e.target.value })}
            placeholder="0901234567"
            className={inputClass}
            required
          />
        </div>
      </div>

      {/* Tinh/Thanh pho */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Tinh/Thanh pho *</label>
          <select
            value={shipping.province_code}
            onChange={(e) => {
              const name = e.target.options[e.target.selectedIndex].text;
              setShipping({ province_code: e.target.value, province: name, district_code: '', district: '', ward_code: '', ward: '' });
            }}
            className={inputClass}
          >
            <option value="">Chon tinh/thanh pho</option>
            <option value="79">Ho Chi Minh</option>
            <option value="01">Ha Noi</option>
            <option value="48">Da Nang</option>
            <option value="92">Can Tho</option>
            <option value="31">Hai Phong</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Quan/Huyen *</label>
          <select
            value={shipping.district_code}
            onChange={(e) => {
              const name = e.target.options[e.target.selectedIndex].text;
              setShipping({ district_code: e.target.value, district: name, ward_code: '', ward: '' });
            }}
            className={inputClass}
          >
            <option value="">Chon quan/huyen</option>
            {shipping.province_code === '79' && (
              <>
                <option value="760">Quan 1</option>
                <option value="769">Quan 3</option>
                <option value="773">Quan 7</option>
                <option value="778">Binh Thanh</option>
              </>
            )}
            {shipping.province_code === '01' && (
              <>
                <option value="001">Ba Dinh</option>
                <option value="005">Cau Giay</option>
                <option value="006">Dong Da</option>
              </>
            )}
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Phuong/Xa *</label>
          <select
            value={shipping.ward_code}
            onChange={(e) => {
              const name = e.target.options[e.target.selectedIndex].text;
              setShipping({ ward_code: e.target.value, ward: name });
            }}
            className={inputClass}
          >
            <option value="">Chon phuong/xa</option>
            {shipping.district_code === '760' && (
              <>
                <option value="26734">Phuong Ben Nghe</option>
                <option value="26737">Phuong Ben Thanh</option>
              </>
            )}
          </select>
        </div>
      </div>

      {/* Dia chi cu the */}
      <div>
        <label className="text-xs text-gray-500 mb-1 block">Dia chi cu the *</label>
        <input
          type="text"
          value={shipping.address_line}
          onChange={(e) => setShipping({ address_line: e.target.value })}
          placeholder="So nha, ten duong..."
          className={inputClass}
          required
        />
      </div>

      {/* Ghi chu */}
      <div>
        <label className="text-xs text-gray-500 mb-1 block">Ghi chu</label>
        <textarea
          value={shipping.note}
          onChange={(e) => setShipping({ note: e.target.value })}
          placeholder="Ghi chu cho don hang (giao gio hanh chinh, goi truoc khi giao...)"
          rows={2}
          className={inputClass}
        />
      </div>
    </div>
  );
}
