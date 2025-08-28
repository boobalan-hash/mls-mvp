
import React, { useEffect, useState } from "react";
import Header from "./components/Header";
import ListingCard from "./components/ListingCard";


// Mock MLS Web App (compact) — Buy/Sell/Lease nav with focused tier,
// leaf-click registration (2 steps, inline ✉️/📱 verify), analyzer modal.

// Helpers
const money = (n: number) => new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 }).format(n || 0);
const dateFmt = (s: string) => new Date(s).toLocaleDateString("en-CA", { year: "numeric", month: "short", day: "numeric" });
const pct = (p: number) => (isFinite(p) ? p / 100 : 0);
const emailOk = (s: string) => /[^\s@]+@[^\s@]+\.[^\s@]+/.test(String(s || "").trim());
const phoneOk = (s: string) => /^(\+?\d[\d\s\-()]{7,})$/.test(String(s || "").trim());

// Finance
function monthlyPayment(totalPrice: number, downPct = 0.20, annualRate = 0.049, years = 25) {
  const loan = Math.max(0, totalPrice * (1 - downPct));
  const r = annualRate / 12; const n = years * 12;
  if (r === 0) return n ? loan / n : 0;
  return loan * r / (1 - Math.pow(1 + r, -n));
}
function avgMonthlyPrincipalFirstYears(price: number, downPct = 0.20, annualRate = 0.049, years = 25, avgYears = 5) {
  const loan = Math.max(0, price * (1 - downPct)); if (!loan) return 0;
  const pay = monthlyPayment(price, downPct, annualRate, years); const r = annualRate / 12; const k = Math.min(avgYears * 12, years * 12);
  let bal = loan, sum = 0; for (let i = 0; i < k; i++) { const interest = bal * r; const principal = Math.max(0, pay - interest); sum += principal; bal = Math.max(0, bal - principal); } return sum / k;
}

// Mock listings
const MOCK_LISTINGS = [
  { mls: "E9010001", address: "32 Moran Rd", city: "Toronto", area: "Scarborough", neighbourhood: "Cliffside", price: 1299000, beds: 4, baths: 4, type: "Detached", sqft: 2400, lot: "39.6 x 150 ft", dom: 7, status: "Active", listDate: "2025-08-15", photo: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1200&auto=format&fit=crop", estRent: 4200, lastSoldPrice: 1099000, lastSoldDate: "2022-05-18" },
  { mls: "C9010003", address: "88 King St E #1203", city: "Toronto", area: "Downtown", neighbourhood: "St. Lawrence", price: 749000, beds: 2, baths: 2, type: "Condo", sqft: 920, lot: null, dom: 4, status: "Active", listDate: "2025-08-23", photo: "https://images.unsplash.com/photo-1522708323590-1e4ce9a789c7?q=80&w=1200&auto=format&fit=crop", estRent: 2600, lastSoldPrice: 629000, lastSoldDate: "2020-07-10" },
];

export default function App() {
  // Nav state
  const [mode, setMode] = useState<'buy' | 'sell' | 'lease'>('buy');
  const [buySub, setBuySub] = useState<'primary' | 'investment'>('primary');
  const [investmentSub, setInvestmentSub] = useState<'cashflow' | 'appreciation'>('cashflow');
  const [leaseSub, setLeaseSub] = useState<'tenant' | 'landlord'>('tenant');
  const [focus, setFocus] = useState<1 | 2 | 3>(1);

  // Assumptions
  const downPct = 0.20, rate = 0.042, years = 25, appr = 0.03;

  // Analyzer
  const [analyzeFor, setAnalyzeFor] = useState<any>(null);
  const [calc, setCalc] = useState<any>({ price: 0, down: 20, rate: 4.2, amort: 25, rent: 0, parking: 0, laundry: 0, misc: 0, taxes: 0, insurance: 0, utilities: 0, maintenancePct: 3, mgmtPct: 0, vacancyPct: 2 });

  // Registration
  const [isRegistered, setIsRegistered] = useState(false);
  const [showReg, setShowReg] = useState(false);
  const [regStep, setRegStep] = useState<1 | 2>(1);
  const [regContext, setRegContext] = useState<any>({ mode: 'buy', leaf: 'primary' });
  const [reg, setReg] = useState<any>({ first: '', last: '', email: '', phone: '', role: 'Buyer' });
  const [verify, setVerify] = useState<any>({ emailSent: false, phoneSent: false, emailCode: '', phoneCode: '', emailServer: '', phoneServer: '', emailVerified: false, phoneVerified: false });
  const [regTx, setRegTx] = useState<any>({});
  const [pendingListing, setPendingListing] = useState<any>(null);

  useEffect(() => { if (!analyzeFor) return; setCalc((c: any) => ({ ...c, price: analyzeFor.price || 0, rent: analyzeFor.estRent || 0, rate: 4.2, amort: 25 })); }, [analyzeFor]);
  useEffect(() => { try { const saved = JSON.parse(localStorage.getItem('regUser') || 'null'); if (saved?.email) { setIsRegistered(true); setReg({ first: saved.first || '', last: saved.last || '', email: saved.email || '', phone: saved.phone || '', role: saved.role || 'Buyer' }); } } catch { } }, []);

  const goLevel = (n: 1 | 2 | 3) => setFocus(n); const back = () => setFocus(f => (f > 1 ? (f - 1 as 1 | 2 | 3) : 1));
  const roleFromContext = (ctx: any) => ({ 'buy:primary': 'Buyer', 'buy:investment_cashflow': 'Investor', 'buy:investment_appreciation': 'Investor', 'sell:sell': 'Seller', 'lease:tenant': 'Tenant', 'lease:landlord': 'Landlord' }[`${ctx.mode}:${ctx.leaf}`] || 'User');
  const openRegWithContext = (ctx: any) => { setRegContext(ctx); setReg((r: any) => ({ ...r, role: roleFromContext(ctx) })); setRegStep(1); setShowReg(true); };

  const onAnalyze = (listing: any) => { if (!isRegistered) { setPendingListing(listing); openRegWithContext({ mode, leaf: buySub === 'investment' ? `investment_${investmentSub}` : buySub }); return; } setAnalyzeFor(listing); };

  const submitRegistration = () => { if (!reg.first || !emailOk(reg.email) || !phoneOk(reg.phone) || !verify.emailVerified || !verify.phoneVerified) return; try { localStorage.setItem('regUser', JSON.stringify(reg)); } catch { } setIsRegistered(true); if (pendingListing) { setAnalyzeFor(pendingListing); setPendingListing(null); } setShowReg(false); };

  const sendEmailCode = () => { const code = String(Math.floor(100000 + Math.random() * 900000)); setVerify((v: any) => ({ ...v, emailSent: true, emailServer: code })); };
  const sendPhoneCode = () => { const code = String(Math.floor(100000 + Math.random() * 900000)); setVerify((v: any) => ({ ...v, phoneSent: true, phoneServer: code })); };
  const checkEmailCode = () => setVerify((v: any) => ({ ...v, emailVerified: v.emailCode === v.emailServer }));
  const checkPhoneCode = () => setVerify((v: any) => ({ ...v, phoneVerified: v.phoneCode === v.phoneServer }));

  // Analyzer metrics
  const incomeMonthly = calc.rent + calc.parking + calc.laundry + calc.misc;
  const opExMonthly = (calc.taxes + calc.insurance + calc.utilities) + pct(calc.maintenancePct) * calc.rent + pct(calc.mgmtPct) * calc.rent + pct(calc.vacancyPct) * calc.rent;
  const noiMonthly = incomeMonthly - opExMonthly;
  const debtMonthly = monthlyPayment(calc.price, pct(calc.down), pct(calc.rate), calc.amort);
  const cashMonthly = noiMonthly - debtMonthly;
  const dscr = debtMonthly > 0 ? (noiMonthly / debtMonthly) : null;
  const capRate = calc.price > 0 ? ((noiMonthly * 12) / calc.price) * 100 : null;
  const avgPrin = avgMonthlyPrincipalFirstYears(calc.price, pct(calc.down), pct(calc.rate), calc.amort, 5);
  const capWithRepay = calc.price > 0 ? (((noiMonthly + avgPrin) * 12) / calc.price) * 100 : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header + focused tier */}
      <Header
        focus={focus}
        mode={mode}
        buySub={buySub}
        leaseSub={leaseSub}
        investmentSub={investmentSub}
        isRegistered={isRegistered}
        goLevel={goLevel}
        onBack={back}
        onSetMode={setMode}
        onSetBuySub={setBuySub}
        onSetLeaseSub={setLeaseSub}
        onSetInvestmentSub={setInvestmentSub}
        onOpenRegCtx={openRegWithContext}
      />


      {/* Cards */}
      <main className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {MOCK_LISTINGS.map((r) => (
          <ListingCard
            key={r.mls}
            listing={r}
            mode={mode}
            buySub={buySub}
            investmentSub={investmentSub}
            leaseSub={leaseSub}
            isRegistered={isRegistered}
            onAnalyze={onAnalyze}
            onRequireReg={() => setShowReg(true)}
            monthlyPayment={monthlyPayment}
            money={money}
            dateFmt={dateFmt}
            downPct={downPct}
            rate={rate}
            years={years}
            appr={appr}
          />
        ))}
      </main>

      {/* Analyzer Modal */}
      {analyzeFor && (
        <div className="fixed inset-0 z-30">
          <div className="absolute inset-0 bg-black/40" onClick={() => setAnalyzeFor(null)} />
          <div className="relative z-10 max-w-3xl mx-auto my-8 bg-white rounded-2xl shadow-xl border">
            <div className="p-4 border-b flex items-start justify-between">
              <div>
                <div className="text-lg font-semibold">Deal Analyzer</div>
                <div className="text-xs text-gray-500">{analyzeFor.address}, {analyzeFor.city} · MLS {analyzeFor.mls}</div>
              </div>
              <button className="px-3 py-1 rounded-lg border" onClick={() => setAnalyzeFor(null)}>Close</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
              <div className="space-y-3">
                <div className="text-xs font-semibold uppercase text-gray-500">Deal Inputs</div>
                <LabeledNumber label="Purchase Price" value={calc.price} onChange={(v: number) => setCalc({ ...calc, price: v })} />
                <div className="grid grid-cols-3 gap-2">
                  <LabeledNumber label="Down %" value={calc.down} onChange={(v: number) => setCalc({ ...calc, down: v })} />
                  <LabeledNumber label="Rate %" value={calc.rate} onChange={(v: number) => setCalc({ ...calc, rate: v })} />
                  <LabeledNumber label="Years" value={calc.amort} onChange={(v: number) => setCalc({ ...calc, amort: v })} />
                </div>
                <div className="text-xs font-semibold uppercase text-gray-500 pt-2">Income (Monthly)</div>
                <LabeledNumber label="Rent" value={calc.rent} onChange={(v: number) => setCalc({ ...calc, rent: v })} />
                <div className="grid grid-cols-3 gap-2">
                  <LabeledNumber label="Parking" value={calc.parking} onChange={(v: number) => setCalc({ ...calc, parking: v })} />
                  <LabeledNumber label="Laundry" value={calc.laundry} onChange={(v: number) => setCalc({ ...calc, laundry: v })} />
                  <LabeledNumber label="Misc" value={calc.misc} onChange={(v: number) => setCalc({ ...calc, misc: v })} />
                </div>
                <div className="text-xs font-semibold uppercase text-gray-500 pt-2">Expenses (Monthly)</div>
                <div className="grid grid-cols-3 gap-2">
                  <LabeledNumber label="Taxes" value={calc.taxes} onChange={(v: number) => setCalc({ ...calc, taxes: v })} />
                  <LabeledNumber label="Insurance" value={calc.insurance} onChange={(v: number) => setCalc({ ...calc, insurance: v })} />
                  <LabeledNumber label="Utilities" value={calc.utilities} onChange={(v: number) => setCalc({ ...calc, utilities: v })} />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <LabeledNumber label="Maint %" value={calc.maintenancePct} onChange={(v: number) => setCalc({ ...calc, maintenancePct: v })} />
                  <LabeledNumber label="Mgmt %" value={calc.mgmtPct} onChange={(v: number) => setCalc({ ...calc, mgmtPct: v })} />
                  <LabeledNumber label="Vacancy %" value={calc.vacancyPct} onChange={(v: number) => setCalc({ ...calc, vacancyPct: v })} />
                </div>
              </div>
              <div className="space-y-3">
                <div className="text-xs font-semibold uppercase text-gray-500">Results</div>
                <KV label="NOI (Monthly)" value={money(Math.round(noiMonthly))} />
                <KV label="Debt Service (Monthly)" value={money(Math.round(debtMonthly))} />
                <KV label="Cash Flow After Debt" value={money(Math.round(cashMonthly))} emphasis={cashMonthly >= 0 ? 'good' : 'bad'} />
                <div className="grid grid-cols-2 gap-2">
                  <KV label="NOI (Annual)" value={money(Math.round(noiMonthly * 12))} />
                  <KV label="Debt (Annual)" value={money(Math.round(debtMonthly * 12))} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <KV label="DSCR" value={dscr ? dscr.toFixed(2) : '—'} emphasis={dscr && dscr >= 1.2 ? 'good' : dscr && dscr < 1 ? 'bad' : undefined} />
                  <KV label="Cap Rate" value={capRate ? capRate.toFixed(2) + '%' : '—'} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <KV label="Avg Principal (mo, 5yr)" value={money(Math.round(avgPrin))} />
                  <KV label="Cap w/ Repayment" value={capWithRepay ? capWithRepay.toFixed(2) + '%' : '—'} />
                </div>
                <div className="text-[11px] text-gray-500">Estimates only.</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Registration Modal */}
      {showReg && (
        <div className="fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative z-10 max-w-2xl mx-auto my-10 bg-white rounded-2xl shadow-2xl border">
            <div className="p-4 border-b flex items-center justify-between">
              <div>
                <div className="text-lg font-semibold">Create your free account</div>
                <div className="text-xs text-gray-500">Step {regStep} of 2 · Actions are paused until you complete registration.</div>
              </div>
              <button className="px-3 py-1 rounded-lg border" onClick={() => setShowReg(false)}>Close</button>
            </div>
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              {regStep === 1 && (
                <div className="space-y-3 md:col-span-2">
                  <TextField label="First name" value={reg.first} onChange={(v: string) => setReg({ ...reg, first: v })} />
                  <TextField label="Last name" value={reg.last} onChange={(v: string) => setReg({ ...reg, last: v })} />
                  <label className="text-xs text-gray-700 block">
                    <span className="block mb-1">Email</span>
                    <div className="flex items-center gap-2">
                      <input type="email" className="w-full px-2 py-1 border rounded-lg" value={reg.email} onChange={(e) => setReg({ ...reg, email: e.target.value })} />
                      {!verify.emailVerified && (<button className={`px-2 py-1 border rounded-lg ${emailOk(reg.email) ? '' : 'opacity-50 cursor-not-allowed'}`} onClick={() => { if (emailOk(reg.email)) sendEmailCode(); }} title="Send verification code">✉️</button>)}
                      {verify.emailVerified && (<span className="text-green-700 text-sm" title="Email verified">✔</span>)}
                    </div>
                    {verify.emailSent && !verify.emailVerified && (
                      <div className="mt-2 flex items-center gap-2">
                        <input className="px-2 py-1 border rounded-lg w-28" placeholder="Code" value={verify.emailCode} onChange={(e) => setVerify((v: any) => ({ ...v, emailCode: e.target.value }))} />
                        <button className="px-2 py-1 border rounded-lg" onClick={checkEmailCode} title="Verify">✅</button>
                        <span className="text-[11px] text-gray-500">(demo: <b>{verify.emailServer}</b>)</span>
                      </div>
                    )}
                  </label>
                  <label className="text-xs text-gray-700 block">
                    <span className="block mb-1">Phone</span>
                    <div className="flex items-center gap-2">
                      <input type="tel" className="w-full px-2 py-1 border rounded-lg" value={reg.phone} onChange={(e) => setReg({ ...reg, phone: e.target.value })} />
                      {!verify.phoneVerified && (<button className={`px-2 py-1 border rounded-lg ${phoneOk(reg.phone) ? '' : 'opacity-50 cursor-not-allowed'}`} onClick={() => { if (phoneOk(reg.phone)) sendPhoneCode(); }} title="Send SMS code">📱</button>)}
                      {verify.phoneVerified && (<span className="text-green-700 text-sm" title="Phone verified">✔</span>)}
                    </div>
                    {verify.phoneSent && !verify.phoneVerified && (
                      <div className="mt-2 flex items-center gap-2">
                        <input className="px-2 py-1 border rounded-lg w-28" placeholder="Code" value={verify.phoneCode} onChange={(e) => setVerify((v: any) => ({ ...v, phoneCode: e.target.value }))} />
                        <button className="px-2 py-1 border rounded-lg" onClick={checkPhoneCode} title="Verify">✅</button>
                        <span className="text-[11px] text-gray-500">(demo: <b>{verify.phoneServer}</b>)</span>
                      </div>
                    )}
                  </label>
                </div>
              )}
              {regStep === 2 && (
                <div className="md:col-span-2"><TxFields ctx={regContext} tx={regTx} onChange={setRegTx} /></div>
              )}
            </div>
            <div className="p-4 border-t flex items-center justify-between">
              <div className="text-[11px] text-gray-500">Privacy-first demo. Data stored locally.</div>
              <div className="flex gap-2">
                {regStep === 1 && (
                  <button className={`px-3 py-2 rounded-xl text-white ${reg.first && emailOk(reg.email) && phoneOk(reg.phone) && verify.emailVerified && verify.phoneVerified ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-gray-300 cursor-not-allowed'}`} onClick={() => setRegStep(2)} disabled={!(reg.first && emailOk(reg.email) && phoneOk(reg.phone) && verify.emailVerified && verify.phoneVerified)}>Continue</button>
                )}
                {regStep === 2 && (<button className="px-3 py-2 rounded-xl text-white bg-indigo-600 hover:bg-indigo-700" onClick={submitRegistration}>Complete</button>)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function LabeledNumber({ label, value, onChange }: { label: string, value: number, onChange: (n: number) => void }) {
  return (<label className="text-xs text-gray-700 block"><span className="block mb-1">{label}</span><input type="number" className="w-full px-2 py-1 border rounded-lg" value={value} onChange={(e) => onChange(parseFloat((e.target as HTMLInputElement).value || '0'))} /></label>);
}
function TextField({ label, value, onChange, type = 'text' }: { label: string, value: string, onChange: (s: string) => void, type?: string }) {
  return (<label className="text-xs text-gray-700 block"><span className="block mb-1">{label}</span><input type={type} className="w-full px-2 py-1 border rounded-lg" value={value} onChange={(e) => onChange((e.target as HTMLInputElement).value)} /></label>);
}
function KV({ label, value, emphasis }: { label: string, value: string, emphasis?: 'good' | 'bad' }) {
  const color = emphasis === 'good' ? 'text-green-700' : emphasis === 'bad' ? 'text-rose-700' : 'text-gray-900';
  return (<div className="p-3 rounded-xl border bg-white"><div className="text-[11px] uppercase tracking-wide text-gray-600">{label}</div><div className={`text-base font-semibold ${color}`}>{value}</div></div>);
}
function TxFields({ ctx, tx, onChange }: { ctx: any, tx: any, onChange: (t: any) => void }) {
  const set = (k: string, v: any) => onChange({ ...tx, [k]: v });
  const Row = ({ children }: { children: any }) => (<div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">{children}</div>);
  const Input = ({ label, val, on }: { label: string, val: any, on: (v: any) => void }) => (<label className="text-xs text-gray-700 block"><span className="block mb-1">{label}</span><input type="text" className="w-full px-2 py-1 border rounded-lg" value={val || ''} onChange={(e) => on((e.target as HTMLInputElement).value)} /></label>);
  const Num = ({ label, val, on }: { label: string, val: any, on: (v: number) => void }) => (<label className="text-xs text-gray-700 block"><span className="block mb-1">{label}</span><input type="number" className="w-full px-2 py-1 border rounded-lg" value={val || 0} onChange={(e) => on(parseFloat((e.target as HTMLInputElement).value || '0'))} /></label>);
  const key = `${ctx.mode}:${ctx.leaf}`;
  return (
    <div className="p-2">
      {key === 'buy:primary' && (<>
        <Row><Num label="Budget" val={tx.budget} on={(v) => set('budget', v)} /><Num label="Down %" val={tx.down} on={(v) => set('down', v)} /><Input label="City/Areas" val={tx.areas} on={(v) => set('areas', v)} /></Row>
        <Row><Num label="Beds" val={tx.beds} on={(v) => set('beds', v)} /><Num label="Baths" val={tx.baths} on={(v) => set('baths', v)} /><Input label="Move-in Date" val={tx.moveIn} on={(v) => set('moveIn', v)} /></Row>
        <Row><Input label="Pre-approval (Y/N)" val={tx.pre} on={(v) => set('pre', v)} /><Num label="Max Monthly Payment" val={tx.maxPay} on={(v) => set('maxPay', v)} /><Input label="Notes" val={tx.notes} on={(v) => set('notes', v)} /></Row>
      </>)}
      {key === 'buy:investment_cashflow' && (<>
        <Row><Num label="Budget" val={tx.budget} on={(v) => set('budget', v)} /><Num label="Down %" val={tx.down} on={(v) => set('down', v)} /><Num label="Target Cap %" val={tx.capTarget} on={(v) => set('capTarget', v)} /></Row>
        <Row><Num label="DSCR Target" val={tx.dscr} on={(v) => set('dscr', v)} /><Input label="Strategy" val={tx.strategy} on={(v) => set('strategy', v)} /><Num label="Est. Rent (Monthly)" val={tx.rent} on={(v) => set('rent', v)} /></Row>
        <Row><Input label="Areas" val={tx.areas} on={(v) => set('areas', v)} /><Input label="Notes" val={tx.notes} on={(v) => set('notes', v)} /></Row>
      </>)}
      {key === 'buy:investment_appreciation' && (<>
        <Row><Num label="Budget" val={tx.budget} on={(v) => set('budget', v)} /><Num label="Down %" val={tx.down} on={(v) => set('down', v)} /><Num label="Target 5yr Return %" val={tx.target5} on={(v) => set('target5', v)} /></Row>
        <Row><Input label="Hold Period (yrs)" val={tx.hold} on={(v) => set('hold', v)} /><Input label="Areas" val={tx.areas} on={(v) => set('areas', v)} /><Input label="Notes" val={tx.notes} on={(v) => set('notes', v)} /></Row>
      </>)}
      {key === 'sell:sell' && (<>
        <Row><Num label="Target Price" val={tx.target} on={(v) => set('target', v)} /><Input label="Timeline" val={tx.timeline} on={(v) => set('timeline', v)} /><Input label="Renovations done?" val={tx.reno} on={(v) => set('reno', v)} /></Row>
        <Row><Input label="Mortgage Balance (opt)" val={tx.mortBal} on={(v) => set('mortBal', v)} /><Input label="Staging? (Y/N)" val={tx.staging} on={(v) => set('staging', v)} /><Input label="Notes" val={tx.notes} on={(v) => set('notes', v)} /></Row>
      </>)}
      {key === 'lease:tenant' && (<>
        <Row><Num label="Budget (Monthly)" val={tx.budget} on={(v) => set('budget', v)} /><Input label="Move-in Date" val={tx.moveIn} on={(v) => set('moveIn', v)} /><Input label="Occupants / Pets" val={tx.occ} on={(v) => set('occ', v)} /></Row>
        <Row><Input label="Employment" val={tx.emp} on={(v) => set('emp', v)} /><Input label="Credit (approx)" val={tx.credit} on={(v) => set('credit', v)} /><Input label="Desired Areas" val={tx.areas} on={(v) => set('areas', v)} /></Row>
      </>)}
      {key === 'lease:landlord' && (<>
        <Row><Num label="Expected Rent" val={tx.rent} on={(v) => set('rent', v)} /><Input label="Lease Term (mo)" val={tx.term} on={(v) => set('term', v)} /><Input label="Available From" val={tx.available} on={(v) => set('available', v)} /></Row>
        <Row><Input label="Unit Type" val={tx.unit} on={(v) => set('unit', v)} /><Input label="Pets Allowed? (Y/N)" val={tx.pets} on={(v) => set('pets', v)} /><Input label="Tenant Criteria" val={tx.criteria} on={(v) => set('criteria', v)} /></Row>
      </>)}
    </div>
  );
}

// Dev sanity tests
if (typeof window !== 'undefined') {
  console.assert(!isNaN(monthlyPayment(1000000, 0.2, 0.05, 25)));
  console.assert(monthlyPayment(1000000, 0.2, 0.05, 25) > 0);
  const mpZero = monthlyPayment(600000, 0.2, 0, 25); const loanZero = 600000 * (1 - 0.2); const perMonthZero = loanZero / (25 * 12);
  console.assert(Math.abs(mpZero - perMonthZero) < 1e-6);
}
