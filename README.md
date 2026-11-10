# Fox Group — Wagon Fitters Handbook (Mobile)

Mobile-friendly web app wrapping the Fox Group Wagon Fitters Handbook (FG1.0, January 2025).

- 41 risk assessments (WF001–WF041, sections 1–41)
- 8 Safe Systems of Work (sections 42–49, pages 120–172) bound into `assets/handbook.pdf`, also available as standalone PDFs in `assets/ssow/`
- Draft sections (Nov 2026, pending review): contents supplement p.173, WF042 Welding Fume and LEV (section 50, p.174–177, `assets/ra/WF042.pdf`), SSoW-070 COSHH (section 51, p.178–181), SSoW-071 Isolation and Stored Energy (section 52, p.182–186). Not yet included in the compliance register wording.
- Paper compliance register pages removed from the PDF; signing is done through the in-app compliance register
- Quick jump tiles for Emergency Response, First Aid, Spill Response and PPE
- PDF.js reader that renders each section at phone width
- Progressive Web App: works offline, "Add to Home Screen"

## Publish

This repository is designed to be served as-is via GitHub Pages (`main` branch, root folder). The site is a static HTML/CSS/JS bundle — no build step.

## Updating the handbook

Replace `assets/handbook.pdf` with the new version and push. Section page numbers live in `sections.js`.

## Adding a Safe System of Work

Copy the PDF to `assets/ssow/SSoW-NNN.pdf`, rebuild `assets/handbook.pdf` with it appended and the contents page updated, add an entry to `SSOW_SECTIONS` in `sections.js` (start page, page count, download, related WF refs, tags), add the file to `CORE` in `sw.js` and bump the cache name.
