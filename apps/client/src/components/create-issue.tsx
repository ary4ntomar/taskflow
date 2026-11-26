"use client"

import { useState, type FormEvent } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

export function CreateIssueDialog({ boardId }: { boardId: number }) {
  type Priority = "low" | "medium" | "high"
  const [priority, setPriority] = useState<Priority>("medium")
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [assignedTo, setAssignedTo] = useState("")
  const queryClient = useQueryClient()

  const createIssue = useMutation({
    mutationFn: async (fields: {
      title: string
      assignedTo: string
      priority: Priority
    }) => {
      const apiURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
      const body = { ...fields, boardId }
      const config = { withCredentials: true }

      try {
        await axios.post(`${apiURL}/issue`, body, config)
      } catch (error) {
        if (!axios.isAxiosError(error) || error.response?.status !== 401) {
          throw error
        }

        await axios.post(`${apiURL}/auth/refresh`, null, config)
        await axios.post(`${apiURL}/issue`, body, config)
      }
    },
    onSuccess: () => {
      setTitle("")
      setAssignedTo("")
      setOpen(false)

      return queryClient.invalidateQueries({
        queryKey: ["issues", boardId],
      })
    },
  })

  const canSubmit =
    Number.isInteger(boardId) &&
    boardId > 0 &&
    title.trim().length > 0 &&
    assignedTo.trim().length > 0 &&
    !createIssue.isPending

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!canSubmit) return

    createIssue.mutate({
      title: title.trim(),
      assignedTo: assignedTo.trim(),
      priority,
    })
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!createIssue.isPending) setOpen(nextOpen)
      }}
    >
      <Button
        type="button"
        onClick={() => {
          createIssue.reset()
          setOpen(true)
        }}
      >
        <Plus className="size-4" aria-hidden="true" />
        New issue
      </Button>

      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="tracking-tight">New issue</DialogTitle>
          <DialogDescription>
            Add work to this board and assign it to an organization member.
          </DialogDescription>
        </DialogHeader>

        <form className="grid gap-5" onSubmit={handleSubmit}>
          <label className="grid gap-2 text-sm font-medium">
            Issue title
            <Input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="e.g. Fix the settings layout"
              disabled={createIssue.isPending}
              required
            />
          </label>

          <label className="grid gap-2 text-sm font-medium">
            Assignee username
            <Input
              value={assignedTo}
              onChange={(event) => setAssignedTo(event.target.value)}
              placeholder="Enter a member’s username"
              disabled={createIssue.isPending}
              required
            />
          </label>
          <label className="grid gap-2 text-sm font-medium">
            Priority
            <select
              value={priority}
              onChange={(event) => setPriority(event.target.value as Priority)}
              disabled={createIssue.isPending}
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </label>

          {createIssue.isError && (
            <p role="alert" className="text-sm text-destructive">
              {axios.isAxiosError<{ message?: string }>(createIssue.error)
                ? (createIssue.error.response?.data?.message ??
                  "Couldn’t create the issue. Please try again.")
                : "Couldn’t create the issue. Please try again."}
            </p>
          )}

          <DialogFooter>
            <Button type="submit" disabled={!canSubmit}>
              {createIssue.isPending ? "Creating…" : "Create issue"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
