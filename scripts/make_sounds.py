#!/usr/bin/env python3
"""Synthesise every sound effect and the placeholder music loop.

    python3 scripts/make_sounds.py      # writes assets/sounds/*.m4a

Everything is generated from scratch (oscillators, noise, envelopes), so we
own it outright — no licences to track. The music is a placeholder until a
real track is commissioned or licensed. Needs: numpy, ffmpeg.
"""

import os
import subprocess
import tempfile
import wave

import numpy as np

SR = 44100
OUT = os.path.join(os.path.dirname(__file__), '..', 'assets', 'sounds')
rng = np.random.default_rng(7)


# ── building blocks ──────────────────────────────────────────────

def t_axis(dur):
    return np.arange(int(SR * dur)) / SR


def env(n, attack=0.005, decay=0.25, curve=4.0):
    """Fast attack, exponential decay envelope over n samples."""
    t = np.arange(n) / SR
    a = np.clip(t / max(attack, 1e-4), 0, 1)
    d = np.exp(-curve * np.maximum(t - attack, 0) / max(decay, 1e-4))
    return a * d


def note_hz(semis_from_a4):
    return 440.0 * 2 ** (semis_from_a4 / 12)


def marimba(freq, dur=0.5, bright=1.0):
    t = t_axis(dur)
    tone = (
        np.sin(2 * np.pi * freq * t)
        + 0.35 * bright * np.sin(2 * np.pi * freq * 4.0 * t) * np.exp(-t * 30)
        + 0.15 * np.sin(2 * np.pi * freq * 2.0 * t) * np.exp(-t * 12)
    )
    return tone * env(len(t), 0.002, dur * 0.35, 5)


def steel(freq, dur=0.6):
    """Steel-drum-ish: a few inharmonic partials."""
    t = t_axis(dur)
    parts = [(1.0, 1.0), (2.0, 0.5), (2.98, 0.25), (4.1, 0.12)]
    tone = sum(a * np.sin(2 * np.pi * freq * m * t) for m, a in parts)
    return tone * env(len(t), 0.004, dur * 0.4, 4)


def pluck_bass(freq, dur=0.4):
    t = t_axis(dur)
    tri = 2 / np.pi * np.arcsin(np.sin(2 * np.pi * freq * t))
    return tri * env(len(t), 0.004, dur * 0.5, 3)


def noise(dur):
    return rng.uniform(-1, 1, int(SR * dur))


def lowpass(x, cutoff):
    """One-pole low-pass filter."""
    a = np.exp(-2 * np.pi * cutoff / SR)
    y = np.empty_like(x)
    acc = 0.0
    for i, v in enumerate(x):
        acc = (1 - a) * v + a * acc
        y[i] = acc
    return y


def highpass(x, cutoff):
    return x - lowpass(x, cutoff)


def sweep(f0, f1, dur, shape='sine'):
    t = t_axis(dur)
    f = f0 * (f1 / f0) ** (t / dur)
    phase = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(phase) if shape == 'sine' else np.sign(np.sin(phase)) * 0.5


def mix(length, *parts):
    """parts: (signal, start_seconds, gain)"""
    out = np.zeros(int(SR * length))
    for sig, start, gain in parts:
        i = int(start * SR)
        j = min(len(out), i + len(sig))
        out[i:j] += sig[: j - i] * gain
    return out


def normalise(x, peak=0.85):
    m = np.max(np.abs(x)) or 1.0
    return x / m * peak


def fade_tail(x, ms=15):
    n = int(SR * ms / 1000)
    if n and len(x) > n:
        x[-n:] *= np.linspace(1, 0, n)
    return x


def save(name, x, peak=0.85, bitrate='96k'):
    x = fade_tail(normalise(x, peak))
    os.makedirs(OUT, exist_ok=True)
    with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as tmp:
        path = tmp.name
    with wave.open(path, 'wb') as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((x * 32767).astype('<i2').tobytes())
    dst = os.path.join(OUT, f'{name}.m4a')
    subprocess.run(
        ['ffmpeg', '-y', '-loglevel', 'error', '-i', path, '-c:a', 'aac', '-b:a', bitrate, dst],
        check=True,
    )
    os.remove(path)
    print('wrote', os.path.relpath(dst))


# ── sound effects ────────────────────────────────────────────────

# major pentatonic from C5 upwards: each extra cloud in a chain goes one step up
PENTA = [3, 5, 7, 10, 12, 15, 17, 19, 22, 24]  # semitones from A4 (C5 = +3)


def make_sfx():
    for i, s in enumerate(PENTA):
        f = note_hz(s)
        save(f'select_{i}', mix(0.35, (marimba(f, 0.35), 0, 1.0), (marimba(f * 2, 0.2, 0.5), 0, 0.25)), peak=0.55)

    # collect: bubbly pop + bright chime
    pop = sweep(900, 220, 0.09) * env(int(SR * 0.09), 0.001, 0.05, 3)
    save('collect', mix(0.4, (pop, 0, 1.0), (marimba(note_hz(15), 0.3), 0.03, 0.6), (marimba(note_hz(22), 0.3), 0.07, 0.45)), peak=0.7)

    # coins: a shower of short metallic pings
    parts = []
    for k in range(9):
        f = note_hz(int(rng.choice([22, 26, 29, 31, 34, 38])))
        ping = np.sin(2 * np.pi * f * t_axis(0.18)) * env(int(SR * 0.18), 0.001, 0.06, 4)
        ping += 0.4 * np.sin(2 * np.pi * f * 2.76 * t_axis(0.18)) * env(int(SR * 0.18), 0.001, 0.03, 4)
        parts.append((ping, k * 0.045 + rng.uniform(0, 0.02), rng.uniform(0.5, 1.0)))
    save('coins', mix(0.65, *parts), peak=0.6)

    # meter full / reward: rising steel-drum arpeggio
    arp = [3, 7, 10, 15, 19]
    save('meter_full', mix(0.9, *[(steel(note_hz(s), 0.5), i * 0.07, 1.0) for i, s in enumerate(arp)]), peak=0.75)

    # island complete: bigger fanfare
    fan = [(steel(note_hz(s), 0.7), i * 0.11, 1.0) for i, s in enumerate([3, 7, 10, 15])]
    fan += [(steel(note_hz(s), 1.4), 0.5, 0.7) for s in (15, 19, 22)]
    fan += [(pluck_bass(note_hz(-21), 1.2), 0.5, 0.8)]
    save('fanfare', mix(2.0, *fan), peak=0.8)

    # cannon: thump + noise burst + falling tone
    boom_t = t_axis(0.7)
    body = np.sin(2 * np.pi * np.cumsum(70 * (0.5 ** (boom_t / 0.25))) / SR) * env(len(boom_t), 0.002, 0.4, 3)
    blast = lowpass(noise(0.7), 900) * env(len(boom_t), 0.001, 0.25, 4)
    save('cannon', body * 1.2 + blast * 1.5, peak=0.9)

    # explosion / hit on a building
    hit = lowpass(noise(0.9), 600) * env(int(SR * 0.9), 0.003, 0.5, 3)
    crack = highpass(noise(0.15), 2000) * env(int(SR * 0.15), 0.001, 0.05, 4)
    save('hit', mix(0.9, (hit, 0, 1.0), (crack, 0, 0.5), (sweep(160, 40, 0.5) * env(int(SR * 0.5), 0.001, 0.3, 3), 0, 0.8)), peak=0.9)

    # thunder: rumble with a crack at the start
    rumble = lowpass(lowpass(noise(2.2), 180), 180) * env(int(SR * 2.2), 0.05, 1.3, 2.5)
    lfo = 0.6 + 0.4 * np.sin(2 * np.pi * 3.2 * t_axis(2.2))
    thunder_crack = highpass(noise(0.25), 1500) * env(int(SR * 0.25), 0.001, 0.08, 4)
    save('thunder', mix(2.2, (rumble * lfo, 0, 3.0), (thunder_crack, 0.02, 0.6)), peak=0.9)

    # small storm cloud appearing: whoosh + low swell
    whoosh = lowpass(noise(0.8), 1200) * np.sin(np.linspace(0, np.pi, int(SR * 0.8))) ** 2
    save('storm_spawn', mix(0.9, (whoosh, 0, 1.0), (sweep(110, 70, 0.8) * env(int(SR * 0.8), 0.2, 0.5, 2), 0, 0.5)), peak=0.7)

    # build: two hammer knocks + sparkle
    def knock():
        k = lowpass(noise(0.08), 1800) * env(int(SR * 0.08), 0.001, 0.03, 4)
        return k + 0.6 * np.sin(2 * np.pi * 320 * t_axis(0.08)) * env(int(SR * 0.08), 0.001, 0.03, 4)

    sparkle = [(marimba(note_hz(s), 0.25, 0.6), 0.28 + i * 0.05, 0.5) for i, s in enumerate([22, 26, 29, 34])]
    save('build', mix(0.8, (knock(), 0, 1.0), (knock(), 0.13, 0.9), *sparkle), peak=0.8)

    # dig: sandy scrape
    scrape = lowpass(highpass(noise(0.3), 500), 3000) * env(int(SR * 0.3), 0.02, 0.15, 3)
    save('dig', scrape, peak=0.6)

    # chest: magical sparkle up
    save('chest', mix(1.0, *[(marimba(note_hz(s), 0.4), i * 0.06, 0.9) for i, s in enumerate([15, 19, 22, 27, 31, 34])]), peak=0.7)

    # shield: bright metallic shimmer
    sh = sum(np.sin(2 * np.pi * f * t_axis(0.8)) for f in (1320, 1980, 2640, 3520))
    save('shield', sh * env(int(SR * 0.8), 0.01, 0.45, 3) * (0.7 + 0.3 * np.sin(2 * np.pi * 9 * t_axis(0.8))), peak=0.5)

    # error / invalid chain: soft low double bump
    bump = np.sin(2 * np.pi * 150 * t_axis(0.09)) * env(int(SR * 0.09), 0.003, 0.05, 3)
    save('error', mix(0.25, (bump, 0, 1.0), (bump, 0.11, 0.8)), peak=0.5)

    # UI tap: tiny wooden click
    click = lowpass(noise(0.03), 4000) * env(int(SR * 0.03), 0.0005, 0.01, 4)
    save('tap', click + 0.5 * np.sin(2 * np.pi * 1200 * t_axis(0.03)) * env(int(SR * 0.03), 0.0005, 0.01, 4), peak=0.45)

    # backfire: thunder + sad falling tone
    sad = sweep(440, 140, 0.9) * env(int(SR * 0.9), 0.01, 0.6, 2)
    save('backfire', mix(2.2, (rumble * lfo, 0, 3.0), (sad, 0.1, 0.35)), peak=0.9)


# ── music: breezy island loop ────────────────────────────────────

def make_music():
    bpm = 104
    beat = 60 / bpm
    bars = 16
    length = bars * 4 * beat
    n = int(SR * length)
    out = np.zeros(n)

    def put(sig, at, gain):
        i = int(at * SR) % n
        j = i + len(sig)
        if j <= n:
            out[i:j] += sig * gain
        else:  # wrap around so the loop is seamless
            out[i:] += sig[: n - i] * gain
            out[: j - n] += sig[n - i :] * gain

    # chords (semitones from A4): C, Am, F, G — then F, G, Em, Am
    prog = [
        [3, 7, 10], [0, 3, 7], [-4, 0, 3], [-2, 2, 5],
        [-4, 0, 3], [-2, 2, 5], [-5, -2, 2], [0, 3, 7],
    ]
    roots = [3 - 24, 0 - 24, -4 - 24, -2 - 24, -4 - 24, -2 - 24, -5 - 24, 0 - 24]
    melody_a = [15, None, 12, 10, 12, None, 7, None, 10, 12, 15, None, 17, 15, 12, None]
    melody_b = [19, None, 17, 15, 17, None, 15, 12, 15, None, 12, 10, 12, None, None, None]

    for bar in range(bars):
        chord = prog[bar % 8]
        root = roots[bar % 8]
        t0 = bar * 4 * beat
        # bass: root on 1 and 3, fifth on the "and" of 2
        put(pluck_bass(note_hz(root), beat * 1.2), t0, 0.55)
        put(pluck_bass(note_hz(root + 7), beat * 0.6), t0 + 1.5 * beat, 0.4)
        put(pluck_bass(note_hz(root), beat * 1.2), t0 + 2 * beat, 0.5)
        put(pluck_bass(note_hz(root + 12), beat * 0.5), t0 + 3.5 * beat, 0.3)
        # marimba off-beat chord stabs (island "skank")
        for k in range(4):
            for s in chord:
                put(marimba(note_hz(s), beat * 0.6, 0.7), t0 + (k + 0.5) * beat, 0.16)
        # shaker on every 8th
        for k in range(8):
            sh = highpass(noise(0.05), 6000) * env(int(SR * 0.05), 0.002, 0.02, 4)
            put(sh, t0 + k * beat / 2, 0.05 if k % 2 else 0.03)
        # soft kick on 1 and 3
        for k in (0, 2):
            kick = np.sin(2 * np.pi * np.cumsum(110 * (0.5 ** (t_axis(0.25) / 0.05))) / SR) * env(int(SR * 0.25), 0.001, 0.12, 3)
            put(kick, t0 + k * beat, 0.35)
        # melody: steel drum, 8th notes, enters on bar 4, rests every 4th bar for air
        if bar >= 4 and bar % 4 != 3:
            line = melody_a if (bar // 4) % 2 == 1 else melody_b
            half = line[(bar % 2) * 8 : (bar % 2) * 8 + 8]
            for k, s in enumerate(half):
                if s is not None:
                    put(steel(note_hz(s), beat * 0.9), t0 + k * beat / 2, 0.22)

    save('music_island', out, peak=0.7, bitrate='128k')


if __name__ == '__main__':
    make_sfx()
    make_music()
