// 'use client';

// import type React from 'react';
// import { useState, useEffect } from 'react';
// import Link from 'next/link';
// import { useRouter } from 'next/navigation';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import {
// 	Card,
// 	CardContent,
// 	CardDescription,
// 	CardFooter,
// 	CardHeader,
// 	CardTitle,
// } from '@/components/ui/card';
// import { Alert, AlertDescription } from '@/components/ui/alert';
// import { Car, Eye, EyeOff } from 'lucide-react';
// import { useAuth } from '@/components/auth-provider';

// export default function LoginPage() {
// 	const [email, setEmail] = useState('');
// 	const [password, setPassword] = useState('');
// 	const [showPassword, setShowPassword] = useState(false);
// 	const [loading, setLoading] = useState(false);
// 	const [error, setError] = useState<string | null>(null);

// 	const router = useRouter();
// 	const { signIn, user, loading: authLoading } = useAuth();

// 	// Handle navigation when user data is available
// 	useEffect(() => {
// 		console.log('useEffect triggered:', { user, authLoading });

// 		if (user !== null && user.role !== undefined) {
// 			console.log('Navigating for user role:', user.role);

// 			setTimeout(() => {
// 				// Navigate based on role
// 				switch (user.role) {
// 					case 'admin':
// 						console.log('Navigating to admin dashboard');
// 						router.push('/admin/dashboard');
// 						break;
// 					case 'student':
// 						console.log('Navigating to student dashboard');
// 						// Try both methods
// 						router.push('/student/dashboard');
// 						// Alternative: window.location.href = '/student/dashboard';
// 						break;
// 					case 'instructor':
// 						console.log('Navigating to instructor dashboard');
// 						router.push('/instructor/dashboard');
// 						break;
// 					case 'accountant':
// 						console.log('Navigating to accountant dashboard');
// 						router.push('/accountant/dashboard');
// 						break;
// 					default:
// 						console.log('Navigating to default route');
// 						router.push('/');
// 				}
// 			}, 100);
// 		}
// 	}, [user?.role, authLoading]);

// 	const handleLogin = async (e: React.FormEvent) => {
// 		e.preventDefault();

// 		if (loading) return; // Prevent multiple submissions

// 		setLoading(true);
// 		setError(null);

// 		try {
// 			console.log('Attempting login for:', email);

// 			// Remove the premature redirect - let the auth flow handle it
// 			// router.push('/student/dashboard'); // <-- Remove this line

// 			await signIn(email, password);

// 			// Don't set loading to false here - let the useEffect handle navigation
// 			// The loading state will be managed by the auth context
// 		} catch (err: any) {
// 			console.error('Login error:', err);
// 			setError(err.message || 'An error occurred during login');
// 		} finally {
// 			setLoading(false);
// 		}
// 	};

// 	// Show loading state while auth is being processed
// 	if (authLoading && user) {
// 		return (
// 			<div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gold-50 flex items-center justify-center p-4">
// 				<div className="text-center space-y-4">
// 					<div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
// 					<p className="text-gray-600">Redirecting to your dashboard...</p>
// 				</div>
// 			</div>
// 		);
// 	}

// 	return (
// 		<div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gold-50 flex items-center justify-center p-4">
// 			<div className="w-full max-w-md">
// 				<Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
// 					<CardHeader className="space-y-4 text-center pb-8">
// 						<div className="flex justify-center">
// 							<div className="p-4 rounded-2xl gradient-blue-gold shadow-lg">
// 								<Car className="h-8 w-8 text-white" />
// 							</div>
// 						</div>
// 						<div className="space-y-2">
// 							<CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
// 								Welcome Back
// 							</CardTitle>
// 							<CardDescription className="text-gray-600 text-lg">
// 								Sign in to access your dashboard
// 							</CardDescription>
// 						</div>
// 					</CardHeader>

// 					<CardContent className="space-y-6">
// 						{error && (
// 							<Alert variant="destructive" className="border-red-200 bg-red-50">
// 								<AlertDescription className="text-red-700">
// 									{error}
// 								</AlertDescription>
// 							</Alert>
// 						)}

// 						<form onSubmit={handleLogin} className="space-y-6">
// 							<div className="space-y-2">
// 								<Label htmlFor="email" className="text-gray-700 font-medium">
// 									Email Address
// 								</Label>
// 								<Input
// 									id="email"
// 									type="email"
// 									placeholder="name@example.com"
// 									value={email}
// 									onChange={(e) => setEmail(e.target.value)}
// 									className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
// 									required
// 									disabled={loading}
// 								/>
// 							</div>

// 							<div className="space-y-2">
// 								<div className="flex items-center justify-between">
// 									<Label
// 										htmlFor="password"
// 										className="text-gray-700 font-medium"
// 									>
// 										Password
// 									</Label>
// 									<Link
// 										href="/forgot-password"
// 										className="text-sm text-blue-600 hover:text-blue-800 font-medium"
// 									>
// 										Forgot password?
// 									</Link>
// 								</div>
// 								<div className="relative">
// 									<Input
// 										id="password"
// 										type={showPassword ? 'text' : 'password'}
// 										value={password}
// 										onChange={(e) => setPassword(e.target.value)}
// 										className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 pr-12"
// 										required
// 										disabled={loading}
// 									/>
// 									<button
// 										type="button"
// 										onClick={() => setShowPassword(!showPassword)}
// 										className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
// 										disabled={loading}
// 									>
// 										{showPassword ? (
// 											<EyeOff className="h-5 w-5" />
// 										) : (
// 											<Eye className="h-5 w-5" />
// 										)}
// 									</button>
// 								</div>
// 							</div>

// 							<Button
// 								type="submit"
// 								className="w-full h-12 gradient-blue text-white hover:opacity-90 btn-animate text-lg font-semibold"
// 								disabled={loading || authLoading}
// 							>
// 								{loading ? (
// 									<div className="flex items-center gap-2">
// 										<div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
// 										Signing in...
// 									</div>
// 								) : (
// 									'Sign In'
// 								)}
// 							</Button>
// 						</form>

// 						{/* Test Accounts Info */}
// 						<div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-gold-50 rounded-xl border border-blue-100">
// 							<p className="text-sm font-semibold text-gray-800 mb-3">
// 								Demo Accounts:
// 							</p>
// 							<div className="grid grid-cols-2 gap-3 text-xs">
// 								<div className="space-y-1">
// 									<p className="font-medium text-blue-700">Admin:</p>
// 									<p className="text-gray-600">admin@landmark.com</p>
// 									<p className="font-medium text-blue-700">Student:</p>
// 									<p className="text-gray-600">alex@example.com</p>
// 								</div>
// 								<div className="space-y-1">
// 									<p className="font-medium text-blue-700">Instructor:</p>
// 									<p className="text-gray-600">john@landmark.com</p>
// 									<p className="font-medium text-blue-700">Accountant:</p>
// 									<p className="text-gray-600">emma@landmark.com</p>
// 								</div>
// 							</div>
// 							<p className="text-xs text-gray-500 mt-3 font-medium">
// 								Password: password123
// 							</p>
// 						</div>
// 					</CardContent>

// 					<CardFooter className="pt-6">
// 						<div className="w-full text-center">
// 							<p className="text-gray-600">
// 								Don't have an account?{' '}
// 								<Link
// 									href="/register"
// 									className="text-blue-600 hover:text-blue-800 font-semibold"
// 								>
// 									Register here
// 								</Link>
// 							</p>
// 						</div>
// 					</CardFooter>
// 				</Card>
// 			</div>
// 		</div>
// 	);
// }

'use client';

import type React from 'react';
import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Car, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/components/auth-provider';

export default function LoginPage() {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [showPassword, setShowPassword] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const { signIn, loading: authLoading } = useAuth();

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault();

		if (loading) return;

		setLoading(true);
		setError(null);

		try {
			console.log('Attempting login for:', email);
			await signIn(email, password);

			// Don't handle navigation here - let middleware handle it
			// The page will automatically redirect via middleware
		} catch (err: any) {
			console.error('Login error:', err);
			setError(err.message || 'An error occurred during login');
		}finally{
			setLoading(false);

		}
	};

	// Show loading state while auth is being processed
	// if (authLoading) {
	// 	return (
	// 		<div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gold-50 flex items-center justify-center p-4">
	// 			<div className="text-center space-y-4">
	// 				<div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
	// 				<p className="text-gray-600">Redirecting to your dashboard...</p>
	// 			</div>
	// 		</div>
	// 	);
	// }

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gold-50 flex items-center justify-center p-4">
			<div className="w-full max-w-md">
				<Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
					<CardHeader className="space-y-4 text-center pb-8">
						<div className="flex justify-center">
							<div className="p-4 rounded-2xl gradient-blue-gold shadow-lg">
								<Car className="h-8 w-8 text-white" />
							</div>
						</div>
						<div className="space-y-2">
							<CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
								Welcome Back
							</CardTitle>
							<CardDescription className="text-gray-600 text-lg">
								Sign in to access your dashboard
							</CardDescription>
						</div>
					</CardHeader>

					<CardContent className="space-y-6">
						{error && (
							<Alert variant="destructive" className="border-red-200 bg-red-50">
								<AlertDescription className="text-red-700">
									{error}
								</AlertDescription>
							</Alert>
						)}

						<form onSubmit={handleLogin} className="space-y-6">
							<div className="space-y-2">
								<Label htmlFor="email" className="text-gray-700 font-medium">
									Email Address
								</Label>
								<Input
									id="email"
									type="email"
									placeholder="name@example.com"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
									required
									disabled={loading}
								/>
							</div>

							<div className="space-y-2">
								<div className="flex items-center justify-between">
									<Label
										htmlFor="password"
										className="text-gray-700 font-medium"
									>
										Password
									</Label>
									<Link
										href="/forgot-password"
										className="text-sm text-blue-600 hover:text-blue-800 font-medium"
									>
										Forgot password?
									</Link>
								</div>
								<div className="relative">
									<Input
										id="password"
										type={showPassword ? 'text' : 'password'}
										value={password}
										onChange={(e) => setPassword(e.target.value)}
										className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 pr-12"
										required
										disabled={loading}
									/>
									<button
										type="button"
										onClick={() => setShowPassword(!showPassword)}
										className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
										disabled={loading}
									>
										{showPassword ? (
											<EyeOff className="h-5 w-5" />
										) : (
											<Eye className="h-5 w-5" />
										)}
									</button>
								</div>
							</div>

							<Button
								type="submit"
								className="w-full h-12 gradient-blue text-white hover:opacity-90 btn-animate text-lg font-semibold"
								disabled={loading || authLoading}
							>
								{loading ? (
									<div className="flex items-center gap-2">
										<div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
										Signing in...
									</div>
								) : (
									'Sign In'
								)}
							</Button>
						</form>

						{/* Test Accounts Info */}
						<div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-gold-50 rounded-xl border border-blue-100">
							<p className="text-sm font-semibold text-gray-800 mb-3">
								Demo Accounts:
							</p>
							<div className="grid grid-cols-2 gap-3 text-xs">
								<div className="space-y-1">
									<p className="font-medium text-blue-700">Admin:</p>
									<p className="text-gray-600">admin@landmark.com</p>
									<p className="font-medium text-blue-700">Student:</p>
									<p className="text-gray-600">alex@example.com</p>
								</div>
								<div className="space-y-1">
									<p className="font-medium text-blue-700">Instructor:</p>
									<p className="text-gray-600">john@landmark.com</p>
									<p className="font-medium text-blue-700">Accountant:</p>
									<p className="text-gray-600">emma@landmark.com</p>
								</div>
							</div>
							<p className="text-xs text-gray-500 mt-3 font-medium">
								Password: password123
							</p>
						</div>
					</CardContent>

					<CardFooter className="pt-6">
						<div className="w-full text-center">
							<p className="text-gray-600">
								Don't have an account?{' '}
								<Link
									href="/register"
									className="text-blue-600 hover:text-blue-800 font-semibold"
								>
									Register here
								</Link>
							</p>
						</div>
					</CardFooter>
				</Card>
			</div>
		</div>
	);
}
