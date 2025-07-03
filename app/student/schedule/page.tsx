"use client"

import { useEffect, useState } from "react"
import { getSupabaseClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, User, MapPin, AlertCircle } from "lucide-react"
import { useAuth } from "@/components/auth-provider"

interface Schedule {
  id: number
  date: string
  time_slot: string
  status: string
  instructor_name: string
  location: string
}

export default function StudentSchedule() {
  const { user } = useAuth()
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = getSupabaseClient()

  useEffect(() => {
    const fetchSchedules = async () => {
      if (!user) return

      try {
        const { data, error } = await supabase
          .from("schedules")
          .select(`
            id,
            date,
            time_slot,
            status,
            users!instructor_id(name)
          `)
          .eq("student_id", user.id)
          .order("date", { ascending: true })

        if (error) throw error

        const formattedSchedules = data.map((schedule) => ({
          ...schedule,
          instructor_name: schedule.users?.name || "Unassigned",
          location: "Main Campus", // Default location
        }))

        setSchedules(formattedSchedules)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchSchedules()
  }, [user, supabase])

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      scheduled: { color: "bg-blue-100 text-blue-800", label: "Scheduled" },
      completed: { color: "bg-green-100 text-green-800", label: "Completed" },
      cancelled: { color: "bg-red-100 text-red-800", label: "Cancelled" },
    }
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.scheduled
    return <Badge className={config.color}>{config.label}</Badge>
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600">Loading your schedule...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto" />
          <p className="text-red-600 font-medium">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Schedule</h1>
          <p className="text-gray-600">View and manage your driving lessons</p>
        </div>
        <Button className="gradient-blue text-white">Book New Lesson</Button>
      </div>

      <div className="grid gap-4">
        {schedules.length > 0 ? (
          schedules.map((schedule) => (
            <Card key={schedule.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 rounded-lg bg-blue-100">
                      <Calendar className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">
                        {new Date(schedule.date).toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {schedule.time_slot}
                        </div>
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-1" />
                          {schedule.instructor_name}
                        </div>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {schedule.location}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">{getStatusBadge(schedule.status)}</div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No lessons scheduled</h3>
              <p className="text-gray-500 mb-4">Book your first driving lesson to get started</p>
              <Button className="gradient-blue text-white">Book Lesson</Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
