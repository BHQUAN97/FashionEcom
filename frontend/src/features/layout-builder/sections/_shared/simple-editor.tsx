'use client';

import { type SectionEditorProps } from '../../registry/types';

interface FieldDef {
  key: string;
  label: string;
  type: 'text' | 'number' | 'color' | 'checkbox' | 'select' | 'textarea';
  options?: { label: string; value: string }[];
  placeholder?: string;
}

/**
 * Factory: tao editor don gian tu field definitions
 */
export function createSimpleEditor(fields: FieldDef[]) {
  return function SimpleEditor({ config, onChange }: SectionEditorProps) {
    return (
      <div className="space-y-3">
        {fields.map((f) => (
          <div key={f.key}>
            <label className="block text-xs font-medium text-gray-600 mb-1">{f.label}</label>
            {f.type === 'text' && (
              <input
                type="text"
                value={(config[f.key] as string) || ''}
                onChange={(e) => onChange({ ...config, [f.key]: e.target.value })}
                placeholder={f.placeholder}
                className="w-full text-sm border rounded px-2 py-1"
              />
            )}
            {f.type === 'textarea' && (
              <textarea
                value={(config[f.key] as string) || ''}
                onChange={(e) => onChange({ ...config, [f.key]: e.target.value })}
                placeholder={f.placeholder}
                rows={3}
                className="w-full text-sm border rounded px-2 py-1"
              />
            )}
            {f.type === 'number' && (
              <input
                type="number"
                value={(config[f.key] as number) || 0}
                onChange={(e) => onChange({ ...config, [f.key]: Number(e.target.value) })}
                className="w-full text-sm border rounded px-2 py-1"
              />
            )}
            {f.type === 'color' && (
              <input
                type="color"
                value={(config[f.key] as string) || '#000000'}
                onChange={(e) => onChange({ ...config, [f.key]: e.target.value })}
                className="w-8 h-6"
              />
            )}
            {f.type === 'checkbox' && (
              <input
                type="checkbox"
                checked={!!config[f.key]}
                onChange={(e) => onChange({ ...config, [f.key]: e.target.checked })}
              />
            )}
            {f.type === 'select' && (
              <select
                value={(config[f.key] as string) || ''}
                onChange={(e) => onChange({ ...config, [f.key]: e.target.value })}
                className="w-full text-sm border rounded px-2 py-1"
              >
                {f.options?.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            )}
          </div>
        ))}
      </div>
    );
  };
}
