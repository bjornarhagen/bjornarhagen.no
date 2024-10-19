import type { ContentSection } from "../components/dumb/ContentRenderer.astro";

export type PageContent = {
    title: string;
    date: string;
    slug: string;
    summary: string;
    poster: string;
    imageHeader: string;
    imageText?: string;
    content: ContentSection[];
};

export type Entries = {
    [key: string]: {
        [key: string]: PageContent;
    };
};
