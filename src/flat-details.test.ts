import type { BonoboClient } from "bonobo-plugin-sdk/frontend";
import { describe, expect, test, vi } from "vitest";
import { read_text_file } from "./flat-details";

describe("read_text_file", () => {
	test("a character split between two pages decodes right", async () => {
		const text = "---\ntitle: Flat\n---\n\nWarm rent 900 € with heating.\n";
		const bytes = new TextEncoder().encode(text);
		// "€" is three bytes. Cut the file after its first byte.
		const cut = bytes.indexOf(0xe2) + 1;
		const fetchRaw = vi
			.fn()
			.mockResolvedValueOnce(new Response(bytes.slice(0, cut), { headers: { "X-File-Next-Cursor": "c1" } }))
			.mockResolvedValueOnce(new Response(bytes.slice(cut)));

		const result = await read_text_file(
			{ fetchRaw } as unknown as BonoboClient,
			"/flats/a.md",
			new AbortController().signal,
		);

		expect(result).toEqual({ text, isCut: false });
		expect(fetchRaw.mock.calls[1][1]).toEqual({ path: "/flats/a.md", cursor: "c1" });
	});
});
