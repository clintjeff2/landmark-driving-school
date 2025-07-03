"use client"

import { useEffect, useState } from "react"
import { getSupabaseClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Play, Clock, BookOpen, AlertCircle } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import Link from "next/link"

interface Video {
  id: string
  title: string
  description: string
  video_url: string
  thumbnail_url: string
  duration: number
  category: string
  created_at: string
}

export default function StudentLearning() {
  const { user } = useAuth()
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = getSupabaseClient()

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const { data, error } = await supabase
          .from("videos")
          .select("*")
          .eq("is_active", true)
          .order("created_at", { ascending: false })

        if (error) throw error
        setVideos(data || [])
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchVideos()
  }, [supabase])

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      basics: "bg-blue-100 text-blue-800",
      "traffic-rules": "bg-green-100 text-green-800",
      parking: "bg-yellow-100 text-yellow-800",
      safety: "bg-red-100 text-red-800",
      general: "bg-gray-100 text-gray-800",
    }
    return colors[category as keyof typeof colors] || colors.general
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600">Loading learning materials...</p>
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
          <h1 className="text-3xl font-bold">E-Learning Hub</h1>
          <p className="text-gray-600">Learn driving theory and techniques through our video library</p>
        </div>
      </div>

      {/* Progress Overview */}
      <Card className="bg-gradient-to-r from-purple-50 to-purple-100">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-purple-800">Your Progress</h3>
              <p className="text-purple-600">8 of 12 modules completed</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-purple-800">65%</div>
              <div className="w-32 bg-purple-200 rounded-full h-2 mt-2">
                <div className="bg-purple-600 h-2 rounded-full" style={{ width: "65%" }}></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Video Library */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.length > 0 ? (
          videos.map((video) => (
            <Card key={video.id} className="hover:shadow-lg transition-shadow group">
              <div className="relative">
                <div className="aspect-video bg-gray-200 rounded-t-lg overflow-hidden">
                  {video.thumbnail_url ? (
                    <img
                      src={video.thumbnail_url || "/placeholder.svg"}
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200">
                      <BookOpen className="h-12 w-12 text-blue-500" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                    <Link href={`/student/learning/video/${video.id}`}>
                      <Button
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity bg-white text-black hover:bg-gray-100"
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Play
                      </Button>
                    </Link>
                  </div>
                </div>
                {video.duration && (
                  <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                    <Clock className="h-3 w-3 inline mr-1" />
                    {formatDuration(video.duration)}
                  </div>
                )}
              </div>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-lg line-clamp-2">{video.title}</h3>
                  <Badge className={getCategoryColor(video.category)}>{video.category.replace("-", " ")}</Badge>
                </div>
                <p className="text-gray-600 text-sm line-clamp-3 mb-4">{video.description}</p>
                <Link href={`/student/learning/video/${video.id}`}>
                  <Button className="w-full gradient-blue text-white">
                    <Play className="h-4 w-4 mr-2" />
                    Watch Video
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full">
            <Card>
              <CardContent className="p-12 text-center">
                <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No videos available</h3>
                <p className="text-gray-500">Learning materials will be added soon</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
