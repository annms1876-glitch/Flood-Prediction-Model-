import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
      <h2 className="text-4xl font-bold text-white mb-2">404</h2>
      <p className="text-slate-400 mb-6">The requested page could not be found.</p>
      <Link
        href="/"
        className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-sm font-medium transition"
      >
        Return to Dashboard
      </Link>
    </div>
  );
}
