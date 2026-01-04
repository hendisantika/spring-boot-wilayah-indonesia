/**
 * 38 Provinsi Indonesia Map Visualization
 * Uses Leaflet.js with GeoJSON files
 */

// Global variables
let map;
let provinsiLayer;
let kabupatenLayer;
let provinsiData = null;
let kabupatenData = null;
let currentLayer = 'provinsi';

// Indonesia center coordinates
const INDONESIA_CENTER = [-2.5489, 118.0149];
const INDONESIA_ZOOM = 5;

// Color palette for provinces (will assign colors based on index)
const PROVINCE_COLORS = [
    '#e6194B', '#3cb44b', '#ffe119', '#4363d8', '#f58231',
    '#911eb4', '#42d4f4', '#f032e6', '#bfef45', '#fabed4',
    '#469990', '#dcbeff', '#9A6324', '#fffac8', '#800000',
    '#aaffc3', '#808000', '#ffd8b1', '#000075', '#a9a9a9',
    '#e6194B', '#3cb44b', '#ffe119', '#4363d8', '#f58231',
    '#911eb4', '#42d4f4', '#f032e6', '#bfef45', '#fabed4',
    '#469990', '#dcbeff', '#9A6324', '#fffac8', '#800000',
    '#aaffc3', '#808000', '#ffd8b1'
];

// Initialize map on page load
document.addEventListener('DOMContentLoaded', function() {
    initMap();
    loadGeoJSONData();
    setupEventListeners();
});

/**
 * Initialize Leaflet map
 */
function initMap() {
    map = L.map('map').setView(INDONESIA_CENTER, INDONESIA_ZOOM);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18,
        minZoom: 4
    }).addTo(map);

    L.control.scale({
        position: 'bottomleft',
        imperial: false
    }).addTo(map);

    addLegend();
}

/**
 * Add legend to map
 */
function addLegend() {
    const legend = L.control({position: 'topright'});

    legend.onAdd = function(map) {
        const div = L.DomUtil.create('div', 'legend');
        div.innerHTML = `
            <h6>Keterangan</h6>
            <div class="legend-item">
                <span class="legend-color" style="background: #3388ff"></span> Provinsi
            </div>
            <div class="legend-item">
                <span class="legend-color" style="background: #ff7800"></span> Kabupaten/Kota
            </div>
        `;
        return div;
    };

    legend.addTo(map);
}

/**
 * Load GeoJSON data from static files
 */
function loadGeoJSONData() {
    showLoading();

    // Load both GeoJSON files in parallel
    Promise.all([
        fetch('/json/provinsi-indonesia.json').then(res => res.json()),
        fetch('/json/kabupaten-indonesia.json').then(res => res.json())
    ])
    .then(([provinsi, kabupaten]) => {
        provinsiData = provinsi;
        kabupatenData = kabupaten;

        // Update statistics
        updateStatistics();

        // Populate filter dropdown
        populateProvinsiFilter();

        // Display province list
        displayProvinsiList();

        // Load default layer (provinsi)
        displayProvinsiLayer();

        hideLoading();
    })
    .catch(error => {
        console.error('Error loading GeoJSON data:', error);
        hideLoading();
        alert('Gagal memuat data GeoJSON. Pastikan file tersedia di folder /json/');
    });
}

/**
 * Update statistics panel
 */
function updateStatistics() {
    if (provinsiData && provinsiData.features) {
        document.getElementById('statProvinsi').textContent = provinsiData.features.length;
    }
    if (kabupatenData && kabupatenData.features) {
        document.getElementById('statKabupaten').textContent = kabupatenData.features.length;
    }
}

/**
 * Populate province filter dropdown
 */
function populateProvinsiFilter() {
    const select = document.getElementById('filterProvinsi');

    // Extract unique province names from kabupaten data
    const provinces = new Set();
    if (kabupatenData && kabupatenData.features) {
        kabupatenData.features.forEach(feature => {
            if (feature.properties && feature.properties.WADMPR) {
                provinces.add(feature.properties.WADMPR);
            }
        });
    }

    // Sort and add to dropdown
    Array.from(provinces).sort().forEach(name => {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        select.appendChild(option);
    });
}

/**
 * Display list of provinces as clickable badges
 */
function displayProvinsiList() {
    const container = document.getElementById('provinsiList');

    if (!provinsiData || !provinsiData.features) {
        container.innerHTML = '<p class="text-muted">Data provinsi tidak tersedia</p>';
        return;
    }

    let html = '';
    provinsiData.features.forEach((feature, index) => {
        const name = getFeatureName(feature);
        const color = PROVINCE_COLORS[index % PROVINCE_COLORS.length];
        html += `<span class="province-badge"
                       style="background-color: ${color}; color: white;"
                       data-index="${index}"
                       onclick="zoomToProvinsi(${index})">${name}</span>`;
    });

    container.innerHTML = html;
}

/**
 * Get feature name from properties
 */
function getFeatureName(feature) {
    if (!feature.properties) return 'Unknown';

    // Try different property names
    return feature.properties.NAMOBJ ||
           feature.properties.WADMPR ||
           feature.properties.nama ||
           feature.properties.NAME ||
           'Unknown';
}

/**
 * Display province layer on map
 */
function displayProvinsiLayer() {
    if (!provinsiData) return;

    // Remove existing layer
    if (provinsiLayer) {
        map.removeLayer(provinsiLayer);
    }

    provinsiLayer = L.geoJSON(provinsiData, {
        style: function(feature) {
            const index = provinsiData.features.indexOf(feature);
            return {
                fillColor: PROVINCE_COLORS[index % PROVINCE_COLORS.length],
                weight: 2,
                opacity: 1,
                color: 'white',
                fillOpacity: 0.6
            };
        },
        onEachFeature: function(feature, layer) {
            const name = getFeatureName(feature);

            layer.bindPopup(`
                <div>
                    <h6>${name}</h6>
                    <p><strong>Tipe:</strong> Provinsi</p>
                    ${feature.properties.LUAS ? `<p><strong>Luas:</strong> ${feature.properties.LUAS.toFixed(2)} km²</p>` : ''}
                </div>
            `);

            layer.on({
                mouseover: function(e) {
                    const layer = e.target;
                    layer.setStyle({
                        weight: 4,
                        color: '#333',
                        fillOpacity: 0.8
                    });
                    layer.bringToFront();
                    updateInfoPanel(feature, 'Provinsi');
                },
                mouseout: function(e) {
                    provinsiLayer.resetStyle(e.target);
                },
                click: function(e) {
                    map.fitBounds(e.target.getBounds());
                    updateInfoPanel(feature, 'Provinsi');
                }
            });
        }
    }).addTo(map);

    document.getElementById('statSelected').textContent = provinsiData.features.length;
    currentLayer = 'provinsi';
    updateLayerButtons('provinsi');
}

/**
 * Display kabupaten layer on map
 */
function displayKabupatenLayer(filterProvinsi = null) {
    if (!kabupatenData) return;

    // Remove existing layer
    if (kabupatenLayer) {
        map.removeLayer(kabupatenLayer);
    }

    let filteredData = kabupatenData;

    // Filter by province if specified
    if (filterProvinsi) {
        filteredData = {
            type: 'FeatureCollection',
            features: kabupatenData.features.filter(f =>
                f.properties && f.properties.WADMPR === filterProvinsi
            )
        };
    }

    kabupatenLayer = L.geoJSON(filteredData, {
        style: function(feature) {
            return {
                fillColor: '#ff7800',
                weight: 1,
                opacity: 1,
                color: 'white',
                fillOpacity: 0.5
            };
        },
        onEachFeature: function(feature, layer) {
            const props = feature.properties || {};
            const name = props.NAMOBJ || props.WADMKK || 'Unknown';

            layer.bindPopup(`
                <div>
                    <h6>${name}</h6>
                    <table class="table table-sm mb-0">
                        <tr><td><strong>Provinsi:</strong></td><td>${props.WADMPR || '-'}</td></tr>
                        <tr><td><strong>Kabupaten/Kota:</strong></td><td>${props.WADMKK || '-'}</td></tr>
                        <tr><td><strong>Kecamatan:</strong></td><td>${props.WADMKC || '-'}</td></tr>
                        <tr><td><strong>Kelurahan:</strong></td><td>${props.WADMKD || '-'}</td></tr>
                        ${props.LUAS ? `<tr><td><strong>Luas:</strong></td><td>${props.LUAS.toFixed(2)} km²</td></tr>` : ''}
                    </table>
                </div>
            `);

            layer.on({
                mouseover: function(e) {
                    const layer = e.target;
                    layer.setStyle({
                        weight: 3,
                        color: '#333',
                        fillOpacity: 0.7
                    });
                    layer.bringToFront();
                    updateInfoPanel(feature, 'Kabupaten/Kota');
                },
                mouseout: function(e) {
                    kabupatenLayer.resetStyle(e.target);
                },
                click: function(e) {
                    map.fitBounds(e.target.getBounds());
                    updateInfoPanel(feature, 'Kabupaten/Kota');
                }
            });
        }
    }).addTo(map);

    document.getElementById('statSelected').textContent = filteredData.features.length;
    currentLayer = 'kabupaten';

    if (filteredData.features.length > 0) {
        map.fitBounds(kabupatenLayer.getBounds());
    }
}

/**
 * Display both layers
 */
function displayBothLayers() {
    displayProvinsiLayer();

    // Add kabupaten layer on top with transparent style
    if (kabupatenData) {
        if (kabupatenLayer) {
            map.removeLayer(kabupatenLayer);
        }

        kabupatenLayer = L.geoJSON(kabupatenData, {
            style: function(feature) {
                return {
                    fillColor: 'transparent',
                    weight: 0.5,
                    opacity: 0.5,
                    color: '#666',
                    fillOpacity: 0
                };
            },
            onEachFeature: function(feature, layer) {
                const props = feature.properties || {};
                const name = props.NAMOBJ || props.WADMKK || 'Unknown';

                layer.bindPopup(`
                    <div>
                        <h6>${name}</h6>
                        <table class="table table-sm mb-0">
                            <tr><td><strong>Provinsi:</strong></td><td>${props.WADMPR || '-'}</td></tr>
                            <tr><td><strong>Kabupaten/Kota:</strong></td><td>${props.WADMKK || '-'}</td></tr>
                        </table>
                    </div>
                `);
            }
        }).addTo(map);
    }

    currentLayer = 'both';
    updateLayerButtons('both');
    document.getElementById('statSelected').textContent =
        `${provinsiData.features.length} Provinsi + ${kabupatenData.features.length} Kab/Kota`;
}

/**
 * Update layer button states
 */
function updateLayerButtons(activeLayer) {
    document.querySelectorAll('.btn-layer').forEach(btn => {
        btn.classList.remove('active');
    });

    if (activeLayer === 'provinsi') {
        document.getElementById('btnProvinsi').classList.add('active');
    } else if (activeLayer === 'kabupaten') {
        document.getElementById('btnKabupaten').classList.add('active');
    } else if (activeLayer === 'both') {
        document.getElementById('btnBoth').classList.add('active');
    }
}

/**
 * Update info panel with feature details
 */
function updateInfoPanel(feature, type) {
    const props = feature.properties || {};
    const container = document.getElementById('infoContent');

    let html = `
        <h5>${getFeatureName(feature)}</h5>
        <table class="table table-sm">
            <tbody>
                <tr><th>Tipe</th><td>${type}</td></tr>
    `;

    if (props.WADMPR) html += `<tr><th>Provinsi</th><td>${props.WADMPR}</td></tr>`;
    if (props.WADMKK) html += `<tr><th>Kabupaten/Kota</th><td>${props.WADMKK}</td></tr>`;
    if (props.WADMKC) html += `<tr><th>Kecamatan</th><td>${props.WADMKC}</td></tr>`;
    if (props.WADMKD) html += `<tr><th>Kelurahan/Desa</th><td>${props.WADMKD}</td></tr>`;
    if (props.KDPPUM) html += `<tr><th>Kode</th><td>${props.KDPPUM}</td></tr>`;
    if (props.LUAS) html += `<tr><th>Luas</th><td>${props.LUAS.toFixed(2)} km²</td></tr>`;

    html += '</tbody></table>';
    container.innerHTML = html;
}

/**
 * Zoom to specific province
 */
function zoomToProvinsi(index) {
    if (!provinsiData || !provinsiData.features[index]) return;

    const feature = provinsiData.features[index];

    // Create temporary layer to get bounds
    const tempLayer = L.geoJSON(feature);
    map.fitBounds(tempLayer.getBounds());

    updateInfoPanel(feature, 'Provinsi');
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Layer buttons
    document.getElementById('btnProvinsi').addEventListener('click', function() {
        clearAllLayers();
        displayProvinsiLayer();
    });

    document.getElementById('btnKabupaten').addEventListener('click', function() {
        clearAllLayers();
        displayKabupatenLayer();
        updateLayerButtons('kabupaten');
    });

    document.getElementById('btnBoth').addEventListener('click', function() {
        clearAllLayers();
        displayBothLayers();
    });

    // Load data button
    document.getElementById('btnLoadData').addEventListener('click', function() {
        loadGeoJSONData();
    });

    // Clear map button
    document.getElementById('btnClearMap').addEventListener('click', function() {
        clearAllLayers();
        document.getElementById('infoContent').innerHTML =
            '<p class="text-muted">Klik pada wilayah di peta untuk melihat informasi detail.</p>';
        document.getElementById('statSelected').textContent = '-';
    });

    // Reset view button
    document.getElementById('btnResetView').addEventListener('click', function() {
        map.setView(INDONESIA_CENTER, INDONESIA_ZOOM);
    });

    // Show all provinces button
    document.getElementById('btnShowAllProvinsi').addEventListener('click', function() {
        clearAllLayers();
        displayProvinsiLayer();
        map.setView(INDONESIA_CENTER, INDONESIA_ZOOM);
    });

    // Province filter
    document.getElementById('filterProvinsi').addEventListener('change', function() {
        const selectedProvinsi = this.value;
        clearAllLayers();

        if (selectedProvinsi) {
            displayKabupatenLayer(selectedProvinsi);
            updateLayerButtons('kabupaten');
        } else {
            displayProvinsiLayer();
        }
    });

    // Search functionality
    const searchInput = document.getElementById('searchWilayah');
    const searchDropdown = document.getElementById('searchDropdown');

    searchInput.addEventListener('input', function() {
        const query = this.value.toLowerCase().trim();

        if (query.length < 2) {
            searchDropdown.style.display = 'none';
            return;
        }

        const results = searchWilayah(query);
        displaySearchResults(results);
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (!searchInput.contains(e.target) && !searchDropdown.contains(e.target)) {
            searchDropdown.style.display = 'none';
        }
    });
}

/**
 * Search for wilayah
 */
function searchWilayah(query) {
    const results = [];

    // Search in provinsi
    if (provinsiData && provinsiData.features) {
        provinsiData.features.forEach((feature, index) => {
            const name = getFeatureName(feature).toLowerCase();
            if (name.includes(query)) {
                results.push({
                    type: 'provinsi',
                    name: getFeatureName(feature),
                    index: index,
                    feature: feature
                });
            }
        });
    }

    // Search in kabupaten (limit to avoid too many results)
    if (kabupatenData && kabupatenData.features) {
        let count = 0;
        kabupatenData.features.forEach((feature, index) => {
            if (count >= 10) return;

            const props = feature.properties || {};
            const searchFields = [
                props.NAMOBJ,
                props.WADMKK,
                props.WADMKC,
                props.WADMKD
            ].filter(Boolean).join(' ').toLowerCase();

            if (searchFields.includes(query)) {
                results.push({
                    type: 'kabupaten',
                    name: props.NAMOBJ || props.WADMKK || 'Unknown',
                    province: props.WADMPR,
                    index: index,
                    feature: feature
                });
                count++;
            }
        });
    }

    return results.slice(0, 15);
}

/**
 * Display search results in dropdown
 */
function displaySearchResults(results) {
    const dropdown = document.getElementById('searchDropdown');

    if (results.length === 0) {
        dropdown.innerHTML = '<div class="search-dropdown-item text-muted">Tidak ditemukan</div>';
        dropdown.style.display = 'block';
        return;
    }

    let html = '';
    results.forEach(result => {
        const typeLabel = result.type === 'provinsi' ?
            '<span class="badge bg-primary">Provinsi</span>' :
            '<span class="badge bg-warning text-dark">Kab/Kota</span>';

        const subtitle = result.province ? `<small class="text-muted"> - ${result.province}</small>` : '';

        html += `
            <div class="search-dropdown-item"
                 data-type="${result.type}"
                 data-index="${result.index}">
                ${typeLabel} ${result.name}${subtitle}
            </div>
        `;
    });

    dropdown.innerHTML = html;
    dropdown.style.display = 'block';

    // Add click handlers
    dropdown.querySelectorAll('.search-dropdown-item').forEach(item => {
        item.addEventListener('click', function() {
            const type = this.dataset.type;
            const index = parseInt(this.dataset.index);

            if (type === 'provinsi') {
                zoomToProvinsi(index);
            } else {
                zoomToKabupaten(index);
            }

            dropdown.style.display = 'none';
            document.getElementById('searchWilayah').value = '';
        });
    });
}

/**
 * Zoom to specific kabupaten
 */
function zoomToKabupaten(index) {
    if (!kabupatenData || !kabupatenData.features[index]) return;

    const feature = kabupatenData.features[index];

    // Create temporary layer to get bounds
    const tempLayer = L.geoJSON(feature);
    map.fitBounds(tempLayer.getBounds());

    // Highlight the feature
    clearAllLayers();

    const highlightLayer = L.geoJSON(feature, {
        style: {
            fillColor: '#ff7800',
            weight: 3,
            opacity: 1,
            color: '#333',
            fillOpacity: 0.7
        }
    }).addTo(map);

    updateInfoPanel(feature, 'Kabupaten/Kota');
}

/**
 * Clear all layers from map
 */
function clearAllLayers() {
    if (provinsiLayer) {
        map.removeLayer(provinsiLayer);
        provinsiLayer = null;
    }
    if (kabupatenLayer) {
        map.removeLayer(kabupatenLayer);
        kabupatenLayer = null;
    }
}

/**
 * Show loading overlay
 */
function showLoading() {
    document.getElementById('loadingOverlay').style.display = 'flex';
    document.getElementById('loadingSpinner').style.display = 'inline-block';
}

/**
 * Hide loading overlay
 */
function hideLoading() {
    document.getElementById('loadingOverlay').style.display = 'none';
    document.getElementById('loadingSpinner').style.display = 'none';
}
