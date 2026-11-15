import os, sys

js_files = [
    'js/space-renderer.js',
    'js/audio-fx.js',
    'js/game-data.js',
    'js/ui-controller.js'
]

print("=" * 60)
print("VALIDATING RECOVERED FRONTEND JAVASCRIPT & DOM INTEGRITY")
print("=" * 60)

all_passed = True

for path in js_files:
    if not os.path.exists(path):
        print(f"MISSING: {path}")
        all_passed = False
        continue

    with open(path, 'r', encoding='utf-8') as f:
        code = f.read()

    lines = code.split('\n')
    
    # Simple syntax and bracket balance validator
    curly = 0
    square = 0
    paren = 0
    in_string = False
    in_comment = False
    errors = []
    
    i = 0
    line_no = 1
    while i < len(code):
        c = code[i]
        if c == '\n':
            line_no += 1
            if in_comment == 'single':
                in_comment = False
        elif not in_string and not in_comment:
            if c == '/' and i + 1 < len(code) and code[i+1] == '/':
                in_comment = 'single'
                i += 1
            elif c == '/' and i + 1 < len(code) and code[i+1] == '*':
                in_comment = 'multi'
                i += 1
            elif c in ('"', "'", '`'):
                in_string = c
            elif c == '{': curly += 1
            elif c == '}':
                curly -= 1
                if curly < 0:
                    errors.append(f"Extra }} at line {line_no}")
                    curly = 0
            elif c == '(': paren += 1
            elif c == ')':
                paren -= 1
                if paren < 0:
                    errors.append(f"Extra ) at line {line_no}")
                    paren = 0
            elif c == '[': square += 1
            elif c == ']':
                square -= 1
                if square < 0:
                    errors.append(f"Extra ] at line {line_no}")
                    square = 0
        elif in_string:
            if c == '\\':
                i += 1
            elif c == in_string:
                in_string = False
        elif in_comment == 'multi':
            if c == '*' and i + 1 < len(code) and code[i+1] == '/':
                in_comment = False
                i += 1
        i += 1

    if curly != 0: errors.append(f"Unclosed {{ count: {curly}")
    if paren != 0: errors.append(f"Unclosed ( count: {paren}")
    if square != 0: errors.append(f"Unclosed [ count: {square}")

    if errors:
        print(f"❌ FAIL: {path} -> {errors}")
        all_passed = False
    else:
        print(f"✔ PASS: {path} (Lines: {len(lines)}, Bytes: {len(code)})")

# Check index.html element IDs required by UIController
with open("index.html", "r", encoding="utf-8") as f:
    html_content = f.read()

required_ids = [
    "space-canvas",
    "system-clock",
    "sound-toggle",
    "screen-intro",
    "begin-mission",
    "how-to-play",
    "help-modal",
    "screen-destination",
    "destination-grid",
    "destination-modal",
    "destination-modal-card",
    "close-destination-modal",
    "destination-modal-planet",
    "destination-modal-title",
    "destination-modal-description",
    "destination-modal-distance",
    "science-objective",
    "continue-destination",
    "screen-spacecraft",
    "craft-name",
    "craft-class",
    "fuel-range",
    "fuel-value",
    "power-range",
    "power-value",
    "supplies-range",
    "supplies-value",
    "mass-value",
    "readiness-value",
    "back-destination",
    "continue-flight",
    "screen-flight",
    "flight-phase",
    "flight-scene",
    "flight-destination-art",
    "progress-value",
    "progress-bar",
    "flight-objective-title",
    "flight-action",
    "flight-scan",
    "flight-stabilize",
    "telemetry-fuel",
    "telemetry-power",
    "telemetry-supplies",
    "telemetry-hull",
    "screen-debrief",
    "success-stamp",
    "debrief-planet",
    "debrief-destination",
    "final-score",
    "grade-badge",
    "score-bar",
    "result-science",
    "result-resources",
    "result-decisions",
    "debrief-insight",
    "replay-mission",
    "new-mission",
    "download-html-report",
    "download-pdf-report",
    "event-modal",
    "popup-event-title",
    "popup-event-choices",
    "event-outcome",
    "popup-next-event",
    "result-modal",
    "result-modal-card",
    "result-modal-title",
    "popup-final-score",
    "popup-final-fuel",
    "popup-final-power",
    "popup-final-supplies",
    "view-debrief",
    "toast"
]

print("\n" + "=" * 60)
print("VALIDATING DOM ELEMENT IDs IN index.html")
print("=" * 60)

missing_ids = []
for el_id in required_ids:
    if f'id="{el_id}"' not in html_content:
        missing_ids.append(el_id)
        print(f"❌ MISSING ID: {el_id}")
    else:
        print(f"✔ FOUND ID: {el_id}")

if missing_ids:
    all_passed = False
    print(f"\nTotal missing IDs: {len(missing_ids)}")
else:
    print(f"\nAll {len(required_ids)} required DOM element IDs verified present in index.html!")

if all_passed:
    print("\n" + "=" * 60)
    print("ALL FRONTEND VALIDATIONS PASSED 100%!")
    print("=" * 60)
    sys.exit(0)
else:
    print("\n" + "=" * 60)
    print("VALIDATION FAILED WITH ERRORS")
    print("=" * 60)
    sys.exit(1)
