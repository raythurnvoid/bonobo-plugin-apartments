// Fake flats for tests and for the QA seed script. Nothing here comes from a real listing. The seed
// script writes them only to a folder whose name starts with `qa-`, such as `/qa-flats`.
//
// Keep this file free of imports and of TypeScript-only syntax that needs a build step (no enums,
// no namespaces), because `scripts/seed-qa-flats.mjs` imports it straight from Node.

export type FixtureFlat = {
	source: string;
	sourceId: string;
	url: string;
	title: string;
	kind: "flat" | "room";
	rentWarm: number;
	rentWarmEstimated: boolean;
	rentCold: number;
	sizeM2: number;
	rooms: number;
	address: string;
	postcode: string;
	lat: number;
	lon: number;
	availableFrom: string;
	floor: "ground" | "upper" | "unclear";
	bikeMin: number;
	walkMin: number;
	distanceKm: number;
	stayMonths: number;
	postedAt: string;
	firstSeenAt: string;
	status: "new" | "saved" | "contacted" | "hidden";
	ideal: boolean;
	flags: string[];
	idealMisses: string[];
	description: string;
};

const STREETS = ["Lindenweg", "Ahornallee", "Birkenstrasse", "Kastanienring", "Ulmenplatz"];
const STATUSES = ["new", "saved", "contacted", "hidden"] as const;
const FLOORS = ["ground", "upper", "unclear"] as const;

function two_digits(value: number) {
	return String(value).padStart(2, "0");
}

/**
 * Build `count` fake flats. The same `count` always gives the same flats, so tests and the seed
 * script agree on every value.
 */
export function fixture_flats(count = 20): FixtureFlat[] {
	const flats: FixtureFlat[] = [];

	for (let index = 0; index < count; index += 1) {
		const isRoom = index % 5 === 4;
		const rentCold = 520 + ((index * 137) % 900);
		const sizeM2 = 28 + ((index * 11) % 60);
		const bikeMin = 6 + ((index * 7) % 35);
		// Spread the ad times over ten days, one format: UTC ISO with milliseconds.
		const postedAt = `2026-11-${two_digits(1 + (index % 10))}T${two_digits(8 + (index % 12))}:15:00.000Z`;
		const ideal = index % 4 === 0;

		flats.push({
			source: "fakeads",
			sourceId: String(1000 + index),
			url: `https://fakeads.example/listing/${1000 + index}`,
			title: `${isRoom ? "Room" : "Flat"} on ${STREETS[index % STREETS.length]} ${index + 1}`,
			kind: isRoom ? "room" : "flat",
			rentWarm: rentCold + 120,
			rentWarmEstimated: index % 3 === 0,
			rentCold,
			sizeM2,
			// Half rooms test that the "Rooms" view sorts decimals by value.
			rooms: isRoom ? 1 : 1 + (index % 3) + (index % 2 === 0 ? 0.5 : 0),
			address: `${STREETS[index % STREETS.length]} ${index + 1}, Musterstadt`,
			postcode: String(10100 + index * 3),
			lat: 52.5 + index / 1000,
			lon: 13.4 + index / 1000,
			availableFrom: `2027-01-${two_digits(1 + (index % 28))}`,
			floor: FLOORS[index % FLOORS.length],
			bikeMin,
			walkMin: bikeMin * 3,
			distanceKm: Math.round(bikeMin * 2.5) / 10,
			stayMonths: 6 + (index % 4) * 6,
			postedAt,
			firstSeenAt: postedAt,
			status: STATUSES[index % STATUSES.length],
			ideal,
			flags: index % 2 === 0 ? ["balcony", "furnished"] : ["quiet"],
			idealMisses: ideal ? [] : ["too far by bike"],
			description: `Fake listing number ${index + 1}. Bright rooms, a small kitchen, and a tram stop nearby.\n\nThis text is test data.`,
		});
	}

	return flats;
}

/**
 * The file path of one flat inside the flats folder.
 */
export function fixture_flat_path(folder: string, flat: FixtureFlat) {
	return `${folder === "/" ? "" : folder}/${flat.source}-${flat.sourceId}.md`;
}

/**
 * The full text of one flat file: frontmatter, then the ad description.
 *
 * `JSON.stringify` writes strings and lists in a form that is also valid YAML, so this needs no
 * YAML library.
 */
export function fixture_flat_text(flat: FixtureFlat) {
	const lines = ["---"];

	for (const [key, value] of Object.entries(flat)) {
		if (key === "description") {
			continue;
		}

		lines.push(
			`${key}: ${typeof value === "number" || typeof value === "boolean" ? String(value) : JSON.stringify(value)}`,
		);
	}

	lines.push("---", "", flat.description, "");
	return lines.join("\n");
}
