'use client';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="text-center space-y-4 max-w-md">
        <h2 className="text-xl font-semibold text-red-600">Loi he thong</h2>
        <p className="text-sm text-gray-600">{error.message}</p>
        <button
          onClick={reset}
          className="px-4 py-2 text-sm bg-black text-white rounded-lg hover:bg-gray-800"
        >
          Thu lai
        </button>
      </div>
    </div>
  );
}
