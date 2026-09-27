// Add basemap layer
const map = L.map('map').setView([46.52, 2.55], 6);

const tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);


// Import sncf station coordinates
import stationData from 'gares-des-voyageurs.json' assert {type:'json'};