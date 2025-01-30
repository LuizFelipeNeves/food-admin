import { Sidebar } from './sidebar';
import { Header } from './header';
import { MainContent } from './main';
import { NotificationsPopover } from "../ui/notifications";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header/>
        <MainContent>{children}</MainContent>
      </div>
    </div>
  );
}