import { data } from "./stationData.js"


// Set up the timer
var time = 45.1;
const timer = document.getElementById("timer");
setInterval(decreaseCount, 100)
function decreaseCount() {
  time = (time - 0.1).toFixed(1);
  timer.innerHTML = time+"s"
  if (time == 0) {
    clearInterval();
  }
}

/*

initialize map

*/

// Add basemap layer
const map = L.map('map').setView([46.52, 2.55], 4);
const tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

// Plot points of each station's coordinates
data.forEach(station => {
  let lat = station.position_geographique.lat;
  let lon = station.position_geographique.lon;
  L.circle([lat, lon], {
    color: 'green',
    fillColor: '#055f2b',
    fillOpacity: 0.8,
    radius: 500
  }).addTo(map);
});

// Updates the map when resized
const resizeObserver = new ResizeObserver(() => {
        map.invalidateSize();
});
const mapBox = document.getElementById("map");
resizeObserver.observe(mapBox);

/*

fetch random station image

*/

// Choose a random station to fetch API data from.
let chooseRandomStation = Math.floor(Math.random() * data.length);
let station = data[chooseRandomStation];
let stationLat = station.position_geographique.lat;
let stationLon = station.position_geographique.lon;
let ymin = stationLat - 0.0009;
let ymax = stationLat + 0.0009;
let xmin = stationLon - 0.0009;
let xmax = stationLon + 0.0009;
let streetViewUrl = String('https://api.panoramax.xyz/api/search?bbox=' + xmin + ',' + ymin + ',' + xmax + ',' + ymax + '&limit=5')
let result = ''
let howManyStationsRerolled = 0

getStreetViewImage();
// Get street view image from a random station's coordinates.
async function getStreetViewImage(xmin, ymin, xmax, ymax) {
  howManyStationsRerolled = 1
  try {
    const response = await fetch(streetViewUrl);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
      fetchAgain();
    }
    result = await response.json();
    if (result.features.length == 0) {
      console.log("Choice #" + howManyStationsRerolled + ": Insufficient data")
      fetchAgain();
    } else {
      outputData();
      document.getElementById("imgTest").src = result.features[0].assets.hd.href
    }
  } catch (error) {
    console.error(error)
  }
}
getStreetViewImage();


// If the original station returns an error, keep retrying until one works.
async function fetchAgain() {
  await this.getStreetViewImage
  howManyStationsRerolled = howManyStationsRerolled + 1
  chooseRandomStation = Math.floor(Math.random() * data.length);
  station = data[chooseRandomStation];
  stationLat = station.position_geographique.lat
  stationLon = station.position_geographique.lon
  ymin = stationLat - 0.0009;
  ymax = stationLat + 0.0009;
  xmin = stationLon - 0.0009;
  xmax = stationLon + 0.0009;
  streetViewUrl = String('https://api.panoramax.xyz/api/search?bbox=' + xmin + ',' + ymin + ',' + xmax + ',' + ymax + '&limit=5')
  try {
    const response = await fetch(streetViewUrl);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
      fetchAgain();
    }
    result = await response.json();
    if (result.features.length == 0) {
      console.log("Choice #" + howManyStationsRerolled + ": Insufficient data")
      fetchAgain();
    } else {
      outputData();
      document.getElementById("imgTest").src = result.features[0].assets.hd.href
    }
  } catch (error) {
    console.error(error)
  }
}


function outputData() {
  console.log("Choice #" + howManyStationsRerolled + ": " + station.nom + " at coordinates " + stationLat + ", " + stationLon)
  console.log(result.features[0].assets.hd.href)
}