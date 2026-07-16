import { createClient } from '@supabase/supabase-js';

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(url, key);

async function test() {
  const fileContent = 'hello world';
  const testUuid = '123e4567-e89b-12d3-a456-426614174000';
  const { data, error } = await supabase.storage
    .from('manifest_product_photos')
    .upload(testUuid, fileContent, { upsert: true });

  if (error) {
    console.log("EXACT ERROR:", JSON.stringify(error, null, 2));
  } else {
    console.log("SUCCESS:", data);
  }
}
test();
