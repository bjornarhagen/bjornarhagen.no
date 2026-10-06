/** Round outward so longer copy and loaded fonts can never be clipped. */
export function gridHeight(
    content: number,
    inset: number,
    step: number,
): number {
    return Math.ceil((content + inset - 0.01) / step) * step;
}

/**
 * Opt-in structural rhythm. Observe natural content, not the minimum height we
 * write to its parent: blocks can shrink again after a responsive reflow.
 * No scroll listener or animation loop is needed.
 */
export function initLayoutGrid() {
    const root = document.documentElement;
    const main = document.querySelector<HTMLElement>(".page-main");
    const blocks = [
        ...document.querySelectorAll<HTMLElement>("[data-grid-block]"),
    ];
    const measures = new Map<HTMLElement, HTMLElement>();
    const intrinsic: HTMLElement[] = [];
    for (const block of blocks) {
        const content = block.querySelector<HTMLElement>(
            ":scope > [data-grid-measure]",
        );
        if (content) measures.set(block, content);
        else intrinsic.push(block);
    }

    let frame = 0;
    const update = () => {
        frame = 0;
        const step = parseFloat(
            getComputedStyle(root).getPropertyValue("--grid-step"),
        );
        if (!step) return;
        // Cards with several flow children must be measured at their natural
        // height first; otherwise a previous minimum prevents them shrinking.
        for (const block of intrinsic)
            block.style.removeProperty("--grid-block-height");
        // Inner blocks first, so their rounded rows feed into the section size.
        for (const block of [...blocks].reverse()) {
            const content = measures.get(block);
            const css = getComputedStyle(block);
            const inset =
                parseFloat(css.paddingTop) +
                parseFloat(css.paddingBottom) +
                parseFloat(css.borderTopWidth) +
                parseFloat(css.borderBottomWidth);
            const height = content
                ? gridHeight(
                      content.getBoundingClientRect().height,
                      inset,
                      step,
                  )
                : gridHeight(block.getBoundingClientRect().height, 0, step);
            const value = `${height}px`;
            if (block.style.getPropertyValue("--grid-block-height") !== value) {
                block.style.setProperty("--grid-block-height", value);
            }
        }
        if (main) {
            const origin = main.getBoundingClientRect().top + window.scrollY;
            root.style.setProperty("--grid-origin-y", `${origin}px`);
            const container = main.querySelector(".grid-width, .container-x");
            if (container)
                root.style.setProperty(
                    "--grid-origin-x",
                    `${container.getBoundingClientRect().left}px`,
                );
            const status =
                document
                    .querySelector(".status-bar.bottom")
                    ?.getBoundingClientRect().height ?? 32;
            // Short pages keep their footer low without introducing a fractional row.
            const minimum =
                origin +
                status +
                gridHeight(window.innerHeight - origin - status, 0, step);
            root.style.setProperty("--grid-page-min-height", `${minimum}px`);
        }
    };
    const schedule = () => {
        if (!frame) frame = requestAnimationFrame(update);
    };
    const observer = new ResizeObserver(schedule);
    for (const content of measures.values()) observer.observe(content);
    for (const block of intrinsic) observer.observe(block);
    const nav = document.querySelector(".bjnav");
    if (nav) observer.observe(nav);
    window.addEventListener("resize", schedule, { passive: true });
    document.fonts.ready.then(schedule);
    update();
}
