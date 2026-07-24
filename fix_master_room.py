import re

with open('src/pages/MasterRoom.tsx', 'r') as f:
    code = f.read()

domain_start = code.find('function DomainSkinControl')
if domain_start != -1:
    first_part = code[:domain_start]
    rest = code[domain_start:]
    
    # find the end of DomainSkinControl
    end_match = re.search(r'  \);\n\}\n', rest)
    if end_match:
        end_idx = end_match.end()
        domain_code = rest[:end_idx]
        remaining = rest[end_idx:]
        
        # we need to put domain_code BEFORE the "function WatermarkEditor" in first_part
        # but wait, first_part ends with "function WatermarkEditor({ clients, setClients }: { clients: Client[], setClients: any }) {\n"
        # Let's fix this safely:
        watermark_start = first_part.rfind('function WatermarkEditor')
        if watermark_start != -1:
            pre_watermark = first_part[:watermark_start]
            watermark_decl = first_part[watermark_start:]
            new_code = pre_watermark + domain_code + '\n' + watermark_decl + remaining
            with open('src/pages/MasterRoom.tsx', 'w') as f:
                f.write(new_code)
