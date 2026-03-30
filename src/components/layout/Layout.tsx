import { Sidebar } from "./Sidebar";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="lg:ml-60 md:ml-14 pb-16 md:pb-0">
        {children}
      </main>
    </div>
  );
}
