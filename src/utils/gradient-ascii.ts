interface GradientAsciiOptions {
    middleStop?: number;
    middleOpacity?: number;
    endStop?: number;
    maxCols?: number;
    cellPx?: number;
    fps?: number;
    onThemeChange?: () => void;
}

/** Render characters from the same moving radial fields used by the CSS blobs. */
export function initGradientAscii(
    backdrop: HTMLElement,
    canvas: HTMLCanvasElement,
    blobs: HTMLElement[],
    {
        middleStop = 0.32,
        middleOpacity = 0.8,
        endStop = 0.72,
        maxCols = 180,
        cellPx = 8,
        fps = 15,
        onThemeChange,
    }: GradientAsciiOptions = {},
) {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    const ramp = " .:-=+*#%@";
    // One sampled pixel per character, plus a cached glyph atlas.
    // No full-resolution screenshot or image sampling per frame.
    const field = document.createElement("canvas");
    const sample = field.getContext("2d", { willReadFrequently: true });
    const atlas = document.createElement("canvas");
    const glyphs = atlas.getContext("2d");
    if (!sample || !glyphs) return;
    let width = 0;
    let height = 0;
    let cols = 0;
    let rows = 0;
    let cellW = 0;
    let cellH = 0;
    let tileW = 0;
    let tileH = 0;

    const paintAscii = () => {
        if (!width || !height) return;
        sample.setTransform(1, 0, 0, 1, 0, 0);
        sample.clearRect(0, 0, cols, rows);

        // Sample the same radial stops and live CSS transforms as the
        // visible gradient, including rotation, stretch and overlap.
        // Coordinates stay in the header's local space when scrolling.
        for (const blob of blobs) {
            const style = getComputedStyle(blob);
            const matrix = new DOMMatrixReadOnly(style.transform);
            const w = parseFloat(style.width);
            const h = parseFloat(style.height);
            const opacity = parseFloat(style.opacity);
            sample.save();
            sample.setTransform(cols / width, 0, 0, rows / height, 0, 0);
            sample.translate(blob.offsetLeft + w / 2, blob.offsetTop + h / 2);
            sample.transform(
                matrix.a,
                matrix.b,
                matrix.c,
                matrix.d,
                matrix.e,
                matrix.f,
            );
            // CSS ellipse gradients default to farthest-corner sizing.
            sample.scale(w / Math.SQRT2, h / Math.SQRT2);
            const gradient = sample.createRadialGradient(0, 0, 0, 0, 0, 1);
            gradient.addColorStop(0, `rgba(255,255,255,${opacity})`);
            gradient.addColorStop(
                middleStop,
                `rgba(255,255,255,${opacity * middleOpacity})`,
            );
            gradient.addColorStop(endStop, "rgba(255,255,255,0)");
            sample.fillStyle = gradient;
            sample.fillRect(-1, -1, 2, 2);
            sample.restore();
        }

        const pixels = sample.getImageData(0, 0, cols, rows).data;
        ctx.clearRect(0, 0, width, height);
        for (let i = 0; i < cols * rows; i++) {
            const intensity = pixels[i * 4 + 3] / 255;
            const glyph = Math.round(intensity * (ramp.length - 1));
            if (!glyph) continue;
            ctx.globalAlpha = 0.25 + intensity * 0.75;
            ctx.drawImage(
                atlas,
                glyph * tileW,
                0,
                tileW,
                tileH,
                (i % cols) * cellW,
                Math.floor(i / cols) * cellH,
                cellW,
                cellH,
            );
        }
        ctx.globalAlpha = 1;
    };

    const sizeCanvas = () => {
        const box = backdrop.getBoundingClientRect();
        width = box.width;
        height = box.height;
        if (!width || !height) return;
        const dpr = Math.min(devicePixelRatio || 1, 2);
        cols = Math.max(20, Math.min(maxCols, Math.round(width / cellPx)));
        cellW = width / cols;
        rows = Math.max(1, Math.round(height / (cellW / 0.6)));
        cellH = height / rows;
        field.width = cols;
        field.height = rows;
        canvas.width = Math.ceil(width * dpr);
        canvas.height = Math.ceil(height * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        tileW = Math.ceil(cellW * dpr);
        tileH = Math.ceil(cellH * dpr);
        atlas.width = tileW * ramp.length;
        atlas.height = tileH;
        const style = getComputedStyle(canvas);
        glyphs.fillStyle = style.color;
        glyphs.font = `${cellH * 0.8 * dpr}px ${style.fontFamily}`;
        glyphs.textAlign = "center";
        glyphs.textBaseline = "middle";
        for (let i = 1; i < ramp.length; i++) {
            glyphs.fillText(ramp[i], (i + 0.5) * tileW, tileH / 2);
        }
        paintAscii();
    };

    let onScreen = false;
    let frame = 0;
    let lastPaint = 0;
    const tick = (now: number) => {
        // Limit redraws while sampling the live CSS animation positions.
        if (now - lastPaint >= 1000 / fps) {
            paintAscii();
            lastPaint = now;
        }
        frame = requestAnimationFrame(tick);
    };
    const syncMotion = () => {
        const visible = onScreen && !document.hidden;
        backdrop.toggleAttribute("data-active", visible);
        if (visible && !reducedMotion.matches) {
            if (!frame) frame = requestAnimationFrame(tick);
        } else {
            cancelAnimationFrame(frame);
            frame = 0;
        }
        paintAscii();
    };
    new ResizeObserver(sizeCanvas).observe(backdrop);
    new MutationObserver(() => {
        sizeCanvas();
        onThemeChange?.();
    }).observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["class"],
    });
    document.fonts.ready.then(sizeCanvas);
    new IntersectionObserver(([entry]) => {
        onScreen = entry.isIntersecting;
        syncMotion();
    }).observe(backdrop);
    document.addEventListener("visibilitychange", syncMotion);
    reducedMotion.addEventListener("change", syncMotion);
}
