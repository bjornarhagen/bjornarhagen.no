export function checkIfImageUrl(url: string): boolean {
    const startsWithSlash = url.startsWith("/");
    const startsWithHttp = url.startsWith("http");
    const hasImageExtension =
        url.match(/\.(jpeg|jpg|gif|png|webp|svg)$/) !== null;

    const isImageUrl = (startsWithSlash || startsWithHttp) && hasImageExtension;
    return isImageUrl;
}
