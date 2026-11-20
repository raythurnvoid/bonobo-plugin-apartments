import type { BonoboClient, BonoboHttpJsonApiPath } from "bonobo-plugin-sdk/frontend";
import type { BonoboHttpApi, BonoboHttpResponse } from "bonobo-plugin-sdk/http-api";

/** How many times a rate-limited call is sent again before its 429 is returned. */
const MAX_429_RETRIES = 4;

/**
 * The longest wait after a 429. The page should not look stuck for longer, so a longer
 * `retryAfterMs` comes back as the 429 at once.
 */
const MAX_429_WAIT_MS = 30_000;

function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

export function get_error_message(error: unknown): string {
	return error instanceof Error ? error.message : String(error);
}

/**
 * Wait before a rate-limited call is sent again: `retryAfterMs` plus a small random delay, like the
 * SDK README asks. `retries` is how many times the call was already sent again.
 *
 * Returns false when the call must not be sent again: the answer has no `retryAfterMs` (it does not
 * clear soon), the wait is longer than 30 s, or the retries are used up. Throws when `signal`
 * aborted during the wait, because the page no longer needs the answer.
 */
export async function wait_before_429_retry(retryAfterMs: unknown, retries: number, signal: AbortSignal | null) {
	if (typeof retryAfterMs !== "number" || retryAfterMs > MAX_429_WAIT_MS || retries >= MAX_429_RETRIES) {
		return false;
	}

	await sleep(retryAfterMs + Math.random() * 250);
	signal?.throwIfAborted();
	return true;
}

/**
 * `client.fetchJson` with the 429 back-off of `wait_before_429_retry`. A retry sends the exact same
 * body (including any cursor) again.
 *
 * Every other status comes back for the caller to narrow on, a 5xx included. `body` is `null` when
 * the answer did not parse as JSON. A refused session refresh, a network failure and an aborted
 * `signal` reject.
 */
export async function fetch_json_with_429_retry<P extends BonoboHttpJsonApiPath>(
	client: BonoboClient,
	path: P,
	body: BonoboHttpApi[P]["POST"]["body"],
	signal: AbortSignal | null,
): Promise<BonoboHttpResponse<P>> {
	for (let retries = 0; ; retries += 1) {
		const answer = await client.fetchJson(path, body);
		// The generic answer type does not name `retryAfterMs`, so read it from the plain object.
		const answerBody: unknown = answer.body;
		const retryAfterMs =
			answer.status === 429 && typeof answerBody === "object" && answerBody !== null && "retryAfterMs" in answerBody
				? answerBody.retryAfterMs
				: undefined;
		if (await wait_before_429_retry(retryAfterMs, retries, signal)) {
			continue;
		}

		return answer;
	}
}
