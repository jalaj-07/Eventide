import React, { useState, useEffect } from "react";
import { User } from "../types";
import { 
  Wallet as WalletIcon, 
  ArrowUpRight, 
  ArrowDownLeft, 
  History, 
  Plus, 
  Landmark
} from "lucide-react";
import { useToast } from "./ToastContext";
import PaymentModal from "./PaymentModal";

interface Transaction {
  id: string;
  type: "credit" | "debit";
  amount: number;
  description: string;
  date: string;
  status: "completed" | "pending" | "failed";
}

interface WalletProps {
  user: User;
}

const Wallet: React.FC<WalletProps> = ({ user }) => {
  const { addToast } = useToast();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showAddFunds, setShowAddFunds] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);


  // Load Wallet Data
  useEffect(() => {
    // Mock Data Load - In real app, fetch from Backend
    const storedWallet = localStorage.getItem(`wallet_${user.id}`);
    if (storedWallet) {
        const data = JSON.parse(storedWallet);
        setBalance(data.balance || 0);
        setTransactions(data.transactions || []);
    } else {
        // Initial Mock State
        setBalance(0);
        setTransactions([]);
    }
  }, [user.id]);

  const saveWallet = (newBalance: number, newTx: Transaction[]) => {
      localStorage.setItem(`wallet_${user.id}`, JSON.stringify({
          balance: newBalance,
          transactions: newTx
      }));
      setBalance(newBalance);
      setTransactions(newTx);
  };

  const handleAddFunds = (amount: number) => {

      setTimeout(() => {
          const newTx: Transaction = {
              id: `tx-${Date.now()}`,
              type: "credit",
              amount: amount,
              description: "Added funds via Bank Transfer",
              date: new Date().toISOString(),
              status: "completed"
          };
          saveWallet(balance + amount, [newTx, ...transactions]);

          setShowAddFunds(false);
          addToast(`Successfully added ₹${amount} to vault`, "success");
      }, 1500);
  };

  const handleWithdraw = () => {
      setShowWithdraw(true);
  };

  const performWithdraw = (amount: number) => {
      if (!amount || isNaN(amount) || amount <= 0) {
          addToast("Invalid amount", "error");
          return;
      }
      if (amount > balance) {
          addToast("Insufficient funds", "error");
          return;
      }

      const newTx: Transaction = {
          id: `tx-${Date.now()}`,
          type: "debit",
          amount: amount,
          description: "Withdrawal to Bank Account",
          date: new Date().toISOString(),
          status: "completed"
      };
      saveWallet(balance - amount, [newTx, ...transactions]);
      setShowWithdraw(false);
      addToast(`Withdrawal of ₹${amount} initiated`, "success");
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <WalletIcon className="text-primary" /> My Vault
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Manage your funds and transactions securely.
          </p>
        </div>
      </div>

      {/* Balance Card */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-900 dark:from-slate-800 dark:to-indigo-950 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
          
          <div className="relative z-10">
              <p className="text-indigo-200 text-sm font-medium mb-1">Total Balance</p>
              <h1 className="text-5xl font-bold mb-6">₹{balance.toLocaleString()}</h1>

              <div className="flex gap-4">
                  <button 
                    onClick={() => setShowAddFunds(true)}
                    className="flex items-center gap-2 bg-white text-slate-900 px-6 py-2.5 rounded-xl font-bold hover:bg-indigo-50 transition shadow-lg shadow-white/10"
                  >
                      <Plus size={18} /> Add Money
                  </button>
                  <button 
                    onClick={handleWithdraw}
                    className="flex items-center gap-2 bg-white/10 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-white/20 transition border border-white/20 backdrop-blur-sm"
                  >
                      <Landmark size={18} /> Withdraw
                  </button>
              </div>
          </div>
      </div>

      {/* Transactions */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                  <History size={20} /> Recent Transactions
              </h3>
              <button className="text-primary text-sm font-bold hover:underline">View All</button>
          </div>
          
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {transactions.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 italic">
                      No transactions yet. Add funds to get started.
                  </div>
              ) : (
                  transactions.map(tx => (
                      <div key={tx.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition flex justify-between items-center">
                          <div className="flex items-center gap-4">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                  tx.type === 'credit' 
                                  ? 'bg-green-100 text-green-600 dark:bg-green-900/30' 
                                  : 'bg-red-100 text-red-600 dark:bg-red-900/30'
                              }`}>
                                  {tx.type === 'credit' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                              </div>
                              <div>
                                  <p className="font-bold text-slate-900 dark:text-white text-sm">{tx.description}</p>
                                  <p className="text-xs text-slate-500">{new Date(tx.date).toLocaleDateString()} • {new Date(tx.date).toLocaleTimeString()}</p>
                              </div>
                          </div>
                          <span className={`font-bold ${
                              tx.type === 'credit' ? 'text-green-600' : 'text-slate-900 dark:text-white'
                          }`}>
                              {tx.type === 'credit' ? '+' : '-'} ₹{tx.amount.toLocaleString()}
                          </span>
                      </div>
                  ))
              )}
          </div>
      </div>

      {/* Hidden Payment Modal for Adding Funds */}
      {showAddFunds && (
          <PaymentModal 
              isOpen={showAddFunds}
              onClose={() => setShowAddFunds(false)}
              amount={0} 
              bookingId="vault-deposit" // Added bookingId for context
              onSuccess={(payment) => handleAddFunds(payment.amount)} 
          />
      )}

      {/* Withdraw Modal */}
      {showWithdraw && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
           <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md p-6 border border-slate-200 dark:border-slate-800">
               <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Withdraw Funds</h3>
               <p className="text-sm text-slate-500 mb-6">Enter the amount you wish to transfer to your linked bank account.</p>
               
               <div className="mb-6">
                   <label className="block text-xs font-bold text-slate-500 mb-1">AMOUNT</label>
                   <div className="relative">
                       <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                       <input 
                           type="number" 
                           autoFocus
                           className="w-full pl-8 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary font-bold text-lg"
                           placeholder="0"
                           id="withdraw-input"
                       />
                   </div>
                   <p className="text-xs text-slate-400 mt-2 text-right">Available: ₹{balance.toLocaleString()}</p>
               </div>

               <div className="flex gap-3">
                   <button 
                       onClick={() => setShowWithdraw(false)}
                       className="flex-1 py-3 font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
                   >
                       Cancel
                   </button>
                   <button 
                       onClick={() => {
                           const input = document.getElementById('withdraw-input') as HTMLInputElement;
                           const amount = parseFloat(input.value);
                           performWithdraw(amount);
                       }}
                       className="flex-1 py-3 font-bold text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-xl hover:opacity-90 transition"
                   >
                       Confirm Withdraw
                   </button>
               </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Wallet;
