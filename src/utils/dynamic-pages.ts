import type { PageContent } from "../data/dynamic-pages";

export function initializeContent(page: PageContent) {
    let pageContent = page.content;
    if (!pageContent || !Array.isArray(pageContent)) {
        pageContent = [{}];
    }

    pageContent = pageContent.map((content) => {
        if (content.layout === undefined) {
            content.layout = "";
        }

        if (content.margin === undefined) {
            content.margin = false;
        }

        if (content.padded === undefined) {
            content.padded = false;
        }

        if (content.bg === undefined) {
            content.bg = "";
        }

        if (!content.text || !Array.isArray(content.text)) {
            content.text = [""];
        }

        if (!content.attributes || typeof content.attributes !== "object") {
            content.attributes = {};
        }

        if (
            !content.attributes.sticky ||
            !Array.isArray(content.attributes.sticky)
        ) {
            content.attributes.sticky = [];
        }

        if (
            !content.attributes.borders ||
            !Array.isArray(content.attributes.borders)
        ) {
            content.attributes.borders = [];
        }

        if (
            !content.attributes.widths ||
            !Array.isArray(content.attributes.widths)
        ) {
            content.attributes.widths = [""];
        }

        if (
            !content.attributes["v-align"] ||
            !Array.isArray(content.attributes["v-align"])
        ) {
            content.attributes["v-align"] = [""];
        }

        if (
            !content.attributes["h-align"] ||
            !Array.isArray(content.attributes["h-align"])
        ) {
            content.attributes["h-align"] = ["center"];
        }

        if (
            !content.attributes["text-align"] ||
            !Array.isArray(content.attributes["text-align"])
        ) {
            content.attributes["text-align"] = [""];
        }

        return content;
    });

    return pageContent;
}

export function convertValueToType(value: any) {
    // boolean
    if (value === "true" || value === "false") {
        return value === "true";
    }

    // number
    if (!isNaN(value)) {
        return +value;
    }

    // string
    return value;
}
