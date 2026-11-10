import { data } from "./stationData.js"


/*

start timer

*/

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

var stationImages = new Array();
var stationNames = new Array();
var stationLatitudes = new Array();
var stationLongitudes = new Array();


getStreetViewImage();
// Get street view image from a random station's coordinates.
async function getStreetViewImage() {
  var result = undefined
  var chooseRandomStation = Math.floor(Math.random() * data.length);
  var station = data[chooseRandomStation];
  var stationLat = station.position_geographique.lat
  var stationLon = station.position_geographique.lon
  var ymin = stationLat - 0.0009;
  var ymax = stationLat + 0.0009;
  var xmin = stationLon - 0.0009;
  var xmax = stationLon + 0.0009;
  var streetViewUrl = String('https://api.panoramax.xyz/api/search?bbox=' + xmin + ',' + ymin + ',' + xmax + ',' + ymax + '&limit=5')
  try {
    const response = await fetch(streetViewUrl);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
      fetchAgain();
    }
    result = await response.json();
    if (result.features.length != 0) {
      stationNames.push(station.nom);
      stationImages.push(result.features[0].assets.hd.href);
      stationLatitudes.push(stationLat);
      stationLongitudes.push(stationLon);
      console.log(stationImages);
      console.log(stationNames);
      console.log(stationLatitudes);
      console.log(stationLongitudes);
    } else {
      console.log("Insufficient data")
      fetchAgain();
    }
  } catch (error) {
    console.error(error)
  }
}


// If the original station returns an error, keep retrying until one works.
async function fetchAgain() {
  var result = undefined
  var chooseRandomStation = Math.floor(Math.random() * data.length);
  var station = data[chooseRandomStation];
  var stationLat = station.position_geographique.lat
  var stationLon = station.position_geographique.lon
  var ymin = stationLat - 0.0009;
  var ymax = stationLat + 0.0009;
  var xmin = stationLon - 0.0009;
  var xmax = stationLon + 0.0009;
  var streetViewUrl = String('https://api.panoramax.xyz/api/search?bbox=' + xmin + ',' + ymin + ',' + xmax + ',' + ymax + '&limit=5')
  try {
    const response = await fetch(streetViewUrl);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
      fetchAgain();
    }
    result = await response.json();
    if (result.features.length != 0) {
      stationNames.push(station.nom);
      stationImages.push(result.features[0].assets.hd.href);
      stationLatitudes.push(stationLat);
      stationLongitudes.push(stationLon);
      console.log(stationImages);
      console.log(stationNames);
      console.log(stationLatitudes);
      console.log(stationLongitudes);
    } else {
      console.log("Insufficient data")
      fetchAgain();
    }
  } catch (error) {
    console.error(error)
  }
}


// Generate five stations for the game
for (let i=0; i<4;i++) {
  getStreetViewImage();
}

// Check size of image once all have been fetched
function checkImageDimensions() {
  if (stationImages.length < 5) {
    window.setTimeout(checkImageDimensions, 10);
  }
  else {
    let imageWidth = new Number();
    let imageHeight = new Number();
    const img = new Image();
    img.onload = function() {
      imageWidth = this.width;
      imageHeight = this.height;
      console.log(imageWidth + "x" + imageHeight);
      if (2 * imageHeight == imageWidth) {
        // if width is double the height, use the a-sky viewer
        document.getElementById("asky").src = stationImages[0];
        console.log("Displaying panorama.");
      }
      else {
        // if anything else, display on the a-plane view
        document.getElementById("aplane").src = stationImages[0];
        console.log("Displaying static image.");
      }
    }
    img.src = stationImages[0]
  }
}
checkImageDimensions();