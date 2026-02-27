import React from 'react';
import { languages } from '../constants';
import { Language } from '../types';

interface LanguageSelectorProps {
  selectedLanguage: Language;
  setSelectedLanguage: (language: Language) => void;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ selectedLanguage, setSelectedLanguage }) => {
  const handleLanguageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedLangCode = event.target.value;
    const language = languages.find(lang => lang.code === selectedLangCode);
    if (language) {
      setSelectedLanguage(language);
    }
  };

  return (
    <div className="relative">
      <select
        value={selectedLanguage.code}
        onChange={handleLanguageChange}
        className="appearance-none bg-white border border-stone-300 rounded-md pl-3 pr-8 py-2 text-sm text-stone-700 focus:outline-none focus:ring-1 focus:ring-stone-500 focus:border-stone-500"
      >
        {languages.map(lang => (
          <option key={lang.code} value={lang.code}>
            {lang.name}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-stone-700">
        <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
          <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
        </svg>
      </div>
    </div>
  );
};

export default LanguageSelector;
