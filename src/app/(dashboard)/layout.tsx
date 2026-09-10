import { Sidebar } from "@/components/layout/sidebar";
import { Footer } from "@/components/layout/footer";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider className="h-screen overflow-hidden">
      <Sidebar />
      <SidebarInset className="overflow-hidden bg-muted/30">
        <div className="flex-1 overflow-auto p-6">{children}</div>
        <Footer />
      </SidebarInset>
    </SidebarProvider>
  );
}
