async function test() {
  const res = await fetch(`${process.env.VITE_SUPABASE_URL}/rest/v1/?apikey=${process.env.VITE_SUPABASE_ANON_KEY}`);
  const text = await res.text();
  console.log("Schema snippet:", text.substring(0, 500));
}
test();
