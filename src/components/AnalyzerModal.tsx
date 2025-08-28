import React from "react";

type Listing = {
  mls: string;
  address: string;
  city: string;
};

export type Calc = {
  price: number;
  down: number;
  rate: number;
  amort: number;
  rent: number;
  parking: number;
  laundry: number;
  misc: number;
  taxes: number;
  insurance: number;
  utilities: number;
  maintenancePct: number;
  mgmtPct: number;
  vacancyPct: number;
};

type Props = {
  listing: Listing;
  calc: Calc;
  setCalc: (c: Calc) => void;
  onClose: () => void;

  // helpers
  money: (n: number) => string;
  pct: (p: number) => number;
  monthlyPayment: (
    totalPrice: number,
    downPct: number,
    annualRate: number,
    years: number
  ) => number;
  avgMonthlyPrincipalFirstYears: (
    price: number,
    downPct: number,
    annualRate: number,
    years: number,
    avgYears: number
  ) => number;
};

export default function AnalyzerModal({
  listing,
  calc,
  setCalc,
  onClose,
  money,
  pct,
  monthlyPayment,
  avgMonthlyPrincipalFirstYears,
}: Props) {
  const incomeMonthly = calc.rent + calc.parking + calc.laundry + calc.misc;
  const opExMonthly =
    calc.taxes +
    calc.insurance +
    calc.utilities +
    pct(calc.maintenancePct) * calc.rent +
    pct(calc.mgmtPct) * calc.rent +
    pct(calc.vacancyPct) * calc.rent;

  const noiMonthly = incomeMonthly - opExMonthly;
  const debtMonthly = monthlyPayment(calc.price, pct(calc.down), pct(calc.rate), calc.amort);
  const cashMonthly = noiMonthly - debtMonthly;
  const dscr = debtMonthly > 0 ? noiMonthly / debtMonthly : null;
  const capRate = calc.price > 0 ? ((noiMonthly * 12) / calc.price) * 100 : null;
  const avgPrin = avgMonthlyPrincipalFirstYears(calc.price, pct(calc.down), pct(calc.rate), calc.amort, 5);
  const capWithRepay = calc.price > 0 ? (((noiMonthly + avgPrin) * 12) / calc.price) * 100 : null;

  return (
    <div className="fixed inset-0 z-30">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 max-w-3xl mx-auto my-8 bg-white rounded-2xl shadow-xl border">
        <div className="p-4 border-b flex items-start justify-between">
          <div>
            <div className="text-lg font-semibold">Deal Analyzer</div>
            <div className="text-xs text-gray-500">
              {listing.address}, {listing.city} · MLS {listing.mls}
            </div>
          </div>
          <button className="px-3 py-1 rounded-lg border" onClick={onClose}>Close</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
          <div className="space-y-3">
            <div className="text-xs font-semibold uppercase text-gray-500">Deal Inputs</div>
            <LabeledNumber label="Purchase Price" value={calc.price} onChange={(v)=>setCalc({...calc, price:v})} />
            <div className="grid grid-cols-3 gap-2">
              <LabeledNumber label="Down %" value={calc.down} onChange={(v)=>setCalc({...calc, down:v})} />
              <LabeledNumber label="Rate %" value={calc.rate} onChange={(v)=>setCalc({...calc, rate:v})} />
              <LabeledNumber label="Years" value={calc.amort} onChange={(v)=>setCalc({...calc, amort:v})} />
            </div>

            <div className="text-xs font-semibold uppercase text-gray-500 pt-2">Income (Monthly)</div>
            <LabeledNumber label="Rent" value={calc.rent} onChange={(v)=>setCalc({...calc, rent:v})} />
            <div className="grid grid-cols-3 gap-2">
              <LabeledNumber label="Parking" value={calc.parking} onChange={(v)=>setCalc({...calc, parking:v})} />
              <LabeledNumber label="Laundry" value={calc.laundry} onChange={(v)=>setCalc({...calc, laundry:v})} />
              <LabeledNumber label="Misc" value={calc.misc} onChange={(v)=>setCalc({...calc, misc:v})} />
            </div>

            <div className="text-xs font-semibold uppercase text-gray-500 pt-2">Expenses (Monthly)</div>
            <div className="grid grid-cols-3 gap-2">
              <LabeledNumber label="Taxes" value={calc.taxes} onChange={(v)=>setCalc({...calc, taxes:v})} />
              <LabeledNumber label="Insurance" value={calc.insurance} onChange={(v)=>setCalc({...calc, insurance:v})} />
              <LabeledNumber label="Utilities" value={calc.utilities} onChange={(v)=>setCalc({...calc, utilities:v})} />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <LabeledNumber label="Maint %" value={calc.maintenancePct} onChange={(v)=>setCalc({...calc, maintenancePct:v})} />
              <LabeledNumber label="Mgmt %" value={calc.mgmtPct} onChange={(v)=>setCalc({...calc, mgmtPct:v})} />
              <LabeledNumber label="Vacancy %" value={calc.vacancyPct} onChange={(v)=>setCalc({...calc, vacancyPct:v})} />
            </div>
          </div>

          <div className="space-y-3">
            <div className="text-xs font-semibold uppercase text-gray-500">Results</div>
            <KV label="NOI (Monthly)" value={money(Math.round(noiMonthly))} />
            <KV label="Debt Service (Monthly)" value={money(Math.round(debtMonthly))} />
            <KV label="Cash Flow After Debt" value={money(Math.round(cashMonthly))} emphasis={cashMonthly>=0? 'good':'bad'} />
            <div className="grid grid-cols-2 gap-2">
              <KV label="NOI (Annual)" value={money(Math.round(noiMonthly*12))} />
              <KV label="Debt (Annual)" value={money(Math.round(debtMonthly*12))} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <KV label="DSCR" value={dscr? dscr.toFixed(2): '—'} emphasis={dscr && dscr>=1.2? 'good': dscr && dscr<1? 'bad': undefined} />
              <KV label="Cap Rate" value={capRate? capRate.toFixed(2)+'%': '—'} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <KV label="Avg Principal (mo, 5yr)" value={money(Math.round(avgPrin))} />
              <KV label="Cap w/ Repayment" value={capWithRepay? capWithRepay.toFixed(2)+'%': '—'} />
            </div>
            <div className="text-[11px] text-gray-500">Estimates only.</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LabeledNumber({label, value, onChange}:{label:string, value:number, onChange:(n:number)=>void}){
  return (
    <label className="text-xs text-gray-700 block">
      <span className="block mb-1">{label}</span>
      <input type="number" className="w-full px-2 py-1 border rounded-lg" value={value} onChange={(e)=>onChange(parseFloat((e.target as HTMLInputElement).value||'0'))} />
    </label>
  );
}

function KV({label, value, emphasis}:{label:string, value:string, emphasis?:'good'|'bad'}){
  const color = emphasis==='good'? 'text-green-700' : emphasis==='bad'? 'text-rose-700':'text-gray-900';
  return (
    <div className="p-3 rounded-xl border bg-white">
      <div className="text-[11px] uppercase tracking-wide text-gray-600">{label}</div>
      <div className={`text-base font-semibold ${color}`}>{value}</div>
    </div>
  );
}
