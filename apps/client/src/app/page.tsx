import { buttonVariants } from "@/components/ui/button"
import { MoveRight } from "lucide-react"
import { ShaderBackground } from "@/components/waves"
import Link from "next/link"

export default function Page() {
  return (
    <div className="relative min-h-screen w-full bg-mist-900 text-white">
      <ShaderBackground />

      <div className="relative z-10 flex min-h-screen flex-col">
        <header className="flex items-center gap-2 px-4 py-3 sm:px-6">
          <img src="/logo.png" alt="" className="h-10 w-auto sm:h-12" />
          <span className="text-lg font-bold sm:text-xl">Taskflow</span>
        </header>

        <main className="flex flex-1 flex-col items-center justify-center gap-4 px-5 pb-24 text-center sm:pb-32 lg:pb-40">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl lg:text-8xl">
            Keep team work moving.
          </h1>

          <p className="max-w-xl text-base text-white/80 sm:text-xl">
            A simple work tracker for teams to organize boards, track issues,
            and ship together.
          </p>

          <Link
            href="/auth/signup"
            className={buttonVariants({
              className: "mt-2 h-11 px-5 text-base",
            })}
          >
            Get started <MoveRight className="size-4" />
          </Link>
        </main>
      </div>
    </div>
  )
}
