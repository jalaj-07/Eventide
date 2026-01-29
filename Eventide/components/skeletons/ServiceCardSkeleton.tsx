import React from "react";
import Skeleton from "../ui/Skeleton";

const ServiceCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm">
        {/* Image Area */}
        <div className="relative h-48 w-full">
            <Skeleton className="h-full w-full rounded-none" />
            <div className="absolute top-3 right-3">
                <Skeleton className="h-6 w-16 rounded-full" />
            </div>
        </div>

        <div className="p-5 flex flex-col gap-3">
            {/* Title */}
            <Skeleton className="h-6 w-3/4" />
            
            {/* Vendor info */}
            <div className="flex items-center gap-2 mb-1">
                <Skeleton className="w-5 h-5 rounded-full" />
                <Skeleton className="h-3 w-1/3" />
            </div>

            {/* Features */}
            <div className="flex gap-2">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-20" />
            </div>
            
            {/* Description */}
            <div className="space-y-2 my-2">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-5/6" />
            </div>

            {/* Button */}
            <Skeleton className="h-10 w-full rounded-xl mt-2" />
        </div>
    </div>
  );
};

export default ServiceCardSkeleton;
