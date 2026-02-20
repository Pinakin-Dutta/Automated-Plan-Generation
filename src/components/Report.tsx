import ReactMarkdown from 'react-markdown';

interface ReportProps {
  imageUrl: string;
  engineeringReport: string;
  climate: string;
}

export default function Report({ imageUrl, engineeringReport, climate }: ReportProps) {
  return (
    <div className="bg-white border border-stone-200 rounded-2xl p-6 md:p-8 shadow-sm mt-8">
      <h2 className="text-3xl font-bold text-stone-900 tracking-tight">Your Homeowner's Construction Pack</h2>
      <p className="text-stone-600 mt-2">Climate Zone: <span className="font-semibold text-stone-800">{climate}</span></p>

      <div className="mt-6">
        <h3 className="text-xl font-bold text-stone-800">2D Floor Plan</h3>
        <div className="mt-4 bg-stone-100 border border-stone-200 rounded-lg overflow-hidden">
          <img src={`data:image/png;base64,${imageUrl}`} alt="Generated Floor Plan" className="w-full h-auto" />
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-bold text-stone-800">Engineering & Architectural Report</h3>
        <div className="mt-4 prose prose-stone max-w-none prose-headings:font-bold prose-headings:tracking-tight">
          <ReactMarkdown>{engineeringReport}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
