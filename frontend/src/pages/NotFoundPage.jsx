import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, Home, ArrowLeft } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 py-16 space-y-4">
      <div className="w-16 h-16 rounded-3xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-2xl shadow-inner mb-2">
        404
      </div>
      <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
        Page Not Found
      </h1>
      <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
        The public page, municipal report, or governance resource you are looking for does not exist or has been relocated.
      </p>
      <div className="pt-2">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md transition"
        >
          <Home className="w-4 h-4" /> Return to CivicFix Home
        </Link>
      </div>
    </div>
  );
};
