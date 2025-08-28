import React from "react";

type Mode = "buy" | "sell" | "lease";
type BuySub = "primary" | "investment";
type InvestSub = "cashflow" | "appreciation";
type LeaseSub = "tenant" | "landlord";

export type Listing = {
  mls: string;
  address: string;
  city: string;
  price: number;
  beds: number;
  baths: number;
  sqft?: number | null;
  lot?: string | null;
  dom: number;
  status?: string;
  listDate: string;
  photo: string;
  estRent?: number;
  lastSoldPrice?: number;
  lastSoldDate?: string;
};

type Props = {
  listing: Listing;
  mode: Mode;
  buySub: BuySub;
  investmentSub: InvestSub;
  leaseSub: LeaseSub;
  isRegistered: boolean;
  onAnalyze: (l: Listing) => void;
  onRequireReg: () => void;

  // helpers coming from App.tsx (we’ll move these into utils later)
  monthlyPayment: (price: number, downPct: number, rate: number, years: number) => number;
  money: (n: number) => string;
  dateFmt: (s: string) => string;
  downPct: number;
  rate: number;
  years: number;
  appr: number;
};

export default function ListingCard({
  listing: r,
  mode,
  buySub,
  investmentSub,
  leaseSub,
  isRegistered,
  onAnalyze,
  onRequireReg,
  monthlyPayment,
  money,
  dateFmt,
  downPct,
  rate,
  years,
  appr,
}: Props) {
  const pay = monthlyPayment(r.price, downPct, rate, years);
  const rent = r.estRent || 0;
  const netOwnerCost = Math.max(0, pay - rent);
  const cashFlow = rent - pay;
  const app1yr = r.price * appr;
  const app5yr = r.price * (Math.pow(1 + appr, 5) - 1);
  const grossYield = r.price ? (((rent * 12) / r.price) * 100).toFixed(2) : "N/A";

  return (
    <div className="bg-white border rounded-2xl overflow-hidden shadow-sm">
      <img
        src={r.photo}
        alt={r.address}
        className="w-full aspect-[4/3] object-cover cursor-pointer"
        onClick={() => {
          if (!isRegistered) onRequireReg();
        }}
      />

      <div className="p-4 space-y-3">
        <div className="flex justify-between items-start">
          <div>
            <div className="text-lg font-semibold">{money(r.price)}</div>
            <div className="text-sm text-gray-600">
              {r.address}, {r.city}
            </div>
          </div>
          <div className="text-right text-xs text-gray-500">
            <div>MLS {r.mls}</div>
            <div>Listed {dateFmt(r.listDate)}</div>
          </div>
        </div>

        {/* BUY ─ Primary */}
        {mode === "buy" && buySub === "primary" && (
          <div className="text-sm text-gray-700 space-y-1">
            <p>
              <b>{r.beds}</b> beds · <b>{r.baths}</b> baths · {r.sqft} sf
            </p>
            <div className="mt-2 p-3 rounded-xl border bg-gray-50">
              <div className="text-[11px] uppercase tracking-wide text-gray-500">
                Est. Monthly Payment
              </div>
              <div className="text-base font-semibold">
                {money(Math.round(pay))}
                <span className="text-xs text-gray-500"> /mo</span>
              </div>
            </div>
          </div>
        )}

        {/* BUY ─ Investment (Cash flow / Appreciation) */}
        {mode === "buy" && buySub === "investment" && (
          <div className="text-sm text-gray-700 space-y-2">
            <p>House-Hack: Est. Rent offset {money(rent)} /mo</p>

            <div className="p-3 rounded-xl border bg-green-50">
              <div className="text-[11px] uppercase tracking-wide text-gray-600">
                Owner Net Monthly (Payment − Rent)
              </div>
              <div className="text-base font-semibold">
                {money(Math.round(netOwnerCost))}
                <span className="text-xs text-gray-500"> /mo</span>
              </div>
            </div>

            {investmentSub === "cashflow" && (
              <div className="p-3 rounded-xl border bg-white">
                <div className="text-[11px] uppercase tracking-wide text-gray-600">
                  Cash Flow (Monthly)
                </div>
                <div
                  className={`text-base font-semibold ${
                    cashFlow >= 0 ? "text-green-700" : "text-rose-700"
                  }`}
                >
                  {money(Math.round(cashFlow))}
                  <span className="text-xs text-gray-500"> /mo</span>
                </div>
              </div>
            )}

            {investmentSub === "appreciation" && (
              <div className="p-3 rounded-xl border bg-white">
                <div className="text-[11px] uppercase tracking-wide text-gray-600">
                  Projected Appreciation
                </div>
                <div className="text-sm">
                  1-year: <b>{money(Math.round(app1yr))}</b> · 5-year:{" "}
                  <b>{money(Math.round(app5yr))}</b>
                </div>
              </div>
            )}
          </div>
        )}

        {/* SELL */}
        {mode === "sell" && (
          <div className="text-sm text-gray-700 space-y-1">
            <p>Current Asking: {money(r.price)}</p>
            <p>Days on Market: {r.dom}</p>
          </div>
        )}

        {/* LEASE */}
        {mode === "lease" && leaseSub === "tenant" && (
          <div className="text-sm text-gray-700 space-y-1">
            <p>
              Asking Rent: <b>{money(r.estRent || 0)}</b> /mo
            </p>
            {r.sqft ? <p>~{((r.estRent || 0) / (r.sqft || 1)).toFixed(2)} $/sf·mo</p> : null}
          </div>
        )}

        {mode === "lease" && leaseSub === "landlord" && (
          <div className="text-sm text-gray-700 space-y-1">
            <p>
              Market Rent (est.): <b>{money(r.estRent || 0)}</b> /mo
            </p>
            <p>Gross Yield: {grossYield !== "N/A" ? `${grossYield}%` : "N/A"}</p>
          </div>
        )}

        {/* Actions */}
        <div className="pt-2">
          <button
            onClick={() => onAnalyze(r)}
            className="px-3 py-1 text-sm rounded-xl border bg-white hover:bg-gray-50"
          >
            Analyze
          </button>
          {!isRegistered && (
            <span className="ml-2 text-[11px] text-gray-400">
              Register to unlock analysis
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
