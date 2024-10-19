import type { PageContent } from "./dynamic-pages";

export type Entries = {
    [key: string]: {
        [key: string]: PageContent;
    };
};

export const entries: Entries = {
    "2023": {
        asdasd: {
            title: "New Entry asd",
            slug: "asdasd",
            imageHeader: "asd",
            imageText: "asd",
            poster: "asd",
            date: "2023-10-19",
            summary: "asd",
            content: [],
        },
    },
    "2024": {
        "08-09-example": {
            title: "Example post!!!",
            date: "2024-08-09",
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
            imageText: "",
        },
        asdasd: {
            title: "New Entry!!",
            slug: "asdasd",
            imageHeader: "asdasd",
            imageText: "asdasd",
            poster: "asdasd",
            date: "2024-10-18",
            summary: "asdasd",
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
        asd: {
            title: "New Entry",
            slug: "asd",
            imageHeader: "asd",
            imageText: "asd",
            poster: "asd",
            date: "2024-10-19",
            summary: "asd",
            content: [],
        },
    },
};
