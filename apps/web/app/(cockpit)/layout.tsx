import { Sidebar } from '@/components/Sidebar';
import { Topbar } from '@/components/Topbar';

export default function CockpitLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Topbar />
        <main className="flex-1 overflow-x-hidden px-6 py-6">{children}</main>
      </div>
    </div>
  );
}
