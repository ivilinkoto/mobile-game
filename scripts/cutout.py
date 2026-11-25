#!/usr/bin/env python3
"""Cut an AI-generated asset out of its plain light background.

    python3 scripts/cutout.py input.png output.png --mode building|icon [--size 512]

* removes the white/light-grey background (and the soft bluish floor shadow)
  that is connected to the image border, with soft anti-aliased edges and
  white-fringe removal;
* trims to the object and re-centres it on a square transparent canvas:
  - icon:     centred, object fills ~90% of the canvas;
  - building: bottom-anchored at 96% height, so every building stands on the
              same ground line the game expects.

Needs: pip install pillow numpy scipy
"""

import argparse

import numpy as np
from PIL import Image
from scipy import ndimage


def background_mask(
    rgb: np.ndarray, white_only: bool = False, white_level: float = 0.955, warm_shadows: bool = False
) -> np.ndarray:
    mx = rgb.max(axis=2)
    mn = rgb.min(axis=2)
    sat = (mx - mn) / np.maximum(mx, 1e-6)
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    border = np.concatenate([rgb[0], rgb[-1], rgb[:, 0], rgb[:, -1]])
    bg_colour = np.median(border, axis=0)
    if bg_colour.min() < 0.85:
        # coloured / dark backdrop (e.g. for white objects): key out that colour
        dist = np.sqrt(((rgb - bg_colour) ** 2).sum(axis=2))
        labels, _ = ndimage.label(dist < 0.12)
        edge = np.unique(np.concatenate([labels[0], labels[-1], labels[:, 0], labels[:, -1]]))
        return np.isin(labels, edge[edge != 0])
    # near-pure white paper (strict, so cream/white objects survive)
    white = (mx > white_level) & (sat < 0.07)
    # the soft floor shadows these models paint: pale, low-saturation,
    # neutral grey to blue-ish grey (never warm)
    shadow = (mx > 0.5) & (mx < 0.985) & (sat < 0.22) & (b >= r - 0.015) & (b >= g - 0.03)
    if warm_shadows:  # shadows tinted by a warm object (e.g. the sun)
        shadow = shadow | ((mx > 0.5) & (mx < 0.975) & (sat < 0.6))
    candidate = white if white_only else (white | shadow)
    labels, _ = ndimage.label(candidate)
    border = np.unique(np.concatenate([labels[0], labels[-1], labels[:, 0], labels[:, -1]]))
    border = border[border != 0]
    return np.isin(labels, border)


def cutout(
    src: str,
    dst: str,
    mode: str,
    size: int,
    white_only: bool = False,
    white_level: float = 0.955,
    warm_shadows: bool = False,
    close: int = 0,
) -> None:
    im = Image.open(src).convert('RGB')
    rgb = np.asarray(im).astype(np.float32) / 255.0
    bg = background_mask(rgb, white_only, white_level, warm_shadows)
    # close tiny holes, then soften the edge
    fg = ndimage.binary_opening(~bg, iterations=1)
    fg = ndimage.binary_fill_holes(fg)
    # drop leftover specks and detached floor shadows: keep the main object,
    # plus other sizeable parts that are clearly coloured (raindrops, bolts…)
    labels, n = ndimage.label(fg)
    if n > 1:
        idx = range(1, n + 1)
        sizes = ndimage.sum(fg, labels, idx)
        mx, mn = rgb.max(axis=2), rgb.min(axis=2)
        sat = (mx - mn) / np.maximum(mx, 1e-6)
        mean_sat = ndimage.mean(sat, labels, idx)
        biggest = int(np.argmax(sizes))
        keep = [
            i + 1
            for i in range(n)
            if i == biggest or (sizes[i] >= sizes.max() * 0.005 and (mean_sat[i] > 0.3 or not white_only) and sizes[i] >= sizes.max() * (0.005 if white_only else 0.04))
        ]
        fg = np.isin(labels, keep)
    fg = ndimage.binary_opening(fg, iterations=3) | ndimage.binary_erosion(fg, iterations=6)
    if close:
        # fill "bites" where a white object melted into the white backdrop
        disk = np.hypot(*np.mgrid[-close : close + 1, -close : close + 1]) <= close
        fg = ndimage.binary_fill_holes(ndimage.binary_closing(fg, structure=disk))
    alpha = ndimage.gaussian_filter(fg.astype(np.float32), sigma=1.0)
    alpha = np.clip((alpha - 0.15) / 0.85, 0, 1)
    # un-mix the white background from semi-transparent edge pixels
    a = np.maximum(alpha[..., None], 1e-3)
    clean = np.clip((rgb - (1 - a) * 1.0) / a, 0, 1)
    rgba = np.dstack([clean, alpha])

    ys, xs = np.where(alpha > 0.05)
    crop = rgba[ys.min() : ys.max() + 1, xs.min() : xs.max() + 1]
    obj = Image.fromarray((crop * 255).astype(np.uint8), 'RGBA')

    fill = 0.9
    scale = min(size * fill / obj.width, size * fill / obj.height)
    obj = obj.resize((max(1, round(obj.width * scale)), max(1, round(obj.height * scale))), Image.LANCZOS)
    canvas = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    x = (size - obj.width) // 2
    y = (size - obj.height) // 2 if mode == 'icon' else round(size * 0.96) - obj.height
    canvas.alpha_composite(obj, (x, y))
    canvas.save(dst, optimize=True)


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('src')
    ap.add_argument('dst')
    ap.add_argument('--mode', choices=['icon', 'building'], default='icon')
    ap.add_argument('--size', type=int, default=512)
    ap.add_argument(
        '--white-only',
        action='store_true',
        help='only remove white background (for pale blue/grey objects); detached pale shadows are dropped',
    )
    ap.add_argument('--white-level', type=float, default=0.955, help='raise (e.g. 0.985) for white objects')
    ap.add_argument('--warm-shadows', action='store_true', help='also remove warm-tinted shadows (e.g. under the sun)')
    ap.add_argument('--close', type=int, default=0, help='radius in px to fill bites in white objects (e.g. 40)')
    args = ap.parse_args()
    cutout(args.src, args.dst, args.mode, args.size, args.white_only, args.white_level, args.warm_shadows, args.close)
