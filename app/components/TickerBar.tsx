'use client';

const mockTickers = [
  { symbol: 'EGX30', price: '52,719', change: '+0.57%', up: true },
  { symbol: 'COMI', price: '126.00', change: '+3.70%', up: true },
  { symbol: 'SWDY', price: '78.00', change: '+1.75%', up: true },
  { symbol: 'TMGH', price: '80.59', change: '+2.01%', up: true },
  { symbol: 'ETEL', price: '88.00', change: '0.00%', up: true },
  { symbol: 'EAST', price: '37.85', change: '-3.67%', up: false },
  { symbol: 'EFIH', price: '19.20', change: '-0.67%', up: false },
  { symbol: 'FWRY', price: '18.20', change: '+2.88%', up: true },
  { symbol: 'USD/EGP', price: '52.67', change: '+0.12%', up: true },
  { symbol: 'XAU', price: '4,694', change: '+0.45%', up: true },
  { symbol: 'OIL', price: '82.30', change: '-0.23%', up: false },
];

export default function TickerBar() {
  const allTickers = [...mockTickers, ...mockTickers];

  return (
    <div className="bg-black border-b border-gray-800 overflow-hidden">
      <div className="flex items-center">

        {/* Label ثابت */}
        <div className="bg-orange-500 text-black font-bold text-xs px-3 py-2 flex-shrink-0 whitespace-nowrap">
          LIVE
        </div>

        {/* الشريط المتحرك */}
        <div className="overflow-hidden flex-1">
          <div
            className="flex w-max"
            style={{ animation: 'ticker 35s linear infinite' }}
          >
            {allTickers.map((ticker, index) => (
              <div
                key={index}
                className="flex items-center gap-2 px-4 py-2 border-r border-gray-800 flex-shrink-0 cursor-pointer hover:bg-gray-900 transition"
              >
                <span className="text-gray-300 text-xs font-bold tracking-wider">{ticker.symbol}</span>
                <span className="text-white text-xs font-mono">{ticker.price}</span>
                <span className={`text-xs font-bold flex items-center gap-0.5 ${ticker.up ? 'text-green-400' : 'text-red-400'}`}>
                  {ticker.up ? '▲' : '▼'} {ticker.change}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      <style>{`
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}