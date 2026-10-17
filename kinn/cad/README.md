# Kinn CAD (Fusion)

Every Fusion version of the device, oldest first. Each has an editable `.f3d` (File > Open > Open from my computer), a `.step` for any CAD tool, and a preview `.png`.

| File | What it is |
|---|---|
| `00_posture_strip_first_concept` | The first Poise posture strip: two adhesive pads, a flex strip, an electronics pod with a threshold slider. |
| `01_poise_v1_strip_and_pod` | Poise v1: smart tape with a printed stretch sensor, electrodes, a snap dock with 3 contacts, and the pod coin with its status LED. |
| `02_kinn_coin_v2_built_out` | The current Kinn coin with its insides modelled (22 mm wide, about 4.7 mm tall). One copy is assembled and one is exploded. Parts: graphite aluminium cup, 3 gold contacts, CR1220-size cell and clip, board (nRF52840 module, IMU, crystal, power IC, chip antenna, passives), 8 LEDs under a light-guide ring, a chrome seam ring, and a gloss-black ceramic dome with a chrome top ring and the "kinn" wordmark. Also saved in Fusion's Default Project as "Kinn Coin v2 (built out)". |

The Kinn knee, shoulder and back strips were modelled in Blender, not Fusion. See `../blender/`.

`fusion-scripts/` holds the scripts that made the coin and exported these files. Run them from Utilities > Scripts and Add-Ins.
