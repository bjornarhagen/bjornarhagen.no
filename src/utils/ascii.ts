import { readFileSync } from "fs";

export function getAscii(filenameInAsciiFolder: string) {
    if (filenameInAsciiFolder.includes("..")) {
        return "No dots allowed";
    }

    return readFileSync(
        new URL(
            `../../public/ascii/${filenameInAsciiFolder}.txt`,
            import.meta.url
        ),
        "utf-8"
    );
}
