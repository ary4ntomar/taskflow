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
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

export function AddMembers({ organizationId }: { organizationId: number }) {
  const [open, setOpen] = useState(false)
  const [memberUsername, setMemberUsername] = useState("")
  const queryClient = useQueryClient()

  const addMember = useMutation({
    mutationFn: async (username: string) => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"
      const endpoint = `${apiUrl}/add-member-to-organization`
      const body = { organizationId, memberUsername: username }
      const config = { withCredentials: true }

      try {
        await axios.post(endpoint, body, config)
      } catch (error) {
        if (!axios.isAxiosError(error) || error.response?.status !== 401) {
          throw error
        }

        await axios.post(`${apiUrl}/auth/refresh`, null, config)
        await axios.post(endpoint, body, config)
      }
    },
    onSuccess: () => {
      setOpen(false)
      setMemberUsername("")

      return queryClient.invalidateQueries({
        queryKey: ["organization", String(organizationId)],
      })
    },
  })

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const username = memberUsername.trim()
    if (!username || addMember.isPending) return

    addMember.mutate(username)
  }

  function handleOpenChange(nextOpen: boolean) {
    if (addMember.isPending) return
    if (nextOpen) addMember.reset()
    setOpen(nextOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button type="button" />}>
        <Plus className="size-4" aria-hidden="true" />
        Add member
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add organization member</DialogTitle>
          <DialogDescription>
            Enter the username of the person you want to add.
          </DialogDescription>
        </DialogHeader>

        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-2">
            <label htmlFor="member-username" className="text-sm font-medium">
              Member username
            </label>
            <Input
              id="member-username"
              value={memberUsername}
              onChange={(event) => setMemberUsername(event.target.value)}
              placeholder="Username"
              disabled={addMember.isPending}
              required
            />
          </div>

          {addMember.isError && (
            <p role="alert" className="text-sm text-destructive">
              Couldn’t add the member. Check the username and try again.
            </p>
          )}

          <DialogFooter>
            <Button
              type="submit"
              disabled={addMember.isPending || !memberUsername.trim()}
            >
              {addMember.isPending ? "Adding…" : "Add member"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}