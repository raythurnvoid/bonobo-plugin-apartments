import { describe, expect, test } from "vitest";
import { describe_page } from "./agent-context";
import { fixture_flats } from "./fixtures/flats";
import { fixture_row } from "./fixtures/rows";

describe("describe_page", () => {
	test("fits in the 4 KiB the model reads when the rows and the viewings are long", () => {
		// German letters take 2 bytes in UTF-8, so a text of 4,000 letters is longer than 4 KiB.
		const flats = fixture_flats(30).map((flat) => ({ ...flat, title: `Schöne Wohnung ${"ä".repeat(300)}` }));

		const context = describe_page({
			folder: "/flats",
			view: "Newest",
			rows: flats.map(fixture_row),
			openFlat: null,
			viewings: "Besichtigung am Montag, Grüße.\n".repeat(200),
		});

		const part = context.content?.[0];
		const text = part?.type === "text" ? part.text : "";
		// The host cuts the text at 4,096 bytes for the model.
		expect(new TextEncoder().encode(text).length).toBeLessThanOrEqual(4_096);
		expect(text.startsWith("Apartments page")).toBe(true);
		expect(text.endsWith("[Shortened.]")).toBe(true);
	});
});
