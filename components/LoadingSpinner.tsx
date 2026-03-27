'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

const Lottie = dynamic(() => import('lottie-react'), { ssr: false });

export function LoadingSpinner() {
  const [animationData, setAnimationData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAnimation = async () => {
      try {
        const response = await fetch('/Food.lottie');
        const data = await response.json();
        setAnimationData(data);
      } catch (error) {
        console.error('Failed to load animation:', error);
        // If loading fails, still show something
        setAnimationData(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadAnimation();
  }, []);

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 shadow-2xl flex flex-col items-center gap-4">
        {/* Lottie Animation or Fallback Spinner */}
        <div className="w-24 h-24 flex items-center justify-center">
          {animationData && !isLoading ? (
            <Lottie 
              animationData={animationData}
              loop={true}
              autoplay={true}
              style={{ width: '100%', height: '100%' }}
            />
          ) : (
            // Fallback spinner while animation loads
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 rounded-full border-4 border-red-200"></div>
              <div 
                className="absolute inset-0 rounded-full border-4 border-transparent border-t-red-600 border-r-red-600 animate-spin"
                style={{ animationDuration: '1s' }}
              ></div>
            </div>
          )}
        </div>
        <p className="text-slate-600 text-sm font-medium">Loading...</p>
      </div>
    </div>
  );
}
