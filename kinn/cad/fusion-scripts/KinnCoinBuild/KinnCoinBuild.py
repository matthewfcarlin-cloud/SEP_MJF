"""Kinn coin v2, built out: a 22 mm x 4.7 mm snap-in coin with its insides modelled.

Creates a new design with every part as its own component:
  Shell (graphite aluminium cup), Contacts (3 gold pads), Battery (CR1220-size cell + clip),
  PCB (nRF52840 module, IMU, crystal, PMIC, chip antenna, passives), Light ring (8 LEDs + light guide),
  Seam (polished chrome ring), Cap (gloss-black ceramic dome, chrome top ring, 'kinn' wordmark).
One copy sits assembled at the origin; a second copy is exploded 40 mm to the right.
Exports .f3d and .step to ~/Movies/kinn_fusion/exports/ and tries to save to your active project.

Run: Utilities > Scripts and Add-Ins > (+) > pick this folder > Run.  Units below are mm.
"""
import math, os, traceback
import adsk.core, adsk.fusion

MM = 0.1
OUT = os.path.expanduser('~/Movies/kinn_fusion/exports')


def P(x, y, z=0.0):
    return adsk.core.Point3D.create(x * MM, y * MM, z * MM)


def V(v):
    return adsk.core.ValueInput.createByReal(v)


def run(_context: str):
    app = adsk.core.Application.get()
    ui = app.userInterface
    try:
        doc = app.documents.add(adsk.core.DocumentTypes.FusionDesignDocumentType)
        design = adsk.fusion.Design.cast(app.activeProduct)
        design.designType = adsk.fusion.DesignTypes.ParametricDesignType
        root = design.rootComponent
        NEW = adsk.fusion.FeatureOperations.NewBodyFeatureOperation

        # ---------- appearances ----------
        lib = app.materialLibraries.itemByName('Fusion Appearance Library')
        cache = {}

        def find(keys):
            if lib is None:
                return None
            for i in range(lib.appearances.count):
                a = lib.appearances.item(i)
                n = a.name.lower()
                if all(k.lower() in n for k in keys):
                    return a
            return None

        def look(name, options, rgb):
            if name in cache:
                return cache[name]
            ap = None
            for keys in options:
                src = find(keys)
                if src:
                    try:
                        ap = design.appearances.addByCopy(src, name)
                        break
                    except Exception:
                        pass
            if ap is None:
                try:
                    ap = design.appearances.addByCopy(find(['plastic']) or lib.appearances.item(0), name)
                    for j in range(ap.appearanceProperties.count):
                        pr = ap.appearanceProperties.item(j)
                        cp = adsk.core.ColorProperty.cast(pr)
                        if cp:
                            cp.value = adsk.core.Color.create(*rgb, 0)
                            break
                except Exception:
                    ap = None
            cache[name] = ap
            return ap

        A = {
            'graphite': lambda: look('Kinn Graphite', [['anodized', 'black'], ['anodized', 'grey'], ['aluminum', 'satin']], (52, 54, 58)),
            'chrome':   lambda: look('Kinn Chrome', [['chrome'], ['polished', 'steel'], ['aluminum', 'polished']], (230, 230, 232)),
            'ceramic':  lambda: look('Kinn Black Ceramic', [['glossy', 'black'], ['piano', 'black'], ['plastic', 'black']], (10, 10, 12)),
            'gold':     lambda: look('Kinn Gold', [['gold', 'polished'], ['gold']], (212, 175, 55)),
            'cell':     lambda: look('Kinn Cell', [['steel', 'satin'], ['stainless'], ['steel']], (180, 182, 186)),
            'pcb':      lambda: look('Kinn PCB', [['plastic', 'matte', 'black'], ['plastic', 'black']], (24, 28, 30)),
            'chip':     lambda: look('Kinn Chip', [['plastic', 'matte', 'black'], ['rubber', 'black']], (18, 18, 20)),
            'passive':  lambda: look('Kinn Passive', [['ceramic'], ['plastic', 'matte', 'white']], (200, 190, 170)),
            'led':      lambda: look('Kinn LED', [['plastic', 'white'], ['plastic', 'matte', 'white']], (245, 245, 245)),
            'guide':    lambda: look('Kinn Light Guide', [['translucent'], ['frosted'], ['glass']], (235, 240, 245)),
            'word':     lambda: look('Kinn Wordmark', [['aluminum', 'brushed'], ['aluminum']], (200, 200, 205)),
        }

        def paint(feat, key):
            ap = A[key]()
            if ap is None:
                return
            for b in feat.bodies:
                try:
                    b.appearance = ap
                except Exception:
                    pass

        # ---------- geometry helpers ----------
        parts = {}

        def comp(name):
            occ = root.occurrences.addNewComponent(adsk.core.Matrix3D.create())
            occ.component.name = name
            parts[name] = occ
            return occ.component

        def extrude(c, prof, z0, h):
            inp = c.features.extrudeFeatures.createInput(prof, NEW)
            inp.startExtent = adsk.fusion.OffsetStartDefinition.create(V(z0 * MM))
            inp.setDistanceExtent(False, V(h * MM))
            return c.features.extrudeFeatures.add(inp)

        def cyl(c, r, z0, h, x=0.0, y=0.0, r_in=None, key=None, name=None):
            sk = c.sketches.add(c.xYConstructionPlane)
            sk.sketchCurves.sketchCircles.addByCenterRadius(P(x, y), r * MM)
            if r_in:
                sk.sketchCurves.sketchCircles.addByCenterRadius(P(x, y), r_in * MM)
            prof = sk.profiles.item(0)
            if r_in:
                for i in range(sk.profiles.count):
                    if sk.profiles.item(i).profileLoops.count == 2:
                        prof = sk.profiles.item(i)
            f = extrude(c, prof, z0, h)
            if key:
                paint(f, key)
            if name and f.bodies.count:
                f.bodies.item(0).name = name
            return f

        def box(c, cx, cy, w, d, z0, h, key, name=None):
            sk = c.sketches.add(c.xYConstructionPlane)
            sk.sketchCurves.sketchLines.addCenterPointRectangle(P(cx, cy), P(cx + w / 2, cy + d / 2))
            f = extrude(c, sk.profiles.item(0), z0, h)
            paint(f, key)
            if name and f.bodies.count:
                f.bodies.item(0).name = name
            return f

        def revolve(c, lines, spline=None, key=None, name=None):
            """lines: list of (r, z) points joined in order; spline: (index, [(r, z)...]) replaces the segment after that index."""
            sk = c.sketches.add(c.xZConstructionPlane)
            to = lambda r, z: sk.modelToSketchSpace(P(r, 0, z))
            L = sk.sketchCurves.sketchLines
            pts = [to(r, z) for r, z in lines]
            n = len(pts)
            for i in range(n):
                a, b = pts[i], pts[(i + 1) % n]
                if spline and spline[0] == i:
                    col = adsk.core.ObjectCollection.create()
                    col.add(a)
                    for r, z in spline[1]:
                        col.add(to(r, z))
                    col.add(b)
                    sk.sketchCurves.sketchFittedSplines.add(col)
                else:
                    L.addByTwoPoints(a, b)
            prof = sk.profiles.item(0)
            inp = c.features.revolveFeatures.createInput(prof, c.zConstructionAxis, NEW)
            inp.setAngleExtent(False, V(2 * math.pi))
            f = c.features.revolveFeatures.add(inp)
            if key:
                paint(f, key)
            if name and f.bodies.count:
                f.bodies.item(0).name = name
            return f

        # ---------- parts (assembled positions, mm) ----------
        c = comp('Shell')
        revolve(c, [(0, 0), (10.6, 0), (11, 0.4), (11, 2.8), (10.4, 2.8), (10.4, 0.6), (0, 0.6)], key='graphite', name='Shell cup')

        c = comp('Contacts')
        for k, a in enumerate((90, 210, 330)):
            x, y = 5.2 * math.cos(math.radians(a)), 5.2 * math.sin(math.radians(a))
            cyl(c, 0.9, -0.12, 0.72, x, y, key='gold', name=f'Contact {k + 1}')

        c = comp('Battery')
        cyl(c, 6.25, 0.65, 1.95, key='cell', name='Cell (CR1220 size)')
        box(c, 0, 0, 12.0, 2.2, 2.6, 0.1, 'cell', 'Cell clip')

        c = comp('PCB')
        cyl(c, 10.1, 2.7, 0.6, key='pcb', name='Board')
        Z = 3.3
        box(c, -2.5, 0.5, 7.0, 7.0, Z, 0.8, 'chip', 'nRF52840 module')
        box(c, 4.0, 2.5, 3.0, 2.5, Z, 0.85, 'chip', 'IMU')
        box(c, 4.5, -3.0, 2.0, 1.6, Z, 0.6, 'passive', 'Crystal')
        box(c, 1.5, -5.0, 2.0, 2.0, Z, 0.6, 'chip', 'Power IC')
        box(c, 0.0, -8.0, 3.2, 1.6, Z, 0.9, 'passive', 'Chip antenna')
        for k, (x, y, w, d) in enumerate([(1.5, 4.5, 1, .5), (2.6, 4.5, 1, .5), (-6.8, 4, .5, 1), (5.5, -0.5, .5, 1),
                                          (6.6, -0.5, .5, 1), (-1, -5.5, 1, .5), (3.5, -6.2, 1, .5), (-4.5, -5.6, 1, .5)]):
            box(c, x, y, w, d, Z, 0.35, 'passive', f'Passive {k + 1}')

        c = comp('Light ring')
        for k in range(8):
            a = math.radians(22.5 + 45 * k)
            box(c, 9.0 * math.cos(a), 9.0 * math.sin(a), 0.8, 0.8, 3.3, 0.3, 'led', f'LED {k + 1}')
        cyl(c, 10.3, 3.3, 0.2, r_in=9.5, key='guide', name='Light guide')

        c = comp('Seam')
        cyl(c, 11.05, 2.8, 0.2, r_in=10.4, key='chrome', name='Chrome seam ring')

        c = comp('Cap')
        revolve(c, [(11, 3.0), (11, 3.5), (7.5, 4.7), (0, 4.7), (0, 4.25), (9.3, 4.15), (10.4, 3.5), (10.4, 3.0)],
                spline=(1, [(10.75, 4.05), (10.1, 4.42), (9.0, 4.63)]), key='ceramic', name='Ceramic dome')
        cyl(c, 6.75, 4.7, 0.04, r_in=6.55, key='chrome', name='Top ring')
        try:
            pin = c.constructionPlanes.createInput()
            pin.setByOffset(c.xYConstructionPlane, V(4.7 * MM))
            pl = c.constructionPlanes.add(pin)
            sk = c.sketches.add(pl)
            ti = sk.sketchTexts.createInput2('kinn', 3.2 * MM)
            ti.setAsMultiLine(P(-5, -2.2), P(5, 2.2), adsk.core.HorizontalAlignments.CenterHorizontalAlignment,
                              adsk.core.VerticalAlignments.MiddleVerticalAlignment, 0)
            txt = sk.sketchTexts.add(ti)
            inp = c.features.extrudeFeatures.createInput(txt, NEW)
            inp.setDistanceExtent(False, V(0.04 * MM))
            f = c.features.extrudeFeatures.add(inp)
            paint(f, 'word')
        except Exception:
            pass  # wordmark is cosmetic

        # ---------- exploded copy, 40 mm to the right ----------
        lift = {'Contacts': -6, 'Shell': 0, 'Battery': 6, 'PCB': 13, 'Light ring': 20, 'Seam': 25, 'Cap': 31}
        for name, dz in lift.items():
            m = adsk.core.Matrix3D.create()
            m.translation = adsk.core.Vector3D.create(40 * MM, 0, dz * MM)
            root.occurrences.addExistingComponent(parts[name].component, m)

        try:
            app.activeViewport.visualStyle = adsk.core.VisualStyles.ShadedVisualStyle
        except Exception:
            pass
        app.activeViewport.fit()

        # ---------- export + save ----------
        os.makedirs(OUT, exist_ok=True)
        em = design.exportManager
        em.execute(em.createFusionArchiveExportOptions(os.path.join(OUT, 'Kinn_Coin_v2_built_out.f3d')))
        em.execute(em.createSTEPExportOptions(os.path.join(OUT, 'Kinn_Coin_v2_built_out.step')))
        saved = ''
        try:
            doc.saveAs('Kinn Coin v2 (built out)', app.data.activeProject.rootFolder, 'Snap-in coin with internals modelled', '')
            saved = ' and saved to your active project'
        except Exception:
            pass
        ui.messageBox('Kinn coin v2 built' + saved + '.\nExported to ' + OUT)
    except Exception:
        ui.messageBox('Kinn coin build failed:\n' + traceback.format_exc())
