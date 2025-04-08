import { readFileSync } from "fs";

function isDevEnvironment() {
    return process.env.NODE_ENV !== "production";
}

export function getAscii(filenameInAsciiFolder: string) {
    if (filenameInAsciiFolder.includes("..")) {
        return "No dots allowed";
    }

    let asciiFilePath = `../../client/ascii/${filenameInAsciiFolder}.txt`;

    if (isDevEnvironment()) {
        asciiFilePath = `../../public/ascii/${filenameInAsciiFolder}.txt`;
    }

    return readFileSync(new URL(asciiFilePath, import.meta.url), "utf-8");
}
