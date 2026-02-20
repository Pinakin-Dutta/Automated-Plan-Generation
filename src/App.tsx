/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Bot } from 'lucide-react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { getClimateZone, generateFloorPlan, getEngineeringReport } from './services/geminiService';
import Report from './components/Report';

interface ReportData {
  imageUrl: string;
  engineeringReport: string;
  climate: string;
}

const containerStyle = {
  width: '100%',
  height: '400px'
};

const defaultCenter = {
  lat: 20.5937,
  lng: 78.9629
};

export default function App() {
  const [length, setLength] = useState('');
  const [breadth, setBreadth] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<ReportData | null>(null);
  const [markerPosition, setMarkerPosition] = useState(defaultCenter);

    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey,
  });

  const handleMapClick = (event: google.maps.MapMouseEvent) => {
    if (event.latLng) {
      setMarkerPosition({ lat: event.latLng.lat(), lng: event.latLng.lng() });
    }
  };

  const handleGenerate = async () => {
    if (!length || !breadth) {
      alert('Please provide the plot length and breadth.');
      return;
    }
    setLoading(true);
    setError(null);
    setReport(null);

    try {
      const climate = await getClimateZone(markerPosition.lat, markerPosition.lng);
      const [imageUrl, engineeringReport] = await Promise.all([
        generateFloorPlan(climate, length, breadth),
        getEngineeringReport(climate, length, breadth),
      ]);
      setReport({ imageUrl, engineeringReport, climate });
    } catch (err) {
      console.error(err);
      setError('An error occurred while generating the report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderMap = () => {
    if (!apiKey || apiKey === 'YOUR_GOOGLE_MAPS_API_KEY') {
      return (
        <div className="h-[400px] flex flex-col items-center justify-center bg-stone-100 text-center p-4">
          <h3 className="text-lg font-semibold text-stone-700">Map Not Configured</h3>
          <p className="text-stone-500 mt-1">Please set your <code className="bg-stone-200 text-stone-800 px-1 py-0.5 rounded">VITE_GOOGLE_MAPS_API_KEY</code> in the Secrets panel to load the map.</p>
        </div>
      );
    }

    if (loadError) {
      return (
        <div className="h-[400px] flex flex-col items-center justify-center bg-red-50 text-center p-4">
          <h3 className="text-lg font-semibold text-red-700">Map Error</h3>
          <p className="text-red-600 mt-1">Could not load the map. Please check your API key and the browser console for more details.</p>
          <p className="text-xs text-red-500 mt-2">Error: {loadError.message}</p>
        </div>
      );
    }

    if (!isLoaded) {
      return <div className="h-[400px] flex items-center justify-center bg-stone-100">Loading Map...</div>;
    }

    return (
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={markerPosition}
        zoom={5}
        onClick={handleMapClick}
      >
        <Marker position={markerPosition} />
      </GoogleMap>
    );
  };

  return (
    <div className="min-h-screen bg-stone-50 font-sans flex flex-col">
      <header className="bg-white border-b border-stone-200 p-4 shadow-sm">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bot className="w-8 h-8 text-stone-600" />
            <div>
              <h1 className="text-xl font-bold text-stone-800 tracking-tight">BuildRight AI Lead</h1>
              <p className="text-sm text-stone-500">Your Climate-Responsive Construction Planner</p>
            </div>
          </div>
        </div>
      </header>

      <main className="py-8 md:py-12 flex-grow">
        <div className="max-w-5xl mx-auto px-4">
          
          <div className="bg-white border border-stone-200 rounded-2xl p-6 md:p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-stone-900 tracking-tight">Start Your Project</h2>
            <p className="text-stone-600 mt-1">Click on the map to set your location, then enter the plot dimensions.</p>
            
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Select Location</label>
                <div className="rounded-lg overflow-hidden border border-stone-300">
                  {renderMap()}
                </div>
              </div>
              <div className="flex flex-col justify-center">
                <div>
                  <label htmlFor="length" className="block text-sm font-medium text-stone-700">Plot Length (ft.)</label>
                  <input
                    type="number"
                    name="length"
                    id="length"
                    className="mt-1 block w-full rounded-md border-stone-300 shadow-sm focus:border-stone-500 focus:ring-stone-500 sm:text-sm py-3"
                    placeholder='e.g., 30'
                    value={length}
                    onChange={(e) => setLength(e.target.value)}
                  />
                </div>
                <div className="mt-4">
                  <label htmlFor="breadth" className="block text-sm font-medium text-stone-700">Plot Breadth (ft.)</label>
                  <input
                    type="number"
                    name="breadth"
                    id="breadth"
                    className="mt-1 block w-full rounded-md border-stone-300 shadow-sm focus:border-stone-500 focus:ring-stone-500 sm:text-sm py-3"
                    placeholder='e.g., 40'
                    value={breadth}
                    onChange={(e) => setBreadth(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="mt-6">
              <button
                type="button"
                onClick={handleGenerate}
                disabled={loading || !isLoaded}
                className="w-full inline-flex items-center justify-center rounded-md border border-transparent bg-stone-800 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2 disabled:bg-stone-400 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating Report...
                  </>
                ) : 'Generate Homeowner\'s Construction Pack'}
              </button>
            </div>
          </div>

          {error && (
            <div className="mt-8 rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {report && <Report {...report} />}
        </div>
      </main>

      <footer className="bg-white border-t border-stone-200 mt-auto">
        <div className="max-w-5xl mx-auto py-6 px-4 text-center text-sm text-stone-500">
          <p>&copy; {new Date().getFullYear()} BuildRight AI. All rights reserved.</p>
          <p className="mt-1">Powered by Google Gemini. Climate data sourced via Google Maps.</p>
        </div>
      </footer>
    </div>
  );
}
