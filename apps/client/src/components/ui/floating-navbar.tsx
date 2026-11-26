"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type FloatingNavProps = {
  navItems: { name: string; link: string; icon?: ReactNode }[]
  onLogout?: () => void
}

export function FloatingNav({ navItems, onLogout }: FloatingNavProps) {
  const pathname = usePathname()

  return (
    <nav
      aria-label="Workspace"
      className="fixed inset-x-0 top-4 z-50 mx-auto flex w-fit items-center gap-1 rounded-full border border-border bg-mist-900 p-1.5 shadow-lg"
    >
      {navItems.map(({ name, link, icon }) => {
        const isActive = pathname === link

        return (
          <Link
            key={link}
            href={link}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-2 text-xs font-medium text-muted-foreground hover:bg-primary/10 hover:text-primary sm:gap-2 sm:px-4 sm:text-sm",
              isActive && "bg-primary/10 text-primary"
            )}
          >
            <span aria-hidden="true">{icon}</span>
            {name}
          </Link>
        )
      })}

      <Button
        type="button"
        size="sm"
        className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
        onClick={onLogout}
      >
        <LogOut className="size-4" aria-hidden="true" />
        Log out
      </Button>
    </nav>
  )
}