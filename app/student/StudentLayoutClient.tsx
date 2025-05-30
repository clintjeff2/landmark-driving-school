// app/student/StudentLayoutClient.tsx
'use client';

import type React from 'react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
	Car,
	Calendar,
	CreditCard,
	BookOpen,
	Award,
	Bell,
	AlertTriangle,
	FileText,
	LogOut,
	Menu,
} from 'lucide-react';
import { useAuth } from '@/components/auth-provider';
import { useState } from 'react';

export default function StudentLayoutClient({
	children,
}: {
	children: React.ReactNode;
}) {
	const pathname = usePathname();
	const { signOut, user } = useAuth();
	const [sidebarOpen, setSidebarOpen] = useState(false);

	const navigation = [
		{
			name: 'Dashboard',
			href: '/student/dashboard',
			icon: <Car className="h-5 w-5" />,
			color: 'blue',
		},
		{
			name: 'Schedule',
			href: '/student/schedule',
			icon: <Calendar className="h-5 w-5" />,
			color: 'green',
		},
		{
			name: 'Payments',
			href: '/student/payments',
			icon: <CreditCard className="h-5 w-5" />,
			color: 'gold',
		},
		{
			name: 'Learning',
			href: '/student/learning',
			icon: <BookOpen className="h-5 w-5" />,
			color: 'purple',
		},
		{
			name: 'Rewards',
			href: '/student/rewards',
			icon: <Award className="h-5 w-5" />,
			color: 'gold',
		},
		{
			name: 'Alerts',
			href: '/student/alerts',
			icon: <AlertTriangle className="h-5 w-5" />,
			color: 'orange',
		},
		{
			name: 'Documents',
			href: '/student/admission',
			icon: <FileText className="h-5 w-5" />,
			color: 'indigo',
		},
	];

	console.log(user, 'IN THIS FILE HERE');
	if (!user || user === null) {
		return <div>Loading...</div>; // or return null
	}

	const getNavItemClass = (item: any, isActive: boolean) => {
		const baseClass =
			'w-full justify-start transition-all duration-200 font-medium';
		if (isActive) {
			return `${baseClass} gradient-blue text-white shadow-lg`;
		}
		return `${baseClass} text-gray-700 hover:bg-blue-50 hover:text-blue-700`;
	};

	return (
		<div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-50 to-blue-50">
			{/* Header */}
			<header className="sticky top-0 z-50 w-full border-b border-blue-100 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 shadow-sm">
				<div className="container flex h-16 items-center justify-between">
					<div className="flex items-center gap-4">
						<Button
							variant="ghost"
							size="icon"
							className="md:hidden"
							onClick={() => setSidebarOpen(!sidebarOpen)}
						>
							<Menu className="h-5 w-5" />
						</Button>
						<Link
							href="/student/dashboard"
							className="flex items-center gap-3 font-bold"
						>
							<div className="p-2 rounded-lg gradient-blue">
								<Car className="h-5 w-5 text-white" />
							</div>
							<span className="text-xl bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
								Landmark Driving School
							</span>
						</Link>
					</div>

					<nav className="hidden md:flex gap-6">
						{navigation.map((item) => (
							<Link
								key={item.name}
								href={item.href}
								className={`text-sm font-medium transition-colors ${
									pathname === item.href
										? 'text-blue-600'
										: 'text-gray-700 hover:text-blue-600'
								}`}
							>
								{item.name}
							</Link>
						))}
					</nav>

					<div className="flex items-center gap-4">
						<Link href="/student/notifications">
							<Button
								variant="ghost"
								size="icon"
								className="relative hover:bg-blue-50"
							>
								<Bell className="h-5 w-5 text-gray-600" />
								<span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
							</Button>
						</Link>
						<div className="hidden md:flex items-center gap-3">
							<div className="text-right">
								<p className="text-sm font-medium text-gray-800">
									{user?.name}
								</p>
								<p className="text-xs text-gray-500">Student</p>
							</div>
							<div className="w-8 h-8 rounded-full gradient-blue flex items-center justify-center">
								<span className="text-white text-sm font-semibold">
									{user?.name?.charAt(0) || 'S'}
								</span>
							</div>
						</div>
						<Button
							variant="outline"
							onClick={() => signOut()}
							className="border-red-200 text-red-600 hover:bg-red-50 btn-animate"
						>
							<LogOut className="h-4 w-4 mr-2" />
							Logout
						</Button>
					</div>
				</div>
			</header>

			<div className="flex flex-1">
				{/* Sidebar */}
				<aside
					className={`${
						sidebarOpen ? 'translate-x-0' : '-translate-x-full'
					} md:translate-x-0 fixed md:static inset-y-0 left-0 z-40 w-64 bg-white/80 backdrop-blur border-r border-blue-100 transition-transform duration-300 ease-in-out md:flex flex-col shadow-lg`}
				>
					<div className="flex flex-col gap-2 p-6 pt-8">
						<div className="mb-4">
							<h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
								Navigation
							</h3>
						</div>
						{navigation.map((item) => (
							<Link key={item.name} href={item.href}>
								<Button
									variant="ghost"
									className={getNavItemClass(item, pathname === item.href)}
									onClick={() => setSidebarOpen(false)}
								>
									<span
										className={`mr-3 ${
											pathname === item.href
												? 'text-white'
												: `text-${item.color}-500`
										}`}
									>
										{item.icon}
									</span>
									{item.name}
								</Button>
							</Link>
						))}

						<div className="mt-8 pt-6 border-t border-gray-200">
							<Button
								variant="ghost"
								className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700 font-medium"
								onClick={() => signOut()}
							>
								<LogOut className="h-5 w-5 mr-3" />
								Logout
							</Button>
						</div>
					</div>
				</aside>

				{/* Overlay for mobile */}
				{sidebarOpen && (
					<div
						className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
						onClick={() => setSidebarOpen(false)}
					/>
				)}

				{/* Main Content */}
				<main className="flex-1 p-6 md:p-8 overflow-auto">{children}</main>
			</div>
		</div>
	);
}
