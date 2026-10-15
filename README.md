# autoopkoper.com - auto opkoper België

Static site (HTML/CSS/JS, no build step). Pages: `/`, `/bedankt/`, `/privacy/`.

## Before going live
1. `bedankt/index.html`: add the Google Ads conversion label in the marked placeholder and uncomment it.
2. The first FormSubmit submission from the new domain may send an activation e-mail to faster24eu@gmail.com; confirm it.
3. Test a submission with 1-4 photos (FormSubmit limits attachments to about 5 MB in total).
4. Check the FAQ payment answer (instant transfer / cash up to the € 3.000 legal limit) matches how you actually pay.
5. Reviews section is commented out in `index.html`; only enable it with real reviews.
6. GitHub Pages: the `CNAME` file holds autoopkoper.com.

Paths are root-relative (`/styles.css`), so preview with a local server from this folder, e.g. `npx serve .`
