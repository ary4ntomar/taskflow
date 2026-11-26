import type { ReactNode } from "react"
import { LogoutPattern } from "@/components/examples/c-alert-dialog-13"


export default function WorkspaceLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-mist-900">
      {/* Top bar wrapper to push the button to the right */}
      <div className="flex justify-end p-4">
        <LogoutPattern/>
      </div>

      <div>{children}</div>
    </div>
  )
}
