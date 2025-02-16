interface MainContentProps {
  children: React.ReactNode;
}

export function MainContent({ children }: MainContentProps) {
  return (
    <main className="flex-1 overflow-y-auto scrollbar-hide">
      <div className="h-full">
        {children}
      </div>
    </main>
  );
}