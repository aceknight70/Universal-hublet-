const x = `  const [catalog, setCatalog] = useState([]);
  const [loadingCatalog, setLoadingCatalog] = useState(false);

  async function loadCatalog() {
    setLoadingCatalog(true);
    const { data } = await supabase.from('manifest_products').select('code, name, price').order('created_at', { ascending: false });
    if (data) setCatalog(data);
    setLoadingCatalog(false);
  }

  useEffect(() => {
    loadCatalog();
  }, []);
`;
console.log(x);
