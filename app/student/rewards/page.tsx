"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Award, Gift, Star, Trophy, Target } from "lucide-react"

interface Reward {
  id: number
  title: string
  description: string
  points: number
  type: "badge" | "discount" | "gift"
  earned: boolean
  earnedDate?: string
}

interface Achievement {
  id: number
  title: string
  description: string
  icon: string
  progress: number
  total: number
  completed: boolean
}

export default function StudentRewards() {
  const [currentPoints] = useState(1250)
  const [totalEarned] = useState(2100)

  const [rewards] = useState<Reward[]>([
    {
      id: 1,
      title: "First Lesson Complete",
      description: "Complete your first driving lesson",
      points: 50,
      type: "badge",
      earned: true,
      earnedDate: "2024-01-10",
    },
    {
      id: 2,
      title: "Perfect Parking",
      description: "Master parallel parking on first try",
      points: 100,
      type: "badge",
      earned: true,
      earnedDate: "2024-01-15",
    },
    {
      id: 3,
      title: "10% Lesson Discount",
      description: "Get 10% off your next lesson package",
      points: 500,
      type: "discount",
      earned: false,
    },
    {
      id: 4,
      title: "Driving School Merchandise",
      description: "Free t-shirt and keychain",
      points: 750,
      type: "gift",
      earned: false,
    },
    {
      id: 5,
      title: "Theory Master",
      description: "Complete all theory modules",
      points: 200,
      type: "badge",
      earned: false,
    },
  ])

  const [achievements] = useState<Achievement[]>([
    {
      id: 1,
      title: "Lesson Streak",
      description: "Attend 5 consecutive lessons",
      icon: "🔥",
      progress: 3,
      total: 5,
      completed: false,
    },
    {
      id: 2,
      title: "Theory Expert",
      description: "Complete all video modules",
      icon: "📚",
      progress: 8,
      total: 12,
      completed: false,
    },
    {
      id: 3,
      title: "Early Bird",
      description: "Attend 10 morning lessons",
      icon: "🌅",
      progress: 10,
      total: 10,
      completed: true,
    },
    {
      id: 4,
      title: "Safety First",
      description: "Complete safety course",
      icon: "🛡️",
      progress: 1,
      total: 1,
      completed: true,
    },
  ])

  const getRewardIcon = (type: string) => {
    switch (type) {
      case "badge":
        return <Award className="h-5 w-5" />
      case "discount":
        return <Target className="h-5 w-5" />
      case "gift":
        return <Gift className="h-5 w-5" />
      default:
        return <Star className="h-5 w-5" />
    }
  }

  const getRewardColor = (type: string, earned: boolean) => {
    if (!earned) return "text-gray-400"

    switch (type) {
      case "badge":
        return "text-yellow-500"
      case "discount":
        return "text-blue-500"
      case "gift":
        return "text-green-500"
      default:
        return "text-purple-500"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Rewards & Achievements</h1>
          <p className="text-gray-600">Earn points and unlock rewards for your progress</p>
        </div>
      </div>

      {/* Points Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-r from-gold-50 to-yellow-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-700">Current Points</p>
                <p className="text-3xl font-bold text-yellow-800">{currentPoints}</p>
              </div>
              <Star className="h-10 w-10 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-purple-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-700">Total Earned</p>
                <p className="text-3xl font-bold text-purple-800">{totalEarned}</p>
              </div>
              <Trophy className="h-10 w-10 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-green-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700">Rewards Earned</p>
                <p className="text-3xl font-bold text-green-800">{rewards.filter((r) => r.earned).length}</p>
              </div>
              <Award className="h-10 w-10 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Available Rewards */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Gift className="h-5 w-5 mr-2" />
              Available Rewards
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {rewards.map((reward) => (
                <div
                  key={reward.id}
                  className={`p-4 border rounded-lg ${reward.earned ? "bg-green-50 border-green-200" : "bg-gray-50"}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={getRewardColor(reward.type, reward.earned)}>{getRewardIcon(reward.type)}</div>
                      <div>
                        <h4 className="font-semibold">{reward.title}</h4>
                        <p className="text-sm text-gray-600">{reward.description}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {reward.points} points
                          </Badge>
                          {reward.earned && (
                            <Badge className="bg-green-100 text-green-800 text-xs">
                              Earned {reward.earnedDate && new Date(reward.earnedDate).toLocaleDateString()}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    {reward.earned ? (
                      <Button size="sm" className="bg-green-600 text-white">
                        Claimed
                      </Button>
                    ) : currentPoints >= reward.points ? (
                      <Button size="sm" className="gradient-blue text-white">
                        Claim
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" disabled>
                        {reward.points - currentPoints} more points
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Achievements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Trophy className="h-5 w-5 mr-2" />
              Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className={`p-4 border rounded-lg ${achievement.completed ? "bg-blue-50 border-blue-200" : "bg-gray-50"}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{achievement.icon}</span>
                      <div>
                        <h4 className="font-semibold">{achievement.title}</h4>
                        <p className="text-sm text-gray-600">{achievement.description}</p>
                      </div>
                    </div>
                    {achievement.completed && <Badge className="bg-blue-100 text-blue-800">Completed</Badge>}
                  </div>
                  <div className="mt-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progress</span>
                      <span>
                        {achievement.progress}/{achievement.total}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${achievement.completed ? "bg-blue-600" : "bg-gray-400"}`}
                        style={{ width: `${(achievement.progress / achievement.total) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
