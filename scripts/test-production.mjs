import assert from "node:assert/strict";
import { existsSync, writeFileSync, unlinkSync } from "node:fs";

const origin = "http://127.0.0.1:8080";
for (let attempt = 0; ; attempt++) {
    try {
        await fetch(origin);
        break;
    } catch (error) {
        if (attempt === 49) throw error;
        await new Promise((resolve) => setTimeout(resolve, 100));
    }
}

assert.equal(process.getuid(), 1000);
assert.equal(existsSync("/app/src"), false);
assert.throws(() => writeFileSync("/app/notes-test", "test"), {
    code: "EROFS",
});
writeFileSync("/tmp/notes-test", "test");
unlinkSync("/tmp/notes-test");

async function page(path, status = 200) {
    const response = await fetch(origin + path);
    assert.equal(response.status, status, path);
    console.log(`${status} ${path}`);
    return response.text();
}

for (const path of ["/notes", "/notes?sort=oldest"]) {
    const response = await fetch(origin + path, { redirect: "manual" });
    assert.equal(response.status, 302, path);
    assert.equal(
        response.headers.get("location"),
        path.replace("/notes", "/entries"),
    );
    const html = await page(path);
    assert.ok(html.includes("UX tip for external links"));
    assert.ok(html.includes('href="/entries/2021/links"'));
    assert.ok(
        html.includes(
            path.includes("oldest") ? "sorted oldest" : "sorted newest",
        ),
    );
}

assert.ok((await page("/")).includes("Bjørnar"));
assert.ok((await page("/entries")).includes("UX tip for external links"));
assert.ok((await page("/entries/2021")).includes("UX tip for external links"));
const note = await page("/entries/2021/links");
assert.ok(note.includes("UX tip for external links"));
assert.ok(note.includes("On this website I have made such an indicator."));
await page("/portfolio");

// SSR must validate parameters itself; getStaticPaths is ignored in server mode.
for (const path of [
    "/missing-collection",
    "/toString",
    "/missing-collection/2021",
    "/entries/1900",
    "/entries/toString",
]) {
    await page(path, 404);
}
console.log("Production route and filesystem checks passed.");
