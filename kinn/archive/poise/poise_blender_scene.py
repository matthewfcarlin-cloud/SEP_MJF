import bpy, math, sys, os
from mathutils import Vector

ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
HERE = '/home/claude/blend'
FPS = 24
DUR = 12 * FPS  # 288 frames

bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
sc.unit_settings.system = 'METRIC'

# ---------------- import ----------------
groups = {
    'Smart_Tape': 'tape', 'Stretch_Sensor': 'ink', 'Sensor_Lead': 'ink',
    'Electrode_0': 'ink2', 'Electrode_1': 'ink2', 'Electrode_2': 'ink2',
    'Snap_Dock': 'alu', 'Contact_0': 'gold', 'Contact_1': 'gold', 'Contact_2': 'gold',
    'Pod_Coin': 'coin', 'Status_LED': 'led'}
objs = {}
for n in groups:
    bpy.ops.wm.stl_import(filepath=os.path.join(HERE, n + '.stl'))
    o = bpy.context.selected_objects[0]
    o.name = n
    o.scale = (0.001, 0.001, 0.001)
    objs[n] = o
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
for o in objs.values():
    bpy.context.view_layer.objects.active = o
    bpy.ops.object.select_all(action='DESELECT'); o.select_set(True)
    try:
        bpy.ops.object.shade_auto_smooth(angle=math.radians(35))
    except Exception:
        bpy.ops.object.shade_smooth()

# product root (for turntable) — parent all to an empty at product centre
root = bpy.data.objects.new('Product', None); sc.collection.objects.link(root)
for o in objs.values():
    o.parent = root
# coin rig (coin + LED move together)
coin_rig = bpy.data.objects.new('CoinRig', None); sc.collection.objects.link(coin_rig)
coin_rig.parent = root
coin_rig.location = (-0.076, 0, 0.0)
for n in ('Pod_Coin', 'Status_LED'):
    o = objs[n]
    for v in o.data.vertices: v.co.x += 0.076
    o.parent = coin_rig

# ---------------- materials ----------------
def node_mat(name):
    m = bpy.data.materials.new(name); m.use_nodes = True
    nt = m.node_tree; b = nt.nodes['Principled BSDF']
    return m, nt, b

def setin(b, key, val):
    if key in b.inputs: b.inputs[key].default_value = val

# tape: woven kinesiology fabric
m, nt, b = node_mat('Tape')
setin(b, 'Base Color', (0.012, 0.020, 0.040, 1))
setin(b, 'Roughness', 0.82)
setin(b, 'Sheen Weight', 0.55); setin(b, 'Sheen Roughness', 0.45)
setin(b, 'Sheen Tint', (0.55, 0.62, 0.75, 1))
tc = nt.nodes.new('ShaderNodeTexCoord')
mp = nt.nodes.new('ShaderNodeMapping'); mp.inputs['Scale'].default_value = (1, 1, 1)
w1 = nt.nodes.new('ShaderNodeTexWave'); w1.wave_type = 'BANDS'; w1.bands_direction = 'X'
w1.inputs['Scale'].default_value = 900; w1.inputs['Distortion'].default_value = 0.6
w2 = nt.nodes.new('ShaderNodeTexWave'); w2.wave_type = 'BANDS'; w2.bands_direction = 'Y'
w2.inputs['Scale'].default_value = 1400; w2.inputs['Distortion'].default_value = 0.6
nz = nt.nodes.new('ShaderNodeTexNoise'); nz.inputs['Scale'].default_value = 3000
mx = nt.nodes.new('ShaderNodeMath'); mx.operation = 'MULTIPLY'
ad = nt.nodes.new('ShaderNodeMath'); ad.operation = 'ADD'
bm = nt.nodes.new('ShaderNodeBump'); bm.inputs['Strength'].default_value = 0.6
bm.inputs['Distance'].default_value = 0.00008
nt.links.new(tc.outputs['Object'], mp.inputs['Vector'])
for w in (w1, w2, nz): nt.links.new(mp.outputs['Vector'], w.inputs['Vector'])
nt.links.new(w1.outputs['Fac'], mx.inputs[0]); nt.links.new(w2.outputs['Fac'], mx.inputs[1])
nt.links.new(mx.outputs[0], ad.inputs[0]); nt.links.new(nz.outputs['Fac'], ad.inputs[1])
nt.links.new(ad.outputs[0], bm.inputs['Height']); nt.links.new(bm.outputs['Normal'], b.inputs['Normal'])
M_tape = m

m, nt, b = node_mat('SilverInk'); setin(b, 'Base Color', (0.80, 0.81, 0.83, 1)); setin(b, 'Metallic', 1.0); setin(b, 'Roughness', 0.32); M_ink = m
m, nt, b = node_mat('SilverInk2'); setin(b, 'Base Color', (0.55, 0.56, 0.58, 1)); setin(b, 'Metallic', 1.0); setin(b, 'Roughness', 0.22); M_ink2 = m
m, nt, b = node_mat('Aluminum')
setin(b, 'Base Color', (0.62, 0.63, 0.65, 1)); setin(b, 'Metallic', 1.0); setin(b, 'Roughness', 0.28)
setin(b, 'Anisotropic', 0.6); M_alu = m
m, nt, b = node_mat('Gold'); setin(b, 'Base Color', (1.0, 0.76, 0.34, 1)); setin(b, 'Metallic', 1.0); setin(b, 'Roughness', 0.18); M_gold = m
m, nt, b = node_mat('CoinCeramic')
setin(b, 'Base Color', (0.86, 0.86, 0.84, 1)); setin(b, 'Roughness', 0.42)
setin(b, 'Coat Weight', 0.35); setin(b, 'Coat Roughness', 0.18)
setin(b, 'Subsurface Weight', 0.08); setin(b, 'Subsurface Radius', (0.5, 0.5, 0.5)); setin(b, 'Subsurface Scale', 0.001)
M_coin = m
m = bpy.data.materials.new('LED'); m.use_nodes = True; nt = m.node_tree
for nd in list(nt.nodes):
    if nd.type == 'BSDF_PRINCIPLED': nt.nodes.remove(nd)
em = nt.nodes.new('ShaderNodeEmission'); em.inputs['Color'].default_value = (0.05, 0.95, 0.75, 1)
em.inputs['Strength'].default_value = 30.0
nt.links.new(em.outputs[0], nt.nodes['Material Output'].inputs['Surface']); M_led = m; LED_EM = em
mats = {'tape': M_tape, 'ink': M_ink, 'ink2': M_ink2, 'alu': M_alu, 'gold': M_gold, 'coin': M_coin, 'led': M_led}
for n, g in groups.items():
    objs[n].data.materials.clear(); objs[n].data.materials.append(mats[g])

# bevel the coin / dock edges a touch for highlights
for n, w in (('Pod_Coin', 0.00015), ('Snap_Dock', 0.00012)):
    md = objs[n].modifiers.new('bev', 'BEVEL'); md.width = w; md.segments = 3; md.limit_method = 'ANGLE'

# ---------------- backdrop (cyclorama) ----------------
bpy.ops.mesh.primitive_plane_add(size=1)
bd = bpy.context.active_object; bd.name = 'Backdrop'
bpy.ops.object.mode_set(mode='EDIT')
bpy.ops.mesh.select_all(action='SELECT')
bpy.ops.object.mode_set(mode='OBJECT')
# build sweep from a curve profile instead
bpy.data.objects.remove(bd)
import bmesh
me = bpy.data.meshes.new('cyc'); bmv = bmesh.new()
W = 3.0; prof = []
for i in range(0, 41):
    a = i / 40 * (math.pi / 2)
    r = 0.5
    prof.append((0, -0.6 + 0.0, 0) if i == 0 else None)
prof = []
for y in [-2.0 + 0.1 * k for k in range(0, 26)]:  # floor from y=-2 to 0.5
    prof.append((y, 0.0))
for i in range(1, 25):
    a = i / 24 * (math.pi / 2)
    prof.append((0.5 + 0.6 * math.sin(a), 0.6 - 0.6 * math.cos(a)))
for k in range(1, 10):
    prof.append((1.1, 0.6 + 0.2 * k))
verts = []
for (y, z) in prof:
    verts.append([bmv.verts.new((-W, y, z)), bmv.verts.new((W, y, z))])
for i in range(len(verts) - 1):
    bmv.faces.new((verts[i][0], verts[i][1], verts[i + 1][1], verts[i + 1][0]))
bmv.to_mesh(me); bmv.free()
bd = bpy.data.objects.new('Backdrop', me); sc.collection.objects.link(bd)
bd.location = (0, 0, -0.00002)
for p in bd.data.polygons: p.use_smooth = True
m, nt, b = node_mat('Backdrop'); setin(b, 'Base Color', (0.42, 0.415, 0.40, 1)); setin(b, 'Roughness', 0.9)
bd.data.materials.append(m)

# ---------------- lights ----------------
def area(name, loc, rot, size, energy, color=(1, 1, 1)):
    ld = bpy.data.lights.new(name, 'AREA'); ld.shape = 'RECTANGLE'; ld.size = size[0]; ld.size_y = size[1]
    ld.energy = energy; ld.color = color
    o = bpy.data.objects.new(name, ld); sc.collection.objects.link(o)
    o.location = loc; o.rotation_euler = [math.radians(a) for a in rot]
    return o
area('Key', (-0.35, -0.45, 0.55), (48, 0, -38), (0.6, 0.35), 9, (1.0, 0.97, 0.93))
area('Fill', (0.55, -0.35, 0.25), (70, 0, 55), (0.5, 0.5), 1.6, (0.9, 0.95, 1.0))
area('Rim', (0.05, 0.55, 0.30), (-60, 0, 180), (0.8, 0.12), 9, (0.92, 0.96, 1.0))
area('Top', (0, 0, 0.7), (0, 0, 0), (0.35, 0.35), 2.0)
w = bpy.data.worlds.new('W'); sc.world = w; w.use_nodes = True
w.node_tree.nodes['Background'].inputs['Color'].default_value = (0.05, 0.05, 0.055, 1)
w.node_tree.nodes['Background'].inputs['Strength'].default_value = 0.25

# ---------------- cameras & animation ----------------
def cam(name, lens, fstop, focus_obj=None):
    cd = bpy.data.cameras.new(name); cd.lens = lens; cd.sensor_width = 36
    cd.dof.use_dof = True; cd.dof.aperture_fstop = fstop
    o = bpy.data.objects.new(name, cd); sc.collection.objects.link(o)
    return o, cd

def look(o, target):
    d = Vector(target) - o.location
    o.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler()

def key_cam(o, cd, f, loc, tgt, focus):
    o.location = loc; look(o, tgt); o.keyframe_insert('location', frame=f); o.keyframe_insert('rotation_euler', frame=f)
    cd.dof.focus_distance = (Vector(focus) - Vector(loc)).length; cd.dof.keyframe_insert('focus_distance', frame=f)

coin_c = (-0.076, 0.0, 0.002)
# Shot A (1-96): low macro slide across sensor to coin
cA, dA = cam('CamA', 85, 5.6)
key_cam(cA, dA, 1, (0.075, -0.13, 0.05), (0.02, 0.0, 0.0), (0.025, 0.0, 0.0))
key_cam(cA, dA, 96, (-0.02, -0.115, 0.048), (-0.065, 0.0, 0.0), coin_c)
# Shot B (97-192): top-down-ish orbit of whole product (product rotates)
cB, dB = cam('CamB', 70, 8.0)
key_cam(cB, dB, 97, (0.0, -0.36, 0.30), (0.0, 0.0, 0.0), (0, 0, 0))
key_cam(cB, dB, 192, (0.0, -0.31, 0.27), (0.0, 0.0, 0.0), (0, 0, 0))
root.rotation_euler = (0, 0, math.radians(-28)); root.keyframe_insert('rotation_euler', frame=97)
root.rotation_euler = (0, 0, math.radians(22)); root.keyframe_insert('rotation_euler', frame=192)
root.rotation_euler = (0, 0, math.radians(-18)); root.keyframe_insert('rotation_euler', frame=193)
root.rotation_euler = (0, 0, math.radians(-18)); root.keyframe_insert('rotation_euler', frame=288)
root.rotation_euler = (0, 0, 0); root.keyframe_insert('rotation_euler', frame=1)
root.rotation_euler = (0, 0, 0); root.keyframe_insert('rotation_euler', frame=96)
# Shot C (193-288): coin lift & drop into dock, close 3/4
cC, dC = cam('CamC', 85, 5.6)
cpos = Vector((-0.076 * math.cos(math.radians(-18)), -0.076 * math.sin(math.radians(-18)), 0.002))
key_cam(cC, dC, 193, (cpos.x + 0.055, cpos.y - 0.11, 0.075), (cpos.x, cpos.y, 0.004), cpos)
key_cam(cC, dC, 226, (cpos.x + 0.05, cpos.y - 0.115, 0.082), (cpos.x, cpos.y, 0.016), (cpos.x, cpos.y, 0.022))
key_cam(cC, dC, 288, (cpos.x + 0.035, cpos.y - 0.095, 0.058), (cpos.x, cpos.y, 0.003), cpos)
coin_rig.location.z = 0.0; coin_rig.keyframe_insert('location', frame=193)
coin_rig.location.z = 0.024; coin_rig.keyframe_insert('location', frame=222)
coin_rig.location.z = 0.024; coin_rig.keyframe_insert('location', frame=236)
coin_rig.location.z = 0.0; coin_rig.keyframe_insert('location', frame=252)
coin_rig.rotation_euler = (0, 0, 0); coin_rig.keyframe_insert('rotation_euler', frame=193)
coin_rig.rotation_euler = (math.radians(8), math.radians(-6), math.radians(140)); coin_rig.keyframe_insert('rotation_euler', frame=229)
coin_rig.rotation_euler = (0, 0, math.radians(360)); coin_rig.keyframe_insert('rotation_euler', frame=252)
# LED: dim, pulses on after click
for f, s in ((1, 18), (96, 18), (193, 6), (250, 4), (254, 60), (262, 22), (270, 40), (288, 26)):
    LED_EM.inputs['Strength'].default_value = s; LED_EM.inputs['Strength'].keyframe_insert('default_value', frame=f)

# easing
for o in (cA, cB, cC, root, coin_rig):
    if o.animation_data and o.animation_data.action:
        try:
            for fc in o.animation_data.action.fcurves:
                for kp in fc.keyframe_points: kp.interpolation = 'BEZIER'; kp.easing = 'AUTO'
        except Exception:
            pass
# camera switching via markers
for f, c in ((1, cA), (97, cB), (193, cC)):
    mk = sc.timeline_markers.new('m%d' % f, frame=f); mk.camera = c
sc.camera = cA

# ---------------- render settings ----------------
sc.render.engine = 'CYCLES'
sc.cycles.device = 'CPU'
sc.cycles.samples = int(ARGS[1]) if len(ARGS) > 1 else 48
sc.cycles.use_denoising = True
try: sc.cycles.denoiser = 'OPENIMAGEDENOISE'
except Exception: pass
sc.cycles.max_bounces = 6; sc.cycles.glossy_bounces = 3; sc.cycles.transmission_bounces = 2
sc.render.resolution_x = 1920; sc.render.resolution_y = 1080
sc.render.resolution_percentage = int(ARGS[2]) if len(ARGS) > 2 else 100
sc.render.fps = FPS; sc.frame_start = 1; sc.frame_end = DUR
sc.view_settings.view_transform = 'AgX'
try: sc.view_settings.look = 'AgX - Medium High Contrast'
except Exception: pass
sc.render.film_transparent = False
sc.render.image_settings.file_format = 'JPEG'; sc.render.image_settings.quality = 94
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(HERE, 'poise.blend'))

mode = ARGS[0] if ARGS else 'save'
if mode == 'still':
    for f in [int(x) for x in ARGS[3].split(',')]:
        sc.frame_set(f)
        sc.camera = cA if f < 97 else (cB if f < 193 else cC)
        sc.render.filepath = os.path.join(HERE, 'still_%03d.jpg' % f)
        bpy.ops.render.render(write_still=True)
