interface MainContentProps {
  children: React.ReactNode;
}

export function MainContent({ children }: MainContentProps) {
  return (
    <main className="flex-1 overflow-hidden">
      <div className="h-full w-full">
        {children}
      </div>
    </main>
  );
}