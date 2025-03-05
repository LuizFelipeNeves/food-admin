"use client";

import { ReactNode } from "react";

interface PosLayoutProps {
  children: ReactNode;
  orderSummary: ReactNode;
}

export function PosLayout({ children, orderSummary }: PosLayoutProps) {
  return (
    <div className="h-full flex flex-col md:flex-row overflow-hidden rounded-lg border bg-card shadow">
      <div className="flex-1 overflow-hidden flex flex-col">
        {children}
      </div>
      <div className="w-full md:w-[350px] lg:w-[400px] border-t md:border-t-0 md:border-l h-[40vh] md:h-full overflow-hidden">
        {orderSummary}
      </div>
    </div>
  );
} 