// 'use client';

// import type React from 'react';
// import { createContext, useContext, useEffect, useState } from 'react';
// import { useRouter } from 'next/navigation';
// import { getSupabaseClient } from '@/lib/supabase/client';
// import type { User } from '@/lib/types';

// interface AuthContextType {
// 	user: User | null;
// 	loading: boolean;
// 	signIn: (email: string, password: string) => Promise<void>;
// 	signOut: () => Promise<void>;
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// export function AuthProvider({ children }: { children: React.ReactNode }) {
// 	const [user, setUser] = useState<User | null>(null);
// 	const [loading, setLoading] = useState(true);
// 	const router = useRouter();
// 	const supabase = getSupabaseClient();

// 	useEffect(() => {
// 		const fetchUser = async () => {
// 			try {
// 				// Get current auth user
// 				const {
// 					data: { session },
// 					error: authError,
// 				} = await supabase.auth.getSession();

// 				if (authError || !session) {
// 					setUser(null);
// 					setLoading(false);
// 					return;
// 				}

// 				// Get user data from the database
// 				const { data: userData, error: userError } = await supabase
// 					.from('users')
// 					.select('*')
// 					.eq('id', session.user.id)
// 					.single(); // Use single() to get one record

// 				if (userError || !userData) {
// 					console.error('Error fetching user data:', userError);
// 					setUser(null);
// 					setLoading(false);
// 					return;
// 				}

// 				console.log('User data fetched successfully:', userData);
// 				setUser(userData as User);
// 			} catch (error) {
// 				console.error('Error fetching user:', error);
// 				setUser(null);
// 			} finally {
// 				setLoading(false);
// 			}
// 		};

// 		fetchUser();

// 		// Set up auth state change listener
// 		const {
// 			data: { subscription },
// 		} = supabase.auth.onAuthStateChange(async (event, session) => {
// 			try {
// 				console.log('Auth state changed:', event);
				
// 				if (event === 'SIGNED_IN' && session) {
// 					setLoading(true); // Set loading when starting to fetch user data
					
// 					// Get user data from the database
// 					const { data: userData, error: userError } = await supabase
// 						.from('users')
// 						.select('*')
// 						.eq('id', session.user.id)
// 						.single();

// 					if (!userError && userData) {
// 						console.log('User signed in, setting user data:', userData);
// 						setUser(userData as User);
// 					} else {
// 						console.error('Error fetching user data after sign in:', userError);
// 						setUser(null);
// 					}
// 					setLoading(false);
// 				} else if (event === 'SIGNED_OUT') {
// 					console.log('User signed out');
// 					setUser(null);
// 					setLoading(false);
// 					router.push('/login');
// 				}
// 			} catch (err) {
// 				console.error('Error in auth state change:', err);
// 				setLoading(false);
// 			}
// 		});

// 		return () => {
// 			subscription.unsubscribe();
// 		};
// 	}, [supabase, router]);

// 	const signIn = async (email: string, password: string) => {
// 		try {
// 			setLoading(true);
// 			const { data, error } = await supabase.auth.signInWithPassword({
// 				email,
// 				password,
// 			});

// 			console.log('Sign in response:', data);
// 			if (error) {
// 				throw error;
// 			}

// 			// Don't set loading to false here - let the auth state change handler manage it
// 		} catch (error) {
// 			console.error('Error signing in:', error);
// 			throw error;
// 		}finally{
// 			setLoading(false); // Only set loading to false on error
// 		}
// 	};

// 	const signOut = async () => {
// 		try {
// 			setLoading(true);
// 			await supabase.auth.signOut();
// 		} catch (error) {
// 			console.error('Error signing out:', error);
// 		} finally {
// 			setLoading(false);
// 		}
// 	};

// 	return (
// 		<AuthContext.Provider value={{ user, loading, signIn, signOut }}>
// 			{children}
// 		</AuthContext.Provider>
// 	);
// }

// export const useAuth = () => {
// 	const context = useContext(AuthContext);
// 	if (context === undefined) {
// 		throw new Error('useAuth must be used within an AuthProvider');
// 	}

// 	console.log('useAuth context:', context);
// 	return context;
// };

'use client';

import type React from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase/client';
import type { User } from '@/lib/types';

interface AuthContextType {
	user: User | null;
	loading: boolean;
	signIn: (email: string, password: string) => Promise<void>;
	signOut: () => Promise<void>;
	refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);
	const router = useRouter();
	const searchParams = useSearchParams();
	const supabase = getSupabaseClient();

	const fetchUserData = async (userId: string) => {
		try {
			const { data: userData, error: userError } = await supabase
				.from('users')
				.select('*')
				.eq('id', userId)
				.single();

			if (userError) {
				console.error('Error fetching user data:', userError);
				return null;
			}

			return userData as User;
		} catch (error) {
			console.error('Error in fetchUserData:', error);
			return null;
		}
	};

	const refreshUser = async () => {
		try {
			const {
				data: { session },
				error: sessionError,
			} = await supabase.auth.getSession();

			if (sessionError || !session) {
				setUser(null);
				return;
			}

			const userData = await fetchUserData(session.user.id);
			if (userData) {
				setUser(userData);
			} else {
				setUser(null);
			}
		} catch (error) {
			console.error('Error refreshing user:', error);
			setUser(null);
		}
	};

	useEffect(() => {
		const initializeAuth = async () => {
			try {
				// Get current auth session
				const {
					data: { session },
					error: authError,
				} = await supabase.auth.getSession();

				if (authError) {
					console.error('Auth error:', authError);
					setUser(null);
					setLoading(false);
					return;
				}

				if (!session) {
					setUser(null);
					setLoading(false);
					return;
				}

				// Get user data from the database
				const userData = await fetchUserData(session.user.id);
				if (userData) {
					console.log('User data fetched successfully:', userData);
					setUser(userData);
				} else {
					setUser(null);
				}
			} catch (error) {
				console.error('Error initializing auth:', error);
				setUser(null);
			} finally {
				setLoading(false);
			}
		};

		initializeAuth();

		// Set up auth state change listener
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange(async (event, session) => {
			try {
				console.log('Auth state changed:', event);
				
				if (event === 'SIGNED_IN' && session) {
					setLoading(true);
					
					// Get user data from the database
					const userData = await fetchUserData(session.user.id);
					if (userData) {
						console.log('User signed in, setting user data:', userData);
						setUser(userData);
						
						// Handle redirect after successful login
						const redirectTo = searchParams?.get('redirectTo');
						if (redirectTo) {
							router.push(redirectTo);
						} else {
							// Redirect based on user role
							switch (userData.role) {
								case 'admin':
									router.push('/admin/dashboard');
									break;
								case 'student':
									router.push('/student/dashboard');
									break;
								case 'instructor':
									router.push('/instructor/dashboard');
									break;
								case 'accountant':
									router.push('/accountant/dashboard');
									break;
								default:
									router.push('/dashboard');
							}
						}
					} else {
						console.error('User data not found after sign in');
						setUser(null);
					}
					setLoading(false);
				} else if (event === 'SIGNED_OUT') {
					console.log('User signed out');
					setUser(null);
					setLoading(false);
					router.push('/login');
				} else if (event === 'TOKEN_REFRESHED' && session) {
					// Refresh user data when token is refreshed
					const userData = await fetchUserData(session.user.id);
					if (userData) {
						setUser(userData);
					}
				}
			} catch (err) {
				console.error('Error in auth state change:', err);
				setUser(null);
				setLoading(false);
			}
		});

		return () => {
			subscription.unsubscribe();
		};
	}, [supabase, router, searchParams]);

	const signIn = async (email: string, password: string) => {
		try {
			setLoading(true);
			const { data, error } = await supabase.auth.signInWithPassword({
				email,
				password,
			});

			console.log('Sign in response:', data);
			if (error) {
				throw error;
			}

			// The auth state change handler will manage user data fetching and navigation
		} catch (error) {
			console.error('Error signing in:', error);
			setLoading(false);
			throw error;
		}
	};

	const signOut = async () => {
		try {
			setLoading(true);
			const { error } = await supabase.auth.signOut();
			if (error) {
				console.error('Error signing out:', error);
			}
		} catch (error) {
			console.error('Error in signOut:', error);
		} finally {
			setLoading(false);
		}
	};

	return (
		<AuthContext.Provider value={{ user, loading, signIn, signOut, refreshUser }}>
			{children}
		</AuthContext.Provider>
	);
}

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error('useAuth must be used within an AuthProvider');
	}

	return context;
};