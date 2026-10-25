import { data } from "./stationData.js"

/*

initialize map

*/

// Add basemap layer
const map = L.map('map').setView([46.52, 2.55], 6);
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

/*

fetch random station image

*/

// Choose a random station to fetch API data from.
let chooseRandomStation = Math.floor(Math.random() * data.length);
let station = data[chooseRandomStation];
let stationLat = station.position_geographique.lat
let stationLon = station.position_geographique.lon
let streetViewUrl = String('https://api.openstreetcam.org/2.0/photo/?lat=' + stationLat + '&lng=' + stationLon + '&zoomLevel=18&join=sequence&orderBy=id&radius=500')
let result = ''
let howManyStationsRerolled = 0


// Get street view image from a random station's coordinates.
async function getStreetViewImage(stationLat, stationLon) {
  howManyStationsRerolled = 1
  try {
    const response = await fetch(streetViewUrl);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
      fetchAgain();
    }
    result = await response.json();
    if (result.status.apiMessage != "The request has an empty response") {
      outputData();
      document.getElementById("imgTest").src = result.result.data[0].fileurlProc
    } else {
      console.log("Choice #" + howManyStationsRerolled + ": Insufficient data")
      fetchAgain();
    }
  } catch (error) {
    console.error(error)
  }
}
getStreetViewImage();


// If the original station returns an error, keep retrying until one works.
async function fetchAgain() {
  await /* Let's goooo! */ this.getStreetViewImage
  howManyStationsRerolled = howManyStationsRerolled + 1
  chooseRandomStation = Math.floor(Math.random() * data.length);
  station = data[chooseRandomStation];
  stationLat = station.position_geographique.lat
  stationLon = station.position_geographique.lon
  streetViewUrl = String('https://api.openstreetcam.org/2.0/photo/?lat=' + stationLat + '&lng=' + stationLon + '&zoomLevel=18&join=sequence&orderBy=id&radius=500')
  try {
    const response = await fetch(streetViewUrl);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
      fetchAgain();
    }
    result = await response.json();
    if (result.status.apiMessage != "The request has an empty response") {
      outputData();
      document.getElementById("imgTest").src = result.result.data[0].fileurlProc
    } else {
      console.log("Choice #" + howManyStationsRerolled + ": Insufficient data")
      fetchAgain();
    }
  } catch (error) {
    console.error(error)
  }
}


function outputData() {
  console.log("Choice #" + howManyStationsRerolled + ": " + station.nom + " at coordinates " + stationLat + ", " + stationLon)
  console.log("Image URL: " + result.result.data[0].fileurlProc)
  console.log("Date added: " + result.result.data[0].dateAdded)
  console.log("Image latitude: " + result.result.data[0].lat)
  console.log("Image longitude: " + result.result.data[0].lng)
}