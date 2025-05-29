"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { getSupabaseClient } from "@/lib/supabase/client"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Save, Settings, Bell, Clock, DollarSign } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface SystemSettings {
  school_name: string
  school_email: string
  school_phone: string
  school_address: string
  lesson_duration: number
  max_students_per_instructor: number
  booking_advance_days: number
  cancellation_hours: number
  default_lesson_price: number
  late_fee: number
  email_notifications: boolean
  sms_notifications: boolean
  auto_confirm_bookings: boolean
  require_payment_upfront: boolean
}

export default function AdminSettingsPage() {
  const { user } = useAuth()
  const supabase = getSupabaseClient()
  const [settings, setSettings] = useState<SystemSettings>({
    school_name: "Landmark Driving School",
    school_email: "info@landmarkdriving.com",
    school_phone: "(555) 123-4567",
    school_address: "123 Main St, City, State 12345",
    lesson_duration: 60,
    max_students_per_instructor: 8,
    booking_advance_days: 30,
    cancellation_hours: 24,
    default_lesson_price: 75,
    late_fee: 25,
    email_notifications: true,
    sms_notifications: false,
    auto_confirm_bookings: false,
    require_payment_upfront: true,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase.from("system_settings").select("*").single()

      if (error && error.code !== "PGRST116") {
        throw error
      }

      if (data) {
        setSettings(data)
      }
    } catch (err: any) {
      setError(err.message)
      toast({
        title: "Error",
        description: "Failed to fetch settings",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setSettings((prev) => ({ ...prev, [name]: value }))
  }

  const handleNumberChange = (name: string, value: string) => {
    setSettings((prev) => ({ ...prev, [name]: Number.parseFloat(value) || 0 }))
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    setSettings((prev) => ({ ...prev, [name]: checked }))
  }

  const handleSaveSettings = async () => {
    try {
      setSaving(true)

      const { error } = await supabase.from("system_settings").upsert(settings, { onConflict: "id" })

      if (error) throw error

      toast({
        title: "Success",
        description: "Settings saved successfully",
      })
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to save settings",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">System Settings</h1>
        <Button onClick={handleSaveSettings} disabled={saving} className="gradient-blue text-white">
          {saving ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" /> Save Settings
            </>
          )}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        {/* School Information */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 rounded-lg gradient-blue">
                <Settings className="h-5 w-5 text-white" />
              </div>
              School Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="school_name">School Name</Label>
              <Input id="school_name" name="school_name" value={settings.school_name} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="school_email">Email Address</Label>
              <Input
                id="school_email"
                name="school_email"
                type="email"
                value={settings.school_email}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="school_phone">Phone Number</Label>
              <Input id="school_phone" name="school_phone" value={settings.school_phone} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="school_address">Address</Label>
              <Textarea
                id="school_address"
                name="school_address"
                value={settings.school_address}
                onChange={handleInputChange}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Lesson Settings */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 rounded-lg gradient-gold">
                <Clock className="h-5 w-5 text-white" />
              </div>
              Lesson Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="lesson_duration">Lesson Duration (minutes)</Label>
              <Select
                value={settings.lesson_duration.toString()}
                onValueChange={(value) => handleNumberChange("lesson_duration", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="45">45 minutes</SelectItem>
                  <SelectItem value="60">60 minutes</SelectItem>
                  <SelectItem value="90">90 minutes</SelectItem>
                  <SelectItem value="120">120 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="max_students_per_instructor">Max Students per Instructor</Label>
              <Input
                id="max_students_per_instructor"
                type="number"
                value={settings.max_students_per_instructor}
                onChange={(e) => handleNumberChange("max_students_per_instructor", e.target.value)}
                min="1"
                max="20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="booking_advance_days">Booking Advance Days</Label>
              <Input
                id="booking_advance_days"
                type="number"
                value={settings.booking_advance_days}
                onChange={(e) => handleNumberChange("booking_advance_days", e.target.value)}
                min="1"
                max="90"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cancellation_hours">Cancellation Notice (hours)</Label>
              <Input
                id="cancellation_hours"
                type="number"
                value={settings.cancellation_hours}
                onChange={(e) => handleNumberChange("cancellation_hours", e.target.value)}
                min="1"
                max="168"
              />
            </div>
          </CardContent>
        </Card>

        {/* Pricing Settings */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-r from-green-500 to-green-600">
                <DollarSign className="h-5 w-5 text-white" />
              </div>
              Pricing Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="default_lesson_price">Default Lesson Price ($)</Label>
              <Input
                id="default_lesson_price"
                type="number"
                step="0.01"
                value={settings.default_lesson_price}
                onChange={(e) => handleNumberChange("default_lesson_price", e.target.value)}
                min="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="late_fee">Late Cancellation Fee ($)</Label>
              <Input
                id="late_fee"
                type="number"
                step="0.01"
                value={settings.late_fee}
                onChange={(e) => handleNumberChange("late_fee", e.target.value)}
                min="0"
              />
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600">
                <Bell className="h-5 w-5 text-white" />
              </div>
              Notification Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Notifications</Label>
                <p className="text-sm text-gray-500">Send email notifications to users</p>
              </div>
              <Switch
                checked={settings.email_notifications}
                onCheckedChange={(checked) => handleSwitchChange("email_notifications", checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>SMS Notifications</Label>
                <p className="text-sm text-gray-500">Send SMS notifications to users</p>
              </div>
              <Switch
                checked={settings.sms_notifications}
                onCheckedChange={(checked) => handleSwitchChange("sms_notifications", checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto-confirm Bookings</Label>
                <p className="text-sm text-gray-500">Automatically confirm lesson bookings</p>
              </div>
              <Switch
                checked={settings.auto_confirm_bookings}
                onCheckedChange={(checked) => handleSwitchChange("auto_confirm_bookings", checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Require Payment Upfront</Label>
                <p className="text-sm text-gray-500">Require payment before lesson confirmation</p>
              </div>
              <Switch
                checked={settings.require_payment_upfront}
                onCheckedChange={(checked) => handleSwitchChange("require_payment_upfront", checked)}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Toaster />
    </div>
  )
}
