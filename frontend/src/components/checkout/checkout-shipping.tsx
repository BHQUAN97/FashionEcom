'use client';

import { useCheckoutStore } from '@/lib/stores/checkout.store';

/** Checkout shipping form — ten, SDT, dia chi 3 cap (tinh/huyen/xa) */
export function CheckoutShipping() {
  const { shipping, setShipping } = useCheckoutStore();

  const inputClass =
    'w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black';

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-sm">Thông tin giao hàng</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Họ tên *</label>
          <input
            type="text"
            value={shipping.name}
            onChange={(e) => setShipping({ name: e.target.value })}
            placeholder="Nguyễn Văn A"
            className={inputClass}
            required
            maxLength={100}
          />
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Số điện thoại *</label>
          <input
            type="tel"
            value={shipping.phone}
            onChange={(e) => setShipping({ phone: e.target.value })}
            placeholder="0901234567"
            pattern="^(0|\+84)[0-9]{9,10}$"
            title="So dien thoai bat dau bang 0 hoac +84, theo sau 9-10 so"
            className={inputClass}
            required
          />
        </div>
      </div>

      {/* Tỉnh/Thành phố */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Tỉnh/Thành phố *</label>
          <select
            value={shipping.province_code}
            onChange={(e) => {
              const name = e.target.options[e.target.selectedIndex].text;
              setShipping({ province_code: e.target.value, province: name, district_code: '', district: '', ward_code: '', ward: '' });
            }}
            className={inputClass}
          >
            <option value="">Chọn tỉnh/thành phố</option>
            <option value="79">Hồ Chí Minh</option>
            <option value="01">Hà Nội</option>
            <option value="48">Đà Nẵng</option>
            <option value="92">Cần Thơ</option>
            <option value="31">Hải Phòng</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Quận/Huyện *</label>
          <select
            value={shipping.district_code}
            onChange={(e) => {
              const name = e.target.options[e.target.selectedIndex].text;
              setShipping({ district_code: e.target.value, district: name, ward_code: '', ward: '' });
            }}
            className={inputClass}
          >
            <option value="">Chọn quận/huyện</option>
            {shipping.province_code === '79' && (
              <>
                <option value="760">Quận 1</option>
                <option value="769">Quận 3</option>
                <option value="773">Quận 7</option>
                <option value="778">Bình Thạnh</option>
              </>
            )}
            {shipping.province_code === '01' && (
              <>
                <option value="001">Ba Đình</option>
                <option value="005">Cầu Giấy</option>
                <option value="006">Đống Đa</option>
              </>
            )}
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Phường/Xã *</label>
          <select
            value={shipping.ward_code}
            onChange={(e) => {
              const name = e.target.options[e.target.selectedIndex].text;
              setShipping({ ward_code: e.target.value, ward: name });
            }}
            className={inputClass}
          >
            <option value="">Chọn phường/xã</option>
            {shipping.district_code === '760' && (
              <>
                <option value="26734">Phường Bến Nghé</option>
                <option value="26737">Phường Bến Thành</option>
              </>
            )}
          </select>
        </div>
      </div>

      {/* Địa chỉ cụ thể */}
      <div>
        <label className="text-xs text-gray-500 mb-1 block">Địa chỉ cụ thể *</label>
        <input
          type="text"
          value={shipping.address_line}
          onChange={(e) => setShipping({ address_line: e.target.value })}
          placeholder="Số nhà, tên đường..."
          className={inputClass}
          required
          maxLength={255}
        />
      </div>

      {/* Ghi chú */}
      <div>
        <label className="text-xs text-gray-500 mb-1 block">Ghi chú</label>
        <textarea
          value={shipping.note}
          onChange={(e) => setShipping({ note: e.target.value })}
          placeholder="Ghi chú cho đơn hàng (giao giờ hành chính, gọi trước khi giao...)"
          rows={2}
          className={inputClass}
        />
      </div>
    </div>
  );
}
