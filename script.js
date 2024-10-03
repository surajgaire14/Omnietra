// Initialize revolution state
let isRevolving = true;

// Create a map centered on a location (example coordinates)
const map = L.map('map').setView([27.7008, 85.3000], 18); // Adjust coordinates for your location

// Add a tile layer (OpenStreetMap)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
}).addTo(map);

// Coordinates for the Sun (center of the football ground)
const sunCoords = [27.7008, 85.3000]; // Adjust to your chosen location

// Planet distances and other properties
const planets = [
    { name: 'Mercury', actualSize: 4879, scaledSize: '1.9 cm', actualDistance: 57900000, scaledDistance: '16.55 m', comparison: 'a small grape', img: 'assets/Mercury.png', distance: 0.015 },
    { name: 'Venus', actualSize: 12104, scaledSize: '3.7 cm', actualDistance: 108200000, scaledDistance: '40.25 m', comparison: 'a small orange', img: 'assets/Venus.png', distance: 0.04 },
    { name: 'Earth', actualSize: 12742, scaledSize: '4.0 cm', actualDistance: 149600000, scaledDistance: '56.00 m', comparison: 'a basketball', img: 'assets/Earth.png', distance: 0.055 },
    { name: 'Mars', actualSize: 6779, scaledSize: '2.2 cm', actualDistance: 227900000, scaledDistance: '90.00 m', comparison: 'a small apple', img: 'assets/Mars.png', distance: 0.09 },
    { name: 'Jupiter', actualSize: 139820, scaledSize: '46.2 cm', actualDistance: 778500000, scaledDistance: '400.00 m', comparison: 'a large exercise ball', img: 'assets/Jupiter.png', distance: 0.4 },
    { name: 'Saturn', actualSize: 116460, scaledSize: '38.1 cm', actualDistance: 1429400000, scaledDistance: '800.00 m', comparison: 'a large beach ball', img: 'assets/Saturn.png', distance: 0.8 },
    { name: 'Uranus', actualSize: 50724, scaledSize: '16.9 cm', actualDistance: 2870990000, scaledDistance: '1600.00 m', comparison: 'a large grapefruit', img: 'assets/Uranus.png', distance: 1.6 },
    { name: 'Neptune', actualSize: 49244, scaledSize: '16.3 cm', actualDistance: 4495000000, scaledDistance: '3200.00 m', comparison: 'a large melon', img: 'assets/Neptune.png', distance: 3.2 }
];

// Create the Sun marker
const sunMarker = L.circleMarker(sunCoords, {
    radius: 10,
    color: 'red',
    fillColor: '#f03',
    fillOpacity: 1
}).addTo(map).bindPopup('Sun (Scaled: 40 cm)');

// Function to create planet markers and animate them
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

    // Add a click event to show planet info
    planetMarkerInstance.on('click', () => {
        const info = `
            <strong>${planet.name}</strong><br>
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

    // Function to animate planet revolution
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

// Function to calculate planet coordinates based on distance and angle
function calculatePlanetCoords(distance, angleRad) {
    return [
        sunCoords[0] + (distance / 100) * Math.cos(angleRad), // Adjusted for visibility
        sunCoords[1] + (distance / 100) * Math.sin(angleRad) // Adjusted for visibility
    ];
}

// Variable to hold click points
let clickPoints = [];
let measureActive = false;

// Function to handle map clicks
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
