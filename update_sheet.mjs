import fs from 'fs';

let content = fs.readFileSync('src/pages/SheetManager.tsx', 'utf8');

const toReplaceSave = `  const handleSave = async () => {
    const validRows = parsedRows.filter(r => r.status === 'valid');
    if (validRows.length === 0) return;
    setSaving(true);
    setProgress(0);
    const CHUNK_SIZE = 50;
    
    // Check if contact_link column exists by doing a tiny select
    const { error: columnCheckError } = await supabase.from('manifest_products').select('contact_link').limit(1);
    const hasContactLink = !columnCheckError;

    try {
      for (let i = 0; i < validRows.length; i += CHUNK_SIZE) {
        const chunk = validRows.slice(i, i + CHUNK_SIZE);
        
        const upsertData = chunk.map(r => {
          const data = { ...r.dbRow };
          if (!hasContactLink) delete data.contact_link;
          return data;
        });

        const { error } = await supabase
          .from('manifest_products')
          .upsert(upsertData, { onConflict: 'code' });

        if (error) {
          throw new Error(\`Failed to save batch starting at index \${i}: \${error.message}\`);
        }
        
        setProgress(Math.min(validRows.length, i + CHUNK_SIZE));
      }
      setMessage({ type: 'success', text: \`Successfully imported \${validRows.length} products.\` });
      setParsedRows([]);
      setPasteData('');
      loadCatalog();
    } catch (err: any) {
      setMessage({ type: 'error', text: \`Error during import: \${err.message}\` });
    } finally {
      setSaving(false);
    }
  };`;

const newSave = `  const handleSave = async () => {
    const validRows = parsedRows.filter(r => r.status === 'valid');
    if (validRows.length === 0) return;
    setSaving(true);
    setProgress(0);

    try {
      // 1. Fetch existing catalog to avoid duplicates by name
      const { data: existingCatalog } = await supabase.from('manifest_catalog').select('id, name');
      const catalogMap = new Map();
      if (existingCatalog) {
         existingCatalog.forEach(c => catalogMap.set(c.name.trim().toLowerCase(), c.id));
      }

      let count = 0;
      for (const row of validRows) {
         let catalogId = catalogMap.get(row.name.trim().toLowerCase());
         
         // 2. Insert into catalog if not exists
         if (!catalogId) {
            const specSheet = {
               code: row.dbRow.code,
               description_bullets: row.dbRow.description_bullets,
               technical_specs: row.dbRow.technical_specs,
               assurance_yn: row.dbRow.assurance_yn,
               assurance_text: row.dbRow.assurance_text,
               laggard_yn: row.dbRow.laggard_yn,
               laggard_promo_text: row.dbRow.laggard_promo_text,
               stock_status: row.dbRow.stock_status,
               search_keywords: row.dbRow.search_keywords
            };
            const { data: newCat, error: catErr } = await supabase.from('manifest_catalog').insert({
               name: row.name,
               brand: row.brandName,
               category: row.category,
               spec_sheet: specSheet
            }).select().single();
            
            if (catErr) {
               console.error("Catalog insert error:", catErr);
               continue;
            }
            if (newCat) {
               catalogId = newCat.id;
               catalogMap.set(row.name.trim().toLowerCase(), catalogId);
            }
         }

         // 3. Upsert into inventory for this client
         if (catalogId && client?.id) {
            const { error: invErr } = await supabase.from('manifest_inventory').upsert({
               client_id: client.id,
               catalog_id: catalogId,
               price: row.dbRow.price || 0,
               tag: row.dbRow.category
            }, { onConflict: 'client_id,catalog_id' });
            
            if (invErr) {
               console.error("Inventory upsert error:", invErr);
            } else {
               count++;
            }
         }
         setProgress(count);
      }
      
      setMessage({ type: 'success', text: \`Successfully imported \${count} products.\` });
      setParsedRows([]);
      setPasteData('');
      loadCatalog();
    } catch (err: any) {
      setMessage({ type: 'error', text: \`Error during import: \${err.message}\` });
    } finally {
      setSaving(false);
    }
  };`;

content = content.replace(toReplaceSave, newSave);

const toReplaceLoad = `const [{ data: prods }, { data: overrides }] = await Promise.all([
      supabase.from('manifest_products').select('id, code, name, price, stock_status, category, manifest_brands(name)').order('created_at', { ascending: false }),
      client?.id ? supabase.from('manifest_client_product_overrides').select('*').eq('client_id', client.id) : Promise.resolve({ data: [] })
    ]);`;

const newLoad = `const [{ data: invData }, { data: overrides }] = await Promise.all([
      supabase.from('manifest_inventory').select('*, manifest_catalog!inner(*)').eq('client_id', client?.id || ''),
      client?.id ? supabase.from('manifest_client_product_overrides').select('*').eq('client_id', client.id) : Promise.resolve({ data: [] })
    ]);
    const prods = invData?.map(inv => ({
       id: inv.manifest_catalog.id,
       code: inv.manifest_catalog.spec_sheet?.code || 'N/A',
       name: inv.manifest_catalog.name,
       price: inv.price,
       stock_status: inv.manifest_catalog.spec_sheet?.stock_status || 'In Stock',
       category: inv.manifest_catalog.category,
       manifest_brands: { name: inv.manifest_catalog.brand }
    })) || [];`;

content = content.replace(toReplaceLoad, newLoad);

fs.writeFileSync('src/pages/SheetManager.tsx', content);
