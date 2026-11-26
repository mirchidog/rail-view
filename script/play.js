import { data } from "./stationData.js"
import { Avansel } from "avansel"

/*
/Fetch random station image
*/

var stationImages = new Array();
var stationNames = new Array();
var stationLatitudes = new Array();
var stationLongitudes = new Array();

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
  var streetViewUrl = 'https://api.panoramax.xyz/api/search?bbox=' + xmin + ',' + ymin + ',' + xmax + ',' + ymax + '&limit=5'
  try {
    const response = await fetch(streetViewUrl);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
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
          stationNames.push(station.nom);
          stationImages.push(result.features[0].assets.hd.href);
          stationLatitudes.push(stationLat);
          stationLongitudes.push(stationLon);
          console.log(stationImages, stationNames, stationLatitudes, stationLongitudes);
        } else {
          // if not, check other images in the location
          console.log("Incorrect aspect ratio, retrying...");
          getStreetViewImage();
        };
      };
    } else {
      console.log("Insufficient data of chosen station, retrying...");
      getStreetViewImage();
    }
  } catch (error) {
    console.error(error);
  }
}

/*
Initialize game elements
*/

var time = 60.1
var guessLat = 0;
var guessLon = 0;
function startGame() {
  // Update Avansel viewer with first image
  if (stationImages.length != 5) {
    window.setTimeout(startGame, 10);
  } else {
    panoViewer.sphere(stationImages[0]).start()

    // Start timer
    const timer = document.getElementById("timer");
    setInterval(decreaseCount, 100);
    function decreaseCount() {
      time = (time - 0.1).toFixed(1);
      timer.innerHTML = time+"s"
      if (time == 0) {
        clearInterval();
      };
    };

    // Add basemap layer with a railway overlay
    const map = L.map('map').setView([46.52, 2.55], 4);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    L.tileLayer('https://tiles.openrailwaymap.org/standard/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="http://www.openrailwaymap.org">OpenRailwayMap</a>'
    }).addTo(map);


    // Plot points of each station's coordinates
    data.forEach(station => {
      let lat = station.position_geographique.lat;
      let lon = station.position_geographique.lon;
      L.circle([lat, lon], {
        color: 'red',
        fillColor: '#9d0909',
        fillOpacity: 0.8,
        radius: 500
      }).addTo(map);
    });

    // Record player's guess for the round
    var markerGroup = L.layerGroup().addTo(map);
    map.on('click', function(e) {
      guessLat = e.latlng.lat
      guessLon = e.latlng.lng
      console.log("Guess is at coords " + guessLat + ", " + guessLon)
      markerGroup.clearLayers();
      L.marker([guessLat, guessLon]).addTo(markerGroup);
    });

    // Updates the map when resized
    const resizeObserver = new ResizeObserver(() => {
        map.invalidateSize();
    });
    const mapBox = document.getElementById("map");
    resizeObserver.observe(mapBox);
  };
};


const score = [];
function scoreRound() {
  const latRange = 8.7386; // stretches from 51.0717°N - 42.3331°N
  const lonRange = 12.9967; // stretches from 8.230°E - 4.7667°W

  // How funny is this? The grading algorithm for this french train game is GARe!
  const calcScore = function(g, a, r) {
    // Finds the inverse of (guess-actual)/range to rate accuracy from 0 to 5000
    return (1 - (Math.abs(g - a) / r))*5000
  }
  // Averages the accuracy from latitude and longitude
  var avgScore = Math.round((calcScore(guessLat, stationLatitudes[0], latRange) + calcScore(guessLon, stationLongitudes[0], lonRange)) / 2)
  if (avgScore < 0) {
    avgScore = 0
  }
  score.push(avgScore)
}

/*
Load Game
*/

// Generate five stations for the game
for (let i=0; i<5;i++) {
  getStreetViewImage();
};

// Create the Avansel panoramic viewer
const panoViewer = new Avansel(document.querySelector("#pano"));
panoViewer.sphere("style/assets/loadingScreen.png").start()
startGame();

// Start scoring and reset
const gameEnd = setInterval(function() {
  if (time <= 0) {
    scoreRound();
    console.log("The score: " + score[0]);
    clearInterval(gameEnd);
  }
}, 100);