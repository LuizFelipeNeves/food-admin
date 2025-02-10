'use client';

import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/toaster';
import { DragDropContext } from '@hello-pangea/dnd';
import { TRPCProvider } from './_trpc/Provider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark">
      <TRPCProvider>
        <DragDropContext onDragEnd={() => {}}>
          {children}
          <Toaster />
        </DragDropContext>
      </TRPCProvider>
    </ThemeProvider>
  );
}