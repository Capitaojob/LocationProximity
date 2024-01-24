const latitudeInput = document.getElementById("latitude");
const longitudeInput = document.getElementById("longitude");
const bodyElement = document.querySelector("body");
const distanceElement = document.getElementById("distance");
const lastDistanceElement = document.getElementById("last_distance");
const CHECK_DELAY_MS = 1000;

let currentCheckIntervalId = "";

let currentLatitude = 0;
let currentLongitude = 0;

let lastLatitude = 0;
let lastLongitude = 0;

let targetLatitude = 0;
let targetLongitude = 0;

let currentLatitudeDistance = 0;
let currentLongitudeDistance = 0;

let lastLatitudeDistance = 0;
let lastLongitudeDistance = 0;

let currentDistance = 0;

async function startLocationChecking() {
	if (!navigator.geolocation) {
		console.error("Geolocalização não é suportada neste navegador");
		return;
	}

	await updateLatitudeAndLongitude();

	currentCheckIntervalId = setInterval(() => {
		lastLatitude = currentLatitude;
		lastLongitude = currentLongitude;
		checkPositionProximityToLatitudeAndLongitude(targetLatitude, targetLongitude);
		compareLatestDistanceWithCurrent();
	}, CHECK_DELAY_MS);

	// Executes once after initialization so delay does not apply at start
	checkPositionProximityToLatitudeAndLongitude(targetLatitude, targetLongitude);
}

async function updateLatitudeAndLongitude() {
	return new Promise((resolve, reject) => {
		navigator.geolocation.getCurrentPosition(
			(position) => {
				currentLatitude = position.coords.latitude;
				currentLongitude = position.coords.longitude;
				resolve();
			},
			(error) => {
				console.error("Erro ao obter a localização: " + error.message);
				reject(error);
			}
		);
	});
}

async function checkPositionProximityToLatitudeAndLongitude(latitude, longitude) {
	if (!latitude || !longitude) return;

	// console.table([
	// 	[currentLatitude, latitude, Math.abs(currentLatitude - latitude)],
	// 	[currentLongitude, longitude, Math.abs(currentLongitude - longitude)],
	// ]);

	let backgroundColor;
	let distanceText;

	lastLatitudeDistance = currentLatitudeDistance;
	lastLongitudeDistance = currentLongitudeDistance;

	currentLatitudeDistance = Math.abs(currentLatitude - latitude);
	currentLongitudeDistance = Math.abs(currentLongitude - longitude);

	currentDistance = calcDiagonal(currentLatitudeDistance, currentLongitudeDistance);

	if (currentDistance < 25) {
		// if (currentLatitudeDistance < 0.00019 && currentLongitudeDistance < 0.00019) {
		distanceText = "Achou! (-25m)";
		backgroundColor = "rgb(93, 199, 61)";
		clearInterval(currentCheckIntervalId);
	} else if (currentDistance < 250) {
		// } else if (currentLatitudeDistance < 0.0018 && currentLongitudeDistance < 0.0018) {
		distanceText = "Quentinho (250 - 25m)";
		backgroundColor = "rgb(230, 255, 10)";
	} else if (currentDistance < 500) {
		// } else if (currentLatitudeDistance < 0.00357 && currentLongitudeDistance < 0.00357) {
		distanceText = "Esquentou (500 - 250m)";
		backgroundColor = "rgb(211, 103, 15)";
	} else if (currentDistance < 1000) {
		// } else if (currentLatitudeDistance < 0.001 && currentLongitudeDistance < 0.001) {
		distanceText = "Longe (1km - 500m)";
		backgroundColor = "rgb(200, 33, 33)";
	} else {
		distanceText = "Muito Longe (+1km)";
		backgroundColor = "rgb(159, 33, 33)";
	}

	distanceElement.innerText = distanceText;
	bodyElement.style.backgroundColor = backgroundColor;
}

function compareLatestDistanceWithCurrent() {
	if (currentLatitudeDistance < lastLatitudeDistance && currentLongitudeDistance < lastLongitudeDistance) {
		lastDistanceElement.innerHTML = "Esquentou";
	} else if (currentLatitudeDistance == lastLatitudeDistance && currentLongitudeDistance == lastLongitudeDistance) {
		lastDistanceElement.innerHTML = "Igual";
	} else {
		lastDistanceElement.innerHTML = "Esfriou";
	}

	lastDistanceElement.innerHTML += " - " + currentDistance + "m";
}

function getUrlLatitudeLongitude() {
	const urlParams = new URLSearchParams(window.location.search);

	const latLongParamArray = urlParams.get("ffaxr").replaceAll(" ", "").split(",");

	const paramLatitude = latLongParamArray[0];
	const paramLongitude = latLongParamArray[1];

	// const paramLatitude = urlParams.get("lat");
	// const paramLongitude = urlParams.get("long");

	targetLatitude = Number(paramLatitude);
	targetLongitude = Number(paramLongitude);
}

function convertToCrypto(word) {
	const letterToCrypt = {
		"a": "ᔑ",
		"b": "ʖ",
		"c": "ᓵ",
		"d": "↸",
		"e": "ᒷ",
		"f": "⎓",
		"g": "⊣",
		"h": "⍑",
		"i": "╎",
		"j": "⋮",
		"k": "ꖌ",
		"l": "ꖎ",
		"m": "ᒲ",
		"n": "リ",
		"o": "𝙹",
		"p": "!¡",
		"q": "ᑑ",
		"r": "∷",
		"s": "ᓭ",
		"t": "ℸ ̣",
		"u": "⚍",
		"v": "⍊",
		"w": "∴",
		"x": " ̇/",
		"y": "||",
		"z": "⨅",
	};

	const newWord = word
		.toLowerCase()
		.split("")
		.map((letter) => {
			if (letter === " ") return " ";

			if (letter in letterToCrypt) {
				return letterToCrypt[letter];
			}

			return letter;
		})
		.join("");

	return newWord;
}

function calcDiagonal(width, length) {
	const diagonal = Math.sqrt(width ** 2 + length ** 2);
	return Math.round(diagonal / 0.00000936);
}

// setInterval(() => {
// 	const TRAVEL_DISTANCE = 0.0002;

// 	if (targetLatitude < currentLatitude) targetLatitude += TRAVEL_DISTANCE;
// 	else targetLatitude -= TRAVEL_DISTANCE;

// 	if (targetLongitude < currentLongitude) targetLongitude += TRAVEL_DISTANCE;
// 	else targetLongitude -= TRAVEL_DISTANCE;
// }, 700);

getUrlLatitudeLongitude();
startLocationChecking();
