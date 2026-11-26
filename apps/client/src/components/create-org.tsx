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
import { Textarea } from "@/components/ui/textarea"

export function CreateOrganizationDialog() {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const queryClient = useQueryClient()

  const createOrganization = useMutation({
    mutationFn: async (organization: { title: string; description: string }) => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"

      try {
        return await axios.post(`${apiUrl}/organization`, organization, {
          withCredentials: true,
        })
      } catch (error) {
        if (!axios.isAxiosError(error) || error.response?.status !== 401) {
          throw error
        }

        await axios.post(`${apiUrl}/auth/refresh`, null, {
          withCredentials: true,
        })

        return axios.post(`${apiUrl}/organization`, organization, {
          withCredentials: true,
        })
      }
    },
    onSuccess: () => {
      setOpen(false)
      setTitle("")
      setDescription("")
      return queryClient.invalidateQueries({ queryKey: ["orgs"] })
    },
  })

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (createOrganization.isPending) return

    createOrganization.mutate({
      title: title.trim(),
      description: description.trim(),
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button
        type="button"
        onClick={() => {
          createOrganization.reset()
          setOpen(true)
        }}
      >
        <Plus className="size-4" aria-hidden="true" />
        New organization
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New organization</DialogTitle>
          <DialogDescription>
            Give your team a name and a short description.
          </DialogDescription>
        </DialogHeader>

        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-2">
            <label htmlFor="organization-title" className="text-sm font-medium">
              Title
            </label>
            <Input
              id="organization-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Dev Team"
              required
            />
          </div>

          <div className="grid gap-2">
            <label htmlFor="organization-description" className="text-sm font-medium">
              Description
            </label>
            <Textarea
              id="organization-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="What will this team work on?"
              rows={3}
              required
            />
          </div>

          {createOrganization.isError && (
            <p role="alert" className="text-sm text-destructive">
              Couldn’t create the organization. Check your details and try again.
            </p>
          )}

          <DialogFooter>
            <Button
              type="submit"
              disabled={createOrganization.isPending || !title.trim() || !description.trim()}
            >
              {createOrganization.isPending ? "Creating…" : "Create organization"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
