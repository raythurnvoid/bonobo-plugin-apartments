import { describe, expect, test } from "vitest";
import { fixture_flat_text, fixture_flats } from "./fixtures/flats";
import { parse_flat_file, safe_ad_url } from "./frontmatter";

describe("parse_flat_file", () => {
	test("reads only the known keys with the right type", () => {
		const text = [
			"---",
			'title: "Flat on Lindenweg 1"',
			"rentWarm: 950",
			'sizeM2: "big"',
			"postcode: 10115",
			"flags: [balcony, 3, quiet]",
			"secretNote: do not show",
			"__proto__: { polluted: true }",
			"---",
			"",
			"Two bright rooms.",
		].join("\n");

		const flat = parse_flat_file(text);

		expect(Object.fromEntries(flat.facts)).toEqual({
			title: "Flat on Lindenweg 1",
			rentWarm: 950,
			postcode: "10115",
			flags: ["balcony", "quiet"],
		});
		expect(flat.description).toBe("Two bright rooms.");
		expect(({} as { polluted?: boolean }).polluted).toBeUndefined();
	});

	test("reads every fact of a fixture flat file", () => {
		const [flat] = fixture_flats(1);
		const { description, ...facts } = flat;

		const parsed = parse_flat_file(fixture_flat_text(flat));

		expect(Object.fromEntries(parsed.facts)).toEqual(facts);
		expect(parsed.description).toBe(description);
	});
});

describe("safe_ad_url", () => {
	test.each([
		["https://fakeads.example/listing/1", "https://fakeads.example/listing/1"],
		["http://fakeads.example/a b", "http://fakeads.example/a%20b"],
		["javascript:alert(1)", null],
		["data:text/html,<p>x</p>", null],
		["fakeads.example/listing/1", null],
		[42, null],
	])("%s gives %s", (value, expected) => {
		expect(safe_ad_url(value)).toBe(expected);
	});
});
