/**
 * Single source of truth for the "years active" figures shown across the site
 * (hero meta, career heading, work-log rule).
 */
export const CAREER_START_YEAR = 2012;

export function yearsActive(now: Date = new Date()): number {
    return Math.max(0, now.getUTCFullYear() - CAREER_START_YEAR);
}
