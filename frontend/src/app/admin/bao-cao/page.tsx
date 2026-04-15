import { redirect } from 'next/navigation';

/** Bao cao index — redirect sang doanh thu */
export default function ReportsPage() {
  redirect('/admin/bao-cao/doanh-thu');
}
