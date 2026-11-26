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

export function CreateBoardDialog({
  organizationId,
}: {
  organizationId: number
}) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const queryClient = useQueryClient()

  const createBoard = useMutation({
    mutationFn: async (boardTitle: string) => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"
      const body = { title: boardTitle, organizationId }
      const config = { withCredentials: true }

      try {
        await axios.post(`${apiUrl}/boards`, body, config)
      } catch (error) {
        if (!axios.isAxiosError(error) || error.response?.status !== 401) {
          throw error
        }

        await axios.post(`${apiUrl}/auth/refresh`, null, config)
        await axios.post(`${apiUrl}/boards`, body, config)
      }
    },
    onSuccess: () => {
      setOpen(false)
      setTitle("")

      return queryClient.invalidateQueries({
        queryKey: ["boards", organizationId],
      })
    },
  })

  const boardTitle = title.trim()
  const canSubmit =
    boardTitle.length >= 3 && boardTitle.length <= 20 && !createBoard.isPending

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (canSubmit) createBoard.mutate(boardTitle)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!createBoard.isPending) setOpen(nextOpen)
      }}
    >
      <Button
        type="button"
        onClick={() => {
          createBoard.reset()
          setOpen(true)
        }}
      >
        <Plus className="size-4" aria-hidden="true" />
        New board
      </Button>

      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="tracking-tight">New board</DialogTitle>
          <DialogDescription>
            Create a board to track work in this organization.
          </DialogDescription>
        </DialogHeader>

        <form className="grid gap-5" onSubmit={handleSubmit}>
          <div className="grid gap-2">
            <label htmlFor="board-title" className="text-sm font-medium">
              Board name
            </label>
            <Input
              id="board-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="e.g. Product backlog"
              maxLength={20}
              disabled={createBoard.isPending}
              required
            />
            <p className="text-xs text-muted-foreground">3–20 characters</p>
          </div>

          {createBoard.isError && (
            <p role="alert" className="text-sm text-destructive">
              Couldn’t create the board. Please try again.
            </p>
          )}

          <DialogFooter>
            <Button type="submit" disabled={!canSubmit}>
              {createBoard.isPending ? "Creating…" : "Create board"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}