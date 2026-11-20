import { cleanup, fireEvent, render, screen } from "@testing-library/preact";
import type { BonoboClient } from "bonobo-plugin-sdk/frontend";
import { afterEach, expect, test, vi } from "vitest";
import { App } from "./app";
import { fixture_flat_text, fixture_flats } from "./fixtures/flats";
import { fixture_row } from "./fixtures/rows";
import { PERMISSION_MESSAGE } from "./flat-list";

afterEach(cleanup);

test("shows the flats of a folder, opens one, and names the fix when the folder is not chosen", async () => {
	const flats = fixture_flats(3);
	const fetchJson = vi.fn(async (path: string, body: { path?: string }) => {
		if (path === "/api/v1/files/list") {
			return { status: 404, body: { message: "Not found", errorCode: "not_found" } };
		}
		if (body.path !== "/flats") {
			return { status: 403, body: { message: `Permission denied: ${body.path}`, errorCode: "permission_denied" } };
		}
		return { status: 200, body: { items: flats.map(fixture_row), cursor: null, isDone: true } };
	});
	const fetchRaw = vi.fn(async () => new Response(fixture_flat_text(flats[0])));
	render(<App client={{ fetchJson, fetchRaw } as unknown as BonoboClient} />);

	const open = await screen.findByRole("button", { name: flats[0].title });
	expect(screen.getAllByRole("row")).toHaveLength(flats.length + 1);
	expect(screen.queryByRole("button", { name: "Load more" })).toBeNull();

	fireEvent.click(open);
	expect(await screen.findByText(flats[0].address)).toBeTruthy();
	// The ad address is text with a Copy button, never a link.
	expect(screen.getByText(flats[0].url).closest("a")).toBeNull();
	expect(screen.queryByRole("link")).toBeNull();

	fireEvent.click(screen.getByRole("button", { name: "← Back to flats" }));
	fireEvent.input(screen.getByLabelText("Folder"), { target: { value: "/other" } });
	fireEvent.click(screen.getByRole("button", { name: "Show" }));

	expect((await screen.findByRole("alert")).textContent).toContain(PERMISSION_MESSAGE);
});

test("starts the list again from the first page when Show is clicked with the same inputs", async () => {
	const flats = fixture_flats(2);
	const fetchJson = vi.fn(async (_path: string, _body: { cursor?: string | null }) => ({
		status: 200,
		body: { items: flats.map(fixture_row), cursor: null, isDone: true },
	}));
	render(<App client={{ fetchJson, fetchRaw: vi.fn() } as unknown as BonoboClient} />);

	await screen.findByRole("button", { name: flats[0].title });
	fireEvent.click(screen.getByRole("button", { name: "Show" }));
	await screen.findByRole("button", { name: flats[0].title });
	const callsBefore = fetchJson.mock.calls.length;

	fireEvent.click(screen.getByRole("button", { name: "Show" }));
	await screen.findByRole("button", { name: flats[0].title });

	expect(fetchJson, "Show with the same inputs must send a new first-page request").toHaveBeenCalledTimes(
		callsBefore + 1,
	);
	expect(fetchJson.mock.calls[callsBefore][1].cursor).toBeNull();
});
