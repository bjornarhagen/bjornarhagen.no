import { dynamicPages } from "@/data/dynamic-pages";

/**
 * Canonical, view-independent numbering for posts/portfolio entries.
 *
 * Each entry gets a stable number based on global chronological order
 * (oldest = No. 0001), so the number never changes when you filter by year
 * or flip the sort. `latestKey` is the single genuinely most-recent entry, so
 * the "LATEST" marker is only ever shown on the real latest post.
 */
export type EntryKey = string; // `${year}/${slug}`

export function entryCatalog(type: string) {
    const pages = dynamicPages[type as keyof typeof dynamicPages] ?? {};
    const all = Object.keys(pages).flatMap((year) =>
        Object.keys(pages[year]).map((slug) => ({
            year,
            slug,
            date: pages[year][slug].date,
        }))
    );

    const time = (d: string) => new Date(d).getTime();
    const oldestFirst = [...all].sort((a, b) => time(a.date) - time(b.date));

    const numberByKey = new Map<EntryKey, number>();
    oldestFirst.forEach((e, i) =>
        numberByKey.set(`${e.year}/${e.slug}`, i + 1)
    );

    const newest = [...all].sort((a, b) => time(b.date) - time(a.date))[0];

    return {
        total: all.length,
        numberByKey,
        latestKey: newest
            ? (`${newest.year}/${newest.slug}` as EntryKey)
            : null,
    };
}

export function entryKey(year: string, slug: string): EntryKey {
    return `${year}/${slug}`;
}

export function fmtNo(n: number | undefined): string {
    return "No. " + String(n ?? 0).padStart(4, "0");
}
