import re, os

os.chdir(os.path.dirname(os.path.abspath(__file__)))

sr = open('js/space-renderer.js', encoding='utf-8').read()

# Find constructor end by tracking brace depth
start = sr.find('    constructor(canvasId) {')
depth = 0
i = start
in_constructor = False
for i in range(start, len(sr)):
    if sr[i] == '{': depth += 1; in_constructor = True
    if sr[i] == '}':
        depth -= 1
        if in_constructor and depth == 0:
            break

print('Constructor spans lines', sr[:start].count('\n')+1, 'to', sr[:i+1].count('\n')+1)
print(sr[start:i+1])
print()
print('--- After constructor (next 200 chars) ---')
print(sr[i+1:i+201])

