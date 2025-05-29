"use client"

import { useEffect, useState } from "react"
import { getSupabaseClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Users, Car, Star } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/components/auth-provider"

interface StudentCount {
  count: number
}

interface InstructorCount {
  count: number
}

interface ScheduleCount {
  count: number
}

interface VehicleCount {
  count: number
}

interface RecentStudent {
  id: string
  name: string
  email: string
  created_at: string
}

export default function AdminDashboard() {
  const { user } = useAuth()
  const [studentCount, setStudentCount] = useState<number>(0)
  const [instructorCount, setInstructorCount] = useState<number>(0)
  const [scheduleCount, setScheduleCount] = useState<number>(0)
  const [vehicleCount, setVehicleCount] = useState<number>(0)
  const [recentStudents, setRecentStudents] = useState<RecentStudent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = getSupabaseClient()

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return

      try {
        // Get student count
        const { count: studentCount, error: studentCountError } = await supabase
          .from("students")
          .select("*", { count: "exact", head: true })

        if (studentCountError) {
          throw studentCountError
        }

        // Get instructor count
        const { count: instructorCount, error: instructorCountError } = await supabase
          .from("users")
          .select("*", { count: "exact", head: true })
          .eq("role", "instructor")

        if (instructorCountError) {
          throw instructorCountError
        }

        // Get schedule count
        const { count: scheduleCount, error: scheduleCountError } = await supabase
          .from("schedules")
          .select("*", { count: "exact", head: true })
          .gte("date", new Date().toISOString().split("T")[0])

        if (scheduleCountError) {
          throw scheduleCountError
        }

        // Get vehicle count (assuming there's a vehicles table)
        const { count: vehicleCount, error: vehicleCountError } = await supabase
          .from("vehicles")
          .select("*", { count: "exact", head: true })

        // For this example, we'll just set a placeholder value if the table doesn't exist

        // Get recent students
        const { data: recentStudentsData, error: recentStudentsError } = await supabase
          .from("users")
          .select("id, name, email, created_at")
          .eq("role", "student")
          .order("created_at", { ascending: false })
          .limit(5)

        if (recentStudentsError) {
          throw recentStudentsError
        }

        // Set state with fetched data
        setStudentCount(studentCount || 0)
        setInstructorCount(instructorCount || 0)
        setScheduleCount(scheduleCount || 0)
        setVehicleCount(vehicleCount || 0)
        setRecentStudents(recentStudentsData || [])
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
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {user?.name || "Admin"}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
        {/* Students Count */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{studentCount}</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>

        {/* Instructors Count */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Instructors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{instructorCount}</div>
            <p className="text-xs text-muted-foreground">Active instructors</p>
          </CardContent>
        </Card>

        {/* Scheduled Lessons */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Lessons</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{scheduleCount}</div>
            <p className="text-xs text-muted-foreground">Scheduled for this month</p>
          </CardContent>
        </Card>

        {/* Vehicles */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vehicles</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vehicleCount}</div>
            <p className="text-xs text-muted-foreground">Available for lessons</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Students */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Recent Students</CardTitle>
            <CardDescription>Newly registered students</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentStudents.length > 0 ? (
                recentStudents.map((student) => (
                  <div key={student.id} className="flex items-center justify-between border-b pb-2">
                    <div>
                      <p className="font-medium">{student.name}</p>
                      <p className="text-sm text-muted-foreground">{student.email}</p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(student.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No recent students</p>
              )}
            </div>
            <Button variant="outline" className="w-full mt-4" asChild>
              <Link href="/admin/students">View All Students</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Instructor Ratings */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Instructor Ratings</CardTitle>
            <CardDescription>Average ratings for instructors</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <div>
                  <p className="font-medium">John Smith</p>
                  <p className="text-sm text-muted-foreground">Senior Instructor</p>
                </div>
                <div className="flex items-center">
                  <Star className="h-4 w-4 fill-current text-yellow-400" />
                  <span className="ml-1 text-sm font-medium">4.9</span>
                </div>
              </div>
              <div className="flex items-center justify-between border-b pb-2">
                <div>
                  <p className="font-medium">Sarah Johnson</p>
                  <p className="text-sm text-muted-foreground">Instructor</p>
                </div>
                <div className="flex items-center">
                  <Star className="h-4 w-4 fill-current text-yellow-400" />
                  <span className="ml-1 text-sm font-medium">4.7</span>
                </div>
              </div>
              <div className="flex items-center justify-between border-b pb-2">
                <div>
                  <p className="font-medium">Michael Brown</p>
                  <p className="text-sm text-muted-foreground">Instructor</p>
                </div>
                <div className="flex items-center">
                  <Star className="h-4 w-4 fill-current text-yellow-400" />
                  <span className="ml-1 text-sm font-medium">4.5</span>
                </div>
              </div>
            </div>
            <Button variant="outline" className="w-full mt-4" asChild>
              <Link href="/admin/ratings">View All Ratings</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
