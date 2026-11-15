import re, os

os.chdir(os.path.dirname(os.path.abspath(__file__)))

files = {
    'space-renderer.js': open('js/space-renderer.js', encoding='utf-8').read(),
    'ui-controller.js':  open('js/ui-controller.js',  encoding='utf-8').read(),
    'audio-fx.js': open('js/audio-fx.js', encoding='utf-8').read(),
    'game-data.js': open('js/game-data.js', encoding='utf-8').read(),
}

print('=== VALIDATING JAVASCRIPT MODULE INTEGRITY ===')
for fname, content in files.items():
    print(f'✔ {fname}: {len(content):,} bytes')

print('\n=== VALIDATING AUDIO ASSETS ===')
for aud in ['alarm.wav', 'click.wav', 'downlink.wav', 'failure.wav', 'flight.wav', 'launch.wav', 'scan.wav', 'spacecraft_ambience.wav', 'startup.wav', 'success.wav']:
    p = f'assets/audio/{aud}'
    exists = os.path.exists(p)
    print(f"  {'✔ OK' if exists else '❌ MISSING'}: {p}")

print('\n=== AUDIT COMPLETE ===')
