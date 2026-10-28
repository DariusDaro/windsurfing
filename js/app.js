// Map page logic: fill the dropdowns, rank spots for the chosen month and
// continent, and draw numbered markers with wind popups.

const DIRECTION_DEGREES = {
  N: 0, NNE: 22.5, NE: 45, ENE: 67.5, E: 90, ESE: 112.5, SE: 135, SSE: 157.5,
  S: 180, SSW: 202.5, SW: 225, WSW: 247.5, W: 270, WNW: 292.5, NW: 315, NNW: 337.5
};

const monthSelect = document.getElementById("month");
const continentSelect = document.getElementById("continent");
const list = document.getElementById("list");

const map = L.map("map", { worldCopyJump: true }).setView([20, 0], 2);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 18,
  attribution: "&copy; <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a> contributors"
}).addTo(map);

const markerLayer = L.layerGroup().addTo(map);

MONTHS.forEach((name, i) => monthSelect.add(new Option(name, i)));
Object.keys(CONTINENTS).forEach(name => continentSelect.add(new Option(name, name)));

monthSelect.addEventListener("change", () => {
  continentSelect.disabled = monthSelect.value === "";
  update();
});
continentSelect.addEventListener("change", update);

function directionFor(spot, month) {
  return Array.isArray(spot.dir) ? spot.dir[month] : spot.dir;
}

// Wind blows FROM the named direction, so the arrow points the opposite way.
// "E / W" style values have two directions and get no single arrow.
function arrowFor(direction) {
  const deg = DIRECTION_DEGREES[direction];
  if (deg === undefined) return "";
  return `<span class="arrow" style="transform: rotate(${deg + 180}deg)">&#8593;</span>`;
}

function topSpots(month, continent) {
  return SPOTS
    .filter(s => continent === "All world" || s.continent === continent)
    .map(s => ({ ...s, avg: s.wind[month], direction: directionFor(s, month) }))
    .sort((a, b) => b.avg - a.avg)
    .slice(0, 10);
}

function popupHtml(spot, rank, month) {
  const knots = (spot.avg * 1.944).toFixed(0);
  return `
    <div class="popup">
      <h3>#${rank} ${spot.name}</h3>
      <div class="country">${spot.country}</div>
      <table>
        <tr><td>Average wind (${MONTHS[month]})</td><td><b>${spot.avg.toFixed(1)} m/s</b> (${knots} kn)</td></tr>
        <tr><td>Direction</td><td><b>${spot.direction}</b> ${arrowFor(spot.direction)}</td></tr>
      </table>
      <div class="note">${spot.note}</div>
    </div>`;
}

function rankIcon(rank) {
  return L.divIcon({
    className: "rank-icon",
    html: `<div class="rank-badge${rank === 1 ? " top" : ""}">${rank}</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15]
  });
}

function update() {
  markerLayer.clearLayers();
  const month = monthSelect.value === "" ? null : Number(monthSelect.value);
  const continent = continentSelect.value;

  if (month === null || !continent) {
    list.innerHTML = `<p class="hint">Choose a month, then a continent, to see the top 10 spots. Number 1 is the best.</p>`;
    map.setView([20, 0], 2);
    return;
  }

  const spots = topSpots(month, continent);
  const markers = [];

  list.innerHTML = `<h2>Top ${spots.length} ${continent === "All world" ? "in the world" : "in " + continent}, ${MONTHS[month]}</h2><p class="tip">Click the number to see wind strength</p><ol></ol>`;
  const ol = list.querySelector("ol");

  // Add in reverse so number 1 is drawn on top of the others.
  spots.slice().reverse().forEach((spot, idx) => {
    const rank = spots.length - idx;
    const marker = L.marker([spot.lat, spot.lng], { icon: rankIcon(rank), zIndexOffset: (11 - rank) * 100 })
      .bindPopup(popupHtml(spot, rank, month))
      .addTo(markerLayer);
    markers[rank - 1] = marker;
  });

  spots.forEach((spot, i) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <div class="rank-badge${i === 0 ? " top" : ""}">${i + 1}</div>
      <div>
        <div class="name">${spot.name}</div>
        <div class="meta">${spot.country} · ${spot.avg.toFixed(1)} m/s ${spot.direction}</div>
      </div>`;
    li.addEventListener("click", () => {
      map.setView([spot.lat, spot.lng], Math.max(map.getZoom(), 8));
      markers[i].openPopup();
    });
    ol.appendChild(li);
  });

  const bounds = L.latLngBounds(spots.map(s => [s.lat, s.lng]));
  map.fitBounds(bounds, { padding: [40, 40], maxZoom: 7 });
}
