import re

with open('src/hooks/useStore.tsx', 'r') as f:
    code = f.read()

# We want to use theme.display_name for client.name if it exists
new_code = code.replace("""        if (typeof (data as any).theme === 'string') {
          try {
              (data as any).theme = JSON.parse((data as any).theme);
          } catch(e) {}
        }
        setClient(data as any);""", """        let parsedTheme = (data as any).theme;
        if (typeof parsedTheme === 'string') {
          try {
              parsedTheme = JSON.parse(parsedTheme);
          } catch(e) {
              parsedTheme = {};
          }
        } else {
          parsedTheme = parsedTheme || {};
        }
        (data as any).theme = parsedTheme;
        if (parsedTheme.display_name) {
            (data as any).name = parsedTheme.display_name;
        }
        setClient(data as any);""")

with open('src/hooks/useStore.tsx', 'w') as f:
    f.write(new_code)
print("Updated useStore to use display_name")
