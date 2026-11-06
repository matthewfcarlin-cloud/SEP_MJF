"""Rendered joins -> site. Their photo end is warped onto the hero photo's tape. Usage: flow_post.py RENDERS PUBLIC"""
import json, os, sys, glob, numpy as np
from multiprocessing.pool import ThreadPool
from PIL import Image
from scipy.interpolate import RBFInterpolator
from scipy.ndimage import map_coordinates
HERE = os.path.dirname(os.path.abspath(__file__)); SRC, PUB = sys.argv[1], sys.argv[2]; H, W = 1024, 1536
PH = json.load(open(f'{HERE}/photo_pts.json')); RD = json.load(open(f'{SRC}/wrap/cp.json')); K = [k for k in PH if k in RD]
A, B = np.array([RD[k] for k in K], float), np.array([PH[k] for k in K], float)
yy, xx = np.mgrid[0:H:4, 0:W:4]; grid = np.stack([xx.ravel(), yy.ravel()], 1).astype(float)
def warp(a, t):
    s = RBFInterpolator(A + (B - A) * t, A, kernel='thin_plate_spline', smoothing=100000.0)(grid).reshape(xx.shape + (2,))
    h, w = a.shape[:2]   # the landmarks are on the 1536x1024 stage, the frames are larger. Scaling how far each point moves, not where it lands, leaves no shift where nothing moves
    py, px = np.mgrid[0:h, 0:w]
    sx = px + np.asarray(Image.fromarray((s[..., 0] - xx).astype('float32')).resize((w, h), Image.BICUBIC)) * w / W; sy = py + np.asarray(Image.fromarray((s[..., 1] - yy).astype('float32')).resize((w, h), Image.BICUBIC)) * h / H
    return np.stack([map_coordinates(a[..., c], [sy, sx], order=1, mode='constant') for c in range(4)], -1)
ease = lambda x: x * x * (3 - 2 * x)
QUALITY = 92   # lower shows blocks in the coin's soft reflections
PAGE_BG = (13, 18, 18, 255)   # the site's --bg. Flattened on it, a frame looks the same as a transparent one and is about a quarter of the size
def run(name, pre, out, weight):
    os.makedirs(f'{PUB}/flow/{out}', exist_ok=True); tot = 0; fs = sorted(glob.glob(f'{SRC}/{name}/{pre}_*.png'))
    for i, f in enumerate(fs):
        a = np.asarray(Image.open(f).convert('RGBA'), float) / 255; w = weight(i, len(fs))
        if w > 0: a = warp(a, ease(w))
        o = f'{PUB}/flow/{out}/{pre}_{i + 1:03d}.webp'; im = Image.fromarray(np.rint(np.clip(a, 0, 1) * 255).astype('uint8'))
        Image.alpha_composite(Image.new('RGBA', im.size, PAGE_BG), im).convert('RGB').save(o, 'WEBP', quality=QUALITY, method=6); tot += os.path.getsize(o)
    print(out, len(fs), tot // 1024, 'KB')
run('wrap', 'a', 'wrap', lambda i, n: max(0, (i - (n - 16)) / 15))
def still(args):
    g, o = args; im = Image.open(g).convert('RGBA')
    Image.alpha_composite(Image.new('RGBA', im.size, PAGE_BG), im).convert('RGB').save(o, 'WEBP', quality=QUALITY, method=6)
    return os.path.getsize(o)
def stills(name, out):
    os.makedirs(f'{PUB}/flow/{out}', exist_ok=True)
    jobs = [(g, f'{PUB}/flow/{out}/{os.path.basename(g)[:-4]}.webp') for g in sorted(glob.glob(f'{SRC}/{name}/*.png'))]
    with ThreadPool(8) as pool: tot = sum(pool.map(still, jobs))
    print(out, tot // 1024, 'KB')
stills('hi2/cursor', 'coin'); stills('hi2/intro', 'intro'); stills('hi2/flex', 'flex')
