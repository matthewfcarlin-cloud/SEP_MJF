"""Rendered joins -> site. Their photo end is warped onto the hero photo's tape. Usage: flow_post.py RENDERS PUBLIC"""
import json, os, sys, glob, numpy as np
from PIL import Image
from scipy.interpolate import RBFInterpolator
from scipy.ndimage import map_coordinates
HERE = os.path.dirname(os.path.abspath(__file__)); SRC, PUB = sys.argv[1], sys.argv[2]; H, W = 1024, 1536
PH = json.load(open(f'{HERE}/photo_pts.json')); RD = json.load(open(f'{SRC}/wrap/cp.json')); K = [k for k in PH if k in RD]
A, B = np.array([RD[k] for k in K], float), np.array([PH[k] for k in K], float)
yy, xx = np.mgrid[0:H:4, 0:W:4]; grid = np.stack([xx.ravel(), yy.ravel()], 1).astype(float)
def warp(a, t):
    s = RBFInterpolator(A + (B - A) * t, A, kernel='thin_plate_spline', smoothing=100000.0)(grid).reshape(xx.shape + (2,))
    sx = np.asarray(Image.fromarray(s[..., 0].astype('float32')).resize((W, H), Image.BICUBIC)); sy = np.asarray(Image.fromarray(s[..., 1].astype('float32')).resize((W, H), Image.BICUBIC))
    return np.stack([map_coordinates(a[..., c], [sy, sx], order=1, mode='constant') for c in range(4)], -1)
ease = lambda x: x * x * (3 - 2 * x)
def run(name, pre, out, weight):
    os.makedirs(f'{PUB}/flow/{out}', exist_ok=True); tot = 0; fs = sorted(glob.glob(f'{SRC}/{name}/{pre}_*.png'))
    for i, f in enumerate(fs):
        a = np.asarray(Image.open(f).convert('RGBA'), float) / 255; w = weight(i, len(fs))
        if w > 0: a = warp(a, ease(w))
        o = f'{PUB}/flow/{out}/{pre}_{i + 1:03d}.webp'; Image.fromarray((np.clip(a, 0, 1) * 255).astype('uint8')).save(o, 'WEBP', quality=84, alpha_quality=88, method=4); tot += os.path.getsize(o)
    print(out, len(fs), tot // 1024, 'KB')
run('wrap', 'a', 'wrap', lambda i, n: max(0, (i - (n - 16)) / 15))
run('unwrap', 'c', 'unwrap', lambda i, n: max(0, 1 - i / 12))
def stills(name, out):
    os.makedirs(f'{PUB}/flow/{out}', exist_ok=True); tot = 0
    for g in sorted(glob.glob(f'{SRC}/{name}/*.png')):
        o = f'{PUB}/flow/{out}/{os.path.basename(g)[:-4]}.webp'; Image.open(g).convert('RGBA').save(o, 'WEBP', quality=84, alpha_quality=88, method=4); tot += os.path.getsize(o)
    print(out, tot // 1024, 'KB')
stills('hi/cursor', 'coin'); stills('hi/intro', 'intro'); stills('hi/flex', 'flex')
