'use client';

import { type SectionRendererProps } from '../../registry/types';

export function AnnouncementBarRenderer({ config, preview }: SectionRendererProps) {
  const messages = (config.messages as Array<{ text: string; link: string }>) || [];
  if (messages.length === 0) return null;

  return (
    <div className="py-2 px-4 text-center text-sm" style={{ backgroundColor: config.bg_color as string, color: config.text_color as string }}>
      <div className="flex items-center justify-center gap-4">
        {messages.map((msg, i) => (
          <span key={i}>
            {msg.link && !preview ? <a href={msg.link} className="underline">{msg.text}</a> : msg.text}
          </span>
        ))}
        {Boolean(config.dismissible) && (
          <button className="ml-2 opacity-70 hover:opacity-100" onClick={preview ? undefined : () => {}}>✕</button>
        )}
      </div>
    </div>
  );
}
