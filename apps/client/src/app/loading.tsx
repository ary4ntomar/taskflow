import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <main aria-busy="true" className="mx-auto max-w-6xl space-y-5 px-4 py-10">
      <span role="status" className="sr-only">
        Loading page…
      </span>
      <Skeleton className="h-16 w-full rounded-xl" />
      <Skeleton className="h-40 w-full rounded-xl" />
    </main>
  )
}
