import { Sidebar } from './sidebar';
import { Header } from './header';
import { MainContent } from './main';
import { NotificationsPopover } from "../ui/notifications";
import { MobileSidebar } from './mobile-sidebar';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="flex h-screen overflow-y-hidden">
      <div className="hidden md:block h-full">
        <Sidebar />
      </div>
      <div className="flex-1 flex flex-col min-h-0">
        <Header>
          <MobileSidebar />
        </Header>
        <MainContent>{children}</MainContent>
      </div>
    </div>
  );
}