"""Wrap frames -> site: warp the ends onto the film's and the photo's tape, write webp. Also writes hero and tape cutout."""
import json, os, sys, glob, numpy as np
from PIL import Image, ImageDraw, ImageFilter
from scipy.interpolate import RBFInterpolator
from scipy.ndimage import map_coordinates, gaussian_filter
PUB = sys.argv[1]; H, W = 1024, 1536
os.makedirs(f'{PUB}/flow/wrap', exist_ok=True)
photo_im = Image.open('reco-hero.png').convert('RGB'); photo = np.asarray(photo_im, float) / 255
photo_im.save(f'{PUB}/flow/hero.webp', 'WEBP', quality=90, method=6); photo_im.convert('RGB').resize((1200, 800), Image.LANCZOS).save(f'{PUB}/flow/hero.jpg', quality=84)
# tape cut out of the photograph
OUT = [(1260,267),(1280,275),(1297,305),(1290,335),(1265,360),(1225,400),(1195,435),(1177,465),(1175,505),(1177,550),(1165,585),(1145,630),(1115,685),(1102,705),(1092,740),(1085,790),(1075,865),(1067,907),(1055,912),(1025,905),(960,880),(945,865),(942,845),(955,775),(970,690),(980,615),(987,570),(1000,520),(1017,475),(1060,415),(1100,360),(1140,315),(1145,295),(1165,275),(1210,265),(1250,267)]
WIN = [(1080,452),(1095,460),(1105,505),(1102,550),(1085,610),(1050,655),(1025,682),(1012,680),(1000,620),(1000,580),(1017,510),(1037,475),(1065,455)]
K = 4; m = Image.new('L', (W * K, H * K), 0); d = ImageDraw.Draw(m)
d.polygon([(x * K, y * K) for x, y in OUT], fill=255); d.polygon([(x * K, y * K) for x, y in WIN], fill=0)
m = m.resize((W, H), Image.LANCZOS).filter(ImageFilter.GaussianBlur(1.1)); TM = np.asarray(m, float) / 255
mx, mn = photo.max(-1), photo.min(-1); sat = (mx - mn) / np.maximum(mx, 1e-3)
Y_, X_ = np.mgrid[0:H, 0:W]; keep = np.clip((0.34 - sat) / 0.08, 0, 1); keep[np.hypot(X_ - 1200, Y_ - 300) < 66] = 1
TM = TM * gaussian_filter(keep, 0.7)
cut = np.dstack([photo, TM]); Image.fromarray((cut * 255).astype('uint8'), 'RGBA').save(f'{PUB}/flow/tape.webp', 'WEBP', quality=90, alpha_quality=95, method=6)
# warps
PH = {'r-113': (1060, 912), 'l-113': (943, 862), 'r-80': (1085, 790), 'l-80': (955, 775), 'r-43': (1110, 695), 'l-43': (968, 690), 'r-5': (1172, 565), 'l-5': (985, 575), 'r33': (1178, 470), 'l33': (1030, 450), 'r70': (1225, 400), 'l70': (1095, 365), 'wa': (1022, 683), 'wb': (1085, 453), 'ws1': (1103, 550), 'ws2': (1000, 585), 'w1a': (1055, 650), 'w1b': (1003, 635), 'w2a': (1100, 490), 'w2b': (1040, 472), 'coin': (1200, 297), 'coinF': (1258, 300), 'coinB': (1143, 300), 'coinU': (1205, 266), 'coinD': (1195, 335)}
RD = json.load(open('cp.json')); ek = list(PH); EA = np.array([RD[k] for k in ek], float); EB = np.array([PH[k] for k in ek], float)
yy, xx = np.mgrid[0:H:4, 0:W:4]; grid = np.stack([xx.ravel(), yy.ravel()], 1).astype(float)
def warp(rgba, A, B, t):
    C = A + (B - A) * t
    src = RBFInterpolator(C, A, kernel='thin_plate_spline', smoothing=30.0)(grid).reshape(xx.shape + (2,))
    sx = np.asarray(Image.fromarray(src[..., 0].astype('float32')).resize((W, H), Image.BICUBIC)); sy = np.asarray(Image.fromarray(src[..., 1].astype('float32')).resize((W, H), Image.BICUBIC))
    return np.stack([map_coordinates(rgba[..., c], [sy, sx], order=1, mode='constant') for c in range(4)], -1)
# the start: onto the fiber film's last frame
K_ = 1536 / 1440
FILM = {'coin': (1035, 165), 'tip': (1160, 225), 'wa': (472, 548), 'wb': (795, 358), 'ws1': (655, 558), 'ws2': (620, 392), 'r-113': (110, 800), 'l-113': (45, 730), 'l33': (730, 318), 'r33': (905, 428), 'l70': (905, 225), 'r70': (1000, 345), 'l-43': (395, 495), 'r-43': (545, 665)}
flat = json.load(open('flat.json')); cs = json.load(open('cams.json'))['start']
fw = np.array(cs['fwd']); up = np.array(cs['up']); rt = np.cross(fw, up); rt /= np.linalg.norm(rt); up = np.cross(rt, fw); C0 = np.array(cs['cam']); f0 = cs['lens'] / 36 * W
def pj(P):
    d = np.array(P) - C0; z = d @ fw; return (W / 2 + f0 * (d @ rt) / z, H / 2 - f0 * (d @ up) / z)
sk = [k for k in FILM if k in flat]; SA = np.array([pj(flat[k]) for k in sk]); SB = np.array([(FILM[k][0] * K_, FILM[k][1] * K_ + 80) for k in sk])
files = sorted(glob.glob('wrap/a_*.png')); N = len(files); END = 18; START = 10
total = 0
for i, f in enumerate(files):
    a = np.asarray(Image.open(f).convert('RGBA'), float) / 255
    e = (i - (N - END)) / (END - 1)
    if e > 0:
        e = e * e * (3 - 2 * e); a = warp(a, EA, EB, e)
    if i < START:
        s = 1 - i / START; a = warp(a, SA, SB, s * s * (3 - 2 * s))
    out = f'{PUB}/flow/wrap/a_{i + 1:03d}.webp'
    Image.fromarray((np.clip(a, 0, 1) * 255).astype('uint8'), 'RGBA').save(out, 'WEBP', quality=82, alpha_quality=88, method=4); total += os.path.getsize(out)
print(N, 'wrap frames', total // 1024, 'KB')
