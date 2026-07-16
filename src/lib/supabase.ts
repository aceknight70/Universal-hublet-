import { createClient } from "@supabase/supabase-js";
import type { Database } from "../types";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://placeholder-url.supabase.co";
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "placeholder-key";

// Allow creation even if placeholder, we'll handle errors gracefully
export const supabase = createClient<Database>(supabaseUrl, supabaseKey);
