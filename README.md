# autoopkoper.com - auto opkoper België

Static site (HTML/CSS/JS, no build step).

Pages:
- `/` (NL) and `/fr/` (FR homepage, thank-you page `/fr/merci/`)
- `/bestelwagen-verkopen/`, `/auto-verkopen-zonder-keuring/`, `/auto-met-schade-verkopen/`, `/auto-verkopen-hoge-kilometerstand/`, `/auto-verkopen-export/`
- Cities: `/auto-verkopen-antwerpen/`, `-gent/`, `-brussel/`, `-leuven/`, `-limburg/`
- Brands: `/volkswagen-verkopen/`, `/bmw-verkopen/`, `/mercedes-verkopen/`, `/peugeot-verkopen/`
- Guides under `/gids/`: papieren, nummerplaat schrappen, defecte auto, nieuwe keuringsregels, LEZ, verkopen met lening
- `/bedankt/`, `/privacy/`

Landing pages share the homepage layout and form (each sets its own hidden `pagina` field). The keuring and LEZ guides contain dated legal info (last checked 18 Oct 2026); review them when rules change.

## Before going live
1. `bedankt/index.html` and `fr/merci/index.html`: add the Google Ads conversion label in the marked placeholder and uncomment it.
2. The first FormSubmit submission from the new domain may send an activation e-mail to faster24eu@gmail.com; confirm it.
3. Test a submission with 1-4 photos (FormSubmit limits attachments to about 5 MB in total).
4. Check the FAQ payment answer (instant transfer / cash up to the € 3.000 legal limit) matches how you actually pay.
5. Reviews section is commented out in `index.html`; only enable it with real reviews.
6. GitHub Pages: the `CNAME` file holds autoopkoper.com.

Paths are root-relative (`/styles.css`), so preview with a local server from this folder, e.g. `npx serve .`

## Internal links (2026-10-19)
`scripts/link-mentions.pl` turns words that are already in the text (e.g. "zonder keuring", "voor export", "papieren") into links to the matching page; phrases in `scripts/link-mentions.txt`. Rerunnable, never changes the visible text. Before: no page linked another page from its main text (only footer and home links). Search Console had 4 impressions (2026-10-14 to 16), too early for query-based changes; re-check in November.
