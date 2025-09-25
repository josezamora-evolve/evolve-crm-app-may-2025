import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"
import { AuthProvider } from "@/components/AuthProvider"
import { UserProfile } from "@/components/UserProfile"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <SidebarProvider>
        <div className="flex h-screen w-full overflow-hidden">
          <AppSidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            <header className="flex-none h-16 border-b bg-white px-6 flex items-center justify-between z-10">
              <h1 className="text-xl font-semibold">CRM Dashboard</h1>
              <UserProfile />
            </header>
            <div className="flex-1 flex min-h-0">
              <main className="flex-1 p-6 bg-white overflow-auto">
                {children}
              </main>
            </div>
          </div>
        </div>
      </SidebarProvider>
    </AuthProvider>
  )
}
