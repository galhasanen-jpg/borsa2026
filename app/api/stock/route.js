import { getConnection } from '../../lib/db';

const mockData = {
    'COMI': { price: '126.00', changePercent: '3.70', volume: '2,345,678' },
    'SWDY': { price: '78.00', changePercent: '1.75', volume: '1,234,567' },
    'TMGH': { price: '80.59', changePercent: '2.01', volume: '987,654' },
    'ETEL': { price: '88.00', changePercent: '0.00', volume: '567,890' },
    'EAST': { price: '37.85', changePercent: '-3.67', volume: '876,543' },
    'EFIH': { price: '19.20', changePercent: '-0.67', volume: '1,987,654' },
    'FWRY': { price: '18.20', changePercent: '2.88', volume: '2,345,678' },
    'MFPC': { price: '40.53', changePercent: '5.27', volume: '3,456,789' },
    'EGAL': { price: '271.03', changePercent: '7.55', volume: '234,567' },
    'ABUK': { price: '78.64', changePercent: '0.96', volume: '456,789' },
    'QNBE': { price: '41.53', changePercent: '-1.40', volume: '345,678' },
    'HDBK': { price: '110.32', changePercent: '-1.46', volume: '345,678' },
    'CIEB': { price: '21.51', changePercent: '-1.83', volume: '432,109' },
    'ADIB': { price: '37.81', changePercent: '-1.79', volume: '234,567' },
    'FAIT': { price: '34.19', changePercent: '-1.84', volume: '345,678' },
    'CANA': { price: '39.27', changePercent: '-1.23', volume: '234,567' },
    'UBEE': { price: '13.30', changePercent: '0.00', volume: '123,456' },
    'SAUD': { price: '18.18', changePercent: '-0.06', volume: '234,567' },
    'EXPA': { price: '16.00', changePercent: '0.00', volume: '123,456' },
    'EGBE': { price: '0.377', changePercent: '-3.33', volume: '987,654' },
    'HRHO': { price: '25.78', changePercent: '-0.85', volume: '876,543' },
    'GBCO': { price: '26.84', changePercent: '-3.52', volume: '567,890' },
    'CICH': { price: '10.25', changePercent: '-0.10', volume: '432,109' },
    'BTFH': { price: '2.940', changePercent: '0.69', volume: '654,321' },
    'VALU': { price: '10.50', changePercent: '2.94', volume: '765,432' },
    'BINV': { price: '37.60', changePercent: '-0.27', volume: '345,678' },
    'CCAP': { price: '3.380', changePercent: '4.00', volume: '876,543' },
    'PHDC': { price: '8.67', changePercent: '-0.57', volume: '3,456,789' },
    'EMFD': { price: '9.00', changePercent: '-0.55', volume: '2,345,678' },
    'OCDI': { price: '17.99', changePercent: '1.52', volume: '345,678' },
    'ORHD': { price: '23.60', changePercent: '-1.38', volume: '345,678' },
    'HELI': { price: '5.15', changePercent: '0.20', volume: '654,321' },
    'MASR': { price: '5.30', changePercent: '4.36', volume: '543,210' },
    'GPPL': { price: '1.400', changePercent: '0.00', volume: '432,109' },
    'MNHD': { price: '12.30', changePercent: '1.65', volume: '654,321' },
    'AMER': { price: '4.50', changePercent: '1.12', volume: '345,678' },
    'CIRA': { price: '16.47', changePercent: '-1.20', volume: '432,109' },
    'VFCO': { price: '15.50', changePercent: '1.97', volume: '3,123,456' },
    'EGSA': { price: '7.02', changePercent: '0.14', volume: '234,567' },
    'SCTS': { price: '265.43', changePercent: '1.65', volume: '123,456' },
    'RAYA': { price: '5.43', changePercent: '0.93', volume: '1,234,567' },
    'MTIE': { price: '7.60', changePercent: '-2.81', volume: '876,543' },
    'IRON': { price: '30.78', changePercent: '-0.58', volume: '456,789' },
    'ELEC': { price: '2.120', changePercent: '2.42', volume: '654,321' },
    'ISMQ': { price: '7.22', changePercent: '-0.96', volume: '345,678' },
    'ORWE': { price: '22.01', changePercent: '0.50', volume: '543,210' },
    'VLMR': { price: '0.700', changePercent: '0.14', volume: '987,654' },
    'ESRS': { price: '25.00', changePercent: '1.50', volume: '456,789' },
    'ARCC': { price: '49.77', changePercent: '-0.50', volume: '345,678' },
    'SCEM': { price: '56.08', changePercent: '-1.15', volume: '234,567' },
    'MBSC': { price: '273.69', changePercent: '0.19', volume: '123,456' },
    'MCQE': { price: '189.60', changePercent: '-0.21', volume: '123,456' },
    'SVCE': { price: '7.20', changePercent: '1.41', volume: '234,567' },
    'ORAS': { price: '467.57', changePercent: '0.03', volume: '123,456' },
    'TAQA': { price: '13.13', changePercent: '-0.53', volume: '432,109' },
    'BONY': { price: '3.820', changePercent: '3.24', volume: '543,210' },
    'FERC': { price: '76.13', changePercent: '4.25', volume: '345,678' },
    'EFIC': { price: '203.00', changePercent: '0.00', volume: '123,456' },
    'EGCH': { price: '12.55', changePercent: '-4.92', volume: '432,109' },
    'KIMA': { price: '15.00', changePercent: '1.20', volume: '234,567' },
    'AMOC': { price: '7.61', changePercent: '1.06', volume: '876,543' },
    'SKPC': { price: '17.53', changePercent: '2.46', volume: '654,321' },
    'MOIL': { price: '0.401', changePercent: '4.16', volume: '987,654' },
    'JUFO': { price: '26.67', changePercent: '0.64', volume: '765,432' },
    'EFID': { price: '27.50', changePercent: '0.00', volume: '456,789' },
    'DOMT': { price: '24.44', changePercent: '0.21', volume: '543,210' },
    'POUL': { price: '31.50', changePercent: '6.78', volume: '654,321' },
    'OLFI': { price: '21.90', changePercent: '1.48', volume: '432,109' },
    'SUGR': { price: '46.48', changePercent: '1.55', volume: '345,678' },
    'ALCN': { price: '25.30', changePercent: '4.12', volume: '1,234,567' },
    'CSAG': { price: '26.80', changePercent: '3.52', volume: '234,567' },
    'ISPH': { price: '11.20', changePercent: '-0.97', volume: '543,210' },
    'PHAR': { price: '79.82', changePercent: '2.19', volume: '345,678' },
    'RMDA': { price: '4.570', changePercent: '-2.97', volume: '432,109' },
    'CLHO': { price: '12.96', changePercent: '-0.69', volume: '543,210' },
    'MHOT': { price: '23.53', changePercent: '-1.13', volume: '234,567' },
    'EGTS': { price: '7.14', changePercent: '0.14', volume: '345,678' },
    'TALM': { price: '15.00', changePercent: '0.13', volume: '234,567' },
    'SPIN': { price: '13.79', changePercent: '-1.01', volume: '345,678' },
    'MIPH': { price: '464.95', changePercent: '4.53', volume: '123,456' },
    'NIPH': { price: '96.55', changePercent: '0.90', volume: '234,567' },
    'CPCI': { price: '254.26', changePercent: '3.13', volume: '123,456' },
    'MPCI': { price: '146.50', changePercent: '2.01', volume: '123,456' },
    'AXPH': { price: '835.10', changePercent: '6.87', volume: '123,456' },
    'OCPH': { price: '174.33', changePercent: '0.00', volume: '123,456' },
    'ADCI': { price: '150.00', changePercent: '1.37', volume: '123,456' },
    'BIOC': { price: '60.28', changePercent: '1.48', volume: '234,567' },
    'AMES': { price: '43.86', changePercent: '-2.45', volume: '234,567' },
    'NINH': { price: '12.01', changePercent: '-0.99', volume: '234,567' },
};

function generateMockData(symbol) {
    const seed = symbol.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const price = (10 + (seed % 200)).toFixed(2);
    const change = ((seed % 10) - 5).toFixed(2);
    const volume = ((seed % 900) + 100).toString() + ',000';
    return { price, changePercent: change, volume };
}

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const symbolParam = searchParams.get('symbol');
    const symbol = symbolParam?.replace('.CA', '');

    let client;
    try {
        // أولاً: جلب من Supabase
        client = await getConnection();
        const result = await client.query(
            `SELECT price, change_percent, volume FROM stock_prices WHERE symbol = $1`,
            [symbol]
        );

        if (result.rows.length > 0) {
            const row = result.rows[0];
            return Response.json({
                price: row.price,
                changePercent: row.change_percent,
                volume: row.volume
            });
        }
    } catch (err) {
        // تجاهل خطأ Supabase والانتقال للبيانات الاحتياطية
    } finally {
        if (client) client.release();
    }

    // ثانياً: جلب من Yahoo Finance
    try {
        const res = await fetch(
            `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbolParam}`,
            { headers: { 'User-Agent': 'Mozilla/5.0' }, cache: 'no-store' }
        );
        const data = await res.json();
        const quote = data.quoteResponse?.result?.[0];

        if (quote && quote.regularMarketPrice) {
            return Response.json({
                price: quote.regularMarketPrice?.toFixed(2),
                changePercent: quote.regularMarketChangePercent?.toFixed(2),
                volume: quote.regularMarketVolume?.toLocaleString(),
            });
        }
    } catch (err) {}

    // ثالثاً: البيانات الاحتياطية
    const mock = mockData[symbol] || generateMockData(symbol);
    return Response.json(mock);
}