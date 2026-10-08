from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parents[1] / 'evidence'
paths = ['desktop-form.jpg', 'desktop-result.jpg', 'desktop-break.jpg', 'desktop-reflection.jpg']
frames = []
for name in paths:
    with Image.open(root / name) as source:
        canvas = Image.new('RGB', (1280, 900), 'white')
        frame = source.copy()
        frame.thumbnail((1280, 900))
        canvas.paste(frame, ((1280-frame.width)//2, (900-frame.height)//2))
        frames.append(canvas)
frames[0].save(root / 'demo-tour.gif', save_all=True, append_images=frames[1:], duration=5000, loop=0)
with Image.open(root / 'demo-tour.gif') as demo:
    assert demo.n_frames == 4
    print(f'Demo tour: {demo.n_frames} actual browser captures, 20-second loop. Not a real-time screen recording.')
