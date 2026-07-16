import { createClient } from '@supabase/supabase-js';

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(url, key);

async function test() {
  const { data: authData, error: authError } = await supabase.auth.signInAnonymously();
  if (authError) {
    console.log("AUTH ERROR:", authError);
    return;
  }
  console.log("AUTH SUCCESS UID:", authData.user?.id);
  
  const fileContent = 'hello world';
  const { data, error } = await supabase.storage
    .from('manifest_gallery')
    .upload(`${authData.user.id}/test.txt`, fileContent, { upsert: true });

  if (error) {
    console.log("UPLOAD ERROR:", JSON.stringify(error, null, 2));
  } else {
    console.log("UPLOAD SUCCESS:", data);
  }
}
test();
