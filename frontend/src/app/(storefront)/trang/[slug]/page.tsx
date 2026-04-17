'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { sanitizeHtml } from '@/lib/utils/sanitize';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4300/api';

interface CmsPage {
  cmsPageId: string;
  cmsPageSlug: string;
  cmsPageTitle: string;
  cmsPageExcerpt: string | null;
  cmsPageContent: string;
  cmsPageThumbnail: string | null;
  cmsPageSeoTitle: string | null;
  cmsPageSeoDescription: string | null;
  cmsPageStatus: number;
  cmsPageSort: number;
  createdDate: string;
  updatedDate: string;
}

interface CmsPageSidebar {
  cmsPageId: string;
  cmsPageSlug: string;
  cmsPageTitle: string;
  cmsPageSort: number;
}

/**
 * CMS Page — /trang/[slug]
 * Hien thi trang noi dung tinh (chinh sach, huong dan, canh bao lua dao...)
 * Layout: main content (70%) + sidebar danh muc page (30%)
 */
export default function CmsPageDetail() {
  const params = useParams();
  const slug = params.slug as string;

  const [page, setPage] = useState<CmsPage | null>(null);
  const [sidebarPages, setSidebarPages] = useState<CmsPageSidebar[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Fetch page data + sidebar pages
  useEffect(() => {
    if (!slug) return;

    setLoading(true);
    setError(false);

    Promise.all([
      fetch(`${API_BASE}/layout/pages/${slug}`).then(r => r.json()),
      fetch(`${API_BASE}/layout/pages`).then(r => r.json()).catch(() => ({ data: [] })),
    ])
      .then(([pageRes, pagesRes]) => {
        if (pageRes.success === false || !pageRes.data) {
          setError(true);
        } else {
          setPage(pageRes.data);
          // Cap nhat document title cho SEO
          document.title = pageRes.data.cmsPageSeoTitle || pageRes.data.cmsPageTitle;
        }
        setSidebarPages(Array.isArray(pagesRes.data) ? pagesRes.data : []);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [slug]);

  // Loading state
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-48 mb-6" />
          <div className="md:flex md:gap-8">
            <div className="md:w-[70%]">
              <div className="h-8 bg-gray-200 rounded w-3/4 mb-4" />
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-4 bg-gray-200 rounded w-5/6" />
                <div className="h-4 bg-gray-200 rounded w-4/6" />
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-4 bg-gray-200 rounded w-3/4" />
              </div>
            </div>
            <div className="hidden md:block md:w-[30%]">
              <div className="h-10 bg-gray-200 rounded mb-2" />
              <div className="space-y-2">
                <div className="h-8 bg-gray-100 rounded" />
                <div className="h-8 bg-gray-100 rounded" />
                <div className="h-8 bg-gray-100 rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 404 — trang khong ton tai
  if (error || !page) {
    return (
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Trang khong ton tai</h1>
        <p className="text-gray-500 mb-6">
          Trang ban dang tim khong ton tai hoac da bi go bo.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-2.5 bg-black text-white text-sm font-semibold rounded hover:bg-gray-800 transition"
        >
          Ve trang chu
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
      {/* Breadcrumb */}
      <Breadcrumb items={[{ label: page.cmsPageTitle }]} />

      {/* Main layout: content + sidebar */}
      <div className="mt-4 md:flex md:gap-8">
        {/* Main content */}
        <div className="md:w-[70%]">
          <h1 className="text-2xl font-bold mb-4">{page.cmsPageTitle}</h1>

          {/* Excerpt — hien thi neu co */}
          {page.cmsPageExcerpt && (
            <p className="text-gray-600 text-sm mb-4 italic">
              {page.cmsPageExcerpt}
            </p>
          )}

          {/* HTML content — sanitized */}
          <div
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(page.cmsPageContent || '') }}
          />
        </div>

        {/* Sidebar — danh muc page */}
        <aside className="mt-8 md:mt-0 md:w-[30%]">
          {sidebarPages.length > 0 && (
            <div className="border rounded-lg overflow-hidden">
              <div className="px-4 py-3 bg-gray-50 font-semibold text-sm border-b">
                Danh muc trang
              </div>
              <nav>
                {sidebarPages.map((sp) => (
                  <Link
                    key={sp.cmsPageId}
                    href={`/trang/${sp.cmsPageSlug}`}
                    className={`block px-4 py-2.5 text-sm border-b last:border-0 transition ${
                      sp.cmsPageSlug === slug
                        ? 'font-semibold text-black bg-gray-50'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-black'
                    }`}
                  >
                    {sp.cmsPageTitle}
                  </Link>
                ))}
              </nav>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
