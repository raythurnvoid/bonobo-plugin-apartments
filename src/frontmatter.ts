import { parse } from "yaml";

/**
 * The frontmatter keys this plugin reads, with the type each one must have. Any other key in a
 * flat file is ignored, and so is a known key with the wrong type.
 */
const FLAT_KEYS = {
	source: "text",
	sourceId: "text",
	url: "text",
	title: "text",
	kind: "text",
	rentWarm: "number",
	rentWarmEstimated: "boolean",
	rentCold: "number",
	sizeM2: "number",
	rooms: "number",
	address: "text",
	postcode: "text",
	lat: "number",
	lon: "number",
	availableFrom: "text",
	availableTo: "text",
	floor: "text",
	bikeMin: "number",
	walkMin: "number",
	distanceKm: "number",
	stayMonths: "number",
	postedAt: "text",
	firstSeenAt: "text",
	status: "text",
	ideal: "boolean",
	flags: "list",
	idealMisses: "list",
} as const;

export type FlatKey = keyof typeof FLAT_KEYS;
export type FlatFactValue = string | number | boolean | string[];
export type FlatFacts = Map<FlatKey, FlatFactValue>;

function read_known_value(kind: (typeof FLAT_KEYS)[FlatKey], value: unknown): FlatFactValue | null {
	switch (kind) {
		case "text":
			// YAML reads an unquoted `10115` as a number. Show it as text so a postcode still appears.
			return typeof value === "string" ? value : typeof value === "number" ? String(value) : null;
		case "number":
			return typeof value === "number" && Number.isFinite(value) ? value : null;
		case "boolean":
			return typeof value === "boolean" ? value : null;
		case "list":
			return Array.isArray(value) ? value.filter((item) => typeof item === "string") : null;
	}
}

/**
 * Split a flat file into its known facts and its description.
 *
 * The facts go into a `Map`, read key by key from the list above. So a file with a key such as
 * `__proto__` cannot change how any object in the page behaves. A file without frontmatter, or
 * with frontmatter that is not valid YAML, gives no facts and the whole text as description.
 */
export function parse_flat_file(text: string): { facts: FlatFacts; description: string } {
	const facts: FlatFacts = new Map();
	const match = /^---\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)/u.exec(text);
	if (!match) {
		return { facts, description: text.trim() };
	}

	const description = text.slice(match[0].length).trim();

	let parsed: unknown;
	try {
		parsed = parse(match[1]);
	} catch {
		return { facts, description };
	}
	if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
		return { facts, description };
	}

	for (const key of Object.keys(FLAT_KEYS) as FlatKey[]) {
		if (!Object.hasOwn(parsed, key)) {
			continue;
		}

		const value = read_known_value(FLAT_KEYS[key], (parsed as Record<string, unknown>)[key]);
		if (value !== null) {
			facts.set(key, value);
		}
	}

	return { facts, description };
}

/**
 * Return the ad address only when it is a normal web address, else `null`.
 *
 * The page shows it as text with a Copy button, never as a link: the plugin frame cannot open
 * new tabs. The check still matters, because a file could hold `javascript:` or another scheme
 * that nobody should paste into a browser.
 */
export function safe_ad_url(value: unknown) {
	if (typeof value !== "string") {
		return null;
	}

	let url: URL;
	try {
		url = new URL(value);
	} catch {
		return null;
	}

	return url.protocol === "http:" || url.protocol === "https:" ? url.href : null;
}
