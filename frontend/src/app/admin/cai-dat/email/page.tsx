'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api/client';

interface EmailTemplate {
  cmsEmailTemplateId: string;
  cmsEmailTemplateKey: string;
  cmsEmailTemplateSubject: string;
  cmsEmailTemplateBody: string;
  cmsEmailTemplateVariables: Array<{ key: string; label: string; sample: string }> | null;
}

const TEMPLATE_LABELS: Record<string, string> = {
  welcome: 'Chao mung',
  order_confirmation: 'Xac nhan don hang',
  order_shipped: 'Don hang dang giao',
  order_delivered: 'Giao hang thanh cong',
  order_cancelled: 'Huy don hang',
  password_reset: 'Dat lai mat khau',
  flash_sale_notify: 'Thong bao Flash Sale',
  discount_code: 'Ma giam gia',
};

/**
 * Admin Email Templates — editor voi variable picker va preview
 */
export default function EmailTemplatesPage() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [editKey, setEditKey] = useState<string | null>(null);
  const [form, setForm] = useState({ subject: '', body: '' });
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    api.get<EmailTemplate[]>('/admin/layout/email-templates')
      .then(res => setTemplates(res.data))
      .finally(() => setLoading(false));
  }, []);

  const handleEdit = (tmpl: EmailTemplate) => {
    setEditKey(tmpl.cmsEmailTemplateKey);
    setForm({ subject: tmpl.cmsEmailTemplateSubject, body: tmpl.cmsEmailTemplateBody });
  };

  const handleSave = async () => {
    if (!editKey) return;
    setSaving(true);
    try {
      await api.put(`/admin/layout/email-templates/${editKey}`, {
        subject: form.subject,
        body: form.body,
      });
      // Reload
      const res = await api.get<EmailTemplate[]>('/admin/layout/email-templates');
      setTemplates(res.data);
      setEditKey(null);
    } finally {
      setSaving(false);
    }
  };

  const activeTemplate = templates.find(t => t.cmsEmailTemplateKey === editKey);

  const insertVariable = (varKey: string) => {
    setForm({ ...form, body: form.body + `{{${varKey}}}` });
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Mau Email</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Template list */}
        <div className="space-y-2">
          {templates.map(tmpl => (
            <button
              key={tmpl.cmsEmailTemplateKey}
              onClick={() => handleEdit(tmpl)}
              className={`w-full text-left px-4 py-3 border rounded-lg text-sm transition ${editKey === tmpl.cmsEmailTemplateKey ? 'border-black bg-gray-50' : 'hover:bg-gray-50'}`}
            >
              <p className="font-medium">{TEMPLATE_LABELS[tmpl.cmsEmailTemplateKey] || tmpl.cmsEmailTemplateKey}</p>
              <p className="text-xs text-gray-400 truncate">{tmpl.cmsEmailTemplateSubject}</p>
            </button>
          ))}
        </div>

        {/* Editor */}
        {editKey && activeTemplate && (
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-medium">{TEMPLATE_LABELS[editKey] || editKey}</h2>
              <div className="flex gap-2">
                <button onClick={() => setShowPreview(!showPreview)} className="px-3 py-1.5 text-xs border rounded">
                  {showPreview ? 'Editor' : 'Preview'}
                </button>
                <button onClick={handleSave} disabled={saving} className="px-4 py-1.5 text-xs bg-black text-white rounded disabled:opacity-50">
                  {saving ? 'Luu...' : 'Luu'}
                </button>
              </div>
            </div>

            <input
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              placeholder="Subject line"
              className="w-full border rounded px-3 py-2 text-sm"
            />

            {/* Variable picker */}
            {activeTemplate.cmsEmailTemplateVariables && (
              <div className="flex flex-wrap gap-1">
                {activeTemplate.cmsEmailTemplateVariables.map(v => (
                  <button
                    key={v.key}
                    onClick={() => insertVariable(v.key)}
                    className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded hover:bg-blue-100"
                    title={`${v.label}: ${v.sample}`}
                  >
                    {`{{${v.key}}}`}
                  </button>
                ))}
              </div>
            )}

            {showPreview ? (
              <div className="border rounded-lg p-4 bg-white min-h-[300px]" dangerouslySetInnerHTML={{ __html: form.body }} />
            ) : (
              <textarea
                value={form.body}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
                rows={15}
                className="w-full border rounded px-3 py-2 text-sm font-mono"
                placeholder="<h2>Noi dung email HTML</h2>"
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
