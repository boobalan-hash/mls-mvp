import React from "react";

type Reg = {
  first: string;
  last: string;
  email: string;
  phone: string;
  role: string;
};

type Verify = {
  emailSent: boolean;
  phoneSent: boolean;
  emailCode: string;
  phoneCode: string;
  emailServer: string;
  phoneServer: string;
  emailVerified: boolean;
  phoneVerified: boolean;
};

type Props = {
  reg: Reg;
  setReg: (r: Reg) => void;
  verify: Verify;
  setVerify: (v: Verify) => void;
  regStep: 1 | 2;
  setRegStep: (s: 1 | 2) => void;
  regContext: any;
  regTx: any;
  setRegTx: (t: any) => void;
  onClose: () => void;
  onComplete: () => void;

  // helpers
  emailOk: (s: string) => boolean;
  phoneOk: (s: string) => boolean;
  sendEmailCode: () => void;
  sendPhoneCode: () => void;
  checkEmailCode: () => void;
  checkPhoneCode: () => void;
  TxFields: React.FC<{ ctx: any; tx: any; onChange: (t: any) => void }>;
};

export default function RegistrationModal({
  reg,
  setReg,
  verify,
  setVerify,
  regStep,
  setRegStep,
  regContext,
  regTx,
  setRegTx,
  onClose,
  onComplete,
  emailOk,
  phoneOk,
  sendEmailCode,
  sendPhoneCode,
  checkEmailCode,
  checkPhoneCode,
  TxFields,
}: Props) {
  return (
    <div className="fixed inset-0 z-40">
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative z-10 max-w-2xl mx-auto my-10 bg-white rounded-2xl shadow-2xl border">
        <div className="p-4 border-b flex items-center justify-between">
          <div>
            <div className="text-lg font-semibold">Create your free account</div>
            <div className="text-xs text-gray-500">
              Step {regStep} of 2 · Actions are paused until you complete registration.
            </div>
          </div>
          <button className="px-3 py-1 rounded-lg border" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {regStep === 1 && (
            <div className="space-y-3 md:col-span-2">
              {/* First + Last */}
              <TextField label="First name" value={reg.first} onChange={(v) => setReg({ ...reg, first: v })} />
              <TextField label="Last name" value={reg.last} onChange={(v) => setReg({ ...reg, last: v })} />

              {/* Email */}
              <label className="text-xs text-gray-700 block">
                <span className="block mb-1">Email</span>
                <div className="flex items-center gap-2">
                  <input
                    type="email"
                    className="w-full px-2 py-1 border rounded-lg"
                    value={reg.email}
                    onChange={(e) => setReg({ ...reg, email: e.target.value })}
                  />
                  {!verify.emailVerified && (
                    <button
                      className={`px-2 py-1 border rounded-lg ${emailOk(reg.email) ? "" : "opacity-50 cursor-not-allowed"}`}
                      onClick={() => {
                        if (emailOk(reg.email)) sendEmailCode();
                      }}
                      title="Send verification code"
                    >
                      ✉️
                    </button>
                  )}
                  {verify.emailVerified && (
                    <span className="text-green-700 text-sm" title="Email verified">
                      ✔
                    </span>
                  )}
                </div>
                {verify.emailSent && !verify.emailVerified && (
                  <div className="mt-2 flex items-center gap-2">
                    <input
                      className="px-2 py-1 border rounded-lg w-28"
                      placeholder="Code"
                      value={verify.emailCode}
                      onChange={(e) => setVerify({ ...verify, emailCode: e.target.value })}
                    />
                    <button className="px-2 py-1 border rounded-lg" onClick={checkEmailCode} title="Verify">
                      ✅
                    </button>
                    <span className="text-[11px] text-gray-500">(demo: <b>{verify.emailServer}</b>)</span>
                  </div>
                )}
              </label>

              {/* Phone */}
              <label className="text-xs text-gray-700 block">
                <span className="block mb-1">Phone</span>
                <div className="flex items-center gap-2">
                  <input
                    type="tel"
                    className="w-full px-2 py-1 border rounded-lg"
                    value={reg.phone}
                    onChange={(e) => setReg({ ...reg, phone: e.target.value })}
                  />
                  {!verify.phoneVerified && (
                    <button
                      className={`px-2 py-1 border rounded-lg ${phoneOk(reg.phone) ? "" : "opacity-50 cursor-not-allowed"}`}
                      onClick={() => {
                        if (phoneOk(reg.phone)) sendPhoneCode();
                      }}
                      title="Send SMS code"
                    >
                      📱
                    </button>
                  )}
                  {verify.phoneVerified && (
                    <span className="text-green-700 text-sm" title="Phone verified">
                      ✔
                    </span>
                  )}
                </div>
                {verify.phoneSent && !verify.phoneVerified && (
                  <div className="mt-2 flex items-center gap-2">
                    <input
                      className="px-2 py-1 border rounded-lg w-28"
                      placeholder="Code"
                      value={verify.phoneCode}
                      onChange={(e) => setVerify({ ...verify, phoneCode: e.target.value })}
                    />
                    <button className="px-2 py-1 border rounded-lg" onClick={checkPhoneCode} title="Verify">
                      ✅
                    </button>
                    <span className="text-[11px] text-gray-500">(demo: <b>{verify.phoneServer}</b>)</span>
                  </div>
                )}
              </label>
            </div>
          )}

          {regStep === 2 && (
            <div className="md:col-span-2">
              <TxFields ctx={regContext} tx={regTx} onChange={setRegTx} />
            </div>
          )}
        </div>

        <div className="p-4 border-t flex items-center justify-between">
          <div className="text-[11px] text-gray-500">Privacy-first demo. Data stored locally.</div>
          <div className="flex gap-2">
            {regStep === 1 && (
              <button
                className={`px-3 py-2 rounded-xl text-white ${
                  reg.first &&
                  emailOk(reg.email) &&
                  phoneOk(reg.phone) &&
                  verify.emailVerified &&
                  verify.phoneVerified
                    ? "bg-indigo-600 hover:bg-indigo-700"
                    : "bg-gray-300 cursor-not-allowed"
                }`}
                onClick={() => setRegStep(2)}
                disabled={
                  !(
                    reg.first &&
                    emailOk(reg.email) &&
                    phoneOk(reg.phone) &&
                    verify.emailVerified &&
                    verify.phoneVerified
                  )
                }
              >
                Continue
              </button>
            )}
            {regStep === 2 && (
              <button className="px-3 py-2 rounded-xl text-white bg-indigo-600 hover:bg-indigo-700" onClick={onComplete}>
                Complete
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function TextField({label, value, onChange}:{label:string, value:string, onChange:(s:string)=>void}){
  return (
    <label className="text-xs text-gray-700 block">
      <span className="block mb-1">{label}</span>
      <input
        type="text"
        className="w-full px-2 py-1 border rounded-lg"
        value={value}
        onChange={(e)=>onChange((e.target as HTMLInputElement).value)}
      />
    </label>
  );
}
