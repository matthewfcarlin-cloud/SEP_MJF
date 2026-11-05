import json, os, sys, glob, numpy as np
from PIL import Image
from scipy.interpolate import RBFInterpolator
from scipy.ndimage import map_coordinates
PUB = sys.argv[1]; H, W = 1024, 1536
PH = {'r-113': (1060, 912), 'l-113': (943, 862), 'r-80': (1085, 790), 'l-80': (955, 775), 'r-43': (1110, 695), 'l-43': (968, 690), 'r-5': (1172, 565), 'l-5': (985, 575), 'r33': (1178, 470), 'l33': (1030, 450), 'r70': (1225, 400), 'l70': (1095, 365), 'wa': (1022, 683), 'wb': (1085, 453), 'ws1': (1103, 550), 'ws2': (1000, 585), 'w1a': (1055, 650), 'w1b': (1003, 635), 'w2a': (1100, 490), 'w2b': (1040, 472), 'coin': (1200, 297), 'coinF': (1258, 300), 'coinB': (1143, 300), 'coinU': (1205, 266), 'coinD': (1195, 335)}
RD = json.load(open('cp.json')); ek = list(PH); A = np.array([RD[k] for k in ek], float); B = np.array([PH[k] for k in ek], float)
yy, xx = np.mgrid[0:H:4, 0:W:4]; grid = np.stack([xx.ravel(), yy.ravel()], 1).astype(float)
def warp(rgba, t):
    src = RBFInterpolator(A + (B - A) * t, A, kernel='thin_plate_spline', smoothing=30.0)(grid).reshape(xx.shape + (2,))
    sx = np.asarray(Image.fromarray(src[..., 0].astype('float32')).resize((W, H), Image.BICUBIC)); sy = np.asarray(Image.fromarray(src[..., 1].astype('float32')).resize((W, H), Image.BICUBIC))
    return np.stack([map_coordinates(rgba[..., c], [sy, sx], order=1, mode='constant') for c in range(4)], -1)
os.makedirs(f'{PUB}/flow/bend', exist_ok=True); os.makedirs(f'{PUB}/flow/phone', exist_ok=True)
tot = 0
for i, f in enumerate(sorted(glob.glob('bend/b_*.png'))):
    a = np.asarray(Image.open(f).convert('RGBA'), float) / 255
    if i < 12:
        s = 1 - i / 12; a = warp(a, s * s * (3 - 2 * s))
    o = f'{PUB}/flow/bend/b_{i + 1:03d}.webp'; Image.fromarray((np.clip(a, 0, 1) * 255).astype('uint8')).save(o, 'WEBP', quality=84, alpha_quality=88, method=4); tot += os.path.getsize(o)
print('bend', tot // 1024, 'KB'); tot = 0
for i, f in enumerate(sorted(glob.glob('phone/p_*.png'))):
    o = f'{PUB}/flow/phone/p_{i + 1:03d}.webp'; Image.open(f).convert('RGBA').save(o, 'WEBP', quality=86, alpha_quality=88, method=4); tot += os.path.getsize(o)
print('phone', tot // 1024, 'KB')
print(json.load(open('bend/coin_end.json')))
