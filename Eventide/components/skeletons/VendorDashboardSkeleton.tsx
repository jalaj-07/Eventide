import React from "react";
import Skeleton from "../ui/Skeleton";

const VendorDashboardSkeleton: React.FC = () => {
  return (
    <div className="pt-24 px-4 sm:px-6 lg:px-8 pb-12 max-w-7xl mx-auto space-y-8 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <Skeleton className="h-10 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-32 rounded-xl" />
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-slate-200 dark:border-slate-800 pb-1 overflow-x-auto">
          {[...Array(6)].map((_, i) => (
             <Skeleton key={i} className="h-8 w-24 rounded-lg" />
          ))}
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between items-start mb-4">
                      <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl">
                          <Skeleton className="w-6 h-6" />
                      </div>
                      <Skeleton className="w-12 h-6 rounded-full" />
                  </div>
                  <Skeleton className="h-8 w-20 mb-1" />
                  <Skeleton className="h-3 w-24" />
              </div>
          ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Chart Area */}
          <div className="xl:col-span-2 bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 h-96">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <Skeleton className="h-6 w-40 mb-2" />
                        <Skeleton className="h-3 w-64" />
                    </div>
                </div>
                <div className="flex items-end justify-between gap-2 h-64 px-4">
                    {[...Array(7)].map((_, i) => (
                        <Skeleton key={i} className={`w-full rounded-t-lg mx-1`} style={{ height: `${Math.random() * 80 + 20}%` }} />
                    ))}
                </div>
          </div>

          {/* List Area */}
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 h-96">
               <div className="flex justify-between items-center mb-6">
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-6 w-16 rounded-full" />
               </div>
               <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex gap-3 items-center">
                            <Skeleton className="w-10 h-10 rounded-full" />
                            <div className="flex-1">
                                <Skeleton className="h-4 w-32 mb-1" />
                                <Skeleton className="h-3 w-20" />
                            </div>
                        </div>
                    ))}
               </div>
          </div>
      </div>
    </div>
  );
};

export default VendorDashboardSkeleton;
