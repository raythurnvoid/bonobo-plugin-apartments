import type { BonoboClient } from "bonobo-plugin-sdk/frontend";
import type { BonoboHttpApi } from "bonobo-plugin-sdk/http-api";
import { fetch_json_with_429_retry } from "./retry";

/** Photos shown for one flat. One list request returns at most this many. */
export const MAX_PHOTOS = 24;

export type FlatPhoto = BonoboHttpApi["/api/v1/files/list"]["POST"]["response"][200]["body"]["items"][number];

/**
 * Read the whole text of one flat file.
 *
 * The read route answers bytes, one page at a time. One decoder is kept across the pages, so a
 * character that is split between two pages still decodes right.
 */
export async function read_flat_text(client: BonoboClient, path: string) {
	const decoder = new TextDecoder();
	let cursor: string | null = null;
	let text = "";

	do {
		const response: Response = await client.fetchRaw("/api/v1/files/read", { path, cursor });
		if (!response.ok) {
			// An error answer is JSON with a message. Fall back to the status when it is not.
			const body: unknown = await response.json().catch(() => null);
			const message =
				typeof body === "object" && body !== null && "message" in body && typeof body.message === "string"
					? body.message
					: `The file read answered ${response.status}`;
			throw new Error(message);
		}

		text += decoder.decode(await response.arrayBuffer(), { stream: true });
		cursor = response.headers.get("X-File-Next-Cursor");
	} while (cursor !== null);

	return text + decoder.decode();
}

/**
 * The folder that holds the photos of one flat: the flat file path without `.md`.
 */
export function flat_photo_folder(flatPath: string) {
	return flatPath.replace(/\.md$/u, "");
}

/**
 * List the photos of one flat. A flat without a photo folder has no photos, so a missing or
 * unreadable folder gives an empty list instead of an error.
 */
export async function list_flat_photos(client: BonoboClient, flatPath: string): Promise<FlatPhoto[]> {
	const answer = await fetch_json_with_429_retry(client, "/api/v1/files/list", {
		path: flat_photo_folder(flatPath),
		// The content type filter works only on a recursive list.
		recursive: true,
		kind: "file",
		contentTypePrefixes: ["image/"],
		limit: MAX_PHOTOS,
	});
	if (answer.status === 403 || answer.status === 404) {
		return [];
	}
	if (answer.status !== 200) {
		throw new Error(answer.body?.message ?? `The files list answered ${answer.status}`);
	}
	if (answer.body === null) {
		throw new Error("The files list answered 200 with a body that is not JSON");
	}

	// A file the person cannot open comes back as a locked row. Its photo cannot load, so skip it.
	return answer.body.items.filter((item) => !item.locked);
}
