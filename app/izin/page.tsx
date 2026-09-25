import { Suspense } from 'react';
import dynamic from 'next/dynamic';

const IzinPage = dynamic(() => import('./IzinPage'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center bg-bg">
      <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary-600 border-t-transparent"></div>
    </div>
  ),
});

export default function IzinRoute() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-bg">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary-600 border-t-transparent"></div>
        </div>
      }
    >
      <IzinPage />
    </Suspense>
  );
}