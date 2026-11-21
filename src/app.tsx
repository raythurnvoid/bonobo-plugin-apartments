import type { BonoboClient } from "bonobo-plugin-sdk/frontend";
import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { describe_page, type FlatMessages, type PageContent } from "./agent-context";
import { flat_messages_path, list_flat_photos, read_text_file, type FlatPhoto } from "./flat-details";
import { create_flat_list } from "./flat-list";
import { parse_flat_file, safe_ad_url, type FlatFacts, type FlatKey } from "./frontmatter";
import { create_media_url_manager, type MediaUrlManager } from "./media-urls";
import { get_error_message } from "./retry";
import {
	FLAT_STATUSES,
	VIEWS,
	row_field,
	row_number,
	type FlatRow,
	type FlatStatus,
	type ViewChoice,
	type ViewId,
} from "./views";

const DEFAULT_FOLDER = "/flats";

/**
 * All plugins share one frame origin, so they share `localStorage` too. Keep the key under this
 * plugin's name, and store only the folder path there, never file data.
 */
const FOLDER_STORAGE_KEY = "bonobo-plugin-apartments:folder";

const number_format = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });
const date_format = new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" });

/**
 * Clean a typed folder path, or return `null` when it is not a folder path.
 */
export function normalize_folder_path(value: string) {
	const trimmed = value.trim();
	if (!trimmed.startsWith("/") || trimmed.length > 1024) {
		return null;
	}
	if (trimmed === "/") {
		return "/";
	}

	const path = trimmed.endsWith("/") ? trimmed.slice(0, -1) : trimmed;
	const names = path.slice(1).split("/");
	return names.every((name) => name !== "" && name !== "." && name !== "..") ? path : null;
}

function read_saved_folder() {
	// Storage can be blocked in a sandboxed frame. Then the default folder is used.
	try {
		return normalize_folder_path(window.localStorage.getItem(FOLDER_STORAGE_KEY) ?? "") ?? DEFAULT_FOLDER;
	} catch {
		return DEFAULT_FOLDER;
	}
}

function save_folder(folder: string) {
	try {
		window.localStorage.setItem(FOLDER_STORAGE_KEY, folder);
	} catch {
		// Nothing to do: the folder still works for this visit.
	}
}

function format_number(value: number | null, unit: string) {
	return value === null ? "—" : `${number_format.format(value)} ${unit}`;
}

function format_rent(row: FlatRow) {
	const rent = row_number(row, "frontmatter.rentWarm");
	if (rent === null) {
		return "—";
	}

	// `~` marks a warm rent the writer estimated from the cold rent.
	const estimated = row_field(row, "frontmatter.rentWarmEstimated") === true;
	return `${estimated ? "~" : ""}${number_format.format(rent)} €`;
}

function format_date(value: unknown) {
	if (typeof value !== "string" || value === "") {
		return "—";
	}

	const time = Date.parse(value);
	return Number.isNaN(time) ? value : date_format.format(time);
}

function view_label(choice: ViewChoice) {
	const label = VIEWS.find((option) => option.id === choice.view)?.label ?? choice.view;
	if (choice.view === "status") {
		return `${label}: ${choice.status}`;
	}
	if (choice.view === "cheapest" && choice.maxRent !== null) {
		return `${label}, up to ${choice.maxRent} €`;
	}
	return label;
}

function row_title(row: FlatRow) {
	const title = row_field(row, "frontmatter.title");
	return typeof title === "string" && title !== "" ? title : row.name;
}

export function App(props: { client: BonoboClient }) {
	const media = useMemo(() => create_media_url_manager(props.client), [props.client]);
	const [folder, setFolder] = useState(read_saved_folder);
	const [folderDraft, setFolderDraft] = useState(folder);
	const [folderError, setFolderError] = useState<string | null>(null);
	const [view, setView] = useState<ViewId>("newest");
	const [status, setStatus] = useState<FlatStatus>("new");
	const [maxRent, setMaxRent] = useState<number | null>(null);
	const [maxRentDraft, setMaxRentDraft] = useState("");
	const [openRow, setOpenRow] = useState<FlatRow | null>(null);
	// Count the Show clicks. Show must reload the list even when nothing changed, and equal state
	// alone does not render again.
	const [showCount, setShowCount] = useState(0);
	const [viewingsOpen, setViewingsOpen] = useState(false);
	// What the page shows, for the chat agent. Keep it in a ref: the host reads it right before each
	// chat message, and updating it must not render the page again.
	const pageRef = useRef<PageContent>({ folder, view: "", rows: [], openFlat: null, viewings: null });

	const choice: ViewChoice = useMemo(() => ({ view, status, maxRent }), [view, status, maxRent]);

	const handle_submit = (event: FormEvent) => {
		event.preventDefault();

		const nextFolder = normalize_folder_path(folderDraft);
		if (nextFolder === null) {
			setFolderError("Type a folder path that starts with /, for example /flats.");
			return;
		}

		const nextMaxRent = maxRentDraft.trim() === "" ? null : Number(maxRentDraft);
		setFolderError(null);
		setFolder(nextFolder);
		setFolderDraft(nextFolder);
		setMaxRent(nextMaxRent !== null && Number.isFinite(nextMaxRent) && nextMaxRent >= 0 ? nextMaxRent : null);
		setShowCount((value) => value + 1);
		save_folder(nextFolder);
	};

	const handle_close_details = useCallback(() => {
		const nodeId = openRow?.nodeId;
		setOpenRow(null);
		// Put the keyboard focus back on the row that opened the details.
		if (nodeId !== undefined) {
			setTimeout(() => document.getElementById(`flat-row-${nodeId}`)?.focus(), 0);
		}
	}, [openRow]);

	const handle_rows_loaded = useCallback((rows: FlatRow[]) => {
		pageRef.current.rows = rows;
	}, []);

	const handle_flat_shown = useCallback((flat: PageContent["openFlat"]) => {
		pageRef.current.openFlat = flat;
	}, []);

	const handle_viewings_shown = useCallback((text: string | null) => {
		pageRef.current.viewings = text;
	}, []);

	// The list shows the applied folder and view, not the drafts in the form.
	useEffect(() => {
		pageRef.current.folder = folder;
		pageRef.current.view = view_label(choice);
	}, [folder, choice]);

	// Send what the page shows with each chat message, so the agent can answer about "this flat".
	useEffect(() => props.client.agent.setContextProvider(() => describe_page(pageRef.current)), [props.client]);

	return (
		<div className="flats">
			{/* Keep the table mounted while the details show, so Back returns to the same rows. */}
			<div hidden={openRow !== null}>
				<header className="flats-header">
					<h1>Flats</h1>
					<button
						className="button"
						type="button"
						aria-expanded={viewingsOpen}
						onClick={() => setViewingsOpen((value) => !value)}
					>
						{viewingsOpen ? "Hide viewings" : "Viewings"}
					</button>
				</header>
				{viewingsOpen ? (
					<ViewingsPanel client={props.client} folder={folder} onViewingsShown={handle_viewings_shown} />
				) : null}
				<form className="flats-controls" onSubmit={handle_submit}>
					<label className="field">
						<span className="field-label">Folder</span>
						<input
							className="input"
							type="text"
							value={folderDraft}
							spellCheck={false}
							autoComplete="off"
							aria-invalid={folderError !== null}
							onInput={(event) => setFolderDraft(event.currentTarget.value)}
						/>
					</label>
					<label className="field">
						<span className="field-label">View</span>
						<select className="input" value={view} onChange={(event) => setView(event.currentTarget.value as ViewId)}>
							{VIEWS.map((option) => (
								<option key={option.id} value={option.id}>
									{option.label}
								</option>
							))}
						</select>
					</label>
					{view === "status" ? (
						<label className="field">
							<span className="field-label">Status</span>
							<select
								className="input"
								value={status}
								onChange={(event) => setStatus(event.currentTarget.value as FlatStatus)}
							>
								{FLAT_STATUSES.map((option) => (
									<option key={option} value={option}>
										{option}
									</option>
								))}
							</select>
						</label>
					) : null}
					{view === "cheapest" ? (
						<label className="field">
							<span className="field-label">Max warm rent (€)</span>
							<input
								className="input"
								type="number"
								min={0}
								inputMode="numeric"
								value={maxRentDraft}
								onInput={(event) => setMaxRentDraft(event.currentTarget.value)}
							/>
						</label>
					) : null}
					<button className="button" type="submit">
						Show
					</button>
				</form>
				{folderError !== null ? (
					<div className="flats-status is-error" role="alert">
						{folderError}
					</div>
				) : null}
				{/* A new folder, view or Show click starts a new list: the key drops the old rows and the old cursor. */}
				<FlatTable
					key={JSON.stringify([folder, choice, showCount])}
					client={props.client}
					folder={folder}
					choice={choice}
					onOpen={setOpenRow}
					onRowsLoaded={handle_rows_loaded}
				/>
			</div>
			{openRow !== null ? (
				<FlatDetails
					key={openRow.nodeId}
					client={props.client}
					media={media}
					row={openRow}
					onFlatShown={handle_flat_shown}
					onClose={handle_close_details}
				/>
			) : null}
		</div>
	);
}

function FlatTable(props: {
	client: BonoboClient;
	folder: string;
	choice: ViewChoice;
	onOpen: (row: FlatRow) => void;
	onRowsLoaded: (rows: FlatRow[]) => void;
}) {
	// Aborts when the table closes (a new folder or view mounts a new table), so the old paging and
	// its 429 waits send no more requests.
	const [controller] = useState(() => new AbortController());
	const list = useMemo(
		() => create_flat_list(props.client, props.folder, props.choice, controller.signal),
		[props.client, props.folder, props.choice, controller],
	);
	const [rows, setRows] = useState<FlatRow[]>([]);
	const [hasMore, setHasMore] = useState(true);
	// The first page starts loading right after the first render. Start as loading, so "Load more"
	// does not flash before it.
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [notice, setNotice] = useState<string | null>(null);
	// Allow one load at a time. A ref keeps the check exact between renders.
	const loadingRef = useRef(false);

	const load_more = useCallback(async () => {
		if (loadingRef.current) {
			return;
		}
		loadingRef.current = true;
		setLoading(true);
		setError(null);
		setNotice(null);

		const result = await list.load_next();
		if (controller.signal.aborted) {
			return;
		}
		// After a restart the list holds only the rows from the first page again.
		if (result.restarted) {
			setRows(result.rows);
		} else if (result.rows.length > 0) {
			setRows((previous) => [...previous, ...result.rows]);
		}
		setError(result.errorMessage);
		setHasMore(list.has_more());
		// A click can use all its requests on short pages and find no rows. Say so, or the click
		// looks like it did nothing.
		if (result.restarted) {
			setNotice("The list changed, so it started again.");
		} else if (result.rows.length === 0 && result.errorMessage === null && list.has_more()) {
			setNotice("No flats found in these pages yet. Load more keeps looking.");
		}

		loadingRef.current = false;
		setLoading(false);
	}, [list, controller]);

	useEffect(() => {
		void load_more();
	}, [load_more]);

	useEffect(() => () => controller.abort(), [controller]);

	useEffect(() => {
		props.onRowsLoaded(rows);
	}, [props.onRowsLoaded, rows]);

	return (
		<div className="flats-list">
			{rows.length > 0 ? (
				// The table is wider than a phone screen. The wrapper scrolls sideways, and it can take
				// focus so the keyboard can scroll it too.
				<div className="flats-table-wrap" role="region" aria-label="Flats table" tabIndex={0}>
					<table className="flats-table">
						<thead>
							<tr>
								<th scope="col">Title</th>
								<th scope="col">Kind</th>
								<th scope="col">Warm rent</th>
								<th scope="col">Size</th>
								<th scope="col">Rooms</th>
								<th scope="col">Bike</th>
								<th scope="col">Walk</th>
								<th scope="col">Posted</th>
								<th scope="col">Found</th>
								<th scope="col">Status</th>
								<th scope="col">Ideal</th>
							</tr>
						</thead>
						<tbody>
							{rows.map((row) => (
								<tr key={row.nodeId}>
									<th scope="row">
										<button
											id={`flat-row-${row.nodeId}`}
											className="flats-open"
											type="button"
											onClick={() => props.onOpen(row)}
										>
											{row_title(row)}
										</button>
									</th>
									<td>{String(row_field(row, "frontmatter.kind") ?? "—")}</td>
									<td>{format_rent(row)}</td>
									<td>{format_number(row_number(row, "frontmatter.sizeM2"), "m²")}</td>
									<td>{row_number(row, "frontmatter.rooms") ?? "—"}</td>
									<td>{format_number(row_number(row, "frontmatter.bikeMin"), "min")}</td>
									<td>{format_number(row_number(row, "frontmatter.walkMin"), "min")}</td>
									<td>{format_date(row_field(row, "frontmatter.postedAt"))}</td>
									<td>{format_date(row_field(row, "frontmatter.firstSeenAt"))}</td>
									{/* `String` shows a `true` or `false` status as text. JSX shows a boolean as nothing. */}
									<td>{String(row_field(row, "frontmatter.status") ?? "—")}</td>
									<td>{row_field(row, "frontmatter.ideal") === true ? "Yes" : "No"}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			) : null}
			{loading ? (
				<div className="flats-status" role="status" aria-live="polite">
					Loading…
				</div>
			) : null}
			{notice !== null ? (
				<div className="flats-status" role="status" aria-live="polite">
					{notice}
				</div>
			) : null}
			{error !== null ? (
				<div className="flats-status is-error" role="alert">
					<span>{error}</span>
					<button className="button" type="button" onClick={() => void load_more()}>
						Retry
					</button>
				</div>
			) : null}
			{!loading && error === null && !hasMore && rows.length === 0 ? (
				<div className="flats-status">No flats in this view.</div>
			) : null}
			{hasMore && !loading && error === null ? (
				<div className="flats-more">
					<button className="button" type="button" onClick={() => void load_more()}>
						Load more
					</button>
				</div>
			) : null}
			{rows.length > 0 ? (
				<div className="flats-count">
					{rows.length} flat{rows.length === 1 ? "" : "s"}
				</div>
			) : null}
		</div>
	);
}

/** The facts the details show, in this order. A flat file without a key skips that line. */
const FACT_LINES: Array<{ key: FlatKey; label: string; unit?: string }> = [
	{ key: "kind", label: "Kind" },
	{ key: "status", label: "Status" },
	{ key: "ideal", label: "Ideal" },
	{ key: "rentWarm", label: "Warm rent", unit: "€" },
	{ key: "rentWarmEstimated", label: "Warm rent is estimated" },
	{ key: "rentCold", label: "Cold rent", unit: "€" },
	{ key: "sizeM2", label: "Size", unit: "m²" },
	{ key: "rooms", label: "Rooms" },
	{ key: "floor", label: "Floor" },
	{ key: "address", label: "Address" },
	{ key: "postcode", label: "Postcode" },
	{ key: "availableFrom", label: "Available from" },
	{ key: "availableTo", label: "Available to" },
	{ key: "stayMonths", label: "Stay", unit: "months" },
	{ key: "bikeMin", label: "By bike", unit: "min" },
	{ key: "walkMin", label: "On foot", unit: "min" },
	{ key: "distanceKm", label: "Distance", unit: "km" },
	{ key: "postedAt", label: "Posted" },
	{ key: "firstSeenAt", label: "First seen" },
	{ key: "flags", label: "Flags" },
	{ key: "idealMisses", label: "Not ideal because" },
	{ key: "source", label: "Source" },
];

function format_fact(line: (typeof FACT_LINES)[number], facts: FlatFacts) {
	const value = facts.get(line.key);
	if (value === undefined) {
		return null;
	}
	if (typeof value === "boolean") {
		return value ? "Yes" : "No";
	}
	if (Array.isArray(value)) {
		return value.length > 0 ? value.join(", ") : null;
	}
	if (typeof value === "number") {
		return format_number(value, line.unit ?? "").trim();
	}
	if (line.key === "postedAt" || line.key === "firstSeenAt") {
		return format_date(value);
	}

	return value;
}

type FlatDetails_State =
	| { step: "loading" }
	| { step: "error"; message: string }
	| { step: "ready"; facts: FlatFacts; description: string; isCut: boolean };

function FlatDetails(props: {
	client: BonoboClient;
	media: MediaUrlManager;
	row: FlatRow;
	onFlatShown: (flat: PageContent["openFlat"]) => void;
	onClose: () => void;
}) {
	const { client, row, onFlatShown } = props;
	const [state, setState] = useState<FlatDetails_State>({ step: "loading" });
	const [photos, setPhotos] = useState<FlatPhoto[]>([]);
	const [photosError, setPhotosError] = useState<string | null>(null);
	const [messages, setMessages] = useState<FlatMessages>({ step: "loading" });
	const [copyNote, setCopyNote] = useState<string | null>(null);
	const [attempt, setAttempt] = useState(0);
	const backRef = useRef<HTMLButtonElement | null>(null);

	useEffect(() => {
		backRef.current?.focus();
	}, []);

	useEffect(() => {
		// When the details close or a retry starts, stop sending requests and ignore late answers.
		const controller = new AbortController();
		setState({ step: "loading" });
		setPhotosError(null);
		setMessages({ step: "loading" });

		read_text_file(client, row.path, controller.signal).then(
			(result) => {
				if (controller.signal.aborted) {
					return;
				}
				// The radar deletes a flat's file when the ad is gone or older than a week.
				if (result === null) {
					setState({ step: "error", message: `${row.path} is gone. The radar may have removed this flat.` });
					return;
				}
				setState({ step: "ready", ...parse_flat_file(result.text), isCut: result.isCut });
			},
			(error: unknown) => {
				if (!controller.signal.aborted) {
					setState({ step: "error", message: get_error_message(error) });
				}
			},
		);
		// The photos load on their own. A failed photo list must not hide the facts.
		list_flat_photos(client, row.path, controller.signal).then(
			(items) => {
				if (!controller.signal.aborted) {
					setPhotos(items);
				}
			},
			(error: unknown) => {
				if (!controller.signal.aborted) {
					setPhotosError(get_error_message(error));
				}
			},
		);

		// The messages load on their own too. A flat the user never wrote to has no messages file.
		const messagesPath = flat_messages_path(row.path);
		if (messagesPath === null) {
			setMessages({ step: "none" });
		} else {
			read_text_file(client, messagesPath, controller.signal).then(
				(result) => {
					if (!controller.signal.aborted) {
						setMessages(result === null ? { step: "none" } : { step: "ready", text: result.text });
					}
				},
				(error: unknown) => {
					if (!controller.signal.aborted) {
						setMessages({ step: "error", message: get_error_message(error) });
					}
				},
			);
		}

		return () => controller.abort();
	}, [client, row.path, attempt]);

	useEffect(() => {
		onFlatShown({
			path: row.path,
			title: row_title(row),
			facts: state.step === "ready" ? state.facts : null,
			description: state.step === "ready" ? state.description : "",
			messages,
		});
	}, [onFlatShown, row, state, messages]);

	// The agent sees the flat only while its details are open.
	useEffect(() => () => onFlatShown(null), [onFlatShown]);

	const adUrl = state.step === "ready" ? safe_ad_url(state.facts.get("url")) : null;

	const handle_copy = () => {
		if (adUrl === null) {
			return;
		}

		// The frame may not be allowed to write to the clipboard. Then the person selects the text.
		Promise.resolve()
			.then(() => navigator.clipboard.writeText(adUrl))
			.then(
				() => setCopyNote("Copied."),
				() => setCopyNote("Copy did not work. Select the address and copy it."),
			);
	};

	return (
		<article className="flat" aria-labelledby="flat-title">
			<div className="flat-topbar">
				<button ref={backRef} className="button" type="button" onClick={props.onClose}>
					← Back to flats
				</button>
			</div>
			<h1 id="flat-title">{row_title(row)}</h1>
			<p className="flat-path">{row.path}</p>
			{state.step === "loading" ? (
				<div className="flats-status" role="status" aria-live="polite">
					Loading…
				</div>
			) : null}
			{state.step === "error" ? (
				<div className="flats-status is-error" role="alert">
					<span>{state.message}</span>
					<button className="button" type="button" onClick={() => setAttempt((value) => value + 1)}>
						Retry
					</button>
				</div>
			) : null}
			{state.step === "ready" ? (
				<>
					<dl className="flat-facts">
						{FACT_LINES.map((line) => {
							const text = format_fact(line, state.facts);
							return text === null ? null : (
								<div key={line.key} className="flat-fact">
									<dt>{line.label}</dt>
									<dd>{text}</dd>
								</div>
							);
						})}
					</dl>
					{adUrl !== null ? (
						<div className="flat-url">
							<h2>Ad address</h2>
							<p className="flat-url-text">{adUrl}</p>
							<button className="button" type="button" onClick={handle_copy}>
								Copy address
							</button>
							<span className="flat-url-note" role="status" aria-live="polite">
								{copyNote}
							</span>
						</div>
					) : null}
					{state.description !== "" ? (
						<div className="flat-description">
							<h2>Description</h2>
							{/* Plain text only. The file body is never rendered as HTML. */}
							<p>{state.description}</p>
							{state.isCut ? <p>The file is longer than 2 MiB, so the description was cut.</p> : null}
						</div>
					) : null}
				</>
			) : null}
			{photos.length > 0 ? (
				<div className="flat-photos">
					<h2>Photos</h2>
					<ul>
						{photos.map((photo) => (
							<li key={photo.nodeId}>
								<FlatPhotoTile media={props.media} photo={photo} />
							</li>
						))}
					</ul>
				</div>
			) : null}
			{photosError !== null ? <p className="flat-note">Photos could not load: {photosError}</p> : null}
			{messages.step === "ready" ? (
				<div className="flat-messages">
					<h2>Messages</h2>
					{/* Plain text only, like the description. */}
					<p>{messages.text}</p>
				</div>
			) : null}
			{messages.step === "error" ? <p className="flat-note">Messages could not load: {messages.message}</p> : null}
		</article>
	);
}

function FlatPhotoTile(props: { media: MediaUrlManager; photo: FlatPhoto }) {
	const { media, photo } = props;
	const [url, setUrl] = useState<string | null>(null);
	const [failed, setFailed] = useState(false);
	// A signed address can end while the page is open. Ask for a new one once, then stop.
	const renewedRef = useRef(false);

	const request_url = useCallback(
		(fresh: boolean) => {
			(fresh ? media.get_fresh_url(photo.nodeId) : media.get_url(photo.nodeId)).then(
				(mediaUrl) => setUrl(mediaUrl.url),
				() => setFailed(true),
			);
		},
		[media, photo.nodeId],
	);

	useEffect(() => {
		request_url(false);
	}, [request_url]);

	const handle_error = () => {
		if (renewedRef.current) {
			setFailed(true);
			return;
		}
		renewedRef.current = true;
		request_url(true);
	};

	if (failed) {
		return <span className="flat-photo is-failed">{photo.name} could not load.</span>;
	}

	return url === null ? (
		<span className="flat-photo is-loading" role="status">
			Loading {photo.name}…
		</span>
	) : (
		<img className="flat-photo" src={url} alt={photo.name} loading="lazy" onError={handle_error} />
	);
}

type ViewingsPanel_State =
	{ step: "loading" } | { step: "error"; message: string } | { step: "ready"; text: string | null };

function ViewingsPanel(props: {
	client: BonoboClient;
	folder: string;
	onViewingsShown: (text: string | null) => void;
}) {
	const { client, folder, onViewingsShown } = props;
	const [state, setState] = useState<ViewingsPanel_State>({ step: "loading" });
	const [attempt, setAttempt] = useState(0);

	useEffect(() => {
		// A new folder or a retry drops the old text, so the panel never shows another folder's viewings.
		const controller = new AbortController();
		setState({ step: "loading" });

		read_text_file(client, `${folder === "/" ? "" : folder}/viewings.md`, controller.signal).then(
			(result) => {
				if (!controller.signal.aborted) {
					setState({ step: "ready", text: result?.text ?? null });
				}
			},
			(error: unknown) => {
				if (!controller.signal.aborted) {
					setState({ step: "error", message: get_error_message(error) });
				}
			},
		);

		return () => controller.abort();
	}, [client, folder, attempt]);

	// Tell the agent what the open panel says, also when it has no viewings to show.
	useEffect(() => {
		if (state.step === "loading") {
			onViewingsShown("Still loading.");
		} else if (state.step === "error") {
			onViewingsShown(`Could not load: ${state.message}`);
		} else {
			onViewingsShown(state.text ?? "No viewings yet (there is no viewings.md in this folder).");
		}
	}, [onViewingsShown, state]);

	// The agent sees the viewings only while the panel is open.
	useEffect(() => () => onViewingsShown(null), [onViewingsShown]);

	return (
		<section className="flats-viewings" aria-labelledby="flats-viewings-title">
			<h2 id="flats-viewings-title">Viewings</h2>
			{state.step === "loading" ? (
				<div className="flats-status" role="status" aria-live="polite">
					Loading…
				</div>
			) : null}
			{state.step === "error" ? (
				<div className="flats-status is-error" role="alert">
					<span>{state.message}</span>
					<button className="button" type="button" onClick={() => setAttempt((value) => value + 1)}>
						Retry
					</button>
				</div>
			) : null}
			{state.step === "ready" && state.text === null ? (
				<div className="flats-status">No viewings yet. The radar writes viewings.md into this folder.</div>
			) : null}
			{/* Plain text only. The file is never rendered as HTML. */}
			{state.step === "ready" && state.text !== null ? <p className="flats-viewings-text">{state.text}</p> : null}
		</section>
	);
}
