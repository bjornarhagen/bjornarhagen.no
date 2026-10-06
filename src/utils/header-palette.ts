export type ColorSample = {
    r: number;
    g: number;
    b: number;
    weight: number;
};

type Swatch = { h: number; s: number; l: number; weight: number };
const clamp = (n: number, min: number, max: number) =>
    Math.max(min, Math.min(max, n));
const hueDistance = (a: number, b: number) =>
    Math.min(Math.abs(a - b), 360 - Math.abs(a - b));

function toSwatch({ r, g, b, weight }: ColorSample): Swatch | null {
    const channels = [r, g, b].map((value) => value / 255);
    const max = Math.max(...channels);
    const min = Math.min(...channels);
    const chroma = max - min;
    const l = (max + min) / 2;
    const s = chroma / (1 - Math.abs(2 * l - 1));
    // Neutrals, near-black and near-white contribute no useful hue. Chroma
    // also rejects almost-white pixels with deceptively high HSL saturation.
    if (chroma < 0.07 || s < 0.18 || l < 0.08 || l > 0.92) return null;
    const [red, green, blue] = channels;
    let h =
        max === red
            ? (green - blue) / chroma
            : max === green
              ? (blue - red) / chroma + 2
              : (red - green) / chroma + 4;
    h = (h * 60 + 360) % 360;
    return {
        h,
        s,
        l,
        weight: weight * Math.pow(s, 1.3) * (1 - Math.abs(l - 0.5)),
    };
}

/** Favor colorful, recurring hues without letting large neutral areas win. */
export function selectHeaderPalette(samples: ColorSample[]): string[] {
    const buckets = new Map<number, Swatch>();
    for (const sample of samples) {
        const color = toSwatch(sample);
        if (!color || color.weight <= 0) continue;
        const key = Math.floor(color.h / 15);
        const bucket = buckets.get(key);
        if (!bucket) {
            buckets.set(key, { ...color });
            continue;
        }
        const total = bucket.weight + color.weight;
        for (const channel of ["h", "s", "l"] as const) {
            bucket[channel] =
                (bucket[channel] * bucket.weight +
                    color[channel] * color.weight) /
                total;
        }
        bucket.weight = total;
    }

    const ranked = [...buckets.values()].sort((a, b) => b.weight - a.weight);
    const selected: Swatch[] = [];
    for (const color of ranked) {
        if (color.weight < ranked[0].weight * 0.08) break;
        if (selected.every((other) => hueDistance(other.h, color.h) >= 35)) {
            selected.push(color);
        }
        if (selected.length === 3) break;
    }
    if (!selected.length) return [];
    // Sparse pages get nearby shades of an actual page color, rather than
    // unrelated rainbow colors. An empty palette uses the CSS brand fallback.
    const base = selected[0];
    if (selected.length === 1) {
        selected.push({ ...base, h: (base.h + 22) % 360 });
    }
    if (selected.length === 2) {
        const direction =
            hueDistance((base.h + 22) % 360, selected[1].h) >
            hueDistance((base.h + 338) % 360, selected[1].h)
                ? 22
                : -22;
        selected.push({ ...base, h: (base.h + direction + 360) % 360 });
    }
    return selected.map(
        ({ h, s, l }) =>
            `hsl(${Math.round(h)} ${Math.round(clamp(s * 100, 45, 85))}% ${Math.round(clamp(l * 100, 42, 62))}%)`,
    );
}

/** Browser-only sampling. Never fetch extra images or inspect site chrome. */
export function watchHeaderPalette(main: HTMLElement, backdrop: HTMLElement) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return () => {};
    let timer: ReturnType<typeof setTimeout>;

    const update = () => {
        const samples: ColorSample[] = [];
        const cssColors = new Map<string, number>();
        const addColor = (color: string, weight: number) => {
            if (!color || color === "none" || color === "transparent") return;
            // Repeated links and inherited text must not overwhelm a photo.
            cssColors.set(color, Math.max(cssColors.get(color) || 0, weight));
        };
        const elements = [
            ...main.querySelectorAll<HTMLElement | SVGElement>("*"),
        ]
            .filter((element) => !backdrop.contains(element))
            .slice(0, 800);
        for (const element of elements) {
            if (!element.getClientRects().length) continue;
            const style = getComputedStyle(element);
            if (style.visibility === "hidden" || Number(style.opacity) === 0)
                continue;
            const box = element.getBoundingClientRect();
            const weight = clamp(
                Math.sqrt(box.width * box.height) / 300,
                0.2,
                1.5,
            );
            addColor(style.backgroundColor, weight);
            if (style.backgroundImage.includes("gradient(")) {
                const stops = style.backgroundImage.match(
                    /(?:rgba?|hsla?|(?:ok)?l(?:ab|ch)|color)\([^()]+\)|#[\da-f]{3,8}\b/gi,
                );
                for (const stop of stops || []) addColor(stop, weight);
            }
            if (
                [...element.childNodes].some(
                    (node) =>
                        node.nodeType === Node.TEXT_NODE &&
                        node.textContent?.trim(),
                )
            ) {
                addColor(style.color, weight);
            }
            if (element instanceof SVGElement) {
                addColor(style.fill, weight);
                addColor(style.stroke, weight);
            }
            for (const edge of ["Top", "Right", "Bottom", "Left"] as const) {
                if (parseFloat(style[`border${edge}Width`])) {
                    addColor(style[`border${edge}Color`], weight);
                }
            }
            for (const pseudo of ["::before", "::after"]) {
                const decoration = getComputedStyle(element, pseudo);
                if (
                    decoration.content !== "none" &&
                    decoration.content !== "normal"
                ) {
                    addColor(decoration.backgroundColor, 0.25);
                }
            }
        }

        // Canvas resolves computed CSS colors (including modern color spaces)
        // to sRGB without maintaining a separate CSS color parser.
        canvas.width = canvas.height = 1;
        for (const [color, weight] of cssColors) {
            ctx.clearRect(0, 0, 1, 1);
            ctx.fillStyle = color;
            ctx.fillRect(0, 0, 1, 1);
            const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
            samples.push({ r, g, b, weight: (weight * a) / 255 });
        }

        const seen = new Set<string>();
        const images = elements
            .filter(
                (element): element is HTMLImageElement =>
                    element instanceof HTMLImageElement,
            )
            .filter((img) => {
                if (
                    !img.complete ||
                    !img.naturalWidth ||
                    !img.getClientRects().length ||
                    seen.has(img.currentSrc)
                )
                    return false;
                seen.add(img.currentSrc);
                return true;
            })
            .slice(0, 8);

        for (const img of images) {
            // Small samples keep extraction cheap, even on photo-heavy pages.
            // Resetting the canvas also clears any previous cross-origin taint.
            canvas.width = canvas.height = 32;
            try {
                ctx.drawImage(img, 0, 0, 32, 32);
                const pixels = ctx.getImageData(0, 0, 32, 32).data;
                const colors = new Map<number, ColorSample>();
                for (let i = 0; i < pixels.length; i += 4) {
                    const [r, g, b, a] = pixels.subarray(i, i + 4);
                    const key = (r >> 4) * 256 + (g >> 4) * 16 + (b >> 4);
                    const color = colors.get(key) || { r, g, b, weight: 0 };
                    color.weight += a / 255 / 1024;
                    colors.set(key, color);
                }
                for (const color of colors.values()) {
                    // Frequency still matters; one bright pixel cannot win.
                    samples.push({
                        ...color,
                        weight: (color.weight * 6) / Math.sqrt(images.length),
                    });
                }
            } catch {
                // Unreadable external images leave the CSS/page palette intact.
            }
        }
        const palette = selectHeaderPalette(samples);
        for (let i = 0; i < 3; i++) {
            if (palette[i])
                backdrop.style.setProperty(
                    `--header-color-${i + 1}`,
                    palette[i],
                );
            else backdrop.style.removeProperty(`--header-color-${i + 1}`);
        }
    };
    const refresh = () => {
        clearTimeout(timer);
        timer = setTimeout(update, 100);
    };
    // Lazy images enrich the palette when they load; no animation-frame scans.
    main.addEventListener("load", refresh, true);
    // Apply the first palette immediately. Commit its colors before enabling
    // transitions, so a new page doesn't slowly emerge from one uniform hue.
    update();
    for (const blob of backdrop.querySelectorAll(".blob")) {
        void getComputedStyle(blob).color;
    }
    backdrop.setAttribute("data-palette-ready", "");
    return refresh;
}
