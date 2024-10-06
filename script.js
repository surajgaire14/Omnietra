let map;
function initializeSolarSystem() {
    // Initialize map with default center
    const map = L.map('map', {
        zoom: 1,
        minZoom: 2.3,
        maxZoom: 19,
        maxBounds: [[-90, -180], [90, 180]]
    }).setView([27.7008, 85.3000], 18); // Adjust coordinates for your starting location

    // Add a tile layer (OpenStreetMap)
    const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap',
        noWrap: true,

    })

    // Add tile layers to all maps
    tileLayer.addTo(map);

    // Variable to hold Sun marker
    let sunMarker;
    let planetsMarkers = []; // Array to hold planet markers
    let planetPaths = []; // Array to hold planet path lines
    let isRevolving = true; // Variable to control planet revolution
    // let exoplanetMarkers = []; 
    let isSolarSystem = true;

    // Earth coordinates
    // const earthCoords = [27.7008, 85.3000]; // Replace with actual Earth coordinates

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

    let planetTrails = [];

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

            const animatePlanet = () => {
                if (isRevolving) {
                    planet.angle += 0.2; // Slowed down angle increment
                    const newAngleRad = planet.angle * (Math.PI / 180);
                    const newPlanetCoords = calculatePlanetCoords(planet.distance, newAngleRad);

                    // Check the state of the checkbox
                    const showMotionTrail = !document.getElementById('toggleMode').checked;

                    // console.log(showMotionTrail)

                    // Add motion trail effect only if the checkbox is NOT checked
                    if (showMotionTrail) {
                        const trail = L.circleMarker(newPlanetCoords, {
                            radius: 0.2,
                            color: 'blue', // You can adjust colors per planet if needed
                            fillOpacity: 0.1,
                            // stroke: true,
                            strokeColor: 'blue',
                            strokeOpacity: 0.22,
                            opacity: 0.2
                        }).addTo(map);
                        planetTrails.push(trail); // Store the trail in the array

                        // Fade out the trail
                        setTimeout(() => {
                            map.removeLayer(trail);
                        }, 1000); // Adjust time to remove the trail
                    } else {
                        // Remove existing trails when checkbox is checked
                        planetTrails.forEach(trail => {
                            map.removeLayer(trail);
                        });
                        planetTrails = []; // Clear the trails array after removing
                    }

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



    // Function to load exoplanetary system
    // const loadExoplanetarySystem = () => {
    //     // Define exoplanets with host star and planet details
    //     const exoplanets = [
    //         { name: 'Proxima Centauri b', actualDistance: 40.0, scaledDistance: 53.2, comparison: '1.17 lk', img: 'assets/proxima_centauri_b.jpg', distance: 53.2 },
    //         { name: 'TRAPPIST-1d', actualDistance: 374.2, scaledDistance: 497.1, comparison: '1.07 lk', img: 'assets/trappist_1d.jpg', distance: 497.1 },
    //         { name: 'LHS 1140 b', actualDistance: 378.1, scaledDistance: 502.5, comparison: '1.45 lk', img: 'assets/lhs_1140_b.jpg', distance: 502.5 },
    //         { name: 'K2-18 b', actualDistance: 1173.3, scaledDistance: 1564.3, comparison: '1.2 lk', img: 'assets/k2_18_b.jpg', distance: 1564.3 },
    //         { name: 'TOI 700 d', actualDistance: 946.0, scaledDistance: 1257.0, comparison: '1.25 lk', img: 'assets/toi_700_d.jpg', distance: 1257.0 },
    //         { name: 'HD 40307 g', actualDistance: 396.2, scaledDistance: 526.8, comparison: '1.25 lk', img: 'assets/hd_40307_g.jpg', distance: 526.8 },
    //         { name: 'Kepler-186f', actualDistance: 5490.5, scaledDistance: 7310.1, comparison: '1.1 lk', img: 'assets/kepler_186f.jpg', distance: 7310.1 },
    //         { name: 'GJ 357 d', actualDistance: 292.5, scaledDistance: 389.5, comparison: '1.3 lk', img: 'assets/gj_357_d.jpg', distance: 389.5 },
    //         { name: 'HD 209458 b', actualDistance: 70.8, scaledDistance: 94.2, comparison: '1.38 lk', img: 'assets/hd_209458_b.jpg', distance: 94.2 },
    //         { name: 'WASP-121 b', actualDistance: 8015.7, scaledDistance: 10645.1, comparison: '1.8 lk', img: 'assets/wasp_121_b.jpg', distance: 10645.1 }
    //     ];

    //     exoplanets.forEach(exoplanet => {
    //         const exoplanetMarker = L.divIcon({
    //             className: 'planet-icon',
    //             html: `<img src="${exoplanet.img}" style="width:20px; height:20px;" />`,
    //             iconSize: [20, 20],
    //             iconAnchor: [10, 10]
    //         });

    //         // Use random coordinates or fixed positions for exoplanets
    //         const exoplanetCoords = [27.7008 + Math.random() * 5, 85.3000 + Math.random() * 5];

    //         const exoplanetMarkerInstance = L.marker(exoplanetCoords, { icon: exoplanetMarker })
    //             .addTo(map)
    //             .bindPopup(`<strong>${exoplanet.name}</strong><br>Host Star: ${exoplanet.hostStar}<br>Distance: ${exoplanet.distance}`)
    //             .openPopup();

    //         exoplanetMarkers.push(exoplanetMarkerInstance);
    //     });
    // };


    // Function to calculate coordinates for exoplanets (can be similar to the planets)
    // const calculateExoplanetCoords = (distance) => {
    //     if (!sunMarker) return [27.7008, 85.3000]; // Fallback if no Sun marker is set
    //     const sunCoords = sunMarker.getLatLng();
    //     return [sunCoords.lat + (distance * 0.1), sunCoords.lng]; // Adjust for visibility
    // };

    // Event listener for the checkbox toggle
    // document.getElementById('toggleMode').addEventListener('change', function () {
    //     const showExoplanets = this.checked;

    //     toggleSystem(showExoplanets);

    //     if (!showExoplanets) {
    //         // Show the solar system again by placing the Sun
    //         alert('Please click on the map to pin the Sun\'s position!');
    //     }
    // });

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
        if (!isSolarSystem || sunMarker) return; // Prevent placing Sun in exoplanet mode or if Sun already exists
        placeSunMarker(e.latlng);
    });


    // Variable to hold click points for measuring distance
    let clickPoints = [];
    let measureMarkers = [];
    let measureActive = false;

    // Function to handle map clicks for measuring distance
    map.on('click', function (e) {
        if (measureActive) {
            if (clickPoints.length < 2) {
                clickPoints.push(e.latlng);
                const marker = L.marker(e.latlng).addTo(map).bindPopup(`Point ${clickPoints.length}`).openPopup();
                measureMarkers.push(marker); // Add marker to array for future clearing

                if (clickPoints.length === 2) {
                    const distance = map.distance(clickPoints[0], clickPoints[1]);
                    document.getElementById('distanceOutput').innerText = `Distance: ${distance.toFixed(2)} meters`;
                    document.getElementById('distanceOutput').style.display = 'block';
                }
            }
        }
    });

    // Clear distance measurement points and output
    const clearMeasurePoints = () => {
        // Remove markers from the map
        measureMarkers.forEach(marker => map.removeLayer(marker));
        measureMarkers = []; // Clear markers array

        // Clear clicked points array
        clickPoints = [];

        // Hide distance output
        document.getElementById('distanceOutput').innerText = '';
        document.getElementById('distanceOutput').style.display = 'none';
    };

    document.getElementById('clearMeasureBtn').addEventListener('click', clearMeasurePoints);


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
        if (sunMarker) {
            const sunCoords = sunMarker.getLatLng();
            map.setView(sunCoords, 14); // Focus on the Sun's position
        } else {
            alert('Please place the Sun marker first!');
        }
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


    // Function to clear all planets, paths, and trails
    const clearPlanetsAndTrails = () => {
        planetsMarkers.forEach(marker => map.removeLayer(marker));
        planetsMarkers = [];
        planetPaths.forEach(path => map.removeLayer(path));
        planetPaths = [];
    };

    // Function to remove Sun marker
    const removeSunMarker = () => {
        if (sunMarker) {
            map.removeLayer(sunMarker);
            sunMarker = null;
        }
    };

    // Function to toggle between Solar and Exoplanetary systems
    const toggleSystem = (showExoplanets) => {
        // if (showExoplanets) {
        //     isSolarSystem = false; // Set to false when showing exoplanetary system

        //     // Remove solar system markers and paths
        //     clearPlanetsAndTrails();
        //     removeSunMarker();

        //     // Load exoplanetary system
        //     loadExoplanetarySystem();
        // } else {
        isSolarSystem = true; // Set to true for solar system

        // Clear exoplanetary markers
        exoplanetMarkers.forEach(marker => map.removeLayer(marker));
        exoplanetMarkers = [];

        // Ask for Sun's position again for the solar system
        alert('Please click on the map to pin the Sun\'s position!');
        // }
    };

    // Function to reset the map state
    const resetMapState = () => {
        // Clear all planets and trails
        clearPlanetsAndTrails();

        // Remove the Sun marker
        removeSunMarker();

        // Clear click points for measuring distance
        clearMeasurePoints();

        // Reset other variables if needed
        isRevolving = true; // Reset revolution state to true
        document.getElementById('controlBtn').innerText = 'Stop Revolution'; // Reset button text
        document.getElementById('toggleMode').checked = false; // Uncheck the toggle checkbox
    };



    // Event listener for the reset button
    document.getElementById('resetBtn').addEventListener('click', resetMapState);

}
function cleanupSolarSystem() {
    // Check if the map exists and remove layers
    if (map) {
        map.eachLayer(function (layer) {
            map.removeLayer(layer); // Remove all layers from the map
        });
        map = null; // Reset map variable
    }
    console.log('Solar System Cleaned Up');
}

initializeSolarSystem();