"use client"
import { useSearchParams } from "next/navigation"
import { CreateIssueDialog } from "@/components/create-issue"
import { Pattern } from "@/components/examples/c-kanban-1"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default  function Issues() {
     
     const searchParams = useSearchParams()
     const boardId = Number(searchParams.get("boardId"))
     const hasBoard = Number.isInteger(boardId) && boardId > 0  

    return (
  <div className="mx-auto w-full min-w-0 max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
     <Link
      href={boardId ? `/board/?organizationId=${boardId}` : "/board"}
      className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
    >
      <ArrowLeft className="size-4" aria-hidden="true" />
      {boardId ? "Back to board" : "Back to board"}
    </Link>
    <header className="mb-5 flex flex-wrap items-center justify-between gap-3 sm:mb-8">
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
        Issues
      </h1>
      <CreateIssueDialog boardId={boardId} />
    </header>

    <main className="min-w-0">
      <Pattern />
    </main>
  </div>
)}
