// Initialize map with default center
const map = L.map('map', {
    center: [27.7008, 85.3000], // Adjust coordinates for your starting location
    zoom: 1,
    minZoom: 2.3, // Set minimum zoom level to avoid excessive zoom-out
    maxZoom: 19, // Set maximum zoom level for close-up view
    maxBounds: [[-90, -180], [90, 180]] // Ensure zoom-out doesn't go beyond map boundaries
})

// Add a tile layer (OpenStreetMap)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap',
    noWrap: true
}).addTo(map);

// Variable to hold Sun marker
let sunMarker;
let planetsMarkers = []; // Array to hold planet markers
let planetPaths = []; // Array to hold planet path lines
let isRevolving = true; // Variable to control planet revolution

// Earth coordinates
const earthCoords = [27.7008, 85.3000]; // Replace with actual Earth coordinates

// Function to create or update Sun marker
const placeSunMarker = (coords) => {
    if (sunMarker) {
        // Update existing marker position
        sunMarker.setLatLng(coords);
    } else {
        // Create a new Sun marker
        sunMarker = L.circleMarker(coords, {
            radius: 10,
            color: 'red',
            fillColor: '#f03',
            fillOpacity: 1
        }).addTo(map).bindPopup('Sun (Scaled: 40 cm)').openPopup();
        loadPlanets(); // Load planets after placing the Sun
    }
};

// Function to load planets on the map
const loadPlanets = () => {
    // Updated planets data with actual size, scaled size, and distance
    const planets = [
        { name: 'Mercury', actualSize: 4879, scaledSize: '0.14 cm', actualDistance: 57900000, scaledDistance: '16.65 m', comparison: 'a small grape', img: 'assets/Mercury.png', distance: 0.01665 },
        { name: 'Venus', actualSize: 12104, scaledSize: '0.35 cm', actualDistance: 108200000, scaledDistance: '31.11 m', comparison: 'a small orange', img: 'assets/Venus.png', distance: 0.03111 },
        { name: 'Earth', actualSize: 12742, scaledSize: '0.37 cm', actualDistance: 149600000, scaledDistance: '43.02 m', comparison: 'a basketball', img: 'assets/Earth.png', distance: 0.04302 },
        { name: 'Mars', actualSize: 6779, scaledSize: '0.19 cm', actualDistance: 227900000, scaledDistance: '65.54 m', comparison: 'a small apple', img: 'assets/Mars.png', distance: 0.06554 },
        { name: 'Jupiter', actualSize: 139820, scaledSize: '4.02 cm', actualDistance: 778500000, scaledDistance: '223.81 m', comparison: 'a large exercise ball', img: 'assets/Jupiter.png', distance: 0.22381 },
        { name: 'Saturn', actualSize: 116460, scaledSize: '3.35 cm', actualDistance: 1429400000, scaledDistance: '410.93 m', comparison: 'a large beach ball', img: 'assets/Saturn.png', distance: 0.41093 },
        { name: 'Uranus', actualSize: 50724, scaledSize: '1.46 cm', actualDistance: 2870990000, scaledDistance: '825.59 m', comparison: 'a large grapefruit', img: 'assets/Uranus.png', distance: 0.82559 },
        { name: 'Neptune', actualSize: 49244, scaledSize: '1.42 cm', actualDistance: 4495000000, scaledDistance: '1293.46 m', comparison: 'a large melon', img: 'assets/Neptune.png', distance: 1.29346 }
    ];

    // Create the initial markers for the planets
    planets.forEach(planet => {
        const planetMarker = L.divIcon({
            className: 'planet-icon',
            html: `<img src="${planet.img}" style="width:20px; height:20px;" />`,
            iconSize: [20, 20],
            iconAnchor: [10, 10]
        });

        // Set a random initial angle to avoid alignment
        planet.angle = Math.random() * 360;
        const angleRad = planet.angle * (Math.PI / 180);
        const planetCoords = calculatePlanetCoords(planet.distance, angleRad);

        // Create the initial marker for the planet
        const planetMarkerInstance = L.marker(planetCoords, { icon: planetMarker }).addTo(map);

        // Store the planet marker instance
        planetsMarkers.push(planetMarkerInstance);

        // Add a click event to show planet info
        planetMarkerInstance.on('click', () => {
            const info =
                `<strong>${planet.name}</strong><br>
                Actual Size (Diameter): ${planet.actualSize} km<br>
                Scaled Size: ${planet.scaledSize}<br>
                Actual Distance (from Sun): ${planet.actualDistance} km<br>
                Scaled Distance: ${planet.scaledDistance}<br>
                It is like a: ${planet.comparison}
            `;
            L.popup()
                .setLatLng(planetCoords)
                .setContent(info)
                .openOn(map);
        });

        // Draw the path for the planet around the Sun
        // drawPlanetPath(planet.distance);

        // Function to animate planet revolution
        // const animatePlanet = () => {
        //     if (isRevolving) {
        //         planet.angle += 0.5; // Slowed down angle increment
        //         const newAngleRad = planet.angle * (Math.PI / 180);
        //         const newPlanetCoords = calculatePlanetCoords(planet.distance, newAngleRad);

        //         // Update planet marker position
        //         planetMarkerInstance.setLatLng(newPlanetCoords);
        //     }

        //     // Continue animation
        //     requestAnimationFrame(animatePlanet);
        // };
        const animatePlanet = () => {
            if (isRevolving) {
                planet.angle += 0.5; // Slowed down angle increment
                const newAngleRad = planet.angle * (Math.PI / 180);
                const newPlanetCoords = calculatePlanetCoords(planet.distance, newAngleRad);

                // Add motion trail effect
                const trail = L.circleMarker(newPlanetCoords, {
                    radius: 5,
                    color: 'blue', // You can adjust colors per planet if needed
                    fillOpacity: 0.5,
                    stroke: true,
                    strokeColor: 'blue',
                    strokeOpacity: 0.5,
                    opacity: 0.5
                }).addTo(map);

                // Fade out the trail
                setTimeout(() => {
                    map.removeLayer(trail);
                }, 1000); // Adjust time to remove the trail

                // Update planet marker position
                planetMarkerInstance.setLatLng(newPlanetCoords);
            }

            // Continue animation
            requestAnimationFrame(animatePlanet);
        };


        // Start the animation for each planet
        animatePlanet();
    });
};

// Function to draw planet paths
const drawPlanetPath = (distance) => {
    if (!sunMarker) return;

    const sunCoords = sunMarker.getLatLng();
    const pathCoords = [];

    for (let angle = 0; angle < 360; angle += 1) { // Incremental angles for a smooth circle
        const angleRad = angle * (Math.PI / 180);
        const coords = [
            sunCoords.lat + (distance / 100) * Math.cos(angleRad), // Adjusted for visibility
            sunCoords.lng + (distance / 100) * Math.sin(angleRad)  // Adjusted for visibility
        ];
        pathCoords.push(coords);
    }

    // Create a polyline for the planet path
    const path = L.polyline(pathCoords, {
        color: 'blue', // Change color as needed
        opacity: 0.5
    }).addTo(map);
    planetPaths.push(path); // Store the path for reference if needed
};

// Function to calculate planet coordinates based on distance and angle
function calculatePlanetCoords(distance, angleRad) {
    if (!sunMarker) {
        return [27.7008, 85.3000]; // Fallback if no Sun marker is set
    }

    const sunCoords = sunMarker.getLatLng();
    return [
        sunCoords.lat + (distance / 100) * Math.cos(angleRad), // Adjusted for visibility
        sunCoords.lng + (distance / 100) * Math.sin(angleRad) // Adjusted for visibility
    ];
}

// Function to handle map clicks for placing Sun
map.on('click', function (e) {
    if (!sunMarker) {
        // Place the Sun marker at clicked position
        placeSunMarker(e.latlng);
    }
});

// Variable to hold click points for measuring distance
let clickPoints = [];
let measureActive = false;

// Function to handle map clicks for measuring distance
map.on('click', function (e) {
    if (measureActive) {
        if (clickPoints.length < 2) {
            clickPoints.push(e.latlng);
            L.marker(e.latlng).addTo(map).bindPopup(`Point ${clickPoints.length}`).openPopup();

            if (clickPoints.length === 2) {
                const distance = map.distance(clickPoints[0], clickPoints[1]);
                document.getElementById('distanceOutput').innerText = `Distance: ${distance.toFixed(2)} meters`;
                document.getElementById('distanceOutput').style.display = 'block';
            }
        }
    }
});

// Control button for starting/stopping revolution
document.getElementById('controlBtn').addEventListener('click', function () {
    isRevolving = !isRevolving; // Toggle revolution state
    this.innerText = isRevolving ? 'Stop Revolution' : 'Start Revolution';
});

// Activate measure tool
document.getElementById('measureBtn').addEventListener('click', function () {
    clickPoints = []; // Reset on activation
    measureActive = !measureActive; // Toggle measure tool
    document.getElementById('distanceOutput').style.display = 'none'; // Hide previous distance

    alert(measureActive ? 'Measure tool activated! Click on two points on the map to measure the distance.' : 'Measure tool deactivated!');
});

// Initial prompt to inform user to pin the Sun's position
alert('Please click on the map to pin the Sun\'s position!');

// Function to focus back to Earth
const focusOnEarth = () => {
    map.setView(earthCoords, 18); // Adjust zoom level as needed
};

// Add event listener for focusing back on Earth
document.getElementById('focusEarthBtn').addEventListener('click', focusOnEarth);

document.addEventListener('DOMContentLoaded', function () {
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const controlsColumn = document.getElementById('controlsColumn');

    // Toggle the control panel sliding from the right when the hamburger is clicked
    hamburgerBtn.addEventListener('click', function () {
        controlsColumn.classList.toggle('active');
    });
});