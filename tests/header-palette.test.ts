import { test } from "node:test";
import assert from "node:assert/strict";
import {
    selectHeaderPalette,
    type ColorSample,
} from "../src/utils/header-palette";

const red = { r: 215, g: 40, b: 55, weight: 1 };
const green = { r: 55, g: 175, b: 70, weight: 1 };
const blue = { r: 35, g: 100, b: 220, weight: 1 };
const hue = (color: string) => Number(color.match(/hsl\((\d+)/)?.[1]);

test("neutral and almost-white pages request the brand fallback", () => {
    const samples: ColorSample[] = [0, 30, 120, 240, 255].map((n) => ({
        r: n,
        g: n,
        b: n,
        weight: 1000,
    }));
    samples.push({ r: 255, g: 250, b: 250, weight: 1000 });
    assert.deepEqual(selectHeaderPalette(samples), []);
});

test("large neutral areas cannot drown out a small colorful accent", () => {
    assert.deepEqual(
        selectHeaderPalette([blue, { r: 20, g: 20, b: 20, weight: 100000 }]),
        selectHeaderPalette([blue]),
    );
});

test("a single accent produces three related but distinct hues", () => {
    const palette = selectHeaderPalette([blue]);
    assert.equal(new Set(palette).size, 3);
    assert.ok(
        palette.every((color) => Math.abs(hue(color) - hue(palette[0])) <= 22),
    );
});

test("distinct content colors survive palette selection", () => {
    const hues = selectHeaderPalette([red, green, blue]).map(hue);
    assert.ok(hues.some((h) => h > 340 || h < 20));
    assert.ok(hues.some((h) => h > 110 && h < 140));
    assert.ok(hues.some((h) => h > 210 && h < 240));
});

test("a tiny saturated outlier does not become a main gradient color", () => {
    assert.deepEqual(
        selectHeaderPalette([blue, { ...red, weight: 0.001 }]),
        selectHeaderPalette([blue]),
    );
});

test("red hues on opposite sides of zero are treated as one family", () => {
    const palette = selectHeaderPalette([
        red,
        { r: 215, g: 55, b: 40, weight: 0.5 },
    ]);
    assert.equal(palette.length, 3);
    assert.ok(palette.map(hue).every((h) => h >= 320 || h <= 40));
});
