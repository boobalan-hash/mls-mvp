import React from "react";

type Mode = 'buy' | 'sell' | 'lease';
type BuySub = 'primary' | 'investment';
type LeaseSub = 'tenant' | 'landlord';
type InvestSub = 'cashflow' | 'appreciation';
type Level = 1 | 2 | 3;

type Props = {
  focus: Level;
  mode: Mode;
  buySub: BuySub;
  leaseSub: LeaseSub;
  investmentSub: InvestSub;
  isRegistered: boolean;
  goLevel: (n: Level) => void;
  onBack: () => void;
  onSetMode: (m: Mode) => void;
  onSetBuySub: (b: BuySub) => void;
  onSetLeaseSub: (l: LeaseSub) => void;
  onSetInvestmentSub: (i: InvestSub) => void;
  onOpenRegCtx: (ctx: any) => void;
};

export default function Header({
  focus, mode, buySub, leaseSub, investmentSub, isRegistered,
  goLevel, onBack, onSetMode, onSetBuySub, onSetLeaseSub, onSetInvestmentSub, onOpenRegCtx
}: Props) {
  return (
    <header className="sticky top-0 z-20 backdrop-blur bg-white/80 border-b">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-2">
          <span className="text-xl font-black">myigllo</span>
          <span className="text-xs px-2 py-1 rounded-full bg-indigo-100 text-indigo-700">MVP</span>
        </div>

        {/* Tier 1 */}
        {focus === 1 && (
          <div className="flex gap-2 items-center">
            <button
              onClick={() => { onSetMode('buy'); goLevel(2); }}
              className={`px-3 py-1 rounded-full text-sm border ${mode === 'buy' ? 'bg-indigo-600 text-white' : 'bg-white'}`}
            >Buy</button>
            <button
              onClick={() => { onSetMode('sell'); goLevel(1); if (!isRegistered) onOpenRegCtx({ mode: 'sell', leaf: 'sell' }); }}
              className={`px-3 py-1 rounded-full text-sm border ${mode === 'sell' ? 'bg-indigo-600 text-white' : 'bg-white'}`}
            >Sell</button>
            <button
              onClick={() => { onSetMode('lease'); goLevel(2); }}
              className={`px-3 py-1 rounded-full text-sm border ${mode === 'lease' ? 'bg-indigo-600 text-white' : 'bg-white'}`}
            >Lease</button>
          </div>
        )}

        {/* Tier 2: Buy */}
        {focus === 2 && mode === 'buy' && (
          <div className="flex items-center gap-2">
            <button onClick={onBack} className="px-3 py-1 rounded-full border text-sm">← Back</button>
            <button
              onClick={() => { onSetBuySub('primary'); goLevel(2); if (!isRegistered) onOpenRegCtx({ mode: 'buy', leaf: 'primary' }); }}
              className={`px-3 py-1 rounded-full text-sm border ${buySub === 'primary' ? 'bg-gray-900 text-white' : 'bg-white'}`}
            >Primary Residence</button>
            <button
              onClick={() => { onSetBuySub('investment'); goLevel(3); }}
              className={`px-3 py-1 rounded-full text-sm border ${buySub === 'investment' ? 'bg-gray-900 text-white' : 'bg-white'}`}
            >Investment</button>
          </div>
        )}

        {/* Tier 2: Lease */}
        {focus === 2 && mode === 'lease' && (
          <div className="flex items-center gap-2">
            <button onClick={onBack} className="px-3 py-1 rounded-full border text-sm">← Back</button>
            <button
              onClick={() => { onSetLeaseSub('tenant'); if (!isRegistered) onOpenRegCtx({ mode: 'lease', leaf: 'tenant' }); }}
              className={`px-3 py-1 rounded-full text-sm border ${leaseSub === 'tenant' ? 'bg-gray-900 text-white' : 'bg-white'}`}
            >Tenant</button>
            <button
              onClick={() => { onSetLeaseSub('landlord'); if (!isRegistered) onOpenRegCtx({ mode: 'lease', leaf: 'landlord' }); }}
              className={`px-3 py-1 rounded-full text-sm border ${leaseSub === 'landlord' ? 'bg-gray-900 text-white' : 'bg-white'}`}
            >Landlord</button>
          </div>
        )}

        {/* Tier 3: Buy/Investment */}
        {focus === 3 && mode === 'buy' && buySub === 'investment' && (
          <div className="flex items-center gap-2">
            <button onClick={onBack} className="px-3 py-1 rounded-full border text-sm">← Back</button>
            <button
              onClick={() => { onSetInvestmentSub('cashflow'); if (!isRegistered) onOpenRegCtx({ mode: 'buy', leaf: 'investment_cashflow' }); }}
              className={`px-3 py-1 rounded-full text-sm border ${investmentSub === 'cashflow' ? 'bg-emerald-600 text-white' : 'bg-white'}`}
            >Cash Flow</button>
            <button
              onClick={() => { onSetInvestmentSub('appreciation'); if (!isRegistered) onOpenRegCtx({ mode: 'buy', leaf: 'investment_appreciation' }); }}
              className={`px-3 py-1 rounded-full text-sm border ${investmentSub === 'appreciation' ? 'bg-indigo-600 text-white' : 'bg-white'}`}
            >Appreciation</button>
          </div>
        )}
      </div>
    </header>
  );
}
