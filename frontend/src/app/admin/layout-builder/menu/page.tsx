'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api/client';
import { ConfirmDialog } from '@/components/admin/shared/ConfirmDialog';

interface MenuItem {
  cmsMenuItemId: string;
  cmsMenuItemLabel: string;
  cmsMenuItemType: string;
  cmsMenuItemValue: string;
  cmsMenuItemIcon: string | null;
  cmsMenuItemBadge: string | null;
  cmsMenuItemSort: number;
  children?: MenuItem[];
}

/**
 * Admin Menu Builder — header nav, footer menu, drag-drop tree
 */
export default function MenuBuilderPage() {
  const [confirmState, setConfirmState] = useState<{ open: boolean; id: string | null }>({ open: false, id: null });
  const [menuType, setMenuType] = useState('header');
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadMenuItems = async (type: string) => {
    setLoading(true);
    try {
      const res = await api.get<{ menu: unknown; items: MenuItem[] }>(`/admin/layout/menus/${type}/items`);
      setItems(res.data.items || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadMenuItems(menuType); }, [menuType]);

  const addItem = () => {
    setItems([...items, {
      cmsMenuItemId: crypto.randomUUID(),
      cmsMenuItemLabel: 'Menu moi',
      cmsMenuItemType: 'url',
      cmsMenuItemValue: '/',
      cmsMenuItemIcon: null,
      cmsMenuItemBadge: null,
      cmsMenuItemSort: items.length,
      children: [],
    }]);
  };

  const updateItem = (id: string, key: string, value: string) => {
    setItems(items.map(item =>
      item.cmsMenuItemId === id ? { ...item, [key]: value } : {
        ...item,
        children: item.children?.map(child =>
          child.cmsMenuItemId === id ? { ...child, [key]: value } : child,
        ),
      },
    ));
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.cmsMenuItemId !== id).map(item => ({
      ...item,
      children: item.children?.filter(c => c.cmsMenuItemId !== id),
    })));
  };

  const handleConfirmRemove = () => {
    if (confirmState.id) {
      removeItem(confirmState.id);
    }
    setConfirmState({ open: false, id: null });
  };

  const addChild = (parentId: string) => {
    setItems(items.map(item =>
      item.cmsMenuItemId === parentId ? {
        ...item,
        children: [...(item.children || []), {
          cmsMenuItemId: crypto.randomUUID(),
          cmsMenuItemLabel: 'Sub menu',
          cmsMenuItemType: 'url',
          cmsMenuItemValue: '/',
          cmsMenuItemIcon: null,
          cmsMenuItemBadge: null,
          cmsMenuItemSort: (item.children?.length || 0),
        }],
      } : item,
    ));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Flatten tree sang format API
      const apiItems = items.map((item, i) => ({
        id: item.cmsMenuItemId,
        label: item.cmsMenuItemLabel,
        type: item.cmsMenuItemType,
        value: item.cmsMenuItemValue,
        icon: item.cmsMenuItemIcon || undefined,
        badge: item.cmsMenuItemBadge || undefined,
        sort: i,
        children: item.children?.map((child, j) => ({
          id: child.cmsMenuItemId,
          label: child.cmsMenuItemLabel,
          type: child.cmsMenuItemType,
          value: child.cmsMenuItemValue,
          icon: child.cmsMenuItemIcon || undefined,
          badge: child.cmsMenuItemBadge || undefined,
          sort: j,
        })),
      }));

      await api.put(`/admin/layout/menus/${menuType}`, { items: apiItems });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Menu Builder</h1>
        <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-black text-white text-sm rounded disabled:opacity-50">
          {saving ? 'Dang luu...' : 'Luu menu'}
        </button>
      </div>

      {/* Tab chon menu type */}
      <div className="flex gap-2">
        {['header', 'footer', 'mobile'].map(type => (
          <button
            key={type}
            onClick={() => setMenuType(type)}
            className={`px-4 py-2 text-sm rounded-full border transition ${menuType === type ? 'bg-black text-white' : 'hover:bg-gray-50'}`}
          >
            {type === 'header' ? 'Header' : type === 'footer' ? 'Footer' : 'Mobile'}
          </button>
        ))}
      </div>

      {/* Menu items tree */}
      <div className="bg-white border rounded-lg p-4 space-y-2">
        {items.map((item, i) => (
          <div key={item.cmsMenuItemId} className="border rounded-lg p-3">
            <div className="flex items-center gap-2">
              <span className="text-gray-400 cursor-grab">⋮⋮</span>
              <input
                value={item.cmsMenuItemLabel}
                onChange={(e) => updateItem(item.cmsMenuItemId, 'cmsMenuItemLabel', e.target.value)}
                className="flex-1 text-sm border rounded px-2 py-1"
              />
              <select
                value={item.cmsMenuItemType}
                onChange={(e) => updateItem(item.cmsMenuItemId, 'cmsMenuItemType', e.target.value)}
                className="text-xs border rounded px-2 py-1"
              >
                <option value="url">URL</option>
                <option value="category">Danh muc</option>
                <option value="page">Trang</option>
              </select>
              <input
                value={item.cmsMenuItemValue}
                onChange={(e) => updateItem(item.cmsMenuItemId, 'cmsMenuItemValue', e.target.value)}
                placeholder="URL / ID"
                className="w-40 text-sm border rounded px-2 py-1"
              />
              {menuType === 'header' && (
                <button onClick={() => addChild(item.cmsMenuItemId)} className="text-xs text-blue-600 hover:underline">+ Sub</button>
              )}
              <button onClick={() => setConfirmState({ open: true, id: item.cmsMenuItemId })} className="text-xs text-red-600 hover:underline">Xoa</button>
            </div>

            {/* Children (cap 2) */}
            {item.children && item.children.length > 0 && (
              <div className="ml-8 mt-2 space-y-1">
                {item.children.map(child => (
                  <div key={child.cmsMenuItemId} className="flex items-center gap-2">
                    <span className="text-gray-300">└</span>
                    <input
                      value={child.cmsMenuItemLabel}
                      onChange={(e) => updateItem(child.cmsMenuItemId, 'cmsMenuItemLabel', e.target.value)}
                      className="flex-1 text-sm border rounded px-2 py-1"
                    />
                    <input
                      value={child.cmsMenuItemValue}
                      onChange={(e) => updateItem(child.cmsMenuItemId, 'cmsMenuItemValue', e.target.value)}
                      placeholder="URL"
                      className="w-40 text-sm border rounded px-2 py-1"
                    />
                    <button onClick={() => setConfirmState({ open: true, id: child.cmsMenuItemId })} className="text-xs text-red-600">Xoa</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        <button onClick={addItem} className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-400 hover:border-gray-400 hover:text-gray-500">
          + Them menu item
        </button>
      </div>
      <ConfirmDialog
        open={confirmState.open}
        title="Xac nhan xoa"
        message="Ban co chac chan muon xoa menu item nay? Hanh dong nay khong the hoan tac."
        variant="danger"
        confirmLabel="Xoa"
        onConfirm={handleConfirmRemove}
        onCancel={() => setConfirmState({ open: false, id: null })}
      />
    </div>
  );
}
