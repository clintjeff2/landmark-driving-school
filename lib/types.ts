export type UserRole = "admin" | "student" | "instructor" | "accountant"

export interface User {
  id: string
  role: UserRole
  name: string
  email: string
  phone?: string
  created_at?: string
}

export interface Student {
  user_id: string
  slot_preference: "morning" | "afternoon" | "evening" | "weekend"
  status: "pending" | "active" | "inactive" | "graduated"
  created_at?: string
}

export interface Schedule {
  id: number
  date: string
  time_slot: string
  instructor_id?: string
  student_id?: string
  vehicle_id?: string
  status: "scheduled" | "completed" | "cancelled"
  created_at?: string
}

export interface Payment {
  id: number
  student_id: string
  amount: number
  status: "pending" | "paid" | "overdue" | "refunded"
  method?: string
  created_at?: string
}

export interface Feedback {
  id: number
  student_id: string
  instructor_id: string
  schedule_id?: number
  rating: number
  comment?: string
  created_at?: string
}
