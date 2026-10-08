from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
from hashlib import sha256

root = Path(__file__).resolve().parents[1]
paths = [root / name for name in ['package.json', 'package-lock.json', '.gitignore', 'README.md', 'LICENSE', 'server.mjs']]
for name in ['lib', 'public', 'scripts', 'test']:
    paths.extend(p for p in (root / name).rglob('*') if p.is_file() and '__pycache__' not in p.parts)
paths.extend(root / 'evidence' / name for name in [
    'model-provenance.json', 'live-inference.json', 'http-tests.json',
    'desktop-form.jpg', 'desktop-result.jpg', 'desktop-break.jpg',
    'desktop-reflection.jpg', 'mobile-form.jpg', 'mobile-result.jpg', 'demo-tour.gif',
    'OutsideCue-demo.mp4', 'video-verification.txt', 'video-check.jpg'])
output = root / 'OutsideCue-source-review.zip'
with ZipFile(output, 'w', ZIP_DEFLATED) as archive:
    for path in sorted(paths):
        archive.write(path, path.relative_to(root).as_posix())
with ZipFile(output) as archive:
    assert archive.testzip() is None
    assert 'evidence/live-inference.json' in archive.namelist()
    assert 'server.mjs' in archive.namelist()
    assert all('dev-account-gate' not in name and 'dev-oauth-gate' not in name for name in archive.namelist())
    print(f'Archive verified: {len(archive.namelist())} files, {output.stat().st_size} bytes')
print(f'SHA256 {sha256(output.read_bytes()).hexdigest()}')
