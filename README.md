# Apartments plugin

A Bonobo Senate plugin page that shows flat listings saved as files. Each flat is one Markdown file
with frontmatter. The page sorts and filters the flats by their frontmatter fields with
`POST /api/v1/files/query`, so it never loads the whole folder.

Version 0.1.1 is a first draft. It pins SDK 0.28.0, the first SDK that types `files/query`.

## What the person must allow

The plugin needs one capability: `workspace.files.read`. Each person then chooses the flats folder
for this plugin in **My file permissions**. Without that choice the page says "Choose the flats
folder in My file permissions."

A flat file with its own sharing rules (a restricted file) does not show in the list.

## Flat file shape

A writer (for example a script that reads listing sites) saves one file per flat.

- File: `/flats/<source>-<sourceId>.md`
- Photos: `/flats/<source>-<sourceId>/1.jpg`, `2.jpg`, … (a folder with the same name as the file,
  without `.md`). Photos are optional.
- Body: the ad description as plain text.

Frontmatter keys:

| Key                                              | Type                                    | Notes                                                  |
| ------------------------------------------------ | --------------------------------------- | ------------------------------------------------------ |
| `source`, `sourceId`                             | text                                    | where the ad comes from                                |
| `url`                                            | text                                    | the ad address, `http` or `https` only                 |
| `title`                                          | text                                    | shown in the table                                     |
| `kind`                                           | `flat` or `room`                        |                                                        |
| `rentWarm`                                       | number                                  | whole euros                                            |
| `rentWarmEstimated`                              | `true` or `false`                       | the table shows `~` before an estimated rent           |
| `rentCold`                                       | number                                  |                                                        |
| `sizeM2`, `rooms`                                | number                                  |                                                        |
| `address`, `postcode`                            | text                                    |                                                        |
| `lat`, `lon`                                     | number                                  |                                                        |
| `availableFrom`, `availableTo`                   | text                                    | a date                                                 |
| `floor`                                          | `ground`, `upper` or `unclear`          |                                                        |
| `bikeMin`, `walkMin`, `distanceKm`, `stayMonths` | number                                  |                                                        |
| `postedAt`, `firstSeenAt`                        | text                                    | UTC ISO time with milliseconds, always the same format |
| `status`                                         | `new`, `saved`, `contacted` or `hidden` |                                                        |
| `ideal`                                          | `true` or `false`                       |                                                        |
| `flags`, `idealMisses`                           | list of text                            | shown in the details only                              |

Rules for the writer:

- **Numbers the views sort by** (`rentWarm`, `sizeM2`, `bikeMin`, `rooms`, `distanceKm`): write a
  whole number, or a number with at most one decimal place. Never write a negative number. The
  folder query sorts values as text and compares each run of digits by its value. This rule keeps
  that order the same as the number order. `12.5` next to `12.25` is the shape that sorts wrong.
- **Leave out a key that has no value.** Do not write `null`. A flat without `rentWarm` is not in
  the "Cheapest" view, a flat without `postedAt` is not in "Newest", and so on.
- **Use one time format** for `postedAt`, for example `2026-11-03T09:15:00.000Z`. The "Newest" view
  sorts this text.
- **Do not write values that change on every run** (such as "last seen" times). Save a file only
  when its text changed: every save costs at least 1 cent.
- A list field (`flags`) sorts and matches by its first item only.

## Views

Every view is one folder query on one field (`mode: "folder"`).

| View               | Field                  | Query                                                                      |
| ------------------ | ---------------------- | -------------------------------------------------------------------------- |
| Newest             | `frontmatter.postedAt` | `order: "desc"`                                                            |
| Cheapest           | `frontmatter.rentWarm` | `order: "asc"`; an optional max rent stops paging at the first larger rent |
| Biggest            | `frontmatter.sizeM2`   | `order: "desc"`                                                            |
| Shortest bike ride | `frontmatter.bikeMin`  | `order: "asc"`                                                             |
| Ideal              | `frontmatter.ideal`    | `match: { eq: true }`                                                      |
| By status          | `frontmatter.status`   | `match: { eq: "<status>" }`                                                |

The table asks for its columns with `fields`, so one request returns everything a page of rows
shows. "Load more" follows the cursor, 50 rows per request. When the host ends the cursor (for
example after files moved), the list starts again from the first page and says so.

The details of one flat read the file with `files/read` and parse the frontmatter. They read at most
about 2 MiB of a file and say when the description was cut. Only the keys in the table above are
read. The ad address is shown as text with a Copy button, never as a link, because the plugin frame
cannot open new tabs. Photos come from `files/list` on the photo folder and `files/download-urls`.
A file whose name does not end with `.md` has no photo folder, so it shows no photos.

The page keeps one thing in `localStorage`: the folder path, under the key
`bonobo-plugin-apartments:folder`. It stores no file data there.

## Commands

Run every command through Vite Plus when you work inside the Bonobo Senate repository
(`vp env exec pnpm ...`).

```sh
pnpm install
pnpm typecheck
pnpm test:once
pnpm build
```

`pnpm build` writes `dist/frontend` (one HTML, one JS and one CSS file with fixed names), formats
the JS and CSS with Prettier so they stay readable for review, and updates the file hashes in
`bonobo.plugin.json`.

## Test data

`src/fixtures/flats.ts` builds fake flats. Tests use them, and so does the seed script:

```sh
T3_API_ORIGIN=<api origin> T3_API_KEY=<personal key> node scripts/seed-qa-flats.mjs --folder /qa-flats --dry-run
```

Remove `--dry-run` to write 20 fake flat files and a few tiny photos. The key needs `files:write`.
The script creates data that costs money, so read the Bonobo Senate `qa-data` skill first and add
the folder to its catalog. Never use real listing data for tests.

- The folder name must start with `qa-` (the default is `/qa-flats`), so the script never writes to
  a real flats folder.
- `T3_API_ORIGIN` must use `https`. Plain `http` is allowed only for `localhost` and `127.0.0.1`.
- A second run saves no flat file again, because unchanged files are skipped. The photos are
  uploaded again on every run.
