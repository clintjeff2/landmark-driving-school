"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { getSupabaseClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Car, ChevronLeft, ChevronRight } from "lucide-react"

export default function RegisterPage() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = getSupabaseClient()

  // Form data
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    slotPreference: "morning",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const nextStep = () => {
    if (step === 1) {
      // Validate first step
      if (!formData.name || !formData.email || !formData.phone) {
        setError("Please fill in all required fields")
        return
      }

      if (!formData.email.includes("@")) {
        setError("Please enter a valid email address")
        return
      }

      if (formData.phone.length < 10) {
        setError("Please enter a valid phone number")
        return
      }
    }

    if (step === 2) {
      // Validate second step
      if (!formData.password || !formData.confirmPassword) {
        setError("Please fill in all required fields")
        return
      }

      if (formData.password.length < 6) {
        setError("Password must be at least 6 characters")
        return
      }

      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match")
        return
      }
    }

    setError(null)
    setStep((prev) => prev + 1)
  }

  const prevStep = () => {
    setError(null)
    setStep((prev) => prev - 1)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Register user with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      })

      if (authError) {
        throw authError
      }

      if (!authData.user) {
        throw new Error("User registration failed")
      }

      // Insert user data into users table
      const { error: userError } = await supabase.from("users").insert([
        {
          id: authData.user.id,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          role: "student", // Default role for registration
        },
      ])

      if (userError) {
        throw userError
      }

      // Insert student-specific data
      const { error: studentError } = await supabase.from("students").insert([
        {
          user_id: authData.user.id,
          slot_preference: formData.slotPreference,
          status: "pending", // Default status for new students
        },
      ])

      if (studentError) {
        throw studentError
      }

      // Redirect to success page
      router.push("/register/success")
    } catch (err: any) {
      setError(err.message || "An error occurred during registration")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-2">
            <Car className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Create an Account</CardTitle>
          <CardDescription>Register as a student at Landmark Driving School</CardDescription>
          <div className="flex items-center justify-center space-x-2 pt-2">
            <div className={`h-2 w-2 rounded-full ${step >= 1 ? "bg-primary" : "bg-muted-foreground/30"}`} />
            <div className={`h-2 w-2 rounded-full ${step >= 2 ? "bg-primary" : "bg-muted-foreground/30"}`} />
            <div className={`h-2 w-2 rounded-full ${step >= 3 ? "bg-primary" : "bg-muted-foreground/30"}`} />
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            {step === 1 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="+1234567890"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="slotPreference">Preferred Lesson Time</Label>
                  <Select
                    value={formData.slotPreference}
                    onValueChange={(value) => handleSelectChange("slotPreference", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select preferred time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="morning">Morning (8AM - 12PM)</SelectItem>
                      <SelectItem value="afternoon">Afternoon (12PM - 4PM)</SelectItem>
                      <SelectItem value="evening">Evening (4PM - 8PM)</SelectItem>
                      <SelectItem value="weekend">Weekend Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 pt-4">
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Registering..." : "Complete Registration"}
                  </Button>
                </div>
              </>
            )}

            {step !== 3 && (
              <div className="space-y-2 pt-4">
                <Button type="button" onClick={nextStep} className="w-full">
                  Next Step <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}

            {step > 1 && (
              <div className="space-y-2">
                <Button type="button" variant="outline" onClick={prevStep} className="w-full">
                  <ChevronLeft className="mr-2 h-4 w-4" /> Previous Step
                </Button>
              </div>
            )}
          </form>
        </CardContent>
        <CardFooter className="flex flex-col">
          <div className="text-center text-sm">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Login
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
