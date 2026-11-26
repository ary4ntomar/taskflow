"use client"

import { useState } from "react"
import { LogOut } from "lucide-react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { ShieldQuestionMarkIcon } from "lucide-react"
import axios from "axios"

export function LogoutPattern() {
  // The base AlertDialogAction does not close the dialog on its own.
  const [open, setOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [error, setError] = useState("")

  async function handleLogout() {
    if (isLoggingOut) return

    setIsLoggingOut(true)
    setError("")

    try {
      const apiURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
      await axios.post(`${apiURL}/auth/logout`, null, {
        withCredentials: true,
      })

      window.location.replace("/")
    } catch {
      setError("Couldn’t log out. Please try again.")
      setIsLoggingOut(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger
        render={
          <Button
            variant="outline"
            className="hover:border-primary/30 hover:bg-primary/5"
          >
            <LogOut className="size-4" aria-hidden="true" />
            Log out
          </Button>
        }
      />

      <AlertDialogContent
        size="sm"
        className="gap-0 overflow-hidden rounded-xl border-border bg-card p-0 text-card-foreground sm:max-w-sm"
      >
        <div className="space-y-3 p-6">
          <AlertDialogMedia className="size-11 rounded-lg border border-primary/20 bg-primary/10 text-primary">
            <LogOut className="size-5" aria-hidden="true" />
          </AlertDialogMedia>

          <AlertDialogTitle className="text-lg font-semibold tracking-tight">
            Log out of TaskFlow?
          </AlertDialogTitle>

          <AlertDialogDescription className="text-sm text-muted-foreground">
            You’ll need to sign in again to access your workspace.
          </AlertDialogDescription>

          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
        </div>

        <AlertDialogFooter className="flex flex-row justify-end gap-2 border-t border-border bg-muted/30 px-6 py-4">
          <AlertDialogCancel variant="ghost" disabled={isLoggingOut}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction onClick={handleLogout} disabled={isLoggingOut}>
            {isLoggingOut ? "Logging out…" : "Log out"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
