'use client';

import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/toaster';
import { DragDropContext } from '@hello-pangea/dnd';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark">
      <DragDropContext onDragEnd={() => {}}>
        {children}
        <Toaster />
      </DragDropContext>
    </ThemeProvider>
  );
}