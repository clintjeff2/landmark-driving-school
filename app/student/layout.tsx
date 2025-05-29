"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Car, Calendar, CreditCard, BookOpen, Award, Bell, AlertTriangle, FileText, LogOut } from "lucide-react"
import { useAuth } from "@/components/auth-provider"

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { signOut } = useAuth()

  const navigation = [
    { name: "Dashboard", href: "/student/dashboard", icon: <Car className="h-5 w-5" /> },
    { name: "Schedule", href: "/student/schedule", icon: <Calendar className="h-5 w-5" /> },
    { name: "Payments", href: "/student/payments", icon: <CreditCard className="h-5 w-5" /> },
    { name: "Learning", href: "/student/learning", icon: <BookOpen className="h-5 w-5" /> },
    { name: "Rewards", href: "/student/rewards", icon: <Award className="h-5 w-5" /> },
    { name: "Alerts", href: "/student/alerts", icon: <AlertTriangle className="h-5 w-5" /> },
    { name: "Admission", href: "/student/admission", icon: <FileText className="h-5 w-5" /> },
  ]

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2 font-bold">
            <Link href="/student/dashboard">
              <div className="flex items-center gap-2">
                <Car className="h-6 w-6" />
                <span>Landmark Driving School</span>
              </div>
            </Link>
          </div>
          <nav className="hidden md:flex gap-6">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`text-sm font-medium ${pathname === item.href ? "text-primary" : "text-muted-foreground"}`}
              >
                {item.name}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/student/notifications">
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>
            </Link>
            <Button variant="outline" onClick={() => signOut()}>
              Logout
            </Button>
          </div>
        </div>
      </header>
      <div className="flex flex-1">
        <aside className="hidden w-64 flex-col border-r bg-muted/40 md:flex">
          <div className="flex flex-col gap-2 p-4">
            {navigation.map((item) => (
              <Link key={item.name} href={item.href}>
                <Button variant={pathname === item.href ? "default" : "ghost"} className="w-full justify-start">
                  {item.icon}
                  <span className="ml-2">{item.name}</span>
                </Button>
              </Link>
            ))}
            <Button variant="ghost" className="w-full justify-start text-red-500" onClick={() => signOut()}>
              <LogOut className="h-5 w-5" />
              <span className="ml-2">Logout</span>
            </Button>
          </div>
        </aside>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
