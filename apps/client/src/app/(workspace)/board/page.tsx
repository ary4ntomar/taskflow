"use client"

import axios from "axios";
import Link from "next/link"
import { SpinnerEmpty } from "@/components/spinner";
import { ArrowLeft, ArrowUpRight, LayoutGrid } from "lucide-react"
import {  useQuery } from "@tanstack/react-query";
import { CreateBoardDialog } from "@/components/create-board";
import { useSearchParams } from "next/navigation"
export default  function Board() {



// Inside the component
const searchParams = useSearchParams()
const organizationId = Number(searchParams.get("organizationId"))
     
 const GetBoard = useQuery({
    queryKey: ["boards", organizationId],
    enabled: Number.isInteger(organizationId) && organizationId > 0,
     queryFn: async ()=>{
          const apiURL = "http://localhost:3001"

          try{
               const res = await axios.get(`${apiURL}/boards`,{
                 params:{organizationId},
                 withCredentials:true,  
               })
              
               return res.data.boards


          } catch(error){
               if(!axios.isAxiosError(error) || error.response?.status !== 401){
                    throw error
               }
               
               await axios.post(`${apiURL}/auth/refresh`,null,{
                    withCredentials:true
               })
          }

          const retryRes = await axios.get(`${apiURL}/boards`,{
               params:{organizationId},
               withCredentials:true,
          })
          return retryRes.data.boards
     }
 }) 

           const allbaords = <ul>
                 {GetBoard.data?.map((board: { id: number; title: string }) => (
                      <li key={board.id}>
                           {board.title}
                      </li>
                 ))}
           </ul>
         

    const boards: { id: number; title: string }[] = GetBoard.data ?? []
const hasOrganization = Number.isInteger(organizationId) && organizationId > 0

return (
  <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-8 sm:py-10">
    <Link
      href={hasOrganization ? `/organization/${organizationId}` : "/organization"}
      className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
    >
      <ArrowLeft className="size-4" aria-hidden="true" />
      {hasOrganization ? "Back to organization" : "Back to organizations"}
    </Link>

    <header className="mt-5 flex flex-wrap items-center justify-between gap-5 rounded-2xl border border-emerald-800/60 bg-linear-to-br from-emerald-950 via-[#11251f] to-[#151a19] p-5 text-white sm:p-7">
      <div className="flex items-center gap-4">
        <div className="grid size-11 shrink-0 place-items-center rounded-xl border border-emerald-400/20 bg-emerald-400/10 text-emerald-300">
          <LayoutGrid className="size-5" aria-hidden="true" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Boards
        </h1>
      </div>

      {hasOrganization && <CreateBoardDialog organizationId={organizationId} />}
    </header>

    <section aria-label="Organization boards" className="mt-6 sm:mt-8">
      {!hasOrganization && (
        <p className="text-sm text-muted-foreground">
          Open an organization to view its boards.
        </p>
      )}

      {hasOrganization && GetBoard.isPending && (
        <div role="status" className="text-sm text-muted-foreground">
          {SpinnerEmpty("Loading Board ............"," Please wait while we process your request. Do not refresh the page.")}
        </div>
      )}

      {GetBoard.isError && (
        <div role="alert" className="text-sm text-destructive">
          {SpinnerEmpty("Couldn't load this organization's Board","Try again after few seconds.")}.
        </div>
      )}

      {GetBoard.isSuccess && boards.length === 0 && (
        <div className="rounded-xl border border-dashed border-border bg-card px-5 py-10 text-center text-sm text-muted-foreground">
           {SpinnerEmpty("No Boards yet","Create your board to get started")}
        </div>
      )}

      {GetBoard.isSuccess && boards.length > 0 && (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {boards.map((board) => (
            <li
              key={board.id}
              className="flex min-w-0 flex-col rounded-xl border border-border bg-linear-to-br from-card via-card to-primary/5"
            >
              <h2 className="flex-1 wrap-break-word px-5 py-5 text-lg font-semibold tracking-tight">
                {board.title}
              </h2>

              <Link
                href={`/issues?boardId=${board.id}`}
                aria-label={`Open issues for ${board.title}`}
                className="flex items-center justify-between gap-2 rounded-b-xl border-t border-border px-5 py-3 text-sm font-medium text-primary hover:bg-primary/5 focus-visible:outline-2 focus-visible:outline-primary"
              >
                Open Issues
                <ArrowUpRight className="size-4" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  </main>
)
}