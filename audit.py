import re, os

os.chdir(os.path.dirname(os.path.abspath(__file__)))

files = {
    'space-renderer.js': open('js/space-renderer.js', encoding='utf-8').read(),
    'ui-controller.js':  open('js/ui-controller.js',  encoding='utf-8').read(),
    'flight-simulator.js': open('js/flight-simulator.js', encoding='utf-8').read(),
    'hangar-builder.js': open('js/hangar-builder.js', encoding='utf-8').read(),
}

for fname, content in files.items():
    print(f'=== {fname} ({len(content):,} chars) ===')
    classes = re.findall(r'class\s+\w+', content)
    print(f'  Classes: {classes}')
    if 'roundRect' in content:
        print(f'  WARN: roundRect used (needs polyfill in older browsers)')
    for attr in ['_imgs', '_asteroids', '_drawAsteroidField', '_buildAsteroidField', '_preloadImages']:
        if attr in content:
            print(f'  HAS: {attr}')
    # Check for incomplete function bodies
    func_starts = [m.start() for m in re.finditer(r'\bfunction\b|\b=>\s*\{', content)]
    print(f'  Function-like patterns: {len(func_starts)}')
    print()

# Check all asset paths referenced in JS/CSS files
print('=== ASSET PATH CHECK ===')
all_code = ''
for f in ['js/ui-controller.js','js/space-renderer.js','css/cinematic.css']:
    all_code += open(f, encoding='utf-8').read()

asset_refs = re.findall(r"['\"]assets/([^'\"]+)['\"]", all_code)
for a in sorted(set(asset_refs)):
    path = f'assets/{a}'
    exists = os.path.exists(path)
    print(f"  {'OK' if exists else 'MISSING'}: {path}")

print()
# Check CSS background rules with url()
print('=== CSS BACKGROUND URLs ===')
css = open('css/cinematic.css', encoding='utf-8').read()
urls = re.findall(r"url\('([^']+)'\)", css)
for u in urls:
    # normalize
    p = u.replace('../','')
    exists = os.path.exists(p)
    print(f"  {'OK' if exists else 'MISSING'}: {u} -> {p}")

