import type { BonoboClient } from "bonobo-plugin-sdk/frontend";
import { fetch_json_with_429_retry, get_error_message } from "./retry";
import { take_rows_up_to_max_rent, view_request, type FlatRow, type ViewChoice } from "./views";

/**
 * Requests one "Load more" may send. The route can answer a short or empty page while more rows
 * exist, so one click follows the cursor until it has rows to show. The limit keeps one click from
 * looping for a long time. 429 retries do not count.
 */
export const LOAD_PAGE_BUDGET = 8;

/** The message for a folder the person did not choose for this plugin. */
export const PERMISSION_MESSAGE = "Choose the flats folder in My file permissions.";

export type FlatList = {
	/**
	 * One "Load more" click. It returns the new rows, and an error message when a request failed.
	 * After an error the cursor is kept, so the next click continues from the same page.
	 *
	 * `restarted` is true when the host ended the cursor and the list started again at the first
	 * page. Then `rows` replace every row shown before.
	 */
	load_next(): Promise<{ rows: FlatRow[]; errorMessage: string | null; restarted: boolean }>;
	/** False when the folder has no more rows for this view. */
	has_more(): boolean;
};

/**
 * `signal` aborts when the table closes. Then no more requests go out.
 */
export function create_flat_list(
	client: BonoboClient,
	folder: string,
	choice: ViewChoice,
	signal: AbortSignal,
): FlatList {
	let cursor: string | null = null;
	let isDone = false;
	// A flat whose sort value changed between two pages can come back on a later page. Show it once.
	const seenNodeIds = new Set<string>();

	return {
		async load_next() {
			const rows: FlatRow[] = [];
			let errorMessage: string | null = null;
			let restarted = false;

			try {
				for (
					let requests = 0;
					rows.length === 0 && !isDone && !signal.aborted && requests < LOAD_PAGE_BUDGET;
					requests += 1
				) {
					const answer = await fetch_json_with_429_retry(
						client,
						"/api/v1/files/query",
						view_request(folder, choice, cursor),
						signal,
					);

					// The host ends a cursor when files move or the host updates. Start the whole list again
					// from the first page, once per click. Reading the old pages again only to skip the rows
					// already shown would cost a request per old page.
					if (
						answer.status === 400 &&
						answer.body !== null &&
						answer.body.errorCode === "invalid_cursor" &&
						cursor !== null &&
						!restarted
					) {
						restarted = true;
						cursor = null;
						seenNodeIds.clear();
						continue;
					}
					if (answer.status === 403) {
						throw new Error(PERMISSION_MESSAGE);
					}
					if (answer.status === 404) {
						throw new Error(`The folder ${folder} does not exist.`);
					}
					if (answer.status !== 200) {
						throw new Error(answer.body?.message ?? `The files query answered ${answer.status}`);
					}
					if (answer.body === null) {
						throw new Error("The files query answered 200 with a body that is not JSON");
					}

					const page = take_rows_up_to_max_rent(answer.body.items, choice.view === "cheapest" ? choice.maxRent : null);
					cursor = answer.body.cursor;
					// Stop paging at the first rent above the max: every later row costs more.
					isDone = answer.body.isDone || page.reachedMaxRent;

					for (const row of page.rows) {
						if (seenNodeIds.has(row.nodeId)) {
							continue;
						}
						seenNodeIds.add(row.nodeId);
						rows.push(row);
					}
				}
			} catch (error) {
				errorMessage = get_error_message(error);
			}

			return { rows, errorMessage, restarted };
		},
		has_more() {
			return !isDone;
		},
	};
}
