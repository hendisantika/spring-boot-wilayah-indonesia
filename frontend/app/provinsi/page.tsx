'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

// Dynamically import the map component to avoid SSR issues with Leaflet
const ProvinsiMap = dynamic(() => import('@/components/ProvinsiMap'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
        <p className="mt-2">Loading map...</p>
      </div>
    </div>
  ),
});

export default function ProvinsiPage() {
  const [geojsonData, setGeojsonData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProvinsiData = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/map/provinsi');
        if (!response.ok) {
          throw new Error('Failed to fetch provinsi data');
        }
        const data = await response.json();
        setGeojsonData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchProvinsiData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
          <p className="mt-2">Loading provinsi data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center text-red-500">
          <p className="text-xl font-bold">Error</p>
          <p className="mt-2">{error}</p>
          <p className="mt-4 text-sm text-gray-500">
            Make sure the Spring Boot backend is running on port 8080
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <header className="bg-white dark:bg-gray-800 shadow-sm p-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Peta 38 Provinsi Indonesia
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Interactive map of Indonesian provinces
          </p>
        </div>
      </header>
      <main className="flex-1">
        <ProvinsiMap geojsonData={geojsonData} />
      </main>
    </div>
  );
}
