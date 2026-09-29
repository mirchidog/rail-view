// Add basemap layer
const map = L.map('map').setView([46.52, 2.55], 6);

const tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

var testCircle = L.circle([latList[1], lonList[1]], {
    color: 'red',
    fillColor: '#f03',
    fillOpacity: 0.5,
    radius: 500
}).addTo(map);

data.forEach(circle => {
    L.circle([latList, lonList], {

    }).addTo(map);
})