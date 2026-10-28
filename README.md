# Windsurfing spots map

A static website that shows the top 10 windsurfing spots for a chosen month and continent.

1. Pick a month from the first dropdown.
2. Pick a continent from the second dropdown.
3. The map shows the 10 windiest spots for that month, numbered 1 to 10 (1 is the best).
4. Click a number (on the map or in the list) to see the average wind speed in m/s and the prevailing direction.

## Run it

Open `index.html` in a browser, or serve the folder:

```
python3 -m http.server 8000
```

To publish it, enable GitHub Pages for the `main` branch (Settings → Pages → Deploy from branch → `main` / root).

## Data

Spot data lives in `js/spots.js`. Each spot has 12 monthly average wind speeds (m/s, January to December)
and a prevailing direction. Spots are ranked by average wind speed for the selected month.
The values are approximate long-term climate averages compiled for trip planning, not live forecasts.
To add a spot, append an entry to `SPOTS`.

Built with [Leaflet](https://leafletjs.com/) and OpenStreetMap tiles.
