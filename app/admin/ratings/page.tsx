"use client"

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
} from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Search, Star, MessageSquare } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Rating {
  id: number
  student_name: string
  instructor_name: string
  rating: number
  comment: string
  created_at: string
}

export default function RatingsPage() {
  const { user } = useAuth()
  const supabase = getSupabaseClient()
  const [ratings, setRatings] = useState<Rating[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [selectedRating, setSelectedRating] = useState<Rating | null>(null)

  useEffect(() => {
    fetchRatings()
  }, [])

  const fetchRatings = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("feedback")
        .select(`
          id,
          rating,
          comment,
          created_at,
          users!student_id(name),
          users!instructor_id(name)
        `)
        .order("created_at", { ascending: false })

      if (error) throw error

      // Transform the data to flatten the structure
      const transformedData = data.map((feedback) => ({
        id: feedback.id,
        student_name: feedback.users?.name || "Unknown Student",
        instructor_name: feedback.users?.name || "Unknown Instructor",
        rating: feedback.rating,
        comment: feedback.comment || "",
        created_at: feedback.created_at,
      }))

      setRatings(transformedData)
    } catch (err: any) {
      setError(err.message)
      toast({
        title: "Error",
        description: "Failed to fetch ratings data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const viewRatingDetails = (rating: Rating) => {
    setSelectedRating(rating)
    setIsViewDialogOpen(true)
  }

  const filteredRatings = ratings.filter(
    (rating) =>
      rating.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rating.instructor_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rating.comment.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const getRatingStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className={`h-4 w-4 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
        ))}
        <span className="ml-2 text-sm font-medium">{rating.toFixed(1)}</span>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600">Loading ratings data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Instructor Ratings</h1>
      </div>

      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle>All Ratings & Feedback</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-6">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search ratings..."
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
                  <TableHead>Student</TableHead>
                  <TableHead>Instructor</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Comment</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRatings.length > 0 ? (
                  filteredRatings.map((rating) => (
                    <TableRow key={rating.id}>
                      <TableCell className="font-medium">{rating.student_name}</TableCell>
                      <TableCell>{rating.instructor_name}</TableCell>
                      <TableCell>{getRatingStars(rating.rating)}</TableCell>
                      <TableCell>
                        {rating.comment ? (
                          <div className="max-w-xs truncate">{rating.comment}</div>
                        ) : (
                          <span className="text-gray-400">No comment</span>
                        )}
                      </TableCell>
                      <TableCell>{new Date(rating.created_at).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => viewRatingDetails(rating)}
                          className="hover:bg-blue-50"
                        >
                          <MessageSquare className="h-4 w-4 mr-1" /> View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6 text-gray-500">
                      No ratings found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* View Rating Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Rating Details</DialogTitle>
            <DialogDescription>Detailed feedback from student to instructor</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {selectedRating && (
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-blue-50 border border-blue-100">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-blue-600">Student</p>
                      <p className="font-medium text-gray-800">{selectedRating.student_name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-blue-600">Date</p>
                      <p className="font-medium text-gray-800">
                        {new Date(selectedRating.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">Instructor</p>
                  <p className="font-medium text-gray-800">{selectedRating.instructor_name}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">Rating</p>
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${i < selectedRating.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                      />
                    ))}
                    <span className="ml-2 font-medium">{selectedRating.rating.toFixed(1)}</span>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">Comment</p>
                  <div className="p-4 rounded-lg bg-gray-50 border border-gray-200 min-h-[100px]">
                    {selectedRating.comment || <span className="text-gray-400">No comment provided</span>}
                  </div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setIsViewDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Toaster />
    </div>
  )
}
