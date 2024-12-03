import type { ContentSection } from "../components/dumb/ContentRenderer.astro";
import entriesJSON from "./entries.json";
import portfolioJSON from "./portfolio.json";

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

export type PagesContent = {
    // Year
    [key: string]: {
        // Slug
        [key: string]: PageContent;
    };
};

export const dynamicPages = {
    entries: entriesJSON as PagesContent,
    portfolio: portfolioJSON as PagesContent,
};

export const dynamicPagesConfig: {
    [key in keyof typeof dynamicPages]: {
        title: string;
        description: string;
    };
} = {
    entries: {
        title: "Posts",
        description: "A collection of my thoughts and experiences.",
    },
    portfolio: {
        title: "Portfolio",
        description: "A showcase of my work.",
    },
};
