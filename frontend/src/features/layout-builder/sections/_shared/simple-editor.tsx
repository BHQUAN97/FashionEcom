'use client';

import { type SectionEditorProps } from '../../registry/types';

/**
 * Field types cho simple editor factory
 * - text, number, textarea: input co ban
 * - color: color picker voi text input
 * - checkbox, toggle: boolean
 * - select: dropdown
 * - radio_cards: mode selection dang card voi icon + label
 * - range: slider voi min/max/step
 * - image: URL input voi preview thumbnail
 * - section_header: divider + label (khong phai field)
 */
export interface FieldDef {
  key: string;
  label: string;
  type: 'text' | 'number' | 'color' | 'checkbox' | 'toggle' | 'select' | 'textarea' | 'radio_cards' | 'range' | 'image' | 'section_header';
  options?: { label: string; value: string; icon?: string; description?: string }[];
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  /** An field khi dieu kien khong thoa (key = value) */
  showWhen?: { key: string; value: unknown };
}

/**
 * Factory: tao editor tu field definitions
 * Ho tro mode selection (radio_cards), image preview, range slider, toggle switch
 */
export function createSimpleEditor(fields: FieldDef[]) {
  return function SimpleEditor({ config, onChange }: SectionEditorProps) {

    // Check dieu kien hien thi field
    const shouldShow = (f: FieldDef) => {
      if (!f.showWhen) return true;
      return config[f.showWhen.key] === f.showWhen.value;
    };

    return (
      <div className="space-y-3">
        {fields.map((f) => {
          if (!shouldShow(f)) return null;

          // Section header — divider + label
          if (f.type === 'section_header') {
            return (
              <div key={f.key} className="pt-3 pb-1 border-t">
                <p className="text-xs font-semibold text-gray-800 uppercase tracking-wide">{f.label}</p>
              </div>
            );
          }

          return (
            <div key={f.key}>
              {f.type !== 'toggle' && f.type !== 'checkbox' && f.type !== 'radio_cards' && (
                <label className="block text-xs font-medium text-gray-600 mb-1">{f.label}</label>
              )}

              {/* Text input */}
              {f.type === 'text' && (
                <input
                  type="text"
                  value={(config[f.key] as string) || ''}
                  onChange={(e) => onChange({ ...config, [f.key]: e.target.value })}
                  placeholder={f.placeholder}
                  className="w-full text-sm border rounded-md px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-orange-400 focus:border-orange-400"
                />
              )}

              {/* Textarea */}
              {f.type === 'textarea' && (
                <textarea
                  value={(config[f.key] as string) || ''}
                  onChange={(e) => onChange({ ...config, [f.key]: e.target.value })}
                  placeholder={f.placeholder}
                  rows={3}
                  className="w-full text-sm border rounded-md px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-orange-400"
                />
              )}

              {/* Number input */}
              {f.type === 'number' && (
                <input
                  type="number"
                  value={(config[f.key] as number) ?? 0}
                  min={f.min}
                  max={f.max}
                  step={f.step}
                  onChange={(e) => onChange({ ...config, [f.key]: Number(e.target.value) })}
                  className="w-full text-sm border rounded-md px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-orange-400"
                />
              )}

              {/* Color picker voi text input */}
              {f.type === 'color' && (
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={(config[f.key] as string) || '#000000'}
                    onChange={(e) => onChange({ ...config, [f.key]: e.target.value })}
                    className="w-8 h-8 rounded border cursor-pointer"
                  />
                  <input
                    type="text"
                    value={(config[f.key] as string) || ''}
                    onChange={(e) => onChange({ ...config, [f.key]: e.target.value })}
                    className="flex-1 text-sm border rounded-md px-2.5 py-1.5 font-mono"
                    placeholder="#000000"
                  />
                </div>
              )}

              {/* Toggle switch */}
              {f.type === 'toggle' && (
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm text-gray-700">{f.label}</span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={!!config[f.key]}
                    onClick={() => onChange({ ...config, [f.key]: !config[f.key] })}
                    className={`relative w-10 h-5 rounded-full transition-colors ${config[f.key] ? 'bg-orange-500' : 'bg-gray-300'}`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${config[f.key] ? 'translate-x-5' : ''}`} />
                  </button>
                </label>
              )}

              {/* Checkbox */}
              {f.type === 'checkbox' && (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!config[f.key]}
                    onChange={(e) => onChange({ ...config, [f.key]: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-400"
                  />
                  <span className="text-sm text-gray-700">{f.label}</span>
                </label>
              )}

              {/* Select dropdown */}
              {f.type === 'select' && (
                <select
                  value={(config[f.key] as string) || ''}
                  onChange={(e) => onChange({ ...config, [f.key]: e.target.value })}
                  className="w-full text-sm border rounded-md px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-orange-400"
                >
                  {f.options?.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              )}

              {/* Radio cards — mode selection */}
              {f.type === 'radio_cards' && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-2">{f.label}</label>
                  <div className="grid grid-cols-2 gap-2">
                    {f.options?.map((o) => {
                      const isActive = config[f.key] === o.value;
                      return (
                        <button
                          key={o.value}
                          type="button"
                          onClick={() => onChange({ ...config, [f.key]: o.value })}
                          className={`flex flex-col items-center gap-1 p-2.5 border-2 rounded-lg text-center transition ${
                            isActive
                              ? 'border-orange-500 bg-orange-50 text-orange-700'
                              : 'border-gray-200 hover:border-gray-300 text-gray-600'
                          }`}
                        >
                          {o.icon && <span className="text-lg">{o.icon}</span>}
                          <span className="text-xs font-medium">{o.label}</span>
                          {o.description && <span className="text-[10px] text-gray-400">{o.description}</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Range slider */}
              {f.type === 'range' && (
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={f.min ?? 0}
                    max={f.max ?? 100}
                    step={f.step ?? 1}
                    value={(config[f.key] as number) ?? 0}
                    onChange={(e) => onChange({ ...config, [f.key]: Number(e.target.value) })}
                    className="flex-1 accent-orange-500"
                  />
                  <span className="text-xs text-gray-500 w-10 text-right">{String(config[f.key] ?? 0)}</span>
                </div>
              )}

              {/* Image URL voi preview */}
              {f.type === 'image' && (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={(config[f.key] as string) || ''}
                    onChange={(e) => onChange({ ...config, [f.key]: e.target.value })}
                    placeholder={f.placeholder || 'URL hinh anh'}
                    className="w-full text-sm border rounded-md px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-orange-400"
                  />
                  {(config[f.key] as string) && (
                    <div className="relative rounded-md overflow-hidden border bg-gray-50">
                      <img
                        src={config[f.key] as string}
                        alt="Preview"
                        className="w-full h-24 object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };
}
