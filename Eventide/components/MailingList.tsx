import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Mail, Check, AlertCircle, Loader2 } from 'lucide-react';

const MailingList: React.FC = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      setMessage('Please enter a valid email address.');
      setStatus('error');
      return;
    }

    setStatus('loading');
    setMessage('');

    try {
      await addDoc(collection(db, 'mailing_list'), {
        email: email,
        createdAt: serverTimestamp(),
      });
      setStatus('success');
      setMessage('You successfully joined our mailing list!');
      setEmail('');
    } catch (error) {
      console.error('Error adding document: ', error);
      setStatus('error');
      setMessage('Something went wrong. Please try again later.');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 backdrop-blur-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl text-primary">
          <Mail size={24} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Join our Newsletter</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">Get weekly event updates and exclusive offers.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="relative">
        <div className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="flex-1 px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-900 dark:text-white transition-all disabled:opacity-50"
            disabled={status === 'loading' || status === 'success'}
          />
          <button
            type="submit"
            disabled={status === 'loading' || status === 'success'}
            className="px-4 py-2 font-bold text-white bg-primary hover:bg-indigo-700 active:scale-95 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[100px]"
          >
            {status === 'loading' ? (
              <Loader2 size={20} className="animate-spin" />
            ) : status === 'success' ? (
              <Check size={20} />
            ) : (
              'Join'
            )}
          </button>
        </div>

        {status === 'error' && (
          <div className="absolute -bottom-8 left-0 flex items-center gap-2 text-sm text-red-500 animate-fade-in">
            <AlertCircle size={14} />
            <span>{message}</span>
          </div>
        )}
        
        {status === 'success' && (
          <div className="absolute -bottom-8 left-0 flex items-center gap-2 text-sm text-green-500 animate-fade-in">
            <Check size={14} />
            <span>{message}</span>
          </div>
        )}
      </form>
    </div>
  );
};

export default MailingList;
