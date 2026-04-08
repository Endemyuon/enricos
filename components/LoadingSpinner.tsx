'use client';

import { useEffect, useState } from 'react';

export function LoadingSpinner() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 shadow-2xl flex flex-col items-center gap-4">
        {/* CSS Spinner */}
        <div className="w-24 h-24 flex items-center justify-center">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-4 border-red-200"></div>
            <div 
              className="absolute inset-0 rounded-full border-4 border-transparent border-t-red-600 border-r-red-600 animate-spin"
              style={{ animationDuration: '1s' }}
            ></div>
          </div>
        </div>
        <p className="text-slate-600 text-sm font-medium">Loading...</p>
      </div>
    </div>
  );
}
