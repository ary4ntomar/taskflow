"use client"

import { OrganizationGrid } from "@/components/organizartion-carousel."
import { Building2 } from "lucide-react"
import { SpinnerEmpty } from "@/components/spinner"

// Use this after the query succeeds.
import axios from "axios"
import { useQuery } from "@tanstack/react-query"
import { CreateOrganizationDialog } from "@/components/create-org"

// Inside your page header
  export default function Organization() {
  const myOrgs = useQuery({
    queryKey: ["orgs"],
    queryFn: async () => {
      try {
        const res = await axios.get("http://localhost:3001/my-organizations", {
          withCredentials: true,
        })

        return res.data.myOrgs
      } catch (error) {
        if (!axios.isAxiosError(error) || error.response?.status !== 401) {
          throw error
        }

        await axios.post("http://localhost:3001/auth/refresh", null, {
          withCredentials: true,
        })

        const res = await axios.get("http://localhost:3001/my-organizations", {
          withCredentials: true,
        })
        return res.data.myOrgs
      }
    },
  })

 return (
  <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-8 sm:py-10">
    <header className="flex flex-wrap items-center justify-between gap-5 rounded-2xl border border-emerald-800/60 bg-linear-to-br from-emerald-950 via-[#11251f] to-[#151a19] p-5 text-white sm:p-7">
      <div className="flex items-center gap-4">
        <div className="grid size-11 shrink-0 place-items-center rounded-xl border border-emerald-400/20 bg-emerald-400/10 text-emerald-300">
          <Building2 className="size-5" aria-hidden="true" />
        </div>

        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Organizations
        </h1>
      </div>

      <CreateOrganizationDialog />
    </header>

    <section aria-label="Your organizations" className="mt-6 sm:mt-8">
      {myOrgs.isPending && (
        <div
          role="status"
          className="rounded-xl border border-border bg-card px-5 py-8 text-sm text-muted-foreground"
        >
         {SpinnerEmpty("Loading Organization........."," Please wait while we process your request. Do not refresh the page.")}
        </div>
      )}

      {myOrgs.isError && (
        <p
          role="alert"
          className="rounded-xl border border-destructive/20 bg-card px-5 py-8 text-sm text-destructive"
        >
          {SpinnerEmpty("Couldn't load organization","Try again after few seconds.")}
        </p>
      )}

      {myOrgs.isSuccess && <OrganizationGrid items={myOrgs.data} />}
    </section>
  </main>
)
}
