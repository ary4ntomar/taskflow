import Link from "next/link"
import { ArrowUpRight, Building2 } from "lucide-react"

type Organization = {
  id: number
  title: string
  description: string
}

export function OrganizationGrid({ items }: { items: Organization[] }) {
  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card px-6 py-12 text-center">
        <Building2
          aria-hidden="true"
          className="mx-auto mb-4 size-8 text-primary"
        />
        <h2 className="font-semibold">No organizations yet</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Create an organization to start managing your team’s work.
        </p>
      </div>
    )
  }

  return (
    <>
      <p className="mb-4 text-sm text-muted-foreground">
        {items.length} {items.length === 1 ? "organization" : "organizations"}
      </p>

      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((org) => (
          <li key={org.id} className="min-w-0">
            <Link
              href={`/organization/${org.id}`}
              aria-label={`Open organization: ${org.title}`}
              className="group flex h-full flex-col rounded-xl border border-border bg-card text-card-foreground shadow-sm transition-colors hover:border-primary/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <div className="flex-1 p-5">
                <div className="mb-4 grid size-11 place-items-center rounded-lg bg-primary/10 text-primary">
                  <Building2 aria-hidden="true" className="size-5" />
                </div>

                <h2 className="text-lg font-semibold tracking-tight wrap-break-word">
                  {org.title}
                </h2>
                <p className="mt-2 line-clamp-2 text-sm leading-relaxed wrap-break-word text-muted-foreground">
                  {org.description}
                </p>
              </div>

              <div className="flex items-center justify-between gap-2 rounded-b-xl border-t border-border px-5 py-3 text-sm font-medium transition-colors group-hover:bg-primary/5">
                <span>Open organization</span>
                <ArrowUpRight
                  aria-hidden="true"
                  className="size-4 text-primary"
                />
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </>
  )
}
