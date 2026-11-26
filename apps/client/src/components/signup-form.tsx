"use client"

import { cn } from "cn"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useState } from "react"
import axios from "axios"
import { useRouter } from "next/navigation"
import { signupSchema } from "@/validators/auth"

import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter()
  const [username, setUsername] = useState<string>("")
  const [pass, setPass] = useState<string>("")
  const [confirmPass, setConfirmPass] = useState<string>("")
  const [error, setError] = useState<string>("")

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event?.preventDefault()
    setError("")

    if (pass !== confirmPass) {
      setError("Password don't match")
      return
    }

    const result = signupSchema.safeParse({
      username,
      password: pass,
      confirmPassword: confirmPass,
    })
    if (!result.success || result.data === undefined) {
      setError("Invalid Input")
      return
    }

    try {
      const apiURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
      await axios.post(
        `${apiURL}/auth/signup`,
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
    } catch (err) {
      setError("Something is wrong please try again")
      return
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8" onSubmit={handleSubmit}>
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Create your account</h1>
                <p className="text-sm text-balance text-muted-foreground">
                  Enter your Username below to create your account
                </p>
              </div>
              <Field>
                <FieldLabel htmlFor="username">Username</FieldLabel>
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  id="username"
                  type="username"
                  placeholder="Enter your Username"
                  required
                />
                <FieldDescription>
                  We&apos;ll not share your credentials with anyone else.
                </FieldDescription>
              </Field>
              <Field>
                <Field className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="password">Password</FieldLabel>
                    <Input
                      value={pass}
                      onChange={(e) => setPass(e.target.value)}
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      required
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="confirm-password">
                      Confirm Password
                    </FieldLabel>
                    <Input
                      value={confirmPass}
                      onChange={(e) => setConfirmPass(e.target.value)}
                      id="confirm-password"
                      type="password"
                      placeholder="Enter your password"
                      required
                    />
                  </Field>
                </Field>
                <FieldDescription>
                  Must be at least 8 characters long.
                </FieldDescription>
                {error && (
                  <p role="alert" className="text-destructive">
                    {error}
                  </p>
                )}
              </Field>
              <Field>
                <Button type="submit">Create Account</Button>
              </Field>
              <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                Or continue with
              </FieldSeparator>
              <FieldDescription className="text-center">
                Already have an account? <Link href="/auth/login">Log in</Link>
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
