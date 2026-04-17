# Fox Group — Wagon Fitters Handbook (Mobile)

Mobile-friendly web app wrapping the Fox Group Wagon Fitters Handbook (FG1.0, January 2025).

- 42 searchable risk assessments (WF001–WF041 + signature page)
- Quick jump tiles for Emergency Response, First Aid, Spill Response and PPE
- PDF.js reader that renders each section at phone width
- Progressive Web App: works offline, "Add to Home Screen"

## Publish

This repository is designed to be served as-is via GitHub Pages (`main` branch, root folder). The site is a static HTML/CSS/JS bundle — no build step.

## Updating the handbook

Replace `assets/handbook.pdf` with the new version and push. Section page numbers live in `sections.js`.
