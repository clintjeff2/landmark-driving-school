"use client"

import { useEffect, useState } from "react"
import { getSupabaseClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, CreditCard, BookOpen, Award, AlertTriangle, FileText } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/components/auth-provider"

interface StudentData {
  status: string
  slot_preference: string
}

interface ScheduleData {
  id: number
  date: string
  time_slot: string
  instructor_name: string
}

interface PaymentData {
  status: string
  amount: number
}

export default function StudentDashboard() {
  const { user } = useAuth()
  const [studentData, setStudentData] = useState<StudentData | null>(null)
  const [schedules, setSchedules] = useState<ScheduleData[]>([])
  const [payments, setPayments] = useState<PaymentData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = getSupabaseClient()

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return

      try {
        // Get student data
        const { data: studentData, error: studentError } = await supabase
          .from("students")
          .select("status, slot_preference")
          .eq("user_id", user.id)
          .single()

        if (studentError) {
          throw studentError
        }

        // Get upcoming schedules
        const { data: scheduleData, error: scheduleError } = await supabase
          .from("schedules")
          .select(`
            id,
            date,
            time_slot,
            users!instructor_id(name)
          `)
          .eq("student_id", user.id)
          .gte("date", new Date().toISOString().split("T")[0])
          .order("date", { ascending: true })
          .limit(3)

        if (scheduleError) {
          throw scheduleError
        }

        // Get payment data
        const { data: paymentData, error: paymentError } = await supabase
          .from("payments")
          .select("status, amount")
          .eq("student_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)

        if (paymentError) {
          throw paymentError
        }

        // Set state with fetched data
        setStudentData(studentData)
        setSchedules(
          scheduleData.map((schedule) => ({
            ...schedule,
            instructor_name: schedule.users?.name || "Unassigned",
          })),
        )
        setPayments(paymentData)
      } catch (err: any) {
        setError(err.message || "An error occurred while fetching data")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user, supabase])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Loading dashboard...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Welcome, {user?.name || "Student"}</h1>
        <p className="text-muted-foreground">
          Your student status: <span className="font-medium">{studentData?.status || "Pending"}</span>
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Upcoming Lessons */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Lessons</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {schedules.length > 0 ? (
              <div className="space-y-2">
                {schedules.map((schedule) => (
                  <div key={schedule.id} className="flex justify-between items-center border-b pb-2">
                    <div>
                      <p className="font-medium">{new Date(schedule.date).toLocaleDateString()}</p>
                      <p className="text-sm text-muted-foreground">{schedule.time_slot}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm">Instructor:</p>
                      <p className="text-sm font-medium">{schedule.instructor_name}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No upcoming lessons scheduled</p>
            )}
            <Button variant="outline" className="w-full mt-4" asChild>
              <Link href="/student/schedule">View Schedule</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Payment Status */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Payment Status</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {payments.length > 0 ? (
              <div>
                <div className="flex justify-between items-center">
                  <p className="text-sm">Latest Payment:</p>
                  <p className="font-medium">${payments[0].amount}</p>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <p className="text-sm">Status:</p>
                  <p
                    className={`font-medium ${
                      payments[0].status === "paid"
                        ? "text-green-500"
                        : payments[0].status === "pending"
                          ? "text-yellow-500"
                          : "text-red-500"
                    }`}
                  >
                    {payments[0].status.charAt(0).toUpperCase() + payments[0].status.slice(1)}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No payment records found</p>
            )}
            <Button variant="outline" className="w-full mt-4" asChild>
              <Link href="/student/payments">Manage Payments</Link>
            </Button>
          </CardContent>
        </Card>

        {/* E-Learning Progress */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">E-Learning</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm">Continue learning with our online resources</p>
              <div className="h-2 w-full rounded-full bg-muted">
                <div className="h-full w-1/3 rounded-full bg-primary"></div>
              </div>
              <p className="text-xs text-muted-foreground">33% Complete</p>
            </div>
            <Button variant="outline" className="w-full mt-4" asChild>
              <Link href="/student/learning">Access Learning Hub</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Rewards */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rewards</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-center py-2">
              <p className="text-3xl font-bold">150</p>
              <p className="text-sm text-muted-foreground">Points Earned</p>
            </div>
            <Button variant="outline" className="w-full mt-4" asChild>
              <Link href="/student/rewards">View Rewards</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Road Alerts */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Road Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div className="rounded-full h-3 w-3 bg-green-500"></div>
              <p className="text-sm">Road conditions are good today</p>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Last updated: Today, 8:00 AM</p>
            <Button variant="outline" className="w-full mt-4" asChild>
              <Link href="/student/alerts">View Alerts</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Admission Document */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admission Document</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-sm">Download your admission document with QR code</p>
            <Button variant="outline" className="w-full mt-4" asChild>
              <Link href="/student/admission">View Document</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
