'use client';

import { useState } from 'react';
import { MapPin, Pencil, Trash2, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Address } from '@/types/address';
import { MOCK_ADDRESSES } from '@/lib/mock/data';

/** Address list — CRUD, set default */
export function AddressList() {
  const [addresses, setAddresses] = useState<Address[]>(MOCK_ADDRESSES);

  const handleDelete = (id: string) => {
    setAddresses((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSetDefault = (id: string) => {
    setAddresses((prev) =>
      prev.map((a) => ({ ...a, is_default: a.id === id })),
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold">Sổ địa chỉ</h2>
        <button className="flex items-center gap-1.5 text-sm text-red-600 hover:underline">
          <Plus className="w-4 h-4" />
          Thêm địa chỉ mới
        </button>
      </div>

      {addresses.length === 0 ? (
        <div className="text-center py-12">
          <MapPin className="w-12 h-12 text-gray-300 mx-auto" />
          <p className="text-gray-500 mt-2">Chưa có địa chỉ nào</p>
        </div>
      ) : (
        <div className="space-y-3">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className={cn(
                'border rounded-lg p-4',
                addr.is_default && 'border-black',
              )}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{addr.name}</span>
                    <span className="text-sm text-gray-500">|</span>
                    <span className="text-sm text-gray-500">{addr.phone}</span>
                    {addr.is_default && (
                      <span className="text-xs bg-black text-white px-1.5 py-0.5 rounded">Mặc định</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {addr.address_line}, {addr.ward}, {addr.district}, {addr.province}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button className="p-1.5 text-gray-400 hover:text-blue-600" aria-label="Sửa">
                    <Pencil className="w-4 h-4" />
                  </button>
                  {!addr.is_default && (
                    <button
                      onClick={() => handleDelete(addr.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600"
                      aria-label="Xóa"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
              {!addr.is_default && (
                <button
                  onClick={() => handleSetDefault(addr.id)}
                  className="text-xs text-gray-500 hover:text-black mt-2"
                >
                  Đặt làm mặc định
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
