import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center space-y-4 max-w-md">
        <h1 className="text-6xl font-bold text-gray-200">404</h1>
        <h2 className="text-xl font-semibold">Không tìm thấy trang</h2>
        <p className="text-gray-600">Trang bạn đang tìm không tồn tại hoặc đã bị xóa.</p>
        <Link href="/" className="inline-block px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800">
          Về trang chủ
        </Link>
      </div>
    </div>
  );
}
