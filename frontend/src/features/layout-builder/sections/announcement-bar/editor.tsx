'use client';

import { type SectionEditorProps } from '../../registry/types';

export function AnnouncementBarEditor({ config, onChange }: SectionEditorProps) {
  const messages = (config.messages as Array<{ text: string; link: string }>) || [];

  const updateMessage = (index: number, key: string, value: string) => {
    const updated = [...messages];
    updated[index] = { ...updated[index], [key]: value };
    onChange({ ...config, messages: updated });
  };

  return (
    <div className="space-y-3">
      <h4 className="font-medium text-sm">Messages</h4>
      {messages.map((msg, i) => (
        <div key={i} className="flex gap-2">
          <input value={msg.text} onChange={(e) => updateMessage(i, 'text', e.target.value)} placeholder="Noi dung" className="flex-1 text-sm border rounded px-2 py-1" />
          <input value={msg.link} onChange={(e) => updateMessage(i, 'link', e.target.value)} placeholder="Link" className="w-28 text-sm border rounded px-2 py-1" />
          <button onClick={() => onChange({ ...config, messages: messages.filter((_, j) => j !== i) })} className="text-red-500 text-xs">X</button>
        </div>
      ))}
      <button onClick={() => onChange({ ...config, messages: [...messages, { text: '', link: '' }] })} className="text-xs px-2 py-1 border rounded">+ Them</button>

      <div className="grid grid-cols-2 gap-2 pt-2 border-t">
        <label className="text-xs">Mau nen</label>
        <input type="color" value={config.bg_color as string} onChange={(e) => onChange({ ...config, bg_color: e.target.value })} className="w-8 h-6" />
        <label className="text-xs">Mau chu</label>
        <input type="color" value={config.text_color as string} onChange={(e) => onChange({ ...config, text_color: e.target.value })} className="w-8 h-6" />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={!!config.dismissible} onChange={(e) => onChange({ ...config, dismissible: e.target.checked })} />
        Cho phep dong
      </label>
    </div>
  );
}
