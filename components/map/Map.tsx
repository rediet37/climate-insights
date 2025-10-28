
// Dynamic import wrapper to avoid SSR issues with Leaflet in Next.js App Router.
import dynamic from 'next/dynamic';

// Export a client-only Map component (loads ClientMap on the browser)
export const Map = dynamic(
  () => import('./ClientMap'), 
  {
  ssr: false,
  //loading: () => (<div className="flex h-full w-full items-center justify-center bg-gray-200"><p>Loading Map...</p></div>
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="flex flex-col items-center text-gray-600">
        <div className="w-16 h-16 border-4 border-t-blue-500 border-blue-200 rounded-full animate-spin mb-4"></div>
        <p className="text-lg font-semibold">Loading Interactive Map...</p>
        <p className="text-sm text-gray-500 mt-2">Please wait while we prepare your visualization</p>
      </div>
    </div>
  ),
});
