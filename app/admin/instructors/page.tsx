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
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Search, Plus, MoreHorizontal, Pencil, Trash2, Loader2, Star } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Instructor {
  id: string
  name: string
  email: string
  phone: string
  created_at: string
  specialization: string
  years_experience: number
  rating: number
}

export default function InstructorsPage() {
  const { user } = useAuth()
  const supabase = getSupabaseClient()
  const [instructors, setInstructors] = useState<Instructor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [processingAction, setProcessingAction] = useState(false)
  const [selectedInstructor, setSelectedInstructor] = useState<Instructor | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    specialization: "general",
    years_experience: "1",
  })

  useEffect(() => {
    fetchInstructors()
  }, [])

  const fetchInstructors = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("users")
        .select(`
          id,
          name,
          email,
          phone,
          created_at,
          instructors!inner(specialization, years_experience)
        `)
        .eq("role", "instructor")
        .order("created_at", { ascending: false })

      if (error) throw error

      // Get ratings for each instructor
      const instructorsWithRatings = await Promise.all(
        data.map(async (instructor) => {
          const { data: feedbackData, error: feedbackError } = await supabase
            .from("feedback")
            .select("rating")
            .eq("instructor_id", instructor.id)

          let rating = 0
          if (!feedbackError && feedbackData && feedbackData.length > 0) {
            const sum = feedbackData.reduce((acc, curr) => acc + curr.rating, 0)
            rating = Number.parseFloat((sum / feedbackData.length).toFixed(1))
          }

          return {
            id: instructor.id,
            name: instructor.name,
            email: instructor.email,
            phone: instructor.phone || "",
            created_at: instructor.created_at,
            specialization: instructor.instructors[0]?.specialization || "general",
            years_experience: instructor.instructors[0]?.years_experience || 0,
            rating,
          }
        }),
      )

      setInstructors(instructorsWithRatings)
    } catch (err: any) {
      setError(err.message)
      toast({
        title: "Error",
        description: "Failed to fetch instructors data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
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
      name: "",
      email: "",
      phone: "",
      password: "",
      specialization: "general",
      years_experience: "1",
    })
  }

  const handleAddInstructor = async () => {
    try {
      setProcessingAction(true)

      // Validate form
      if (!formData.name || !formData.email || !formData.password) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        })
        return
      }

      // 1. Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      })

      if (authError) throw authError

      if (!authData.user) {
        throw new Error("Failed to create user account")
      }

      // 2. Add user to users table
      const { error: userError } = await supabase.from("users").insert([
        {
          id: authData.user.id,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          role: "instructor",
        },
      ])

      if (userError) throw userError

      // 3. Add instructor-specific data
      const { error: instructorError } = await supabase.from("instructors").insert([
        {
          user_id: authData.user.id,
          specialization: formData.specialization,
          years_experience: Number.parseInt(formData.years_experience),
        },
      ])

      if (instructorError) throw instructorError

      toast({
        title: "Success",
        description: "Instructor added successfully",
      })

      resetForm()
      setIsAddDialogOpen(false)
      fetchInstructors()
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to add instructor",
        variant: "destructive",
      })
    } finally {
      setProcessingAction(false)
    }
  }

  const handleEditInstructor = async () => {
    if (!selectedInstructor) return

    try {
      setProcessingAction(true)

      // Validate form
      if (!formData.name || !formData.email) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        })
        return
      }

      // 1. Update user data
      const { error: userError } = await supabase
        .from("users")
        .update({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
        })
        .eq("id", selectedInstructor.id)

      if (userError) throw userError

      // 2. Update instructor-specific data
      const { error: instructorError } = await supabase
        .from("instructors")
        .update({
          specialization: formData.specialization,
          years_experience: Number.parseInt(formData.years_experience),
        })
        .eq("user_id", selectedInstructor.id)

      if (instructorError) throw instructorError

      // 3. Update password if provided
      if (formData.password) {
        const { error: passwordError } = await supabase.auth.admin.updateUserById(selectedInstructor.id, {
          password: formData.password,
        })

        if (passwordError) {
          toast({
            title: "Warning",
            description: "User updated but password could not be changed",
            variant: "default",
          })
        }
      }

      toast({
        title: "Success",
        description: "Instructor updated successfully",
      })

      resetForm()
      setIsEditDialogOpen(false)
      fetchInstructors()
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to update instructor",
        variant: "destructive",
      })
    } finally {
      setProcessingAction(false)
    }
  }

  const handleDeleteInstructor = async () => {
    if (!selectedInstructor) return

    try {
      setProcessingAction(true)

      // 1. Delete instructor record
      const { error: instructorError } = await supabase
        .from("instructors")
        .delete()
        .eq("user_id", selectedInstructor.id)

      if (instructorError) throw instructorError

      // 2. Delete user record
      const { error: userError } = await supabase.from("users").delete().eq("id", selectedInstructor.id)

      if (userError) throw userError

      // 3. Delete auth user
      const { error: authError } = await supabase.auth.admin.deleteUser(selectedInstructor.id)

      if (authError) {
        toast({
          title: "Warning",
          description: "User data deleted but auth account may remain",
          variant: "default",
        })
      }

      toast({
        title: "Success",
        description: "Instructor deleted successfully",
      })

      setIsDeleteDialogOpen(false)
      fetchInstructors()
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to delete instructor",
        variant: "destructive",
      })
    } finally {
      setProcessingAction(false)
    }
  }

  const openEditDialog = (instructor: Instructor) => {
    setSelectedInstructor(instructor)
    setFormData({
      name: instructor.name,
      email: instructor.email,
      phone: instructor.phone || "",
      password: "", // Don't set password for edit
      specialization: instructor.specialization,
      years_experience: instructor.years_experience.toString(),
    })
    setIsEditDialogOpen(true)
  }

  const openDeleteDialog = (instructor: Instructor) => {
    setSelectedInstructor(instructor)
    setIsDeleteDialogOpen(true)
  }

  const filteredInstructors = instructors.filter(
    (instructor) =>
      instructor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      instructor.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      instructor.specialization.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const getSpecializationLabel = (specialization: string) => {
    switch (specialization) {
      case "general":
        return "General Driving"
      case "defensive":
        return "Defensive Driving"
      case "commercial":
        return "Commercial Vehicles"
      case "automatic":
        return "Automatic Transmission"
      case "manual":
        return "Manual Transmission"
      default:
        return specialization
    }
  }

  const getRatingStars = (rating: number) => {
    return (
      <div className="flex items-center">
        <span className="mr-1 font-medium">{rating.toFixed(1)}</span>
        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600">Loading instructors data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Instructors Management</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-blue text-white">
              <Plus className="mr-2 h-4 w-4" /> Add Instructor
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Instructor</DialogTitle>
              <DialogDescription>
                Create a new instructor account. They will receive an email to confirm their registration.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 gap-3">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="John Doe"
                />
              </div>
              <div className="grid grid-cols-1 gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="john@example.com"
                />
              </div>
              <div className="grid grid-cols-1 gap-3">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+1234567890"
                />
              </div>
              <div className="grid grid-cols-1 gap-3">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Set a temporary password"
                />
              </div>
              <div className="grid grid-cols-1 gap-3">
                <Label htmlFor="specialization">Specialization</Label>
                <Select
                  value={formData.specialization}
                  onValueChange={(value) => handleSelectChange("specialization", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select specialization" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General Driving</SelectItem>
                    <SelectItem value="defensive">Defensive Driving</SelectItem>
                    <SelectItem value="commercial">Commercial Vehicles</SelectItem>
                    <SelectItem value="automatic">Automatic Transmission</SelectItem>
                    <SelectItem value="manual">Manual Transmission</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-1 gap-3">
                <Label htmlFor="years_experience">Years of Experience</Label>
                <Select
                  value={formData.years_experience}
                  onValueChange={(value) => handleSelectChange("years_experience", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select years" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20].map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year} {year === 1 ? "year" : "years"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button className="gradient-blue text-white" onClick={handleAddInstructor} disabled={processingAction}>
                {processingAction ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Adding...
                  </>
                ) : (
                  "Add Instructor"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle>All Instructors</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-6">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search instructors..."
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
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Specialization</TableHead>
                  <TableHead>Experience</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInstructors.length > 0 ? (
                  filteredInstructors.map((instructor) => (
                    <TableRow key={instructor.id}>
                      <TableCell className="font-medium">{instructor.name}</TableCell>
                      <TableCell>{instructor.email}</TableCell>
                      <TableCell>{instructor.phone || "—"}</TableCell>
                      <TableCell>{getSpecializationLabel(instructor.specialization)}</TableCell>
                      <TableCell>
                        {instructor.years_experience} {instructor.years_experience === 1 ? "year" : "years"}
                      </TableCell>
                      <TableCell>{getRatingStars(instructor.rating)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditDialog(instructor)}>
                              <Pencil className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openDeleteDialog(instructor)} className="text-red-600">
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
                      No instructors found
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
            <DialogTitle>Edit Instructor</DialogTitle>
            <DialogDescription>Update instructor information and specialization.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 gap-3">
              <Label htmlFor="edit-name">Full Name</Label>
              <Input id="edit-name" name="name" value={formData.name} onChange={handleInputChange} />
            </div>
            <div className="grid grid-cols-1 gap-3">
              <Label htmlFor="edit-email">Email</Label>
              <Input id="edit-email" name="email" type="email" value={formData.email} onChange={handleInputChange} />
            </div>
            <div className="grid grid-cols-1 gap-3">
              <Label htmlFor="edit-phone">Phone Number</Label>
              <Input id="edit-phone" name="phone" value={formData.phone} onChange={handleInputChange} />
            </div>
            <div className="grid grid-cols-1 gap-3">
              <Label htmlFor="edit-password">Password (leave blank to keep unchanged)</Label>
              <Input
                id="edit-password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Set new password"
              />
            </div>
            <div className="grid grid-cols-1 gap-3">
              <Label htmlFor="edit-specialization">Specialization</Label>
              <Select
                value={formData.specialization}
                onValueChange={(value) => handleSelectChange("specialization", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select specialization" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General Driving</SelectItem>
                  <SelectItem value="defensive">Defensive Driving</SelectItem>
                  <SelectItem value="commercial">Commercial Vehicles</SelectItem>
                  <SelectItem value="automatic">Automatic Transmission</SelectItem>
                  <SelectItem value="manual">Manual Transmission</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 gap-3">
              <Label htmlFor="edit-years_experience">Years of Experience</Label>
              <Select
                value={formData.years_experience}
                onValueChange={(value) => handleSelectChange("years_experience", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select years" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20].map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year} {year === 1 ? "year" : "years"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button className="gradient-blue text-white" onClick={handleEditInstructor} disabled={processingAction}>
              {processingAction ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating...
                </>
              ) : (
                "Update Instructor"
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
              Are you sure you want to delete this instructor? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {selectedInstructor && (
              <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                <p className="font-medium text-gray-800">{selectedInstructor.name}</p>
                <p className="text-sm text-gray-600">{selectedInstructor.email}</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteInstructor} disabled={processingAction}>
              {processingAction ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...
                </>
              ) : (
                "Delete Instructor"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Toaster />
    </div>
  )
}
