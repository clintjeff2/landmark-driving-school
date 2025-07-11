import { createClient } from '@supabase/supabase-js';

// Create a single supabase client for interacting with your database from the client
let supabaseClient: ReturnType<typeof createClient> | null = null;

export const getSupabaseClient = () => {
	if (supabaseClient) return supabaseClient;

	const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
	const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

	if (!supabaseUrl || !supabaseAnonKey) {
		throw new Error('Missing Supabase environment variables');
	}

	supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
	return supabaseClient;
};
