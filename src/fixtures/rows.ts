import { TABLE_FIELDS, type FlatRow } from "../views";
import { fixture_flat_path, type FixtureFlat } from "./flats";

/**
 * One fake flat as the `files/query` route returns it, with the table fields.
 */
export function fixture_row(flat: FixtureFlat): FlatRow {
	const path = fixture_flat_path("/flats", flat);
	// The route shows a list field as its first value.
	const values: Record<string, string | number | boolean> = {
		...flat,
		flags: flat.flags[0] ?? "",
		idealMisses: flat.idealMisses[0] ?? "",
	};

	return {
		path,
		name: path.slice("/flats/".length),
		// The route answers a branded files_nodes id. Brand the fixture once here.
		nodeId: `node-${flat.sourceId}` as FlatRow["nodeId"],
		kind: "file",
		contentType: "text/markdown",
		updatedAt: 0,
		status: "ready",
		size: 100,
		readOnly: false,
		fields: Object.fromEntries(
			TABLE_FIELDS.map((field) => [field, { value: values[field.slice("frontmatter.".length)], isPreview: false }]),
		),
	};
}
