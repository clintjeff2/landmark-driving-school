"use client"

import { useEffect, useState } from "react"
import { getSupabaseClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, CheckCircle, Star } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/components/auth-provider"

interface LessonData {
  id: number
  date: string
  time_slot: string
  student_name: string
}

interface AttendanceData {
  present: number
  absent: number
}

interface RatingData {
  average: number
  count: number
}

export default function InstructorDashboard() {
  const { user } = useAuth()
  const [lessons, setLessons] = useState<LessonData[]>([])
  const [attendance, setAttendance] = useState<AttendanceData>({ present: 0, absent: 0 })
  const [rating, setRating] = useState<RatingData>({ average: 0, count: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = getSupabaseClient()

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return

      try {
        // Get upcoming lessons
        const { data: lessonData, error: lessonError } = await supabase
          .from("schedules")
          .select(`
            id,
            date,
            time_slot,
            users!student_id(name)
          `)
          .eq("instructor_id", user.id)
          .gte("date", new Date().toISOString().split("T")[0])
          .order("date", { ascending: true })
          .limit(5)

        if (lessonError) {
          throw lessonError
        }

        // Get attendance statistics
        const { data: attendanceData, error: attendanceError } = await supabase
          .from("attendance")
          .select("present")
          .eq("instructor_id", user.id)

        if (attendanceError) {
          throw attendanceError
        }

        // Calculate attendance stats
        const present = attendanceData?.filter((a) => a.present).length || 0
        const absent = attendanceData?.filter((a) => !a.present).length || 0

        // Get rating data
        const { data: ratingData, error: ratingError } = await supabase
          .from("feedback")
          .select("rating")
          .eq("instructor_id", user.id)

        if (ratingError) {
          throw ratingError
        }

        // Calculate average rating
        const ratings = ratingData?.map((r) => r.rating) || []
        const average = ratings.length > 0 ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length : 0

        // Set state with fetched data
        setLessons(
          lessonData.map((lesson) => ({
            ...lesson,
            student_name: lesson.users?.name || "Unassigned",
          })),
        )
        setAttendance({ present, absent })
        setRating({ average, count: ratings.length })
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
        <h1 className="text-3xl font-bold">Instructor Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {user?.name || "Instructor"}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
        {/* Upcoming Lessons Count */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Lessons</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lessons.length}</div>
            <p className="text-xs text-muted-foreground">Scheduled for this week</p>
          </CardContent>
        </Card>

        {/* Attendance Rate */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {attendance.present + attendance.absent > 0
                ? Math.round((attendance.present / (attendance.present + attendance.absent)) * 100)
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground">
              {attendance.present} present, {attendance.absent} absent
            </p>
          </CardContent>
        </Card>

        {/* Rating */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rating.average.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">Based on {rating.count} reviews</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-1">
        {/* Today's Lessons */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Upcoming Lessons</CardTitle>
            <CardDescription>Your scheduled lessons for the coming days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {lessons.length > 0 ? (
                lessons.map((lesson) => (
                  <div key={lesson.id} className="flex items-center justify-between border-b pb-2">
                    <div>
                      <p className="font-medium">
                        {new Date(lesson.date).toLocaleDateString()}, {lesson.time_slot}
                      </p>
                      <p className="text-sm text-muted-foreground">Student: {lesson.student_name}</p>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/instructor/lessons/${lesson.id}`}>Details</Link>
                    </Button>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No upcoming lessons scheduled</p>
              )}
            </div>
            <Button variant="outline" className="w-full mt-4" asChild>
              <Link href="/instructor/lessons">View All Lessons</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
