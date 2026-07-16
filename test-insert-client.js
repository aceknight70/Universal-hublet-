import { createClient } from '@supabase/supabase-js';

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(url, key);

async function test() {
  const dummyUUID = 'd407fd4a-f3d6-4444-8d4e-1b8f5cf21a9a';
  const { data, error } = await supabase.from('manifest_clients').insert({
    id: dummyUUID,
    name: 'Test Client',
    slug: 'test-client',
    categories: []
  });
  console.log("Insert Client Error:", error);
  
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('manifest_gallery')
    .upload(`${dummyUUID}/test_gallery.txt`, 'hello', { upsert: true });

  console.log("Upload Error:", uploadError);
  console.log("Upload Data:", uploadData);
}
test();
