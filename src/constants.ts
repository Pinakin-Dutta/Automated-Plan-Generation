import { Language } from './types';

export const languages: Language[] = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'हिन्दी' }, // Hindi
  { code: 'bn', name: 'বাংলা' }, // Bengali
  { code: 'te', name: 'తెలుగు' }, // Telugu
  { code: 'mr', name: 'मराठी' }, // Marathi
  { code: 'ta', name: 'தமிழ்' }, // Tamil
  { code: 'ur', name: 'اردو' }, // Urdu
  { code: 'gu', name: 'ગુજરાતી' }, // Gujarati
  { code: 'kn', name: 'ಕನ್ನಡ' }, // Kannada
  { code: 'or', name: 'ଓଡ଼ିଆ' }, // Odia
  { code: 'ml', name: 'മലയാളം' }, // Malayalam
  { code: 'pa', name: 'ਪੰਜਾਬੀ' }, // Punjabi
  { code: 'as', name: 'অসমীয়া' }, // Assamese
  { code: 'mai', name: 'मैथिली' }, // Maithili
  { code: 'sa', name: 'संस्कृतम्' }, // Sanskrit
  { code: 'ne', name: 'नेपाली' }, // Nepali
  { code: 'ks', name: 'कॉशुर' }, // Kashmiri
  { code: 'kok', name: 'कोंकणी' }, // Konkani
  { code: 'sd', name: 'सिन्धी' }, // Sindhi
];

export const translations: { [key: string]: { [key: string]: string } } = {
  en: {
    title: 'Neev.Ai',
    subtitle: 'Your Climate-Responsive Construction Planner',
    startProject: 'Start Your Project',
    startProjectSubtitle: 'Click on the map to set your location, then enter the plot dimensions.',
    selectLocation: 'Select Location',
    plotLength: 'Plot Length (ft.)',
    plotBreadth: 'Plot Breadth (ft.)',
    requiredRooms: 'Required Rooms',
    generateReport: 'Generate Homeowner\'s Construction Pack',
    generatingReport: 'Generating Report...',
    mapNotConfigured: 'Map Not Configured',
    mapNotConfiguredSubtitle: 'Please set your VITE_GOOGLE_MAPS_API_KEY in the Secrets panel to load the map.',
    mapError: 'Map Error',
    mapErrorSubtitle: 'Could not load the map. Please check your API key and the browser console for more details.',
    loadingMap: 'Loading Map...',
    error: 'Error',
    footerText: '© {year} Neev.Ai. All rights reserved.',
    footerSubtitle: 'Powered by Google Gemini. Climate data sourced via Google Maps.',
    plotLengthPlaceholder: 'e.g., 30',
    plotBreadthPlaceholder: 'e.g., 40',
    requiredRoomsPlaceholder: 'e.g., 2 Bedrooms, 1 Study, 2 Bathrooms, Pooja Room',
    budget: 'Budget Range',
    affordable: 'Affordable',
    midRange: 'Mid Range',
    highRange: 'High Range',
    vastuCompliant: 'Vastu Compliant Design',
  },
};
