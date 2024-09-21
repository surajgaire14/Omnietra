// script.js

// Initialize the map and limit Earth placement to once
var map = L.map('map').setView([27.7172, 85.3240], 5); // Default view centered at Kathmandu
var earthPlaced = false; // Track if the Earth is already placed

// Add map tiles (using OpenStreetMap)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
}).addTo(map);

// Function to calculate scaled position using polar coordinates
function getScaledOrbitPosition(lat, lng, distanceAU, angleDeg) {
    const AU_IN_KM = 149597870.7;
    const SCALE_FACTOR = 1e6; // Scale down factor for visualization

    // Convert the distance to kilometers and then scale down
    let scaledDistance = (distanceAU * AU_IN_KM) / SCALE_FACTOR;

    // Convert angle to radians
    let angleRad = (angleDeg * Math.PI) / 180;

    // Calculate scaled position using polar coordinates
    let scaledLat = lat + (scaledDistance * Math.cos(angleRad)) / 111;
    let scaledLng = lng + (scaledDistance * Math.sin(angleRad)) / (111 * Math.cos(lat * Math.PI / 180));

    return [scaledLat, scaledLng];
}

// Function to draw complete orbit for a planet
function drawOrbit(lat, lng, distanceAU) {
    const orbitRadius = (distanceAU * 149597870.7) / 1e6; // Scale radius for orbit
    const points = 360; // Number of points to create a circle

    for (let i = 0; i < points; i++) {
        let angle = (i / points) * 360; // Angle for each point
        let pos = getScaledOrbitPosition(lat, lng, distanceAU, angle);
        
        // Add the orbit as a polyline
        if (i === 0) {
            var orbitPath = L.polyline([pos], { color: 'red' }).addTo(map); // Red orbit color
        } else {
            orbitPath.addLatLng(pos);
        }
    }
}

// Function to display solar system
function displaySolarSystem(lat, lng) {
    // Define planets, their distances from the Sun in AU, and scaled sizes
    const planets = {
        'Mercury': { distance: 0.39, realSize: '4,880 km', scaledSize: '1.5 cm' },
        'Venus': { distance: 0.72, realSize: '12,104 km', scaledSize: '3.8 cm' },
        'Earth': { distance: 1, realSize: '12,742 km', scaledSize: '2 cm' },
        'Mars': { distance: 1.52, realSize: '6,779 km', scaledSize: '2.1 cm' },
        'Jupiter': { distance: 5.2, realSize: '139,822 km', scaledSize: '14 cm' },
        'Saturn': { distance: 9.58, realSize: '116,464 km', scaledSize: '11.5 cm' },
        'Uranus': { distance: 19.22, realSize: '50,724 km', scaledSize: '5.1 cm' },
        'Neptune': { distance: 30.05, realSize: '49,244 km', scaledSize: '5 cm' },
        'Sun': { distance: 0, realSize: '1,391,000 km', scaledSize: '40 cm' } // Sun is the reference
    };

    // Add the Earth marker first
    L.marker([lat, lng], {
        icon: L.icon({
            iconUrl: 'earth.png', // Add your earth image here
            iconSize: [20, 20] // Scaled size for the earth
        })
    }).addTo(map).bindPopup("<b>Earth</b><br>Real Size: ~12,742 km diameter.<br>Scaled Size: Marble (~2 cm).");

    // Add the Sun marker
    let sunMarker = L.marker([lat, lng], {
        icon: L.icon({
            iconUrl: 'sun.png', // Add your sun image here
            iconSize: [40, 40] // Scaled size for the sun
        })
    }).addTo(map).bindPopup("<b>Sun</b><br>Real Size: ~1,391,000 km diameter.<br>Scaled Size: Large ball (~40 cm).");

    // Add planets with orbits
    for (let planet in planets) {
        let distance = planets[planet].distance;
        let angle = Math.random() * 360; // Random angle to position planet on orbit

        // Draw the complete orbit for the planet
        drawOrbit(lat, lng, distance);

        // Calculate scaled position of planet using orbit distance and angle
        let planetPos = getScaledOrbitPosition(lat, lng, distance, angle);

        // Add planet marker
        L.marker(planetPos, {
            icon: L.icon({
                iconUrl: planet.toLowerCase() + '.png', // Add images for each planet (e.g., mercury.png)
                iconSize: [20, 20] // Scaled size for the planet
            })
        }).addTo(map).bindPopup(`<b>${planet}</b><br>Real Size: ${planets[planet].realSize}<br>Scaled Size: ${planets[planet].scaledSize}`);
    }
}

// Function to handle map clicks
function onMapClick(e) {
    if (!earthPlaced) {
        var latlng = e.latlng;

        // Display solar system around the Earth
        displaySolarSystem(latlng.lat, latlng.lng);

        earthPlaced = true; // Prevent further Earth placement
    } else {
        alert("Earth is already placed! Reload the page to start over.");
    }
}
// Add the rotation of the planets 

// Add click event to set Earth position
map.on('click', onMapClick);
