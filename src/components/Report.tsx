import ReactMarkdown from 'react-markdown';
import { Star, HardHat, Home, RefreshCcw, Scale, MessageCircle, FileText, CheckCircle2, PenTool, Crown } from 'lucide-react';

interface ReportProps {
  imageUrl: string;
  engineeringReport: string;
  climate: string;
  constructionDetailsImageUrl: string;
  csvData: string;
  estimatedCost: string;
}

export default function Report({ imageUrl, engineeringReport, climate, constructionDetailsImageUrl, csvData, estimatedCost }: ReportProps) {
  const handleDownloadCsv = () => {
    const blob = new Blob(["Category,Item,Quantity,Unit,Notes\n" + csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.href) {
      URL.revokeObjectURL(link.href);
    }
    link.href = URL.createObjectURL(blob);
    link.download = 'construction_summary.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  const csvHeaders = ['Category', 'Item', 'Quantity', 'Unit', 'Notes'];
  const csvRows = csvData.split('\n').filter(row => row.trim() !== '').map(row => {
    const regex = /(?:^|,)(?:"([^"]*)"|([^,]*))/g;
    let match;
    const cells = [];
    while ((match = regex.exec(row)) !== null) {
      cells.push(match[1] || match[2] || '');
    }
    return cells;
  });

  return (
    <div className="mt-8 space-y-6">
      <div className="bg-white border border-stone-200 rounded-2xl p-6 md:p-8 shadow-sm">
        <h2 className="text-3xl font-bold text-stone-900 tracking-tight">Your Homeowner's Construction Pack</h2>
        <p className="text-stone-600 mt-2">Climate Zone: <span className="font-semibold text-stone-800">{climate}</span></p>
      </div>

      <div className="bg-white border border-stone-200 rounded-2xl p-6 md:p-8 shadow-sm">
        <h3 className="text-xl font-bold text-stone-800">Generated Floor Plan</h3>
        <div className="mt-4 bg-stone-100 border border-stone-200 rounded-lg overflow-hidden">
          {imageUrl === 'ERROR' ? (
            <div className="p-4 text-center text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
              <p>Could not generate the floor plan image at this time. Please try generating the report again.</p>
            </div>
          ) : (
            <img src={`data:image/png;base64,${imageUrl}`} alt="Generated Floor Plan" className="w-full h-auto" />
          )}
        </div>
      </div>

      <div className="bg-white border border-stone-200 rounded-2xl p-6 md:p-8 shadow-sm">
        <h3 className="text-xl font-bold text-stone-800">Engineering & Architectural Report</h3>
        <div className="mt-4 prose prose-stone max-w-none prose-headings:font-bold prose-headings:tracking-tight space-y-4">
          <ReactMarkdown components={{
            h3: (props) => <h3 className="font-bold text-xl mb-4 mt-8" {...props} />
          }}>{engineeringReport}</ReactMarkdown>
        </div>
      </div>

      <div className="bg-white border border-stone-200 rounded-2xl p-6 md:p-8 shadow-sm">
        <h3 className="text-xl font-bold text-stone-800">Typical Construction Details</h3>
        <div className="mt-4 bg-stone-100 border border-stone-200 rounded-lg overflow-hidden">
          {constructionDetailsImageUrl === 'ERROR' ? (
            <div className="p-4 text-center text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
              <p>Could not generate the construction details image at this time. Please try generating the report again.</p>
            </div>
          ) : (
            <img src={`data:image/png;base64,${constructionDetailsImageUrl}`} alt="Typical Construction Details" className="w-full h-auto" />
          )}
        </div>
      </div>

      <div className="bg-white border border-stone-200 rounded-2xl p-6 md:p-8 shadow-sm">
        <h3 className="text-xl font-bold text-stone-800">Data Summary</h3>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full bg-white border border-stone-200">
            <thead>
              <tr className="bg-stone-100">
                {csvHeaders.map(header => (
                  <th key={header} className="px-4 py-3 text-left font-bold text-stone-800 border-b border-stone-300">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {csvRows.map((row, rowIndex) => (
                <tr key={rowIndex} className="even:bg-stone-50">
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex} className={`px-4 py-2 border-t border-stone-200 ${cellIndex === 0 ? 'font-bold text-stone-700' : 'text-stone-600'}`} style={{whiteSpace: 'pre-wrap', wordWrap: 'break-word'}}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white border border-stone-200 rounded-2xl p-6 md:p-8 shadow-sm">
        <h3 className="text-xl font-bold text-stone-800">Total Estimated Cost</h3>
        <p className="text-stone-600 mt-1">The following is a high-level estimate and should be used for preliminary planning purposes only. For a detailed quote, please consult with a qualified contractor.</p>
        <div className="mt-4 prose prose-stone max-w-none prose-headings:font-bold prose-headings:tracking-tight space-y-4">
          <ReactMarkdown components={{
            h3: (props) => <h3 className="font-bold text-lg mb-2 mt-6" {...props} />,
            h4: (props) => <h4 className="font-bold text-base mb-2 mt-4" {...props} />
          }}>{estimatedCost}</ReactMarkdown>
        </div>
      </div>

      <div className="bg-white border border-stone-200 rounded-2xl p-6 md:p-8 shadow-sm">
        <p className="text-stone-500 text-sm mb-2">Transparent Contractor Selection Process</p>
        <div className="border border-stone-200 rounded-xl p-6 bg-stone-50/50">
          <h3 className="text-xl font-bold text-stone-900 mb-6">Compare Verified Contractors</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Contractor 1 */}
            <div className="bg-white rounded-xl border-2 border-stone-800 shadow-sm p-5 relative overflow-hidden">
              <div className="absolute top-4 right-4 bg-stone-100 text-stone-800 text-xs font-bold px-2 py-1 rounded-full">
                Top Rated
              </div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-stone-800 flex items-center justify-center text-white">
                  <Star className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <h4 className="font-bold text-stone-900">R.K. Builders</h4>
                  <div className="flex text-amber-400">
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                  </div>
                </div>
              </div>
              
              <div className="space-y-3 mb-6 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-stone-500">Quote</span>
                  <span className="font-bold text-stone-900 text-base">₹26,50,000</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-stone-500">Timeline</span>
                  <span className="font-semibold text-stone-900">8 months</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-stone-500">Projects</span>
                  <span className="font-semibold text-stone-900">45+</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-stone-500">Experience</span>
                  <span className="font-semibold text-stone-900">12 years</span>
                </div>
              </div>
              
              <button className="w-full bg-stone-800 hover:bg-stone-900 text-white font-medium py-2.5 rounded-lg transition-colors">
                View Profile
              </button>
            </div>

            {/* Contractor 2 */}
            <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-stone-600 flex items-center justify-center text-white">
                  <HardHat className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-stone-900">Metro Construction</h4>
                  <div className="flex text-amber-400">
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 text-stone-200 fill-current" />
                  </div>
                </div>
              </div>
              
              <div className="space-y-3 mb-6 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-stone-500">Quote</span>
                  <span className="font-bold text-stone-900 text-base">₹27,80,000</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-stone-500">Timeline</span>
                  <span className="font-semibold text-stone-900">7 months</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-stone-500">Projects</span>
                  <span className="font-semibold text-stone-900">120+</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-stone-500">Experience</span>
                  <span className="font-semibold text-stone-900">8 years</span>
                </div>
              </div>
              
              <button className="w-full bg-stone-100 hover:bg-stone-200 text-stone-800 font-medium py-2.5 rounded-lg transition-colors">
                View Profile
              </button>
            </div>

            {/* Contractor 3 */}
            <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-stone-600 flex items-center justify-center text-white">
                  <Home className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-stone-900">Home Makers</h4>
                  <div className="flex text-amber-400">
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                    <div className="relative w-4 h-4">
                      <Star className="w-4 h-4 text-stone-200 fill-current absolute top-0 left-0" />
                      <div className="absolute top-0 left-0 overflow-hidden w-2 h-4">
                        <Star className="w-4 h-4 fill-current" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3 mb-6 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-stone-500">Quote</span>
                  <span className="font-bold text-stone-900 text-base">₹28,50,000</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-stone-500">Timeline</span>
                  <span className="font-semibold text-stone-900">9 months</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-stone-500">Projects</span>
                  <span className="font-semibold text-stone-900">80+</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-stone-500">Experience</span>
                  <span className="font-semibold text-stone-900">15 years</span>
                </div>
              </div>
              
              <button className="w-full bg-stone-100 hover:bg-stone-200 text-stone-800 font-medium py-2.5 rounded-lg transition-colors">
                View Profile
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 flex flex-col items-center justify-center text-center">
            <RefreshCcw className="w-6 h-6 text-stone-700 mb-2" />
            <span className="font-bold text-stone-900 text-sm">Verified</span>
            <span className="text-xs text-stone-500">Background checked</span>
          </div>
          <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 flex flex-col items-center justify-center text-center">
            <Scale className="w-6 h-6 text-stone-700 mb-2" />
            <span className="font-bold text-stone-900 text-sm">Compare</span>
            <span className="text-xs text-stone-500">Side-by-side quotes</span>
          </div>
          <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 flex flex-col items-center justify-center text-center">
            <MessageCircle className="w-6 h-6 text-stone-700 mb-2" />
            <span className="font-bold text-stone-900 text-sm">Reviews</span>
            <span className="text-xs text-stone-500">Customer feedback</span>
          </div>
          <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 flex flex-col items-center justify-center text-center">
            <FileText className="w-6 h-6 text-stone-700 mb-2" />
            <span className="font-bold text-stone-900 text-sm">Contracts</span>
            <span className="text-xs text-stone-500">Standardized agreements</span>
          </div>
        </div>
      </div>

      <div className="bg-white border border-stone-200 rounded-2xl p-6 md:p-8 shadow-sm">
        <h3 className="text-xl font-bold text-stone-800">Download Summary</h3>
        <p className="text-stone-600 mt-1">Download a spreadsheet summary of the material estimates and key recommendations.</p>
        <div className="mt-4">
          <button
            type="button"
            onClick={handleDownloadCsv}
            className="inline-flex items-center rounded-md border border-transparent bg-stone-800 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2"
          >
            Download Summary (CSV)
          </button>
        </div>
      </div>

      {/* Premium Feature: Connect with Architect */}
      <div className="relative overflow-hidden rounded-2xl bg-stone-900 text-white shadow-xl">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-amber-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-32 h-32 bg-stone-500/20 rounded-full blur-3xl"></div>
        
        <div className="relative p-8 md:p-10">
          <div className="flex flex-col md:flex-row gap-8 items-center justify-between">
            <div className="flex-1 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm font-bold tracking-wide uppercase">
                <Crown className="w-4 h-4" />
                Premium Service
              </div>
              <h3 className="text-3xl font-bold tracking-tight">Connect with a Certified Architect</h3>
              <p className="text-stone-400 max-w-xl text-lg">
                Take your AI-generated plans to the next level. Get personalized modifications, structural validation, and official architect-approved blueprints ready for construction.
              </p>
              
              <ul className="mt-6 space-y-3">
                <li className="flex items-start gap-3 text-stone-300">
                  <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <span><strong>Personalized Design Review:</strong> 1-on-1 consultation to refine the layout to your exact needs.</span>
                </li>
                <li className="flex items-start gap-3 text-stone-300">
                  <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <span><strong>Structural Validation:</strong> Ensure your plans meet all local building codes and safety standards.</span>
                </li>
                <li className="flex items-start gap-3 text-stone-300">
                  <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <span><strong>Official Blueprints:</strong> Receive stamped, architect-approved plans required for permits.</span>
                </li>
              </ul>
            </div>
            
            <div className="w-full md:w-auto flex flex-col gap-4">
              <div className="bg-stone-800/50 border border-stone-700 rounded-xl p-6 text-center backdrop-blur-sm">
                <div className="text-stone-400 text-sm font-medium mb-1">Starting at</div>
                <div className="text-4xl font-bold text-white mb-4">₹4,999</div>
                <button className="w-full bg-amber-500 hover:bg-amber-400 text-stone-900 font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20">
                  <PenTool className="w-5 h-5" />
                  Consult an Architect
                </button>
                <p className="text-stone-500 text-xs mt-3">100% Satisfaction Guarantee</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
