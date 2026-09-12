# Camp Hearne — Self-Guided Trail Map

Standalone interactive trail map (Leaflet + satellite imagery) for the Camp Hearne
WWII Historic Site. Hosted on GitHub Pages, intended to be served from a subdomain
of camphearne.com (e.g. trail.camphearne.com).

- 22 lettered stops (A–V) with exact GPS coordinates, sector, interpretive narrative,
  and a historic photo — all sourced from the museum's Stops Table
- Hover a marker for its name; tap/click for the full story + photo + "read more" link
- Traced 1.3-mile trail line + "locate me" for walking the site
- Free tiles (Esri World Imagery / OpenStreetMap) — no API key or billing

Data lives in `stops-data.js`; photos in `assets/stops/`. The trail *line* is an
approximation (letter order) pending an exact KML/GPX; every *pin* is exact.

Prepared by Arrowpoint Digital.
