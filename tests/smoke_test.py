from pathlib import Path
import re
ROOT = Path(__file__).resolve().parents[1]
html = (ROOT / 'index.html').read_text(encoding='utf-8')
js = (ROOT / 'js/app.js').read_text(encoding='utf-8')
css = (ROOT / 'css/style.css').read_text(encoding='utf-8')
required_ids = ['recipe-grid','guide-grid','tips-grid','timing-table','recipe-form','plan-form','export-all-btn','import-btn','main-export-btn']
for item in required_ids:
    assert f'id="{item}"' in html, f'Missing HTML id: {item}'
assert "mc_ricettario_v1" not in js, "App should not write directly to the main site's localStorage"
assert "planWeeks" in js and "recipeId:recipe.id" in js, 'Missing planner export format'
assert "localStorage.setItem(STORAGE_KEY" in js, 'Missing local recipe persistence'
assert 'prefers-reduced-motion' in css, 'Missing reduced motion preference'
assert len(re.findall(r'<section\b', html)) >= 5, 'Unexpectedly few site sections'
print('Smoke tests passed: structure, local persistence, planner export contract and responsive CSS markers.')
