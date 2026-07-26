import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
    const res = await fetch(`${process.env.VITE_SUPABASE_URL}/rest/v1/manifest_master`, {
        method: 'OPTIONS',
        headers: {
            apikey: process.env.VITE_SUPABASE_ANON_KEY,
            Authorization: `Bearer ${process.env.VITE_SUPABASE_ANON_KEY}`
        }
    });
    const text = await res.text();
    console.log("Options:", text);
}
run();
