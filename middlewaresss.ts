import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

export async function middleware(req: NextRequest) {
	const res = NextResponse.next();
	const supabase = createMiddlewareClient({ req, res });

	try {
		// Refresh the session if it exists
		const {
			data: { session },
			error: sessionError,
		} = await supabase.auth.getSession();

		if (sessionError) {
			console.error('Session error in middleware:', sessionError);
		}

		// Get the pathname from the URL
		const { pathname } = req.nextUrl;

		// Public routes that don't require authentication
		const publicRoutes = ['/login', '/register', '/forgot-password', '/'];
		const isPublicRoute =
			publicRoutes.includes(pathname) || pathname.startsWith('/auth');

		// If no session and trying to access protected routes, redirect to login
		if (
			!session &&
			!isPublicRoute &&
			(pathname.startsWith('/student') ||
				pathname.startsWith('/admin') ||
				pathname.startsWith('/instructor') ||
				pathname.startsWith('/accountant') ||
				pathname.startsWith('/dashboard'))
		) {
			const redirectUrl = new URL('/login', req.url);
			// Store the attempted URL to redirect back after login
			redirectUrl.searchParams.set('redirectTo', pathname);
			return NextResponse.redirect(redirectUrl);
		}

		// If we have a session, verify and handle role-based access
		if (session) {
			// Refresh the user's auth token to ensure it's valid
			const { error: refreshError } = await supabase.auth.refreshSession();

			if (refreshError) {
				console.error('Token refresh error:', refreshError);
				// If token refresh fails, redirect to login
				const redirectUrl = new URL('/login', req.url);
				return NextResponse.redirect(redirectUrl);
			}

			// If user is on login/register pages and authenticated, redirect to dashboard
			if (pathname === '/login' || pathname === '/register') {
				// Get user role to redirect to appropriate dashboard
				const { data: userData, error: userError } = await supabase
					.from('users')
					.select('role')
					.eq('id', session.user.id)
					.single();

				if (!userError && userData) {
					let redirectPath = '/dashboard';

					switch (userData.role) {
						case 'admin':
							redirectPath = '/admin/dashboard';
							break;
						case 'student':
							redirectPath = '/student/dashboard';
							break;
						case 'instructor':
							redirectPath = '/instructor/dashboard';
							break;
						case 'accountant':
							redirectPath = '/accountant/dashboard';
							break;
					}

					const redirectUrl = new URL(redirectPath, req.url);
					return NextResponse.redirect(redirectUrl);
				}
			}

			// For protected routes, verify role-based access
			if (
				pathname.startsWith('/admin') ||
				pathname.startsWith('/student') ||
				pathname.startsWith('/instructor') ||
				pathname.startsWith('/accountant')
			) {
				// Get user role from database
				const { data: userData, error: userError } = await supabase
					.from('users')
					.select('role, active')
					.eq('id', session.user.id)
					.single();

				if (userError || !userData) {
					console.error('Error fetching user data in middleware:', userError);
					// If error fetching role, redirect to login
					const redirectUrl = new URL('/login', req.url);
					return NextResponse.redirect(redirectUrl);
				}

				const { role, active } = userData;

				// Check if user account is active
				if (!active) {
					const redirectUrl = new URL('/account-suspended', req.url);
					return NextResponse.redirect(redirectUrl);
				}

				// Check if user is trying to access a route they don't have permission for
				const hasAccess =
					(pathname.startsWith('/admin') && role === 'admin') ||
					(pathname.startsWith('/student') && role === 'student') ||
					(pathname.startsWith('/instructor') && role === 'instructor') ||
					(pathname.startsWith('/accountant') && role === 'accountant');

				if (!hasAccess) {
					// Redirect to their appropriate dashboard
					let redirectPath = '/dashboard';

					switch (role) {
						case 'admin':
							redirectPath = '/admin/dashboard';
							break;
						case 'student':
							redirectPath = '/student/dashboard';
							break;
						case 'instructor':
							redirectPath = '/instructor/dashboard';
							break;
						case 'accountant':
							redirectPath = '/accountant/dashboard';
							break;
					}

					const redirectUrl = new URL(redirectPath, req.url);
					return NextResponse.redirect(redirectUrl);
				}

				// Add user info to headers for the downstream components
				const response = NextResponse.next();
				response.headers.set('x-user-id', session.user.id);
				response.headers.set('x-user-role', role);
				response.headers.set('x-user-email', session.user.email || '');

				return response;
			}
		}

		// Ensure the response includes the session cookies
		return res;
	} catch (error) {
		console.error('Middleware error:', error);
		// On any error, allow the request to continue but log it
		return res;
	}
}

// Specify which routes this middleware should run on
export const config = {
	matcher: [
		/*
		 * Match all request paths except for the ones starting with:
		 * - api (API routes)
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 * - public folder files
		 */
		'/((?!api|_next/static|_next/image|favicon.ico|public).*)',
	],
};
