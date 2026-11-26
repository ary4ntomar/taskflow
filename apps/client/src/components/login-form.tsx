"use client"

import { cn } from "cn"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useState } from "react"
import axios from "axios"
import { useRouter } from "next/navigation"
import { signinSchema } from "@/validators/auth"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter()
       const [username, setUsername] = useState<string>("")
       const [pass, setPass] = useState<string>("")
       const [error, setError] = useState<string>("")

    
  const handleSubmit = async (event:React.FormEvent<HTMLFormElement>) => {
    event?.preventDefault()
    setError("")

   
    const result = signinSchema.safeParse({
      username,
      password: pass,
    })
    if (!result.success || result.data === undefined) {
      setError("Invalid Input")
      return
    }

    try {
      await axios.post(
        "http://localhost:3001/auth/signin",
        {
          username: result.data.username,
          password: result.data.password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      )
      router.push("/organization")
    }     
    catch (err) {
      setError("Something is wrong please try again")
      return
    }
  }

  return (
    <div className={cn("flex flex-col gap-6 ", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8" onSubmit={handleSubmit}>
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Welcome back</h1>
                <p className="text-balance text-muted-foreground">
                  Login to your Taskflow account
                </p>
              </div>
              <Field>
                <FieldLabel htmlFor="email">Username</FieldLabel>
                <Input
                  value={username}
                  onChange={(e)=>setUsername(e.target.value)}
                  id="username"
                  type="username"
                  placeholder="Enter your username"
                  required
                />
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                </div>
                <Input value={pass} onChange={(e)=>setPass(e.target.value)} id="password" type="password" placeholder="enter your password" required />
              </Field>
               {error && <p role="alert" className="text-destructive">{error}</p>}
              <Field>
                <Button type="submit">Login</Button>
              </Field>
              <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                Or continue with
              </FieldSeparator>
              <FieldDescription className="text-center">
                Don&apos;t have an account? <Link href="/auth/signup">Sign up</Link>
              </FieldDescription>
            </FieldGroup>
          </form>
          <div className="relative hidden bg-muted md:block">
            <img
              src="/placeholder.png"
              alt="Image"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.5]"
            />
          </div>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </FieldDescription>
    </div>
  )
}
