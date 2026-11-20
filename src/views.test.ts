import type { BonoboClient } from "bonobo-plugin-sdk/frontend";
import { describe, expect, test, vi } from "vitest";
import { fixture_flats } from "./fixtures/flats";
import { fixture_row } from "./fixtures/rows";
import { create_flat_list } from "./flat-list";
import { PAGE_LIMIT, TABLE_FIELDS, view_request, type ViewChoice } from "./views";

describe("view_request", () => {
	const choice = (view: ViewChoice["view"]): ViewChoice => ({ view, status: "saved", maxRent: 900 });

	test.each([
		["newest", { field: "frontmatter.postedAt", order: "desc" }],
		["cheapest", { field: "frontmatter.rentWarm", order: "asc" }],
		["biggest", { field: "frontmatter.sizeM2", order: "desc" }],
		["shortest-bike", { field: "frontmatter.bikeMin", order: "asc" }],
		["ideal", { field: "frontmatter.ideal", match: { eq: true } }],
		["status", { field: "frontmatter.status", match: { eq: "saved" } }],
	] as const)("the %s view sends one folder query on its field", (view, expected) => {
		expect(view_request("/flats", choice(view), "c1")).toEqual({
			mode: "folder",
			path: "/flats",
			fields: TABLE_FIELDS,
			limit: PAGE_LIMIT,
			cursor: "c1",
			...expected,
		});
	});
});

describe("create_flat_list", () => {
	test("the cheapest view stops paging at the first rent above the max", async () => {
		const flats = fixture_flats(6).sort((a, b) => a.rentWarm - b.rentWarm);
		const maxRent = flats[2].rentWarm;
		const fetchJson = vi.fn(async () => ({
			status: 200,
			body: { items: flats.map(fixture_row), cursor: "next", isDone: false },
		}));
		const list = create_flat_list({ fetchJson } as unknown as BonoboClient, "/flats", {
			view: "cheapest",
			status: "new",
			maxRent,
		});

		const first = await list.load_next();

		expect(first.rows.map((row) => row.nodeId)).toEqual(flats.slice(0, 3).map((flat) => `node-${flat.sourceId}`));
		// The server said more pages exist, but every later flat costs more than the max.
		expect(list.has_more()).toBe(false);
		expect((await list.load_next()).rows).toEqual([]);
		expect(fetchJson).toHaveBeenCalledTimes(1);
	});
});
