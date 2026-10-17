"""Kinn: export every Kinn / Poise design from Fusion's cloud projects.

Finds every Fusion design whose name looks like this project (kinn, poise, posture, strip, pod, coin, tape)
in every project you can see, opens it, and saves a .f3d (editable) and a .step copy to
~/Movies/kinn_fusion/exports/. Also writes exports/index.txt listing what was exported.

Run: Utilities > Scripts and Add-Ins > (+) > pick this folder > Run.
"""
import os, re, traceback
import adsk.core, adsk.fusion

OUT = os.path.expanduser('~/Movies/kinn_fusion/exports')
MATCH = re.compile(r'kinn|poise|posture|strip|pod|coin|tape', re.I)


def safe(s):
    return re.sub(r'[^A-Za-z0-9._-]+', '_', s).strip('_')[:80]


def walk(folder):
    for df in folder.dataFiles:
        yield df
    for sub in folder.dataFolders:
        yield from walk(sub)


def run(_context: str):
    app = adsk.core.Application.get()
    ui = app.userInterface
    os.makedirs(OUT, exist_ok=True)
    log = []
    try:
        for proj in app.data.dataProjects:
            for df in walk(proj.rootFolder):
                try:
                    if df.fileExtension != 'f3d' or not MATCH.search(df.name):
                        continue
                    base = f'{safe(proj.name)}__{safe(df.name)}_v{df.versionNumber}'
                    doc = app.documents.open(df, True)
                    design = adsk.fusion.Design.cast(doc.products.itemByProductType('DesignProductType'))
                    em = design.exportManager
                    em.execute(em.createFusionArchiveExportOptions(os.path.join(OUT, base + '.f3d')))
                    em.execute(em.createSTEPExportOptions(os.path.join(OUT, base + '.step')))
                    doc.close(False)
                    log.append(f'OK    {proj.name} / {df.name} (v{df.versionNumber})')
                    adsk.doEvents()
                except Exception:
                    log.append(f'FAIL  {proj.name} / {df.name}: {traceback.format_exc().splitlines()[-1]}')
        # also the currently open, unsaved designs
        for doc in list(app.documents):
            try:
                if doc.isSaved or not MATCH.search(doc.name):
                    continue
                design = adsk.fusion.Design.cast(doc.products.itemByProductType('DesignProductType'))
                base = 'open__' + safe(doc.name)
                em = design.exportManager
                em.execute(em.createFusionArchiveExportOptions(os.path.join(OUT, base + '.f3d')))
                em.execute(em.createSTEPExportOptions(os.path.join(OUT, base + '.step')))
                log.append(f'OK    (open, unsaved) {doc.name}')
            except Exception:
                log.append(f'FAIL  (open) {doc.name}: {traceback.format_exc().splitlines()[-1]}')
        with open(os.path.join(OUT, 'index.txt'), 'w') as f:
            f.write('\n'.join(log) + '\n')
        ui.messageBox(f'Kinn export done: {sum(l.startswith("OK") for l in log)} designs.\nSaved to {OUT}')
    except Exception:
        ui.messageBox('Export failed:\n' + traceback.format_exc())
