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
        <div className="flex min-h-screen w-full">
          <AppSidebar />
          <div className="flex-1 flex flex-col">
            <header className="sticky top-0 h-16 border-b bg-white px-6 flex items-center justify-between z-10">
              <h1 className="text-xl font-semibold">CRM Dashboard</h1>
              <UserProfile />
            </header>
            <main className="flex-1 p-6 bg-white">
              {children}
            </main>
          </div>
        </div>
      </SidebarProvider>
    </AuthProvider>
  )
}
