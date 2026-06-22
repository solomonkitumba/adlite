from pathlib import Path

root = Path(__file__).resolve().parent.parent
pages = [
    'advertisement-in-uganda',
    'best-advertisement-in-uganda',
    'outdoor-advertisement',
    'live-distribution',
    'distribution-report'
]

html_files = list(root.glob('*.html'))
updated = []
for f in html_files:
    text = f.read_text(encoding='utf-8')
    orig = text
    for p in pages:
        # variants: "p/", "../p/", "/p/"
        text = text.replace(f'href="{p}/"', f'href="{p}.html"')
        text = text.replace(f"href='{p}/'", f"href='{p}.html'")
        text = text.replace(f'href="../{p}/"', f'href="../{p}.html"')
        text = text.replace(f"href='../{p}/'", f"href='../{p}.html'")
        text = text.replace(f'href="/{p}/"', f'href="/{p}.html"')
        text = text.replace(f"href='/{p}/'", f"href='/{p}.html'")
    if text != orig:
        f.write_text(text, encoding='utf-8')
        updated.append(str(f))

print('Updated files:')
for u in updated:
    print('-', u)
