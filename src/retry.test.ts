import type { BonoboClient } from "bonobo-plugin-sdk/frontend";
import { afterEach, describe, expect, test, vi } from "vitest";
import { fetch_json_with_429_retry } from "./retry";

afterEach(() => {
	vi.useRealTimers();
});

describe("fetch_json_with_429_retry", () => {
	test("a 429 waits retryAfterMs, sends the same body again, and sends nothing after an abort", async () => {
		vi.useFakeTimers();
		const fetchJson = vi
			.fn()
			.mockResolvedValue({ status: 429, body: { message: "Rate limit exceeded", retryAfterMs: 1_000 } });
		const controller = new AbortController();

		const answer = fetch_json_with_429_retry(
			{ fetchJson } as unknown as BonoboClient,
			"/api/v1/files/list",
			{ path: "/flats", cursor: "c1" },
			controller.signal,
		);
		const rejected = expect(answer).rejects.toThrow();

		// The wait is retryAfterMs plus at most 250 ms of random delay.
		await vi.advanceTimersByTimeAsync(1_250);
		expect(fetchJson).toHaveBeenCalledTimes(2);
		expect(fetchJson.mock.calls[1][1]).toEqual({ path: "/flats", cursor: "c1" });

		controller.abort();
		await vi.advanceTimersByTimeAsync(1_250);
		expect(fetchJson).toHaveBeenCalledTimes(2);
		await rejected;
	});

	test("a wait longer than 30 s comes back as the 429 at once", async () => {
		vi.useFakeTimers();
		const tooLong = { status: 429, body: { message: "Rate limit exceeded", retryAfterMs: 60_000 } };
		const fetchJson = vi.fn().mockResolvedValue(tooLong);

		const answer = fetch_json_with_429_retry({ fetchJson } as unknown as BonoboClient, "/api/v1/files/list", {}, null);
		await vi.advanceTimersByTimeAsync(61_000);

		expect(fetchJson).toHaveBeenCalledTimes(1);
		expect(await answer).toEqual(tooLong);
	});
});
