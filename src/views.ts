import type { BonoboHttpApi } from "bonobo-plugin-sdk/http-api";

export type FilesQueryBody = BonoboHttpApi["/api/v1/files/query"]["POST"]["body"];
export type FlatRow = BonoboHttpApi["/api/v1/files/query"]["POST"]["response"][200]["body"]["items"][number];

/** Rows per request. This is the route's own maximum. */
export const PAGE_LIMIT = 50;

/**
 * The fields the table shows. The route returns them with each row, so the table needs no
 * second request per flat.
 */
export const TABLE_FIELDS = [
	"frontmatter.title",
	"frontmatter.rentWarm",
	"frontmatter.rentWarmEstimated",
	"frontmatter.sizeM2",
	"frontmatter.rooms",
	"frontmatter.bikeMin",
	"frontmatter.postedAt",
	"frontmatter.status",
];

export const FLAT_STATUSES = ["new", "saved", "contacted", "hidden"] as const;
export type FlatStatus = (typeof FLAT_STATUSES)[number];

export const VIEWS = [
	{ id: "newest", label: "Newest" },
	{ id: "cheapest", label: "Cheapest" },
	{ id: "biggest", label: "Biggest" },
	{ id: "shortest-bike", label: "Shortest bike ride" },
	{ id: "ideal", label: "Ideal" },
	{ id: "status", label: "By status" },
] as const;
export type ViewId = (typeof VIEWS)[number]["id"];

export type ViewChoice = {
	view: ViewId;
	/** Used by the "By status" view only. */
	status: FlatStatus;
	/** Used by the "Cheapest" view only. `null` means no limit. */
	maxRent: number | null;
};

/**
 * The request one view sends for one page.
 *
 * Every view is one folder-mode query on one field. A sort view leaves out `match`, so the folder
 * answers every flat that has the field, in value order. A flat without that field is not in the
 * view.
 */
export function view_request(folder: string, choice: ViewChoice, cursor: string | null): FilesQueryBody {
	const base = { mode: "folder" as const, path: folder, fields: TABLE_FIELDS, limit: PAGE_LIMIT, cursor };

	switch (choice.view) {
		case "newest":
			return { ...base, field: "frontmatter.postedAt", order: "desc" };
		case "cheapest":
			return { ...base, field: "frontmatter.rentWarm", order: "asc" };
		case "biggest":
			return { ...base, field: "frontmatter.sizeM2", order: "desc" };
		case "shortest-bike":
			return { ...base, field: "frontmatter.bikeMin", order: "asc" };
		case "ideal":
			return { ...base, field: "frontmatter.ideal", match: { eq: true } };
		case "status":
			return { ...base, field: "frontmatter.status", match: { eq: choice.status } };
	}
}

/**
 * Read one returned field of a row. A file without the field gives `null`.
 */
export function row_field(row: FlatRow, field: string) {
	return row.fields[field]?.value ?? null;
}

/**
 * Read one returned field as a number. A missing field, or a value that is not a number, gives
 * `null`.
 */
export function row_number(row: FlatRow, field: string) {
	const value = row_field(row, field);
	if (typeof value === "number") {
		return value;
	}

	// A writer may quote a number. Then the value comes back as text.
	const parsed = typeof value === "string" && value.trim() !== "" ? Number(value) : Number.NaN;
	return Number.isFinite(parsed) ? parsed : null;
}

/**
 * Keep the rows up to the max rent, and say if the page went past it.
 *
 * The "Cheapest" view comes back in rent order. So the first row above the max rent means every
 * later row is above it too, and paging can stop there. No max rent keeps every row.
 */
export function take_rows_up_to_max_rent(rows: FlatRow[], maxRent: number | null) {
	if (maxRent === null) {
		return { rows, reachedMaxRent: false };
	}

	const firstAbove = rows.findIndex((row) => {
		const rent = row_number(row, "frontmatter.rentWarm");
		return rent !== null && rent > maxRent;
	});
	if (firstAbove === -1) {
		return { rows, reachedMaxRent: false };
	}

	return { rows: rows.slice(0, firstAbove), reachedMaxRent: true };
}
