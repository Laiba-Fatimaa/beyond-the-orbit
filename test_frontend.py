import os, sys

js_files = [
    'js/nasa-data.js',
    'js/game-data.js',
    'js/game-engine.js',
    'js/events-engine.js',
    'js/space-renderer.js',
    'js/hangar-builder.js',
    'js/flight-simulator.js',
    'js/audio-fx.js',
    'js/ui-controller.js'
]

print("=" * 60)
print("VALIDATING FRONTEND JAVASCRIPT & DOM INTEGRITY")
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
    
    # Simple brace balance check ignoring comments and strings
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
                i += 1 # skip escape
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

# Check index.html element IDs required by UIController and FlightSimulator
with open("index.html", "r", encoding="utf-8") as f:
    html_content = f.read()

required_ids = [
    "space-canvas",
    "landing-planet-canvas",
    "landing-craft-canvas",
    "missions-card-grid",
    "schematic-viewport",
    "subsystem-options-container",
    "tel-mass-val",
    "tel-cost-val",
    "tel-pwr-val",
    "tel-data-val",
    "tel-rel-val",
    "planning-status-badge",
    "validation-critique-box",
    "launch-action-btn",
    "sim-mission-phase-title",
    "mission-elapsed-time",
    "flight-deck-radar-canvas",
    "sim-objectives-checklist",
    "hud-fuel-val",
    "hud-fuel-bar",
    "hud-power-val",
    "hud-power-bar",
    "hud-health-val",
    "hud-health-bar",
    "hud-datacol-val",
    "hud-science-val",
    "flight-discovery-banner",
    "action-scan-btn",
    "action-downlink-btn",
    "action-burn-btn",
    "action-power-btn",
    "power-mode-label",
    "flight-log-feed",
    "action-end-mission-btn",
    "anomaly-modal-container",
    "debrief-dest-val",
    "debrief-obj-completed-val",
    "debrief-collected-val",
    "debrief-transmitted-val",
    "debrief-rel-val",
    "debrief-score-num",
    "debrief-score-badge",
    "outcome-circle-icon",
    "debrief-summary-text",
    "debrief-categories-container",
    "debrief-objectives-list",
    "debrief-lessons-list",
    "debrief-suggestions-list"
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

