"use client"

import { useEffect, useState } from "react"
import { getSupabaseClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DollarSign, CreditCard, AlertCircle, ArrowUpRight } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/components/auth-provider"

interface PaymentSummary {
  total: number
  paid: number
  pending: number
  overdue: number
}

interface RecentPayment {
  id: number
  student_name: string
  amount: number
  status: string
  date: string
}

export default function AccountantDashboard() {
  const { user } = useAuth()
  const [paymentSummary, setPaymentSummary] = useState<PaymentSummary>({
    total: 0,
    paid: 0,
    pending: 0,
    overdue: 0,
  })
  const [recentPayments, setRecentPayments] = useState<RecentPayment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = getSupabaseClient()

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return

      try {
        // Get payment summary
        const { data: paymentsData, error: paymentsError } = await supabase.from("payments").select("amount, status")

        if (paymentsError) {
          throw paymentsError
        }

        // Calculate payment summary
        const total = paymentsData?.reduce((sum, payment) => sum + Number(payment.amount), 0) || 0
        const paid =
          paymentsData?.filter((p) => p.status === "paid").reduce((sum, payment) => sum + Number(payment.amount), 0) ||
          0
        const pending =
          paymentsData
            ?.filter((p) => p.status === "pending")
            .reduce((sum, payment) => sum + Number(payment.amount), 0) || 0
        const overdue =
          paymentsData
            ?.filter((p) => p.status === "overdue")
            .reduce((sum, payment) => sum + Number(payment.amount), 0) || 0

        // Get recent payments with student names
        const { data: recentPaymentsData, error: recentPaymentsError } = await supabase
          .from("payments")
          .select(`
            id,
            amount,
            status,
            created_at,
            users!student_id(name)
          `)
          .order("created_at", { ascending: false })
          .limit(5)

        if (recentPaymentsError) {
          throw recentPaymentsError
        }

        // Set state with fetched data
        setPaymentSummary({ total, paid, pending, overdue })
        setRecentPayments(
          recentPaymentsData.map((payment) => ({
            id: payment.id,
            student_name: payment.users?.name || "Unknown",
            amount: Number(payment.amount),
            status: payment.status,
            date: payment.created_at,
          })),
        )
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
        <h1 className="text-3xl font-bold">Accountant Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {user?.name || "Accountant"}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
        {/* Total Revenue */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${paymentSummary.total.toFixed(2)}</div>
            <div className="flex items-center pt-1 text-xs text-green-500">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              <span>+12.5% from last month</span>
            </div>
          </CardContent>
        </Card>

        {/* Paid Payments */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${paymentSummary.paid.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((paymentSummary.paid / (paymentSummary.total || 1)) * 100)}% of total revenue
            </p>
          </CardContent>
        </Card>

        {/* Pending Payments */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${paymentSummary.pending.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((paymentSummary.pending / (paymentSummary.total || 1)) * 100)}% of total revenue
            </p>
          </CardContent>
        </Card>

        {/* Overdue Payments */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${paymentSummary.overdue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((paymentSummary.overdue / (paymentSummary.total || 1)) * 100)}% of total revenue
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-1">
        {/* Recent Payments */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Recent Payments</CardTitle>
            <CardDescription>Latest payment transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentPayments.length > 0 ? (
                recentPayments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between border-b pb-2">
                    <div>
                      <p className="font-medium">{payment.student_name}</p>
                      <p className="text-sm text-muted-foreground">{new Date(payment.date).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${payment.amount.toFixed(2)}</p>
                      <p
                        className={`text-sm ${
                          payment.status === "paid"
                            ? "text-green-500"
                            : payment.status === "pending"
                              ? "text-yellow-500"
                              : "text-red-500"
                        }`}
                      >
                        {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No recent payments</p>
              )}
            </div>
            <Button variant="outline" className="w-full mt-4" asChild>
              <Link href="/accountant/payments">View All Payments</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
