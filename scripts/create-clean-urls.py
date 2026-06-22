from pathlib import Path
import re

root = Path(__file__).resolve().parent.parent
pages = {
    'advertisement-in-uganda.html': 'advertisement-in-uganda',
    'best-advertisement-in-uganda.html': 'best-advertisement-in-uganda',
    'outdoor-advertisement.html': 'outdoor-advertisement',
    'live-distribution.html': 'live-distribution',
    'distribution-report.html': 'distribution-report'
}
clean_url_host = 'https://solomonkitumba.github.io/adlite'


def normalize_canonical(text: str, dir_name: str) -> str:
    return re.sub(
        r'<link rel="canonical" href="[^"]*"',
        f'<link rel="canonical" href="{clean_url_host}/{dir_name}/"',
        text,
    )


def create_directory_page(text: str, dir_name: str) -> str:
    text = normalize_canonical(text, dir_name)
    text = text.replace('href="styles.css"', 'href="../styles.css"')
    text = text.replace('href="imgs/', 'href="../imgs/')
    text = text.replace('src="imgs/', 'src="../imgs/')
    text = text.replace('href="index.html"', 'href="../"')
    text = re.sub(r'href="index.html#([^"]*)"', r'href="../#\1"', text)

    for html_name, target_dir in pages.items():
        text = text.replace(f'href="{html_name}"', f'href="../{target_dir}/"')
    return text


def create_fallback_page(text: str, dir_name: str) -> str:
    text = normalize_canonical(text, dir_name)
    text = text.replace('href="../styles.css"', 'href="styles.css"')
    text = text.replace('href="../imgs/', 'href="imgs/')
    text = text.replace('src="../imgs/', 'src="imgs/')
    text = text.replace('href="../"', 'href="index.html"')
    text = re.sub(r'href="../#([^"]*)"', r'href="index.html#\1"', text)

    for html_name, target_dir in pages.items():
        text = text.replace(f'href="../{target_dir}/"', f'href="{html_name}"')
    return text


for html_file, dir_name in pages.items():
    source = root / html_file
    if not source.exists():
        print(f"Missing source file {html_file}")
        continue

    original = source.read_text(encoding='utf-8')
    fallback_text = create_fallback_page(original, dir_name)
    directory_text = create_directory_page(fallback_text, dir_name)

    source.write_text(fallback_text, encoding='utf-8')
    print(f'Preserved fallback file: {html_file}')

    target = root / dir_name
    target.mkdir(parents=True, exist_ok=True)
    (target / 'index.html').write_text(directory_text, encoding='utf-8')
    print(f'Created clean URL page: {dir_name}/index.html')

root_index = root / 'index.html'
root_index_text = root_index.read_text(encoding='utf-8')
replacements = {
    'href="live-distribution.html"': 'href="live-distribution/"',
    'href="distribution-report.html"': 'href="distribution-report/"',
    'href="advertisement-in-uganda.html"': 'href="advertisement-in-uganda/"',
    'href="outdoor-advertisement.html"': 'href="outdoor-advertisement/"',
    'href="best-advertisement-in-uganda.html"': 'href="best-advertisement-in-uganda/"'
}
for old, new in replacements.items():
    root_index_text = root_index_text.replace(old, new)
root_index.write_text(root_index_text, encoding='utf-8')
print('Updated root index.html links')

sitemap = root / 'sitemap.xml'
if sitemap.exists():
    sitemap_text = sitemap.read_text(encoding='utf-8')
    sitemap_replacements = {
        'https://solomonkitumba.github.io/adlite/live-distribution.html': 'https://solomonkitumba.github.io/adlite/live-distribution/',
        'https://solomonkitumba.github.io/adlite/advertisement-in-uganda.html': 'https://solomonkitumba.github.io/adlite/advertisement-in-uganda/',
        'https://solomonkitumba.github.io/adlite/outdoor-advertisement.html': 'https://solomonkitumba.github.io/adlite/outdoor-advertisement/',
        'https://solomonkitumba.github.io/adlite/best-advertisement-in-uganda.html': 'https://solomonkitumba.github.io/adlite/best-advertisement-in-uganda/',
        'https://solomonkitumba.github.io/adlite/distribution-report.html': 'https://solomonkitumba.github.io/adlite/distribution-report/'
    }
    for old, new in sitemap_replacements.items():
        sitemap_text = sitemap_text.replace(old, new)
    sitemap.write_text(sitemap_text, encoding='utf-8')
    print('Updated sitemap.xml')
else:
    print('No sitemap.xml found')
