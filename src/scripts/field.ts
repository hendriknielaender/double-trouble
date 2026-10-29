const WORDS = ["DOUBLE", "TROUBLE"] as const;
const NOISE = "#%&*+=-:<>/\\|01";
const DUST = ".:+'`";
const SLOT = 7;
const FRAME_MS = 50;
const GLITCH_MS = 100;
const IDLE_MS = 200;
const LIVELY_MS = 400;

type Rect = { left: number; right: number; top: number; bottom: number };
type Glitch = { until: number; swap: number; glyphs: string[] };

const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

const hash = (x: number, y: number, z: number) => {
  let h =
    Math.imul(x, 374761393) +
    Math.imul(y, 668265263) +
    Math.imul(z, 1440670441);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
};

const noise = (x: number, y: number, z: number) => {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const zi = Math.floor(z);
  const u = smoothstep(0, 1, x - xi);
  const v = smoothstep(0, 1, y - yi);
  const w = smoothstep(0, 1, z - zi);
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
  const plane = (z0: number) =>
    lerp(
      lerp(hash(xi, yi, z0), hash(xi + 1, yi, z0), u),
      lerp(hash(xi, yi + 1, z0), hash(xi + 1, yi + 1, z0), u),
      v,
    );
  return lerp(plane(zi), plane(zi + 1), w);
};

const pick = (set: string, seed: number) =>
  set[Math.floor(seed * set.length) % set.length];

const toRect = (element: Element | null): Rect | null => {
  if (!element) return null;
  const { left, right, top, bottom } = element.getBoundingClientRect();
  return { left, right, top, bottom };
};

export function startField(canvas: HTMLCanvasElement, epoch: number) {
  const context = canvas.getContext("2d");
  if (!context) return;
  const ctx = context;
  const root = document.documentElement;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = matchMedia("(pointer: fine)").matches;
  const family =
    getComputedStyle(root).getPropertyValue("--font-mono").trim() ||
    "monospace";

  const heroElement = document.querySelector("[data-field-hero]");
  const clearElement = document.querySelector("[data-field-clear]");
  const quietElements = [...document.querySelectorAll("[data-field-quiet]")];
  const glitches = new Map<number, Glitch>();
  const pointer = { x: -1e4, y: -1e4 };
  let pointerAt = Number.NEGATIVE_INFINITY;
  let scrollAt = Number.NEGATIVE_INFINITY;
  let ripple: { x: number; y: number; start: number } | null = null;
  let width = 0;
  let height = 0;
  let dpr = 1;
  let fontSize = 13;
  let advance = 0;
  let rowHeight = 0;
  let slotWidth = 0;
  let originX = 0;
  let colors: string[] = [];
  let sprites: HTMLCanvasElement[] = [];
  let strength = 0.3;
  let frame = 0;
  let last = Number.NEGATIVE_INFINITY;

  const resolveColor = (variable: string) => {
    canvas.style.color = `var(${variable})`;
    return getComputedStyle(canvas).color;
  };

  const paint = () => {
    colors = [resolveColor("--left"), resolveColor("--right")];
    strength = root.dataset.theme === "light" ? 0.36 : 0.32;
    sprites = WORDS.map((word, index) => {
      const sprite = document.createElement("canvas");
      sprite.width = Math.ceil(SLOT * advance * dpr);
      sprite.height = Math.ceil(rowHeight * dpr);
      const sctx = sprite.getContext("2d");
      if (!sctx) return sprite;
      sctx.scale(dpr, dpr);
      sctx.font = `${fontSize}px ${family}`;
      sctx.textBaseline = "middle";
      sctx.fillStyle = colors[index];
      const offset = ((SLOT - word.length) * advance) / 2;
      for (let i = 0; i < word.length; i++) {
        sctx.fillText(word[i], offset + i * advance, rowHeight / 2);
      }
      return sprite;
    });
  };

  const layout = () => {
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    fontSize = width < 640 ? 11 : 13;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.font = `${fontSize}px ${family}`;
    ctx.textBaseline = "middle";
    advance = ctx.measureText("M").width * 1.85;
    rowHeight = Math.round(fontSize * 2.7);
    slotWidth = SLOT * advance + advance * 2.4;
    originX = width / 2 - Math.ceil(width / 2 / slotWidth) * slotWidth;
    paint();
  };

  const glitch = (key: number, now: number, word: string) => {
    const existing = glitches.get(key);
    if (existing && existing.until > now) return existing;
    const created = {
      until: now + 160 + Math.random() * 320,
      swap: 0,
      glyphs: [...word],
    };
    glitches.set(key, created);
    return created;
  };

  const draw = (now: number, elapsed: number) => {
    const time = reduced ? 0 : (performance.timeOrigin + now - epoch) / 1000;
    for (const [key, state] of glitches) {
      if (state.until <= now) glitches.delete(key);
    }
    // Glitches are rolled per frame; keep their rate per second stable
    // when the field idles at a slower cadence.
    const roll = elapsed / FRAME_MS;
    const hero = toRect(heroElement);
    const area = toRect(clearElement);
    const clear = area && area.left > 48 ? area : null;
    const quiet = quietElements.map(toRect).filter((rect) => rect !== null);
    const scroll = window.scrollY;
    const rowOffset = Math.floor(scroll / rowHeight);
    const shift = scroll - rowOffset * rowHeight;
    const rows = Math.ceil(height / rowHeight) + 1;
    const cols = Math.ceil((width - originX) / slotWidth);
    const tokenWidth = SLOT * advance;
    const radius = ripple ? (now - ripple.start) * 1.05 : 0;
    if (ripple && radius > Math.hypot(width, height)) ripple = null;
    const twinkle = Math.floor(time * 2.5);

    const heroWeight = (y: number) => {
      if (!hero || y < hero.top || y > hero.bottom) return 0;
      return smoothstep(0, 160, hero.bottom - y);
    };

    const gutterWeight = (left: number, right: number) => {
      if (!clear) return 0;
      const distance = Math.max(clear.left - right, left - clear.right);
      return distance <= 0 ? 0 : smoothstep(0, 140, distance);
    };

    const quietWeight = (x: number, y: number) => {
      let weight = 1;
      for (const rect of quiet) {
        const dx = Math.max(rect.left - x, 0, x - rect.right);
        const dy = Math.max(rect.top - y, 0, y - rect.bottom);
        weight = Math.min(
          weight,
          0.18 + 0.82 * smoothstep(0, 72, Math.hypot(dx, dy)),
        );
      }
      return weight;
    };

    ctx.clearRect(0, 0, width, height);
    let drawn = 0;

    for (let r = 0; r < rows; r++) {
      const row = r + rowOffset;
      const y = r * rowHeight - shift;
      const cy = y + rowHeight / 2;
      const words = heroWeight(cy);
      for (let c = 0; c < cols; c++) {
        const x = originX + c * slotWidth;
        const cx = x + tokenWidth / 2;
        const wordIndex = cx < width / 2 ? 0 : 1;
        const word = WORDS[wordIndex];
        const offset = ((SLOT - word.length) * advance) / 2;
        const key = row * 4096 + c;

        if (words > 0) {
          const presence = smoothstep(
            0.4,
            0.6,
            noise(c * 0.23 + wordIndex * 7, row * 0.31, time * 0.07),
          );
          let wave = 0;
          if (ripple) {
            const distance = Math.hypot(cx - ripple.x, cy - ripple.y);
            wave = Math.max(0, 1 - Math.abs(distance - radius) / 70);
          }
          const alpha =
            strength *
            words *
            quietWeight(cx, cy) *
            Math.min(1, presence + wave * 1.4);
          if (alpha >= 0.012) {
            if (!reduced) {
              const near = finePointer
                ? Math.max(
                    0,
                    1 - Math.hypot(cx - pointer.x, cy - pointer.y) / 140,
                  )
                : 0;
              if (Math.random() < (0.0012 + near * 0.18 + wave * 0.5) * roll) {
                glitch(key, now, word);
              }
            }
            const state = glitches.get(key);
            if (state) {
              if (now > state.swap) {
                const settle = 1 - (state.until - now) / 480;
                state.glyphs = [...word].map((glyph) =>
                  Math.random() < settle ? glyph : pick(NOISE, Math.random()),
                );
                state.swap = now + 70;
              }
              ctx.globalAlpha = alpha;
              ctx.fillStyle = colors[wordIndex];
              for (let i = 0; i < word.length; i++) {
                ctx.fillText(state.glyphs[i], x + offset + i * advance, cy);
              }
            } else {
              ctx.globalAlpha = alpha;
              ctx.drawImage(sprites[wordIndex], x, y, tokenWidth, rowHeight);
            }
            drawn++;
          }
        }

        if (!clear || words >= 1) continue;
        if (x + tokenWidth > clear.left && x < clear.right) {
          if (x >= clear.left && x + tokenWidth <= clear.right) continue;
        }
        ctx.fillStyle = colors[wordIndex];
        for (let i = 0; i < word.length; i++) {
          const gx = x + offset + i * advance;
          const edge = gutterWeight(gx, gx + advance);
          if (edge <= 0) continue;
          const presence = smoothstep(
            0.52,
            0.72,
            noise(c * 1.3 + i * 0.19, row * 0.27, time * 0.09),
          );
          const alpha = strength * 0.8 * edge * presence * (1 - words);
          if (alpha < 0.012) continue;
          ctx.globalAlpha = alpha;
          ctx.fillText(pick(DUST, hash(c * 16 + i, row, twinkle + i)), gx, cy);
          drawn++;
        }
      }
    }

    ctx.globalAlpha = 1;
    return drawn > 0 || ripple !== null;
  };

  // Only the ripple, a nearby pointer and scrolling need 20 fps; a glitch
  // flickers fine at 10. The slow drift of the field is invisible at 5 fps,
  // so the canvas idles there and stops committing frames nobody sees change.
  const tick = (now: number) => {
    frame = 0;
    const lively =
      ripple !== null ||
      now - pointerAt < LIVELY_MS ||
      now - scrollAt < LIVELY_MS;
    const interval = lively
      ? FRAME_MS
      : glitches.size > 0
        ? GLITCH_MS
        : IDLE_MS;
    if (now - last >= interval) {
      const elapsed = Math.min(now - last, IDLE_MS);
      last = now;
      const busy = draw(now, elapsed);
      canvas.dataset.ready = "";
      if (!busy) return;
    }
    if (!reduced) frame = requestAnimationFrame(tick);
  };

  const wake = () => {
    if (!frame && !document.hidden) frame = requestAnimationFrame(tick);
  };

  const redraw = () => {
    last = Number.NEGATIVE_INFINITY;
    wake();
  };

  layout();
  wake();

  document.fonts.addEventListener("loadingdone", () => {
    layout();
    redraw();
  });

  window.addEventListener(
    "resize",
    () => {
      layout();
      redraw();
    },
    { passive: true },
  );
  window.addEventListener(
    "scroll",
    () => {
      scrollAt = performance.now();
      if (reduced) redraw();
      else wake();
    },
    { passive: true },
  );
  if (finePointer && !reduced) {
    window.addEventListener(
      "pointermove",
      (event) => {
        pointer.x = event.clientX;
        pointer.y = event.clientY;
        pointerAt = performance.now();
        wake();
      },
      { passive: true },
    );
  }
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      cancelAnimationFrame(frame);
      frame = 0;
    } else {
      wake();
    }
  });
  new MutationObserver(() => {
    paint();
    redraw();
  }).observe(root, { attributes: true, attributeFilter: ["data-theme"] });

  const fists = [...document.querySelectorAll("[data-bump]")];
  const pair = fists[0]?.parentElement;
  if (pair && !reduced && root.dataset.intro !== "seen") {
    Promise.all(
      fists.flatMap((fist) =>
        fist.getAnimations().map((animation) => animation.finished),
      ),
    )
      .then(() => {
        const rect = pair.getBoundingClientRect();
        ripple = {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
          start: performance.now(),
        };
        wake();
      })
      .catch(() => {});
  }
}
