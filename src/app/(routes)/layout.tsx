import LogoutButton from "@/components/ui/logout-button"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import ThemeToggle from "@/components/ui/theme-toggle"

import { AppSidebar } from "./_components/app-sidebar"

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <SidebarProvider defaultOpen={false}>
            <AppSidebar />
            <main className="w-full">
                <div className="flex items-center justify-end px-4 py-2">
                    {/* Desktop: SidebarTrigger à esquerda, botões à direita */}
                    <div className="hidden">
                        <SidebarTrigger />
                    </div>

                    {/* Mobile: SidebarTrigger e botões juntos */}
                    <div className="flex items-center justify-end md:hidden gap-2">
                        <SidebarTrigger />

                        <ThemeToggle />
                        <LogoutButton />
                    </div>

                    {/* Desktop: botões à direita */}
                    <div className="hidden md:flex items-center justify-end gap-2">
                        <ThemeToggle />
                        <LogoutButton />
                    </div>
                </div>
                {children}
            </main>
        </SidebarProvider>
    )
}