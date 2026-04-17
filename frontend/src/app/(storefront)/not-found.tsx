import Link from 'next/link';

/** Custom 404 page */
export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-6xl font-bold text-gray-200">404</p>
        <h1 className="text-xl font-bold mt-4">Trang không tồn tại</h1>
        <p className="text-gray-500 mt-2">Trang bạn đang tìm không tồn tại hoặc đã bị xóa</p>
        <Link
          href="/"
          className="inline-block mt-4 px-6 py-2.5 bg-black text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition"
        >
          VỀ TRANG CHỦ
        </Link>
      </div>
    </div>
  );
}
