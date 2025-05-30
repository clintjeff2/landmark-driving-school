'use client';

import { useEffect, useState } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
	Calendar,
	CreditCard,
	BookOpen,
	Award,
	AlertTriangle,
	FileText,
	TrendingUp,
	Clock,
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/components/auth-provider';

interface StudentData {
	status: string;
	slot_preference: string;
}

interface ScheduleData {
	id: number;
	date: string;
	time_slot: string;
	instructor_name: string;
}

interface PaymentData {
	status: string;
	amount: number;
}

export default function StudentDashboard() {
	console.log('Seen the STUDENT PAGE');
	const { user } = useAuth();
	console.log(user);
	const [studentData, setStudentData] = useState<StudentData | null>(null);
	const [schedules, setSchedules] = useState<ScheduleData[]>([]);
	const [payments, setPayments] = useState<PaymentData[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const supabase = getSupabaseClient();

	useEffect(() => {
		const fetchData = async () => {
			if (!user) return;

			try {
				// Get student data
				const { data: studentData, error: studentError } = await supabase
					.from('students')
					.select('status, slot_preference')
					.eq('user_id', user.id)
					.single();

				if (studentError) {
					throw studentError;
				}

				// Get upcoming schedules
				const { data: scheduleData, error: scheduleError } = await supabase
					.from('schedules')
					.select(
						`
            id,
            date,
            time_slot,
            users!instructor_id(name)
          `
					)
					.eq('student_id', user.id)
					.gte('date', new Date().toISOString().split('T')[0])
					.order('date', { ascending: true })
					.limit(3);

				if (scheduleError) {
					throw scheduleError;
				}

				// Get payment data
				const { data: paymentData, error: paymentError } = await supabase
					.from('payments')
					.select('status, amount')
					.eq('student_id', user.id)
					.order('created_at', { ascending: false })
					.limit(1);

				if (paymentError) {
					throw paymentError;
				}

				// Set state with fetched data
				setStudentData(studentData);
				setSchedules(
					scheduleData.map((schedule) => ({
						...schedule,
						instructor_name: schedule.users?.name || 'Unassigned',
					}))
				);
				setPayments(paymentData);
			} catch (err: any) {
				setError(err.message || 'An error occurred while fetching data');
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, []);

	if (loading) {
		return (
			<div className="flex items-center justify-center h-full min-h-[400px]">
				<div className="text-center space-y-4">
					<div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
					<p className="text-gray-600">Loading your dashboard...</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex items-center justify-center h-full min-h-[400px]">
				<div className="text-center space-y-4">
					<div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
						<AlertTriangle className="h-8 w-8 text-red-500" />
					</div>
					<p className="text-red-600 font-medium">{error}</p>
				</div>
			</div>
		);
	}

	const getStatusBadge = (status: string) => {
		const statusConfig = {
			active: {
				color: 'bg-green-100 text-green-800 border-green-200',
				label: 'Active',
			},
			pending: {
				color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
				label: 'Pending',
			},
			inactive: {
				color: 'bg-gray-100 text-gray-800 border-gray-200',
				label: 'Inactive',
			},
			graduated: {
				color: 'bg-blue-100 text-blue-800 border-blue-200',
				label: 'Graduated',
			},
		};

		const config =
			statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
		return (
			<Badge className={`${config.color} border font-medium`}>
				{config.label}
			</Badge>
		);
	};

	return (
		<div className="space-y-8">
			{/* Header */}
			<div className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 rounded-2xl p-8 text-white">
				<div className="flex items-center justify-between">
					<div className="space-y-2">
						<h1 className="text-3xl font-bold">
							Welcome back, {user?.name || 'Student'}! 👋
						</h1>
						<p className="text-blue-100 text-lg">
							Your learning journey continues. Let's make today count!
						</p>
					</div>
					<div className="text-right space-y-2">
						<p className="text-blue-100">Status:</p>
						{getStatusBadge(studentData?.status || 'pending')}
					</div>
				</div>
			</div>

			{/* Quick Stats */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
				<Card className="card-hover border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
					<CardContent className="p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-blue-600 text-sm font-medium">Next Lesson</p>
								<p className="text-2xl font-bold text-blue-800">
									{schedules.length > 0 ? 'Today' : 'None'}
								</p>
							</div>
							<Clock className="h-8 w-8 text-blue-500" />
						</div>
					</CardContent>
				</Card>

				<Card className="card-hover border-0 shadow-lg bg-gradient-to-br from-gold-50 to-yellow-100">
					<CardContent className="p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-yellow-700 text-sm font-medium">Progress</p>
								<p className="text-2xl font-bold text-yellow-800">65%</p>
							</div>
							<TrendingUp className="h-8 w-8 text-yellow-600" />
						</div>
					</CardContent>
				</Card>

				<Card className="card-hover border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
					<CardContent className="p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-green-600 text-sm font-medium">Lessons</p>
								<p className="text-2xl font-bold text-green-800">12</p>
							</div>
							<Calendar className="h-8 w-8 text-green-500" />
						</div>
					</CardContent>
				</Card>

				<Card className="card-hover border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
					<CardContent className="p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-purple-600 text-sm font-medium">Points</p>
								<p className="text-2xl font-bold text-purple-800">1,250</p>
							</div>
							<Award className="h-8 w-8 text-purple-500" />
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Main Dashboard Grid */}
			<div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
				{/* Upcoming Lessons */}
				<Card className="card-hover border-0 shadow-lg">
					<CardHeader className="pb-4">
						<CardTitle className="flex items-center gap-3 text-gray-800">
							<div className="p-2 rounded-lg gradient-blue">
								<Calendar className="h-5 w-5 text-white" />
							</div>
							Upcoming Lessons
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						{schedules.length > 0 ? (
							schedules.map((schedule) => (
								<div
									key={schedule.id}
									className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200"
								>
									<div className="flex justify-between items-start">
										<div className="space-y-1">
											<p className="font-semibold text-blue-800">
												{new Date(schedule.date).toLocaleDateString()}
											</p>
											<p className="text-sm text-blue-600">
												{schedule.time_slot}
											</p>
										</div>
										<div className="text-right">
											<p className="text-xs text-blue-600">Instructor</p>
											<p className="text-sm font-medium text-blue-800">
												{schedule.instructor_name}
											</p>
										</div>
									</div>
								</div>
							))
						) : (
							<div className="text-center py-8 text-gray-500">
								<Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
								<p>No upcoming lessons scheduled</p>
							</div>
						)}
						<Button
							asChild
							className="w-full gradient-blue text-white hover:opacity-90 btn-animate"
						>
							<Link href="/student/schedule">View Full Schedule</Link>
						</Button>
					</CardContent>
				</Card>

				{/* Payment Status */}
				<Card className="card-hover border-0 shadow-lg">
					<CardHeader className="pb-4">
						<CardTitle className="flex items-center gap-3 text-gray-800">
							<div className="p-2 rounded-lg gradient-gold">
								<CreditCard className="h-5 w-5 text-white" />
							</div>
							Payment Status
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						{payments.length > 0 ? (
							<div className="p-4 rounded-xl bg-gradient-to-r from-green-50 to-green-100 border border-green-200">
								<div className="flex justify-between items-center mb-2">
									<span className="text-sm text-green-600">Latest Payment</span>
									<span className="text-lg font-bold text-green-800">
										${payments[0].amount}
									</span>
								</div>
								<div className="flex justify-between items-center">
									<span className="text-sm text-green-600">Status</span>
									<Badge
										className={`${
											payments[0].status === 'paid'
												? 'bg-green-100 text-green-800 border-green-200'
												: payments[0].status === 'pending'
												? 'bg-yellow-100 text-yellow-800 border-yellow-200'
												: 'bg-red-100 text-red-800 border-red-200'
										} border font-medium`}
									>
										{payments[0].status.charAt(0).toUpperCase() +
											payments[0].status.slice(1)}
									</Badge>
								</div>
							</div>
						) : (
							<div className="text-center py-8 text-gray-500">
								<CreditCard className="h-12 w-12 mx-auto mb-3 text-gray-300" />
								<p>No payment records found</p>
							</div>
						)}
						<Button
							asChild
							variant="outline"
							className="w-full border-2 border-gold-200 text-gold-700 hover:bg-gold-50 btn-animate"
						>
							<Link href="/student/payments">Manage Payments</Link>
						</Button>
					</CardContent>
				</Card>

				{/* E-Learning Progress */}
				<Card className="card-hover border-0 shadow-lg">
					<CardHeader className="pb-4">
						<CardTitle className="flex items-center gap-3 text-gray-800">
							<div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600">
								<BookOpen className="h-5 w-5 text-white" />
							</div>
							E-Learning Hub
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-3">
							<div className="flex justify-between text-sm">
								<span className="text-gray-600">Course Progress</span>
								<span className="font-medium text-purple-600">65%</span>
							</div>
							<div className="w-full bg-gray-200 rounded-full h-3">
								<div
									className="bg-gradient-to-r from-purple-500 to-purple-600 h-3 rounded-full"
									style={{ width: '65%' }}
								></div>
							</div>
							<p className="text-xs text-gray-500">8 of 12 modules completed</p>
						</div>
						<div className="p-4 rounded-xl bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200">
							<p className="text-sm text-purple-700 font-medium">
								Next: Traffic Signs & Signals
							</p>
							<p className="text-xs text-purple-600 mt-1">
								Estimated time: 25 minutes
							</p>
						</div>
						<Button
							asChild
							className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:opacity-90 btn-animate"
						>
							<Link href="/student/learning">Continue Learning</Link>
						</Button>
					</CardContent>
				</Card>

				{/* Rewards */}
				<Card className="card-hover border-0 shadow-lg">
					<CardHeader className="pb-4">
						<CardTitle className="flex items-center gap-3 text-gray-800">
							<div className="p-2 rounded-lg gradient-gold">
								<Award className="h-5 w-5 text-white" />
							</div>
							Rewards & Points
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="text-center py-4">
							<div className="text-4xl font-bold gradient-gold bg-clip-text text-transparent mb-2">
								1,250
							</div>
							<p className="text-gray-600">Total Points Earned</p>
						</div>
						<div className="space-y-2">
							<div className="flex justify-between text-sm">
								<span className="text-gray-600">Next Reward</span>
								<span className="font-medium text-gold-600">
									250 points away
								</span>
							</div>
							<div className="w-full bg-gray-200 rounded-full h-2">
								<div
									className="gradient-gold h-2 rounded-full"
									style={{ width: '83%' }}
								></div>
							</div>
						</div>
						<Button
							asChild
							variant="outline"
							className="w-full border-2 border-gold-200 text-gold-700 hover:bg-gold-50 btn-animate"
						>
							<Link href="/student/rewards">View Rewards</Link>
						</Button>
					</CardContent>
				</Card>

				{/* Road Alerts */}
				<Card className="card-hover border-0 shadow-lg">
					<CardHeader className="pb-4">
						<CardTitle className="flex items-center gap-3 text-gray-800">
							<div className="p-2 rounded-lg bg-gradient-to-r from-orange-500 to-red-500">
								<AlertTriangle className="h-5 w-5 text-white" />
							</div>
							Road Alerts
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="p-4 rounded-xl bg-gradient-to-r from-green-50 to-green-100 border border-green-200">
							<div className="flex items-center gap-3">
								<div className="w-3 h-3 bg-green-500 rounded-full"></div>
								<div>
									<p className="text-sm font-medium text-green-800">
										All Clear
									</p>
									<p className="text-xs text-green-600">
										Road conditions are excellent today
									</p>
								</div>
							</div>
						</div>
						<p className="text-xs text-gray-500">
							Last updated: Today, 8:00 AM
						</p>
						<Button
							asChild
							variant="outline"
							className="w-full border-2 border-orange-200 text-orange-700 hover:bg-orange-50 btn-animate"
						>
							<Link href="/student/alerts">View All Alerts</Link>
						</Button>
					</CardContent>
				</Card>

				{/* Admission Document */}
				<Card className="card-hover border-0 shadow-lg">
					<CardHeader className="pb-4">
						<CardTitle className="flex items-center gap-3 text-gray-800">
							<div className="p-2 rounded-lg bg-gradient-to-r from-indigo-500 to-indigo-600">
								<FileText className="h-5 w-5 text-white" />
							</div>
							Documents
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="p-4 rounded-xl bg-gradient-to-r from-indigo-50 to-indigo-100 border border-indigo-200">
							<div className="flex items-center gap-3">
								<FileText className="h-8 w-8 text-indigo-600" />
								<div>
									<p className="text-sm font-medium text-indigo-800">
										Admission Certificate
									</p>
									<p className="text-xs text-indigo-600">Ready for download</p>
								</div>
							</div>
						</div>
						<Button
							asChild
							className="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 text-white hover:opacity-90 btn-animate"
						>
							<Link href="/student/admission">Download Document</Link>
						</Button>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
