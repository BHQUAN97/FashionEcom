import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

/** Breadcrumb navigation — mobile: chi hien 2 item cuoi */
export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={cn('text-sm text-gray-500', className)}>
      <ol className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
        <li>
          <Link href="/" className="hover:text-black transition whitespace-nowrap">
            Trang chủ
          </Link>
        </li>
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-1">
            <ChevronRight className="w-3 h-3 flex-shrink-0" />
            {item.href && i < items.length - 1 ? (
              <Link href={item.href} className="hover:text-black transition whitespace-nowrap">
                {item.label}
              </Link>
            ) : (
              <span className="text-gray-800 font-medium whitespace-nowrap">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
