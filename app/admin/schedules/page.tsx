"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { getSupabaseClient } from "@/lib/supabase/client"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Search, Plus, MoreHorizontal, Pencil, Trash2, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Schedule {
  id: number
  date: string
  time_slot: string
  instructor_name: string
  student_name: string
  status: string
  created_at: string
}

interface User {
  id: string
  name: string
  role: string
}

export default function AdminSchedulesPage() {
  const { user } = useAuth()
  const supabase = getSupabaseClient()
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [instructors, setInstructors] = useState<User[]>([])
  const [students, setStudents] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [processingAction, setProcessingAction] = useState(false)
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    date: "",
    time_slot: "09:00-10:00",
    instructor_id: "",
    student_id: "",
    status: "scheduled",
  })

  useEffect(() => {
    fetchSchedules()
    fetchUsers()
  }, [])

  const fetchSchedules = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("schedules")
        .select(`
          id,
          date,
          time_slot,
          status,
          created_at,
          instructor:users!instructor_id(name),
          student:users!student_id(name)
        `)
        .order("date", { ascending: false })

      if (error) throw error

      // Transform the data to flatten the structure
      const transformedData = data.map((schedule) => ({
        id: schedule.id,
        date: schedule.date,
        time_slot: schedule.time_slot,
        instructor_name: schedule.instructor?.name || "Unassigned",
        student_name: schedule.student?.name || "Unassigned",
        status: schedule.status,
        created_at: schedule.created_at,
      }))

      setSchedules(transformedData)
    } catch (err: any) {
      setError(err.message)
      toast({
        title: "Error",
        description: "Failed to fetch schedules data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      // Fetch instructors
      const { data: instructorsData, error: instructorsError } = await supabase
        .from("users")
        .select("id, name, role")
        .eq("role", "instructor")

      if (instructorsError) throw instructorsError

      // Fetch students
      const { data: studentsData, error: studentsError } = await supabase
        .from("users")
        .select("id, name, role")
        .eq("role", "student")

      if (studentsError) throw studentsError

      setInstructors(instructorsData || [])
      setStudents(studentsData || [])
    } catch (err: any) {
      toast({
        title: "Error",
        description: "Failed to fetch users data",
        variant: "destructive",
      })
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const resetForm = () => {
    setFormData({
      date: "",
      time_slot: "09:00-10:00",
      instructor_id: "",
      student_id: "",
      status: "scheduled",
    })
  }

  const handleAddSchedule = async () => {
    try {
      setProcessingAction(true)

      // Validate form
      if (!formData.date || !formData.instructor_id || !formData.student_id) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        })
        return
      }

      const { error } = await supabase.from("schedules").insert([
        {
          date: formData.date,
          time_slot: formData.time_slot,
          instructor_id: formData.instructor_id,
          student_id: formData.student_id,
          status: formData.status,
        },
      ])

      if (error) throw error

      toast({
        title: "Success",
        description: "Schedule added successfully",
      })

      resetForm()
      setIsAddDialogOpen(false)
      fetchSchedules()
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to add schedule",
        variant: "destructive",
      })
    } finally {
      setProcessingAction(false)
    }
  }

  const handleEditSchedule = async () => {
    if (!selectedSchedule) return

    try {
      setProcessingAction(true)

      // Validate form
      if (!formData.date || !formData.instructor_id || !formData.student_id) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        })
        return
      }

      const { error } = await supabase
        .from("schedules")
        .update({
          date: formData.date,
          time_slot: formData.time_slot,
          instructor_id: formData.instructor_id,
          student_id: formData.student_id,
          status: formData.status,
        })
        .eq("id", selectedSchedule.id)

      if (error) throw error

      toast({
        title: "Success",
        description: "Schedule updated successfully",
      })

      resetForm()
      setIsEditDialogOpen(false)
      fetchSchedules()
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to update schedule",
        variant: "destructive",
      })
    } finally {
      setProcessingAction(false)
    }
  }

  const handleDeleteSchedule = async () => {
    if (!selectedSchedule) return

    try {
      setProcessingAction(true)

      const { error } = await supabase.from("schedules").delete().eq("id", selectedSchedule.id)

      if (error) throw error

      toast({
        title: "Success",
        description: "Schedule deleted successfully",
      })

      setIsDeleteDialogOpen(false)
      fetchSchedules()
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to delete schedule",
        variant: "destructive",
      })
    } finally {
      setProcessingAction(false)
    }
  }

  const openEditDialog = (schedule: Schedule) => {
    setSelectedSchedule(schedule)
    // Find the instructor and student IDs
    const instructor = instructors.find((i) => i.name === schedule.instructor_name)
    const student = students.find((s) => s.name === schedule.student_name)

    setFormData({
      date: schedule.date,
      time_slot: schedule.time_slot,
      instructor_id: instructor?.id || "",
      student_id: student?.id || "",
      status: schedule.status,
    })
    setIsEditDialogOpen(true)
  }

  const openDeleteDialog = (schedule: Schedule) => {
    setSelectedSchedule(schedule)
    setIsDeleteDialogOpen(true)
  }

  const filteredSchedules = schedules.filter(
    (schedule) =>
      schedule.instructor_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      schedule.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      schedule.date.includes(searchQuery) ||
      schedule.time_slot.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "scheduled":
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200 border">Scheduled</Badge>
      case "completed":
        return <Badge className="bg-green-100 text-green-800 border-green-200 border">Completed</Badge>
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800 border-red-200 border">Cancelled</Badge>
      case "no-show":
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 border">No Show</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>
    }
  }

  const timeSlots = [
    "08:00-09:00",
    "09:00-10:00",
    "10:00-11:00",
    "11:00-12:00",
    "12:00-13:00",
    "13:00-14:00",
    "14:00-15:00",
    "15:00-16:00",
    "16:00-17:00",
    "17:00-18:00",
    "18:00-19:00",
    "19:00-20:00",
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600">Loading schedules data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Schedules Management</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-blue text-white">
              <Plus className="mr-2 h-4 w-4" /> Add Schedule
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Schedule</DialogTitle>
              <DialogDescription>Create a new lesson schedule for a student and instructor.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 gap-3">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>
              <div className="grid grid-cols-1 gap-3">
                <Label htmlFor="time_slot">Time Slot</Label>
                <Select value={formData.time_slot} onValueChange={(value) => handleSelectChange("time_slot", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select time slot" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((slot) => (
                      <SelectItem key={slot} value={slot}>
                        {slot}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-1 gap-3">
                <Label htmlFor="instructor_id">Instructor</Label>
                <Select
                  value={formData.instructor_id}
                  onValueChange={(value) => handleSelectChange("instructor_id", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select instructor" />
                  </SelectTrigger>
                  <SelectContent>
                    {instructors.map((instructor) => (
                      <SelectItem key={instructor.id} value={instructor.id}>
                        {instructor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-1 gap-3">
                <Label htmlFor="student_id">Student</Label>
                <Select value={formData.student_id} onValueChange={(value) => handleSelectChange("student_id", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select student" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-1 gap-3">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => handleSelectChange("status", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="no-show">No Show</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button className="gradient-blue text-white" onClick={handleAddSchedule} disabled={processingAction}>
                {processingAction ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Adding...
                  </>
                ) : (
                  "Add Schedule"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle>All Schedules</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-6">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search schedules..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-blue-50">
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Instructor</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSchedules.length > 0 ? (
                  filteredSchedules.map((schedule) => (
                    <TableRow key={schedule.id}>
                      <TableCell className="font-medium">{new Date(schedule.date).toLocaleDateString()}</TableCell>
                      <TableCell>{schedule.time_slot}</TableCell>
                      <TableCell>{schedule.instructor_name}</TableCell>
                      <TableCell>{schedule.student_name}</TableCell>
                      <TableCell>{getStatusBadge(schedule.status)}</TableCell>
                      <TableCell>{new Date(schedule.created_at).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditDialog(schedule)}>
                              <Pencil className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openDeleteDialog(schedule)} className="text-red-600">
                              <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-6 text-gray-500">
                      No schedules found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Schedule</DialogTitle>
            <DialogDescription>Update schedule information and status.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 gap-3">
              <Label htmlFor="edit-date">Date</Label>
              <Input
                id="edit-date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleInputChange}
                min={new Date().toISOString().split("T")[0]}
              />
            </div>
            <div className="grid grid-cols-1 gap-3">
              <Label htmlFor="edit-time_slot">Time Slot</Label>
              <Select value={formData.time_slot} onValueChange={(value) => handleSelectChange("time_slot", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select time slot" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((slot) => (
                    <SelectItem key={slot} value={slot}>
                      {slot}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 gap-3">
              <Label htmlFor="edit-instructor_id">Instructor</Label>
              <Select
                value={formData.instructor_id}
                onValueChange={(value) => handleSelectChange("instructor_id", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select instructor" />
                </SelectTrigger>
                <SelectContent>
                  {instructors.map((instructor) => (
                    <SelectItem key={instructor.id} value={instructor.id}>
                      {instructor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 gap-3">
              <Label htmlFor="edit-student_id">Student</Label>
              <Select value={formData.student_id} onValueChange={(value) => handleSelectChange("student_id", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select student" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 gap-3">
              <Label htmlFor="edit-status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleSelectChange("status", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="no-show">No Show</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button className="gradient-blue text-white" onClick={handleEditSchedule} disabled={processingAction}>
              {processingAction ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating...
                </>
              ) : (
                "Update Schedule"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this schedule? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {selectedSchedule && (
              <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                <p className="font-medium text-gray-800">
                  {new Date(selectedSchedule.date).toLocaleDateString()} - {selectedSchedule.time_slot}
                </p>
                <p className="text-sm text-gray-600">
                  {selectedSchedule.instructor_name} → {selectedSchedule.student_name}
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteSchedule} disabled={processingAction}>
              {processingAction ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...
                </>
              ) : (
                "Delete Schedule"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Toaster />
    </div>
  )
}
