// Initialize the map
var map = L.map('map').setView([-32.4075, -63.2403], 13); // Coordinates for Villa María, Argentina

// Add a tile layer (map style)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Example points in Villa María and Villa Nueva, Argentina
var points = [
    { lat: -32.4075, lng: -63.2403, label: "Punto 1 - Villa María Centro" },
    { lat: -32.4172, lng: -63.2310, label: "Punto 2 - Barrio Belgrano, Villa María" },
    { lat: -32.4356, lng: -63.2347, label: "Punto 3 - Barrio Jardin del Golf, Villa Nueva" },
    { lat: -32.4280, lng: -63.2243, label: "Punto 4 - Barrio Las Rosas, Villa Nueva" }
];

// Add markers to the map with click events
points.forEach(function (point) {
    L.marker([point.lat, point.lng]).addTo(map)
        .bindPopup(point.label)
        .on('click', function() {
            // Redirect to the specific order details page
            window.location.href = `../Pedidos/pedidodetalle.html`;
        });
});

