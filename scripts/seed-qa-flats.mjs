#!/usr/bin/env node
// Writes fake flat files to a Bonobo Senate workspace, for testing this plugin by hand.
//
// The flats come from src/fixtures/flats.ts. They are made up: never point this script at real
// listing data. Each saved file costs at least 1 cent, so the script sends `skipIfUnchanged` and a
// second run writes nothing.
//
// Usage (Node 24 or newer, which can import the .ts fixture file directly):
//   T3_API_ORIGIN=<api origin> T3_API_KEY=<personal key> node scripts/seed-qa-flats.mjs [--folder /qa-flats] [--dry-run]
//
// The key needs the `files:write` scope. Photos need a plan that allows uploads. When the upload
// is refused, the script says so and keeps the text files.

import process from "node:process";
import { crc32, deflateSync } from "node:zlib";
import { fixture_flat_path, fixture_flat_text, fixture_flats } from "../src/fixtures/flats.ts";

const WRITE_BATCH = 20;
const FLATS_WITH_PHOTOS = 3;

function fail(message) {
	console.error(`seed-qa-flats: ${message}`);
	process.exit(1);
}

function read_args() {
	const args = process.argv.slice(2);
	let folder = "/qa-flats";
	let dryRun = false;

	for (let index = 0; index < args.length; index += 1) {
		if (args[index] === "--dry-run") {
			dryRun = true;
		} else if (args[index] === "--folder" && args[index + 1] !== undefined) {
			folder = args[index + 1];
			index += 1;
		} else {
			fail(`Unknown argument "${args[index]}"`);
		}
	}
	if (!/^\/[a-z0-9][a-z0-9/-]*$/u.test(folder)) {
		fail(`The folder must look like /qa-flats (lowercase letters, digits and dashes). Got "${folder}"`);
	}

	return { folder, dryRun };
}

function png_chunk(type, data) {
	const body = Buffer.concat([Buffer.from(type, "latin1"), data]);
	const length = Buffer.alloc(4);
	length.writeUInt32BE(data.length);
	const checksum = Buffer.alloc(4);
	checksum.writeUInt32BE(crc32(body));
	return Buffer.concat([length, body, checksum]);
}

// A 16x16 PNG in one flat color. It is small, so an upload costs almost no storage.
function tiny_png(red, green, blue) {
	const size = 16;
	const header = Buffer.alloc(13);
	header.writeUInt32BE(size, 0);
	header.writeUInt32BE(size, 4);
	// 8 bits per channel, RGB, default compression, default filter, no interlace.
	header.set([8, 2, 0, 0, 0], 8);

	// Each row starts with one filter byte (0 = none), then 3 bytes per pixel.
	const row = Buffer.concat([Buffer.from([0]), Buffer.alloc(size * 3, Buffer.from([red, green, blue]))]);
	const pixels = Buffer.concat(Array.from({ length: size }, () => row));

	return Buffer.concat([
		Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
		png_chunk("IHDR", header),
		png_chunk("IDAT", deflateSync(pixels)),
		png_chunk("IEND", Buffer.alloc(0)),
	]);
}

const { folder, dryRun } = read_args();
const flats = fixture_flats(20);
const text_files = flats.map((flat) => ({
	path: fixture_flat_path(folder, flat),
	content: fixture_flat_text(flat),
	overwrite: true,
}));
const photo_files = flats
	.filter((flat) => flat.ideal)
	.slice(0, FLATS_WITH_PHOTOS)
	.flatMap((flat, flatIndex) =>
		[1, 2].map((number) => ({
			path: `${fixture_flat_path(folder, flat).replace(/\.md$/u, "")}/${number}.png`,
			bytes: tiny_png(60 + flatIndex * 60, 90 + number * 50, 160),
		})),
	);

if (dryRun) {
	for (const file of text_files) {
		console.log(`would write ${file.path} (${Buffer.byteLength(file.content)} bytes)`);
	}
	for (const file of photo_files) {
		console.log(`would upload ${file.path} (${file.bytes.length} bytes)`);
	}
	process.exit(0);
}

const origin = process.env.T3_API_ORIGIN;
const key = process.env.T3_API_KEY;
if (!origin || !key) {
	fail("Set T3_API_ORIGIN and T3_API_KEY first. The key is never printed.");
}

async function call(route, body) {
	const response = await fetch(`${origin}${route}`, {
		method: "POST",
		headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
		body: JSON.stringify(body),
		redirect: "error",
	});
	const answer = await response.json().catch(() => null);
	return { status: response.status, body: answer };
}

const made = await call("/api/v1/files/mkdir", { paths: [folder] });
if (made.status !== 200) {
	fail(`mkdir ${folder} answered ${made.status}: ${made.body?.message ?? "no message"}`);
}

let written = 0;
let failed = 0;
for (let start = 0; start < text_files.length; start += WRITE_BATCH) {
	const answer = await call("/api/v1/files/write-many", {
		files: text_files.slice(start, start + WRITE_BATCH),
		skipIfUnchanged: true,
	});
	if (answer.status !== 200) {
		fail(`write-many answered ${answer.status}: ${answer.body?.message ?? "no message"}`);
	}

	written += answer.body.written.length;
	failed += answer.body.errors.length;
	for (const error of answer.body.errors) {
		console.error(`seed-qa-flats: ${error.path}: ${error.message}`);
	}
}
console.log(`seed-qa-flats: ${written} flat files saved or already the same, ${failed} failed`);

const targets = await call("/api/v1/files/upload-urls", {
	files: photo_files.map((file) => ({ path: file.path, contentType: "image/png", size: file.bytes.length })),
	overwrite: true,
});
if (targets.status !== 200) {
	// Uploads need a plan that allows them. The flats still work without photos.
	console.log(`seed-qa-flats: no photos uploaded (${targets.status}: ${targets.body?.message ?? "no message"})`);
} else {
	let uploaded = 0;
	for (const [index, target] of targets.body.files.entries()) {
		// Send exactly the returned headers. The API key never goes to the upload address.
		const put = await fetch(target.uploadUrl, {
			method: "PUT",
			headers: target.headers,
			body: photo_files[index].bytes,
		});
		if (put.ok) {
			uploaded += 1;
		} else {
			console.error(`seed-qa-flats: upload of ${target.path} answered ${put.status}`);
		}
	}
	console.log(`seed-qa-flats: ${uploaded} of ${photo_files.length} photos uploaded`);
}

if (failed > 0) {
	process.exit(1);
}
