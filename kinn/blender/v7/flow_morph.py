"""The rendered tape at the end of the wrap -> the tape in the hero photo, as a true morph.
Both images slide onto a shared in-between shape while one dissolves into the other, so the outlines never show double.
Usage: flow_morph.py RENDERS PUBLIC [preview.png]"""
import json, os, sys
from multiprocessing.pool import ThreadPool
import numpy as np
from PIL import Image
from scipy.interpolate import RBFInterpolator
from scipy.ndimage import map_coordinates

HERE = os.path.dirname(os.path.abspath(__file__))
SRC, PUB = sys.argv[1], sys.argv[2]
PREVIEW = sys.argv[3] if len(sys.argv) > 3 else None
H, W = 1024, 1536
FRAMES = 30
PAGE_BG = (13, 18, 18, 255)        # the site's --bg, as in flow_post.py
WRAP_SMOOTHING = 100000.0          # what flow_post.py warped the end of the wrap with
MORPH_SMOOTHING = 400.0            # lower follows the landmarks more closely, higher bends the tape less
GRID_STEP = 4
LIGHT_START, LIGHT_END = .1, .9    # when in the morph the photo's light takes over

ph, rd = json.load(open(f'{HERE}/photo_pts.json')), json.load(open(f'{SRC}/wrap/cp.json'))
keys = [k for k in ph if k in rd]
raw, photo_pts = np.array([rd[k] for k in keys], float), np.array([ph[k] for k in keys], float)
yy, xx = np.mgrid[0:H:GRID_STEP, 0:W:GRID_STEP]
grid = np.stack([xx.ravel(), yy.ravel()], 1).astype(float)


def rendered_landmarks():
    """Where the landmarks sit in the last wrap frame, which flow_post.py has already warped part of the way."""
    inverse = RBFInterpolator(photo_pts, raw, kernel='thin_plate_spline', smoothing=WRAP_SMOOTHING)
    pts = photo_pts.copy()
    for _ in range(20):
        pts = pts + (raw - inverse(pts))
    return pts


def warp(image, shape, home):
    """Move image, whose landmarks sit at home, so they sit at shape."""
    s = RBFInterpolator(shape, home, kernel='thin_plate_spline', smoothing=MORPH_SMOOTHING)(grid).reshape(xx.shape + (2,))
    sx = np.asarray(Image.fromarray(s[..., 0].astype('float32')).resize((W, H), Image.BICUBIC))
    sy = np.asarray(Image.fromarray(s[..., 1].astype('float32')).resize((W, H), Image.BICUBIC))
    return np.stack([map_coordinates(image[..., c], [sy, sx], order=1, mode='nearest') for c in range(3)], -1)


def flat(path):
    im = Image.open(path).convert('RGBA')
    bg = Image.new('RGBA', im.size, PAGE_BG)
    bg.alpha_composite(im)
    return np.asarray(bg.convert('RGB'), float) / 255


ease = lambda x: x * x * (3 - 2 * x)
start, end = flat(f'{PUB}/flow/wrap/a_070.webp'), flat(f'{PUB}/flow/tape.webp')
start_pts = rendered_landmarks()


def frame(i):
    t = i / (FRAMES - 1)
    shape = start_pts + (photo_pts - start_pts) * ease(t)
    light = ease(np.clip((t - LIGHT_START) / (LIGHT_END - LIGHT_START), 0, 1))
    return warp(start, shape, start_pts) * (1 - light) + warp(end, shape, photo_pts) * light


def to_image(a):
    return Image.fromarray((np.clip(a, 0, 1) * 255).astype('uint8'))


if PREVIEW:
    picks = [0, 7, 11, 15, 19, 23, 29]
    tile = (920, 200, 1320, 930)
    sheet = Image.new('RGB', (len(picks) * 300, 548), '#333')
    for n, i in enumerate(picks):
        sheet.paste(to_image(frame(i)).crop(tile).resize((296, 540), Image.LANCZOS), (n * 300, 4))
    sheet.save(PREVIEW)
else:
    out = f'{PUB}/flow/settle'
    os.makedirs(out, exist_ok=True)

    def write(i):
        path = f'{out}/s_{i + 1:03d}.webp'
        to_image(frame(i)).save(path, 'WEBP', quality=88, method=6)
        return os.path.getsize(path)

    with ThreadPool(8) as pool:
        print('settle', FRAMES, sum(pool.map(write, range(FRAMES))) // 1024, 'KB')
