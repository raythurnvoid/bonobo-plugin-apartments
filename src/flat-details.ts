import type { BonoboClient } from "bonobo-plugin-sdk/frontend";
import type { BonoboHttpApi } from "bonobo-plugin-sdk/http-api";
import { fetch_json_with_429_retry, wait_before_429_retry } from "./retry";

/** Photos shown for one flat. One list request returns at most this many. */
export const MAX_PHOTOS = 24;

/**
 * The details stop reading a flat file after about this many bytes. An ad text is far shorter, so a
 * longer file is not a normal flat file, and reading all of it would only cost requests.
 */
export const MAX_FLAT_TEXT_BYTES = 2 * 1024 * 1024;

export type FlatPhoto = BonoboHttpApi["/api/v1/files/list"]["POST"]["response"][200]["body"]["items"][number];

/**
 * Read one field of an error answer. The answer is JSON, but it can also be something else.
 */
function error_field(body: unknown, key: "message" | "errorCode" | "retryAfterMs"): unknown {
	return typeof body === "object" && body !== null ? Reflect.get(body, key) : undefined;
}

/**
 * Read the text of one flat file. `isCut` is true when the file is longer than
 * `MAX_FLAT_TEXT_BYTES` and only its start was read.
 *
 * The read route answers bytes, one page at a time. One decoder is kept across the pages, so a
 * character that is split between two pages still decodes right.
 */
export async function read_flat_text(client: BonoboClient, path: string, signal: AbortSignal) {
	let decoder = new TextDecoder();
	let cursor: string | null = null;
	let text = "";
	let bytes = 0;
	let restarted = false;
	let rateLimitedRetries = 0;

	for (;;) {
		const response: Response = await client.fetchRaw("/api/v1/files/read", { path, cursor });
		if (!response.ok) {
			const body: unknown = await response.json().catch(() => null);

			// Wait and send the same page request again, like every other call of this plugin.
			if (
				response.status === 429 &&
				(await wait_before_429_retry(error_field(body, "retryAfterMs"), rateLimitedRetries, signal))
			) {
				rateLimitedRetries += 1;
				continue;
			}
			// The file was saved again during the read, so the pages read so far do not fit the new
			// text. Read it again from the start, once.
			if (response.status === 409 && error_field(body, "errorCode") === "file_changed" && !restarted) {
				restarted = true;
				decoder = new TextDecoder();
				cursor = null;
				text = "";
				bytes = 0;
				continue;
			}

			// An error answer is JSON with a message. Fall back to the status when it is not.
			const message = error_field(body, "message");
			throw new Error(typeof message === "string" ? message : `The file read answered ${response.status}`);
		}

		const chunk = await response.arrayBuffer();
		bytes += chunk.byteLength;
		text += decoder.decode(chunk, { stream: true });
		cursor = response.headers.get("X-File-Next-Cursor");
		if (cursor === null) {
			return { text: text + decoder.decode(), isCut: false };
		}
		// Do not flush the decoder here. Half a character at the cut would show as a broken sign.
		if (bytes >= MAX_FLAT_TEXT_BYTES) {
			return { text, isCut: true };
		}
		signal.throwIfAborted();
	}
}

/**
 * The folder that holds the photos of one flat: the flat file path without `.md`. A file that does
 * not end with `.md` has no photo folder, so this gives `null`.
 */
export function flat_photo_folder(flatPath: string) {
	return flatPath.endsWith(".md") ? flatPath.slice(0, -".md".length) : null;
}

/**
 * List the photos of one flat. A flat without a photo folder has no photos, so a missing or
 * unreadable folder gives an empty list instead of an error.
 */
export async function list_flat_photos(
	client: BonoboClient,
	flatPath: string,
	signal: AbortSignal,
): Promise<FlatPhoto[]> {
	const folder = flat_photo_folder(flatPath);
	if (folder === null) {
		return [];
	}

	const answer = await fetch_json_with_429_retry(
		client,
		"/api/v1/files/list",
		{
			path: folder,
			// The content type filter works only on a recursive list.
			recursive: true,
			kind: "file",
			contentTypePrefixes: ["image/"],
			limit: MAX_PHOTOS,
		},
		signal,
	);
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
