import type { PageContent } from "./dynamic-pages";

export type Entries = {
    // year
    [key: string]: {
        // slug
        [key: string]: PageContent;
    };
};

export const entries: Entries = {
    "2024": {
        "08-09-example": {
            title: "Example post",
            date: "09.08.2024",
            slug: "08-09-example",
            poster: "/images/entries/index.jpg",
            imageHeader: "/images/entries/index.jpg",
            summary: "Example post summary",
            content: [
                {
                    layout: "cols-3",
                    padded: true,
                    bg: "light",
                    attributes: {
                        "text-align": [
                            "",
                            "center",
                            "center",
                            "center",
                            "center",
                            "center",
                        ],
                    },
                    text: [
                        "## Title",
                        "![Picture](/images/entries/index.jpg)",
                        "![Picture](/images/entries/index.jpg)",
                        "![Picture](/images/entries/index.jpg)",
                        "![Picture](/images/entries/index.jpg)",
                        "![Picture](/images/entries/index.jpg)",
                    ],
                },
            ],
        },
    },
};
