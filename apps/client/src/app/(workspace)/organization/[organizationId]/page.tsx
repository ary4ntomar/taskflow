"use client"

import axios from "axios"
import Link from "next/link"
import { Building2, ArrowUpRight, Users } from "lucide-react"
import { useParams } from "next/navigation"
import { useMutation, useQuery } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { AddMembers } from "@/components/add-member"
import { SpinnerEmpty } from "@/components/spinner"

export default function MyOrganization() {
  const { organizationId } = useParams()

  const myOrg = useQuery({
    queryKey: ["Myorg", organizationId],
    queryFn: async () => {
      try {
        const res = await axios.get("http://localhost:3001/organization", {
          params: { organizationId },
          withCredentials: true,
        })

        return res.data.organization
      } catch (error) {
        if (!axios.isAxiosError(error) || error.response?.status !== 401) {
          throw error
        }

        await axios.post("http://localhost:3001/auth/refresh", null, {
          withCredentials: true,
        })

        const res = await axios.get("http://localhost:3001/organization", {
          params: { organizationId },
          withCredentials: true,
        })
        return res.data.organization
      }
    },
  })

  const deleteMember = useMutation({
    mutationFn: (memberUsername: string) =>
      axios.delete("http://localhost:3001/members", {
        withCredentials: true,
        data: { organizationId: Number(organizationId), memberUsername },
      }),
    onSuccess: () => myOrg.refetch(),
  })

  if (myOrg.isPending) return <div> {SpinnerEmpty("Loading Organization........."," Please wait while we process your request. Do not refresh the page.")}</div>
  if (myOrg.isError) return <div> {SpinnerEmpty("Couldn't load organization","Try again after few seconds.")}</div>

  const org = myOrg.data
  const members: { id: number; username: string }[] = org.user ?? []

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-8 sm:py-10">
      <Link
        href="/organization"
        className="text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        ← Organizations
      </Link>

      <header className="mt-5 rounded-2xl border border-emerald-800/60 bg-linear-to-br from-emerald-950 via-[#11251f] to-[#151a19] p-6 text-white sm:p-9">
        <div className="grid size-12 place-items-center rounded-xl border border-emerald-400/20 bg-emerald-400/10 text-emerald-300">
          <Building2 className="size-6" aria-hidden="true" />
        </div>

        <div className="mt-5 flex flex-wrap items-end justify-between gap-6">
          <div className="min-w-0">
            <h1 className="wrap-break-word text-3xl font-semibold tracking-tight sm:text-4xl">
              {org.title}
            </h1>
            <p className="mt-3 max-w-xl wrap-break-word text-sm leading-6 text-white/70">
              {org.description}
            </p>
            <p className="mt-5 text-sm text-white/65">
              Admin <span className="ml-1 font-medium text-white">{org.admin.username}</span>
            </p>
          </div>

          <Link
            href={`/board?organizationId=${org.id}`}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-300 px-4 py-2.5 text-sm font-semibold text-emerald-950 hover:bg-emerald-200"
          >
            Open Boards
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </header>

      <section aria-labelledby="members-heading" className="mt-8">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 id="members-heading" className="flex items-center gap-2 text-xl font-semibold tracking-tight">
            Members
            <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium tabular-nums text-muted-foreground">
              {members.length}
            </span>
          </h2>
          <AddMembers organizationId={org.id} />
        </div>

        <div className="rounded-xl border border-border bg-card">
          {members.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <Users className="mx-auto mb-3 size-6 text-muted-foreground" aria-hidden="true" />
              <p className="text-sm font-medium">No members yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Add someone by their TaskFlow username.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {members.map((member) => (
                <li key={member.id} className="flex items-center gap-3 px-4 py-3 sm:px-5">
                  <span aria-hidden="true" className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                    {member.username.slice(0, 1).toUpperCase()}
                  </span>
                  <span className="min-w-0 flex-1 wrap-break-word text-sm font-medium">
                    {member.username}
                  </span>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="shrink-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    aria-label={`Remove ${member.username}`}
                    disabled={deleteMember.isPending}
                    onClick={() => deleteMember.mutate(member.username)}
                  >
                    Remove
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {deleteMember.isError && (
          <p role="alert" className="mt-3 text-sm text-destructive">
            Couldn’t remove the member. Please try again.
          </p>
        )}
      </section>
    </main>
  )
}