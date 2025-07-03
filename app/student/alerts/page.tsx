"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, CheckCircle, Info, Clock } from "lucide-react"

interface Alert {
  id: number
  type: "info" | "warning" | "success" | "urgent"
  title: string
  message: string
  date: string
  read: boolean
}

export default function StudentAlerts() {
  const [alerts] = useState<Alert[]>([
    {
      id: 1,
      type: "success",
      title: "Lesson Completed",
      message: "Great job! You successfully completed your parallel parking lesson.",
      date: "2024-01-15",
      read: false,
    },
    {
      id: 2,
      type: "info",
      title: "Upcoming Lesson Reminder",
      message: "You have a driving lesson scheduled for tomorrow at 2:00 PM with instructor John Smith.",
      date: "2024-01-14",
      read: false,
    },
    {
      id: 3,
      type: "warning",
      title: "Weather Alert",
      message: "Heavy rain expected tomorrow. Your lesson may be rescheduled for safety reasons.",
      date: "2024-01-13",
      read: true,
    },
    {
      id: 4,
      type: "urgent",
      title: "Payment Due",
      message: "Your payment of $150 is due in 3 days. Please make payment to avoid service interruption.",
      date: "2024-01-12",
      read: true,
    },
  ])

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case "urgent":
        return <AlertTriangle className="h-5 w-5 text-red-500" />
      default:
        return <Info className="h-5 w-5 text-blue-500" />
    }
  }

  const getAlertBadge = (type: string) => {
    const badgeConfig = {
      success: { color: "bg-green-100 text-green-800", label: "Success" },
      warning: { color: "bg-yellow-100 text-yellow-800", label: "Warning" },
      urgent: { color: "bg-red-100 text-red-800", label: "Urgent" },
      info: { color: "bg-blue-100 text-blue-800", label: "Info" },
    }
    const config = badgeConfig[type as keyof typeof badgeConfig] || badgeConfig.info
    return <Badge className={config.color}>{config.label}</Badge>
  }

  const unreadCount = alerts.filter((alert) => !alert.read).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Alerts & Notifications</h1>
          <p className="text-gray-600">Stay updated with important information</p>
        </div>
        {unreadCount > 0 && <Badge className="bg-red-100 text-red-800">{unreadCount} unread</Badge>}
      </div>

      {/* Alert Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600">Total Alerts</p>
                <p className="text-2xl font-bold text-blue-800">{alerts.length}</p>
              </div>
              <Info className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-green-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600">Success</p>
                <p className="text-2xl font-bold text-green-800">{alerts.filter((a) => a.type === "success").length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-600">Warnings</p>
                <p className="text-2xl font-bold text-yellow-800">
                  {alerts.filter((a) => a.type === "warning").length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-red-50 to-red-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600">Urgent</p>
                <p className="text-2xl font-bold text-red-800">{alerts.filter((a) => a.type === "urgent").length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {alerts.map((alert) => (
          <Card
            key={alert.id}
            className={`${!alert.read ? "border-l-4 border-l-blue-500 bg-blue-50/30" : ""} hover:shadow-md transition-shadow`}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  {getAlertIcon(alert.type)}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-lg">{alert.title}</h3>
                      <div className="flex items-center space-x-2">
                        {getAlertBadge(alert.type)}
                        {!alert.read && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                      </div>
                    </div>
                    <p className="text-gray-700 mb-2">{alert.message}</p>
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="h-4 w-4 mr-1" />
                      {new Date(alert.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {alerts.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Info className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No alerts</h3>
            <p className="text-gray-500">You're all caught up! New alerts will appear here.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
