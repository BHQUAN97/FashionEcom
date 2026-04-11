'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center space-y-4 max-w-md">
        <h2 className="text-2xl font-bold">Da xay ra loi</h2>
        <p className="text-gray-600">{error.message || 'Vui long thu lai sau'}</p>
        <button
          onClick={reset}
          className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
        >
          Thu lai
        </button>
      </div>
    </div>
  );
}
