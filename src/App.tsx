/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Bot } from 'lucide-react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { getClimateZone, generateFloorPlan, getEngineeringReport, generateConstructionDetailsImage, generateReportCsv, getEstimatedCost } from './services/geminiService';
import Report from './components/Report';
import { getPlotSvg } from './utils/svgGenerator';
import { Canvg } from 'canvg';
import LanguageSelector from './components/LanguageSelector';
import { languages, translations } from './constants';
import { Language } from './types';

interface ReportData {
  imageUrl: string;
  engineeringReport: string;
  climate: string;
  constructionDetailsImageUrl: string;
  csvData: string;
  estimatedCost: string;
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
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(languages[0]);
  const [length, setLength] = useState('');
  const [breadth, setBreadth] = useState('');
  const [rooms, setRooms] = useState('');
  const [budget, setBudget] = useState('affordable');
  const [vastuCompliant, setVastuCompliant] = useState(true);
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
    const l = parseInt(length);
    const b = parseInt(breadth);

    if (!length || !breadth || isNaN(l) || isNaN(b) || l <= 0 || b <= 0) {
      alert('Please provide valid positive numbers for plot length and breadth.');
      return;
    }

    if (typeof OffscreenCanvas === 'undefined') {
      alert('Your browser does not support OffscreenCanvas, which is required for this feature. Please use a modern browser.');
      return;
    }

    setLoading(true);
    setError(null);
    setReport(null);

    try {
      const plotSvg = getPlotSvg(l, b);
      
      const canvas = new OffscreenCanvas(l + 100, b + 100);
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Failed to get 2D context for canvas.');
      }
      const v = await Canvg.from(ctx, plotSvg);
      await v.render();
      const blob = await canvas.convertToBlob();
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      const plotPngBase64 = await new Promise<string>((resolve, reject) => {
        reader.onloadend = () => {
          if (reader.result) {
            resolve(reader.result.toString().split(',')[1]);
          } else {
            reject(new Error('Failed to read canvas blob as data URL.'));
          }
        };
        reader.onerror = () => reject(new Error('FileReader error.'));
      });

      const climate = await getClimateZone(markerPosition.lat, markerPosition.lng).catch(e => {
        console.error("Climate zone detection failed:", e);
        return "Unknown Climate";
      });

      const constructionDetailsPromise = generateConstructionDetailsImage(climate).catch(e => {
        console.error("Construction details image generation failed:", e);
        return "ERROR";
      });

      const floorPlanPromise = generateFloorPlan(climate, length, breadth, rooms, plotPngBase64, vastuCompliant).catch(e => {
        console.error("Floor plan generation failed:", e);
        return "ERROR";
      });

      const engineeringReportPromise = getEngineeringReport(climate, length, breadth, budget, vastuCompliant).catch(e => {
        console.error("Engineering report generation failed:", e);
        return "Failed to generate engineering report.";
      });

      const [imageUrl, engineeringReport, constructionDetailsImageUrl] = await Promise.all([
        floorPlanPromise,
        engineeringReportPromise,
        constructionDetailsPromise
      ]);

      const csvDataPromise = generateReportCsv(engineeringReport).catch(e => {
        console.error("CSV generation failed:", e);
        return "";
      });

      const estimatedCostPromise = getEstimatedCost(engineeringReport, budget).catch(e => {
        console.error("Cost estimation failed:", e);
        return "Estimation failed.";
      });

      const [csvData, estimatedCost] = await Promise.all([
        csvDataPromise,
        estimatedCostPromise
      ]);

      setReport({ imageUrl, engineeringReport, climate, constructionDetailsImageUrl, csvData, estimatedCost });
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Failed to call Gemini API: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const renderMap = () => {
    if (!apiKey || apiKey === 'YOUR_GOOGLE_MAPS_API_KEY') {
      return (
        <div className="h-[400px] flex flex-col items-center justify-center bg-stone-100 text-center p-4">
          <h3 className="text-lg font-semibold text-stone-700">{translations[selectedLanguage.code]?.mapNotConfigured || translations.en.mapNotConfigured}</h3>
          <p className="text-stone-500 mt-1">{translations[selectedLanguage.code]?.mapNotConfiguredSubtitle || translations.en.mapNotConfiguredSubtitle}</p>
        </div>
      );
    }

    if (loadError) {
      return (
        <div className="h-[400px] flex flex-col items-center justify-center bg-red-50 text-center p-4">
          <h3 className="text-lg font-semibold text-red-700">{translations[selectedLanguage.code]?.mapError || translations.en.mapError}</h3>
          <p className="text-red-600 mt-1">{translations[selectedLanguage.code]?.mapErrorSubtitle || translations.en.mapErrorSubtitle}</p>
          <p className="text-xs text-red-500 mt-2">Error: {loadError.message}</p>
        </div>
      );
    }

    if (!isLoaded) {
      return <div className="h-[400px] flex items-center justify-center bg-stone-100">{translations[selectedLanguage.code]?.loadingMap || translations.en.loadingMap}</div>;
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
    <div className="min-h-screen bg-[#f5f5f0] font-sans flex flex-col">
      <header className="bg-white border-b border-stone-200 p-4 shadow-sm">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bot className="w-8 h-8 text-stone-600" />
            <div>
              <h1 className="text-xl font-bold text-stone-800 tracking-tight">{translations[selectedLanguage.code]?.title || translations.en.title}</h1>
              <p className="text-sm text-stone-500">{translations[selectedLanguage.code]?.subtitle || translations.en.subtitle}</p>
            </div>
          </div>
          <LanguageSelector selectedLanguage={selectedLanguage} setSelectedLanguage={setSelectedLanguage} />
        </div>
      </header>

      <main className="py-8 md:py-12 flex-grow">
        <div className="max-w-5xl mx-auto px-4">
          
          <div className="bg-white border border-stone-200 rounded-2xl p-6 md:p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-stone-900 tracking-tight">{translations[selectedLanguage.code]?.startProject || translations.en.startProject}</h2>
            <p className="text-stone-600 mt-1">{translations[selectedLanguage.code]?.startProjectSubtitle || translations.en.startProjectSubtitle}</p>
            
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">{translations[selectedLanguage.code]?.selectLocation || translations.en.selectLocation}</label>
                <div className="rounded-lg overflow-hidden border border-stone-300">
                  {renderMap()}
                </div>
              </div>
              <div className="flex flex-col justify-center">
                <div>
                  <label htmlFor="length" className="block text-sm font-medium text-stone-700">{translations[selectedLanguage.code]?.plotLength || translations.en.plotLength}</label>
                  <input
                    type="number"
                    name="length"
                    id="length"
                    className="mt-1 block w-full rounded-md border-stone-300 shadow-sm focus:border-stone-500 focus:ring-stone-500 sm:text-sm py-3"
                    placeholder={translations[selectedLanguage.code]?.plotLengthPlaceholder || translations.en.plotLengthPlaceholder}
                    value={length}
                    onChange={(e) => setLength(e.target.value)}
                  />
                </div>
                <div className="mt-4">
                  <label htmlFor="breadth" className="block text-sm font-medium text-stone-700">{translations[selectedLanguage.code]?.plotBreadth || translations.en.plotBreadth}</label>
                  <input
                    type="number"
                    name="breadth"
                    id="breadth"
                    className="mt-1 block w-full rounded-md border-stone-300 shadow-sm focus:border-stone-500 focus:ring-stone-500 sm:text-sm py-3"
                    placeholder={translations[selectedLanguage.code]?.plotBreadthPlaceholder || translations.en.plotBreadthPlaceholder}
                    value={breadth}
                    onChange={(e) => setBreadth(e.target.value)}
                  />
                </div>
                <div className="mt-4">
                  <label htmlFor="budget" className="block text-sm font-medium text-stone-700">{translations[selectedLanguage.code]?.budget || 'Budget Range'}</label>
                  <select
                    id="budget"
                    name="budget"
                    className="mt-1 block w-full rounded-md border-stone-300 shadow-sm focus:border-stone-500 focus:ring-stone-500 sm:text-sm py-3 px-3"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                  >
                    <option value="affordable">{translations[selectedLanguage.code]?.affordable || 'Affordable'}</option>
                    <option value="mid-range">{translations[selectedLanguage.code]?.midRange || 'Mid Range'}</option>
                    <option value="high-range">{translations[selectedLanguage.code]?.highRange || 'High Range'}</option>
                  </select>
                </div>
                <div className="mt-4">
                  <label htmlFor="rooms" className="block text-sm font-medium text-stone-700">{translations[selectedLanguage.code]?.requiredRooms || translations.en.requiredRooms}</label>
                  <textarea
                    id="rooms"
                    name="rooms"
                    rows={3}
                    className="mt-1 block w-full rounded-md border-stone-300 shadow-sm focus:border-stone-500 focus:ring-stone-500 sm:text-sm py-2 px-3"
                    placeholder={translations[selectedLanguage.code]?.requiredRoomsPlaceholder || translations.en.requiredRoomsPlaceholder}
                    value={rooms}
                    onChange={(e) => setRooms(e.target.value)}
                  />
                </div>
                <div className="mt-4 flex items-center">
                  <input
                    id="vastu"
                    name="vastu"
                    type="checkbox"
                    className="h-4 w-4 rounded border-stone-300 text-stone-600 focus:ring-stone-500"
                    checked={vastuCompliant}
                    onChange={(e) => setVastuCompliant(e.target.checked)}
                  />
                  <label htmlFor="vastu" className="ml-2 block text-sm text-stone-700">
                    {translations[selectedLanguage.code]?.vastuCompliant || 'Vastu Compliant Design'}
                  </label>
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
                    {translations[selectedLanguage.code]?.generatingReport || translations.en.generatingReport}
                  </>
                ) : translations[selectedLanguage.code]?.generateReport || translations.en.generateReport}
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
                  <h3 className="text-sm font-medium text-red-800">{translations[selectedLanguage.code]?.error || translations.en.error}</h3>
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
          <p>{(translations[selectedLanguage.code]?.footerText || translations.en.footerText).replace('{year}', new Date().getFullYear().toString())}</p>
          <p className="mt-1">{translations[selectedLanguage.code]?.footerSubtitle || translations.en.footerSubtitle}</p>
        </div>
      </footer>
    </div>
  );
}
