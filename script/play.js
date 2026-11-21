import { data } from "./stationData.js"
import { Avansel } from "avansel"


// Fetch random station image

var stationImages = new Array();
var stationNames = new Array();
var stationLatitudes = new Array();
var stationLongitudes = new Array();


getStreetViewImage();
// Get street view image from a random station's coordinates.
async function getStreetViewImage() {
  var result = undefined;
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
      document.getElementById("loadingBox").innerHTML = "Station fetch error. Retrying..."
      getStreetViewImage();
    }
    result = await response.json();
    if (result.features.length != 0) {
      let imageWidth = new Number();
      let imageHeight = new Number();
      const img = new Image();
      img.src = result.features[0].assets.sd.href;
      img.onload = function() {
        imageWidth = img.naturalWidth;
        imageHeight = img.naturalHeight;
        console.log(imageWidth + "x" + imageHeight);
        if (2 * imageHeight == imageWidth) {
          // if width is double the height, pass the image
          console.log("Aspect ratio correct, station data added.");
          document.getElementById("loadingBox").innerHTML = String("Image success. Station " + (stationImages.length+1) + "/5.")
          stationNames.push(station.nom);
          stationImages.push(result.features[0].assets.hd.href);
          stationLatitudes.push(stationLat);
          stationLongitudes.push(stationLon);
          console.log(stationImages);
          console.log(stationNames);
          console.log(stationLatitudes);
          console.log(stationLongitudes);
        } else {
          // if not, check other images in the location
          console.log("Incorrect aspect ratio, retrying...");
          document.getElementById("loadingBox").innerHTML = "Incorrect dimensions, retrying..."
          getStreetViewImage();
        };
      };
    } else {
      console.log("Insufficient data of chosen station, retrying...");
      document.getElementById("loadingBox").innerHTML = "Insufficient data, retrying..."
      getStreetViewImage();
    }
  } catch (error) {
    console.error(error);
    document.getElementById("loadingBox").innerHTML = "HTTP error " + error
  }
}



// Generate five stations for the game
for (let i=0; i<4;i++) {
  getStreetViewImage();
};


const panoViewer = new Avansel(document.querySelector("#pano"));
panoViewer.sphere("style/assets/loadingScreen.png").start()
function updateAvansel() {
  if (stationImages.length != 5) {
    window.setTimeout(updateAvansel, 10);
  } else {
    panoViewer.sphere(stationImages[0]).start()

    // Start timer
    var time = 60.1;
    const timer = document.getElementById("timer");
    setInterval(decreaseCount, 100)
    function decreaseCount() {
      time = (time - 0.1).toFixed(1);
      timer.innerHTML = time+"s"
      if (time == 0) {
        clearInterval();
      };
    };
    
    // Initialize map

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
  };
};
updateAvansel();