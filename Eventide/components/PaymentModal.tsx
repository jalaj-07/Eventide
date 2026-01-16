import React, { useState, useEffect } from "react";
import { X, CreditCard, ShieldCheck, Wallet, Loader2, Smartphone, Building2 } from "lucide-react";
import { Payment } from "../types";
import { useToast } from "./ToastContext";

interface PROPS {
  amount: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (payment: Payment) => void;
  bookingId?: string; // Kept as optional but unused in component logic for now, standard interface
}

type PaymentMethod = "Card" | "UPI" | "EMI";

const PaymentModal: React.FC<PROPS> = ({ amount, isOpen, onClose, onSuccess }) => {
  const [method, setMethod] = useState<PaymentMethod>("Card");

  const [step, setStep] = useState<"input" | "processing" | "success">("input");
  const { addToast } = useToast();

  // Form States
  const [cardDetails, setCardDetails] = useState({ number: "", expiry: "", cvv: "", name: "" });
  const [upiId, setUpiId] = useState("");
  const [emiBank, setEmiBank] = useState("HDFC");
  const [emiTenure, setEmiTenure] = useState("3");
  const [enteredAmount, setEnteredAmount] = useState<number>(amount);
  const [canConfirm, setCanConfirm] = useState(false);

  useEffect(() => {
      // Logic for "I Have Paid" button delay
      if (method === "UPI") {
          setCanConfirm(false);
          const timer = setTimeout(() => setCanConfirm(true), 2000); // 2 seconds delay
          return () => clearTimeout(timer);
      } else {
          setCanConfirm(true);
      }
  }, [method]);

  useEffect(() => {
    setEnteredAmount(amount);
  }, [amount]);

  useEffect(() => {
    if (isOpen) {
        setStep("input");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePayment = async () => {
    // Validate Amount
    if (enteredAmount <= 0) {
        addToast("Please enter a valid amount", "error");
        return;
    }

    setStep("processing");

    // Simulate Network Delay / Payment Verification
    setTimeout(() => {
        // Here we would verifying against the backend if real integration
        
        setStep("success");
        setTimeout(() => {
            onSuccess({
                id: "pay_" + Math.random().toString(36).substring(7),
                amount: enteredAmount,
                method: method || "Card",
                currency: "INR",
                status: "Succeeded"
            });
            onClose();
        }, 1500);
    }, 2000);
  };

  const getEmiMonthly = () => {
      const p = enteredAmount;
      const n = parseInt(emiTenure);
      const r = 14 / 1200; // Annual 14%
      // Simple EMI calc or just mock
      const emi = Math.round(p / n + (p * r));
      return emi;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col md:flex-row h-[600px] border border-slate-200 dark:border-slate-800">
        
        {/* Sidebar */}
        <div className="w-full md:w-1/3 bg-slate-50 dark:bg-slate-800 p-6 border-r border-slate-100 dark:border-slate-700">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6">Payment Method</h3>
            <div className="space-y-3">
                <button
                    onClick={() => setMethod("Card")}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${method === "Card" ? "bg-white dark:bg-slate-700 shadow-md text-primary ring-1 ring-primary" : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700/50"}`}
                >
                    <CreditCard size={20} />
                    <div className="text-left">
                        <span className="block font-bold text-sm">Card</span>
                        <span className="text-[10px] opacity-70">Visa, Mastery, Amex</span>
                    </div>
                </button>
                <button
                    onClick={() => setMethod("UPI")}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${method === "UPI" ? "bg-white dark:bg-slate-700 shadow-md text-primary ring-1 ring-primary" : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700/50"}`}
                >
                    <Smartphone size={20} />
                    <div className="text-left">
                        <span className="block font-bold text-sm">UPI</span>
                        <span className="text-[10px] opacity-70">GooglePay, PhonePe</span>
                    </div>
                </button>
                <button
                    onClick={() => setMethod("EMI")}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${method === "EMI" ? "bg-white dark:bg-slate-700 shadow-md text-primary ring-1 ring-primary" : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700/50"}`}
                >
                    <Wallet size={20} />
                    <div className="text-left">
                        <span className="block font-bold text-sm">EMI</span>
                        <span className="text-[10px] opacity-70">Easy Installments</span>
                    </div>
                </button>
            </div>
            
            <div className="mt-auto pt-10">
                <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-100 dark:border-green-900/30">
                    <ShieldCheck size={16} />
                    100% Secure Payment
                </div>
            </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8 flex flex-col relative bg-white dark:bg-slate-900">
            <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X size={20} />
            </button>

            <div className="mb-8">
                <p className="text-slate-500 text-sm">Total Payable Amount</p>
                {amount > 0 ? (
                    <h2 className="text-4xl font-bold text-slate-900 dark:text-white">₹{amount.toLocaleString()}</h2>
                ) : (
                    <div className="flex items-center gap-2 border-b-2 border-slate-200 focus-within:border-primary transition-colors">
                        <span className="text-4xl font-bold text-slate-400">₹</span>
                        <input
                            type="number"
                            className="text-4xl font-bold text-slate-900 dark:text-white bg-transparent outline-none w-full py-2"
                            placeholder="Enter Amount"
                            autoFocus
                            value={enteredAmount || ""}
                            onChange={(e) => setEnteredAmount(parseInt(e.target.value) || 0)}
                        />
                    </div>
                )}
            </div>
            
            {step === "processing" ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                    <Loader2 size={48} className="text-primary animate-spin mb-4" />
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Processing Payment</h3>
                    <p className="text-slate-500 mt-2">Please do not close this window...</p>
                </div>
            ) : step === "success" ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center animate-fade-in-up">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-6">
                        <ShieldCheck size={40} />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Payment Successful!</h3>
                    <p className="text-slate-500 mt-2">Redirecting you back...</p>
                </div>
            ) : (
                <div className="flex-1 overflow-y-auto">
                    {method === "Card" && (
                        <div className="space-y-4 animate-fade-in">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">CARD NUMBER</label>
                                <div className="relative">
                                    <CreditCard className="absolute left-3 top-3 text-slate-400" size={18} />
                                    <input 
                                        type="text" 
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary"
                                        placeholder="0000 0000 0000 0000"
                                        value={cardDetails.number}
                                        onChange={e => setCardDetails({...cardDetails, number: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">EXPIRY</label>
                                    <input 
                                        type="text" 
                                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary"
                                        placeholder="MM/YY"
                                        value={cardDetails.expiry}
                                        onChange={e => setCardDetails({...cardDetails, expiry: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">CVV</label>
                                    <input 
                                        type="password" 
                                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary"
                                        placeholder="123"
                                        value={cardDetails.cvv}
                                        onChange={e => setCardDetails({...cardDetails, cvv: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">CARD HOLDER NAME</label>
                                <input 
                                    type="text" 
                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="John Doe"
                                    value={cardDetails.name}
                                    onChange={e => setCardDetails({...cardDetails, name: e.target.value})}
                                />
                            </div>
                        </div>
                    )}

                    {method === "UPI" && (
                        <div className="space-y-6 animate-fade-in text-center pt-2">
                            <div className="mx-auto w-48 h-48 bg-white p-2 rounded-xl border border-slate-200 shadow-sm flex items-center justify-center">
                                <img 
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`upi://pay?pa=purshotamkumarsingh37@okaxis&pn=Eventide&am=${enteredAmount || 0}&cu=INR&tn=Eventide Payment: ${enteredAmount || 0}`)}`}
                                    alt="UPI QR Code"
                                    className="w-full h-full object-contain"
                                />
                            </div>
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
                                <div className="relative flex justify-center text-xs uppercase"><span className="bg-white dark:bg-slate-900 px-2 text-slate-500">Or Pay via ID</span></div>
                            </div>
                             <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1 text-left">UPI ID / VPA</label>
                                <input 
                                    type="text" 
                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="username@upi"
                                    value={upiId}
                                    onChange={e => setUpiId(e.target.value)}
                                />
                            </div>
                        </div>
                    )}

                    {method === "EMI" && (
                        <div className="space-y-4 animate-fade-in">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">SELECT BANK</label>
                                <div className="relative">
                                    <Building2 className="absolute left-3 top-3 text-slate-400" size={18} />
                                    <select 
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary appearance-none"
                                        value={emiBank}
                                        onChange={e => setEmiBank(e.target.value)}
                                    >
                                        <option value="HDFC">HDFC Bank</option>
                                        <option value="SBI">SBI Card</option>
                                        <option value="ICICI">ICICI Bank</option>
                                        <option value="AXIS">Axis Bank</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">SELECT TENURE</label>
                                <select 
                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary"
                                    value={emiTenure}
                                    onChange={e => setEmiTenure(e.target.value)}
                                >
                                    <option value="3">3 Months @ 14% p.a</option>
                                    <option value="6">6 Months @ 15% p.a</option>
                                    <option value="9">9 Months @ 16% p.a</option>
                                    <option value="12">12 Months @ 16% p.a</option>
                                </select>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                                <div className="flex justify-between mb-2">
                                    <span className="text-sm text-slate-500">Monthly EMI</span>
                                    <span className="font-bold text-slate-900 dark:text-white">₹{getEmiMonthly().toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-xs text-slate-400">
                                    <span>Total Interest</span>
                                    <span>₹{(getEmiMonthly() * parseInt(emiTenure) - enteredAmount).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {step === "input" && (
                <button
                    onClick={handlePayment}
                    className="w-full mt-6 bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-3.5 rounded-xl font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
                    disabled={
                        (method === "Card" && (!cardDetails.number || !cardDetails.cvv)) ||
                        (method === "UPI" && !canConfirm)
                    }
                >
                    {method === "UPI" ? `I Have Paid ₹${enteredAmount.toLocaleString()}` : `Pay ₹${enteredAmount.toLocaleString()}`}
                </button>
            )}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
