import type { BonoboClient } from "bonobo-plugin-sdk/frontend";
import { describe, expect, test, vi } from "vitest";
import { fixture_flats } from "./fixtures/flats";
import { fixture_row } from "./fixtures/rows";
import { create_flat_list } from "./flat-list";

describe("create_flat_list", () => {
	test("the cheapest view stops paging at the first rent above the max", async () => {
		const flats = fixture_flats(6).sort((a, b) => a.rentWarm - b.rentWarm);
		const maxRent = flats[2].rentWarm;
		const fetchJson = vi.fn(async () => ({
			status: 200,
			body: { items: flats.map(fixture_row), cursor: "next", isDone: false },
		}));
		const list = create_flat_list(
			{ fetchJson } as unknown as BonoboClient,
			"/flats",
			{ view: "cheapest", status: "new", maxRent },
			new AbortController().signal,
		);

		const first = await list.load_next();

		expect(first.rows.map((row) => row.nodeId)).toEqual(flats.slice(0, 3).map((flat) => `node-${flat.sourceId}`));
		// The server said more pages exist, but every later flat costs more than the max.
		expect(list.has_more()).toBe(false);
		expect((await list.load_next()).rows).toEqual([]);
		expect(fetchJson).toHaveBeenCalledTimes(1);
	});

	test("one click follows the cursor past an empty page to the rows", async () => {
		const flats = fixture_flats(2);
		const fetchJson = vi
			.fn()
			.mockResolvedValueOnce({ status: 200, body: { items: [], cursor: "c1", isDone: false } })
			.mockResolvedValueOnce({ status: 200, body: { items: flats.map(fixture_row), cursor: null, isDone: true } });
		const list = create_flat_list(
			{ fetchJson } as unknown as BonoboClient,
			"/flats",
			{ view: "newest", status: "new", maxRent: null },
			new AbortController().signal,
		);

		const result = await list.load_next();

		expect(result.rows).toHaveLength(flats.length);
		expect(fetchJson).toHaveBeenCalledTimes(2);
		expect(fetchJson.mock.calls[1][1]).toMatchObject({ cursor: "c1" });
	});

	test("an ended cursor starts the whole list again from the first page", async () => {
		const flats = fixture_flats(3);
		const fetchJson = vi
			.fn()
			.mockResolvedValueOnce({ status: 200, body: { items: [fixture_row(flats[0])], cursor: "c1", isDone: false } })
			.mockResolvedValueOnce({ status: 400, body: { message: "Cursor changed", errorCode: "invalid_cursor" } })
			.mockResolvedValueOnce({ status: 200, body: { items: flats.map(fixture_row), cursor: null, isDone: true } });
		const list = create_flat_list(
			{ fetchJson } as unknown as BonoboClient,
			"/flats",
			{ view: "newest", status: "new", maxRent: null },
			new AbortController().signal,
		);
		await list.load_next();

		const result = await list.load_next();

		// The first page comes back whole, including the flat shown before the restart, so the
		// table can replace its rows.
		expect(result.restarted).toBe(true);
		expect(result.rows).toHaveLength(flats.length);
		expect(fetchJson.mock.calls[2][1]).toMatchObject({ cursor: null });
	});
});
