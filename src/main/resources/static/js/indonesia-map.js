/**
 * Indonesian Administrative Boundary Map Visualization
 * Uses Leaflet.js and GeoJSON from Spring Boot backend
 */

// Global variables
let map;
let currentLayer;
let currentGeoJsonLayer;
let provinsiData = []; // Store all province data for search

// Indonesia center coordinates
const INDONESIA_CENTER = [-2.5489, 118.0149];
const INDONESIA_ZOOM = 5;

// Color scheme for different administrative levels
const COLORS = {
    provinsi: '#3388ff',
    kota: '#ff7800',
    kecamatan: '#2ecc71',
    kelurahan: '#e74c3c'
};

// Initialize map on page load
document.addEventListener('DOMContentLoaded', function() {
    initMap();
    loadProvinsiFilter();
    setupEventListeners();
});

/**
 * Initialize Leaflet map
 */
function initMap() {
    // Create map centered on Indonesia
    map = L.map('map').setView(INDONESIA_CENTER, INDONESIA_ZOOM);

    // Add OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18,
        minZoom: 4
    }).addTo(map);

    // Add scale control
    L.control.scale({
        position: 'bottomleft',
        imperial: false
    }).addTo(map);

    // Add custom legend
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
            <h6>Tingkat Administrasi</h6>
            <div class="legend-item">
                <span class="legend-color" style="background: ${COLORS.provinsi}"></span> Provinsi
            </div>
            <div class="legend-item">
                <span class="legend-color" style="background: ${COLORS.kota}"></span> Kabupaten/Kota
            </div>
            <div class="legend-item">
                <span class="legend-color" style="background: ${COLORS.kecamatan}"></span> Kecamatan
            </div>
            <div class="legend-item">
                <span class="legend-color" style="background: ${COLORS.kelurahan}"></span> Kelurahan/Desa
            </div>
        `;
        return div;
    };

    legend.addTo(map);
}

/**
 * Load province list for filter dropdown and search
 */
function loadProvinsiFilter() {
    fetch('/provinsi')
        .then(response => response.json())
        .then(data => {
            provinsiData = data; // Store for search functionality
            const select = document.getElementById('filterProvinsi');
            data.forEach(provinsi => {
                const option = document.createElement('option');
                option.value = provinsi.id;
                option.textContent = provinsi.nama;
                select.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Error loading provinces:', error);
            showError('Gagal memuat daftar provinsi');
        });
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Load boundaries button
    document.getElementById('btnLoadBoundaries').addEventListener('click', loadBoundaries);

    // Clear map button
    document.getElementById('btnClearMap').addEventListener('click', clearMap);

    // Reset view button
    document.getElementById('btnResetView').addEventListener('click', resetView);

    // Zoom to selection button
    document.getElementById('btnZoomToSelection').addEventListener('click', zoomToSelection);

    // Province search box
    document.getElementById('searchProvinsi').addEventListener('input', function() {
        searchProvinsi(this.value);
    });

    // Province filter change
    document.getElementById('filterProvinsi').addEventListener('change', function() {
        const provinsiId = this.value;
        if (provinsiId) {
            loadKotaFilter(provinsiId);
            document.getElementById('btnZoomToSelection').disabled = false;
        } else {
            resetKotaFilter();
            document.getElementById('btnZoomToSelection').disabled = true;
        }
    });

    // Kota filter change
    document.getElementById('filterKota').addEventListener('change', function() {
        const kotaId = this.value;
        if (kotaId) {
            loadKecamatanFilter(kotaId);
        } else {
            resetKecamatanFilter();
        }
    });

    // Kecamatan filter change
    document.getElementById('filterKecamatan').addEventListener('change', function() {
        const kecamatanId = this.value;
        if (kecamatanId) {
            loadKelurahanFilter(kecamatanId);
        } else {
            resetKelurahanFilter();
        }
    });

    // Admin level change - auto reload if boundaries already loaded
    document.getElementById('adminLevel').addEventListener('change', function() {
        if (currentGeoJsonLayer) {
            loadBoundaries();
        }
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', closeSearchDropdown);

    // Handle keyboard navigation in search box
    document.getElementById('searchProvinsi').addEventListener('keydown', handleSearchKeydown);
}

/**
 * Search province by name with autocomplete dropdown
 */
function searchProvinsi(query) {
    const searchResults = document.getElementById('searchResults');
    const dropdown = document.getElementById('searchDropdown');

    // Reset keyboard navigation
    selectedIndex = -1;

    if (!query || query.length < 1) {
        searchResults.textContent = '';
        dropdown.style.display = 'none';
        dropdown.innerHTML = '';
        return;
    }

    const results = provinsiData.filter(p =>
        p.nama.toLowerCase().includes(query.toLowerCase())
    );

    if (results.length === 0) {
        dropdown.innerHTML = '<div class="search-dropdown-empty">Tidak ada provinsi yang ditemukan</div>';
        dropdown.style.display = 'block';
        searchResults.textContent = '';
    } else {
        // Build dropdown items
        let html = '';
        results.forEach(provinsi => {
            html += `<div class="search-dropdown-item" data-id="${provinsi.id}" data-nama="${provinsi.nama}">
                        ${provinsi.nama}
                     </div>`;
        });
        dropdown.innerHTML = html;
        dropdown.style.display = 'block';

        // Add click handlers to dropdown items
        dropdown.querySelectorAll('.search-dropdown-item').forEach(item => {
            item.addEventListener('click', function() {
                selectProvinsiFromDropdown(this.dataset.id, this.dataset.nama);
            });
        });

        // Update search results text
        searchResults.textContent = `${results.length} provinsi ditemukan`;
        searchResults.className = 'form-text text-info';
    }
}

/**
 * Select province from autocomplete dropdown
 */
function selectProvinsiFromDropdown(id, nama) {
    // Set the search input value
    document.getElementById('searchProvinsi').value = nama;

    // Select in dropdown
    document.getElementById('filterProvinsi').value = id;
    document.getElementById('filterProvinsi').dispatchEvent(new Event('change'));

    // Hide dropdown
    document.getElementById('searchDropdown').style.display = 'none';

    // Update results text
    const searchResults = document.getElementById('searchResults');
    searchResults.textContent = `Terpilih: ${nama}`;
    searchResults.className = 'form-text text-success';
}

/**
 * Close autocomplete dropdown when clicking outside
 */
function closeSearchDropdown(event) {
    const searchInput = document.getElementById('searchProvinsi');
    const dropdown = document.getElementById('searchDropdown');

    if (event.target !== searchInput && !dropdown.contains(event.target)) {
        dropdown.style.display = 'none';
    }
}

/**
 * Handle keyboard navigation in search dropdown
 */
let selectedIndex = -1;

function handleSearchKeydown(event) {
    const dropdown = document.getElementById('searchDropdown');
    const items = dropdown.querySelectorAll('.search-dropdown-item');

    if (items.length === 0) return;

    switch(event.key) {
        case 'ArrowDown':
            event.preventDefault();
            selectedIndex = Math.min(selectedIndex + 1, items.length - 1);
            updateSelectedItem(items);
            break;

        case 'ArrowUp':
            event.preventDefault();
            selectedIndex = Math.max(selectedIndex - 1, 0);
            updateSelectedItem(items);
            break;

        case 'Enter':
            event.preventDefault();
            if (selectedIndex >= 0 && selectedIndex < items.length) {
                const item = items[selectedIndex];
                selectProvinsiFromDropdown(item.dataset.id, item.dataset.nama);
                selectedIndex = -1;
            }
            break;

        case 'Escape':
            event.preventDefault();
            dropdown.style.display = 'none';
            selectedIndex = -1;
            break;
    }
}

/**
 * Update selected item visual state
 */
function updateSelectedItem(items) {
    items.forEach((item, index) => {
        if (index === selectedIndex) {
            item.classList.add('selected');
            item.scrollIntoView({ block: 'nearest' });
        } else {
            item.classList.remove('selected');
        }
    });
}

/**
 * Load kota/kabupaten filter based on selected province
 */
function loadKotaFilter(provinsiId) {
    fetch(`/kota?province=${provinsiId}`)
        .then(response => response.json())
        .then(data => {
            const select = document.getElementById('filterKota');
            select.disabled = false;
            select.innerHTML = '<option value="">Semua Kabupaten/Kota</option>';

            data.forEach(kota => {
                const option = document.createElement('option');
                option.value = kota.id;
                option.textContent = kota.nama;
                select.appendChild(option);
            });

            // Reset child filters
            resetKecamatanFilter();
        })
        .catch(error => {
            console.error('Error loading kota:', error);
        });
}

/**
 * Load kecamatan filter based on selected kota
 */
function loadKecamatanFilter(kotaId) {
    fetch(`/kecamatan?kota=${kotaId}`)
        .then(response => response.json())
        .then(data => {
            const select = document.getElementById('filterKecamatan');
            select.disabled = false;
            select.innerHTML = '<option value="">Semua Kecamatan</option>';

            data.forEach(kecamatan => {
                const option = document.createElement('option');
                option.value = kecamatan.id;
                option.textContent = kecamatan.nama;
                select.appendChild(option);
            });

            // Reset child filter
            resetKelurahanFilter();
        })
        .catch(error => {
            console.error('Error loading kecamatan:', error);
        });
}

/**
 * Load kelurahan filter based on selected kecamatan
 */
function loadKelurahanFilter(kecamatanId) {
    fetch(`/kelurahan?kecamatan=${kecamatanId}`)
        .then(response => response.json())
        .then(data => {
            const select = document.getElementById('filterKelurahan');
            select.disabled = false;
            select.innerHTML = '<option value="">Semua Kelurahan/Desa</option>';

            data.forEach(kelurahan => {
                const option = document.createElement('option');
                option.value = kelurahan.id;
                option.textContent = kelurahan.nama;
                select.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Error loading kelurahan:', error);
        });
}

/**
 * Reset kota filter and its children
 */
function resetKotaFilter() {
    const select = document.getElementById('filterKota');
    select.disabled = true;
    select.innerHTML = '<option value="">Pilih Provinsi Terlebih Dahulu</option>';
    resetKecamatanFilter();
}

/**
 * Reset kecamatan filter and its children
 */
function resetKecamatanFilter() {
    const select = document.getElementById('filterKecamatan');
    select.disabled = true;
    select.innerHTML = '<option value="">Pilih Kota Terlebih Dahulu</option>';
    resetKelurahanFilter();
}

/**
 * Reset kelurahan filter
 */
function resetKelurahanFilter() {
    const select = document.getElementById('filterKelurahan');
    select.disabled = true;
    select.innerHTML = '<option value="">Pilih Kecamatan Terlebih Dahulu</option>';
}

/**
 * Load boundaries from API based on selected level and filters
 */
function loadBoundaries() {
    const level = document.getElementById('adminLevel').value;
    const provinsiId = document.getElementById('filterProvinsi').value;
    const kotaId = document.getElementById('filterKota').value;
    const kecamatanId = document.getElementById('filterKecamatan').value;
    const kelurahanId = document.getElementById('filterKelurahan').value;

    // Build API URL
    let apiUrl = `/api/map/${level}`;
    const params = new URLSearchParams();

    if (level === 'kota' && provinsiId) {
        params.append('provinsiId', provinsiId);
    } else if (level === 'kecamatan' && kotaId) {
        params.append('kotaId', kotaId);
    } else if (level === 'kelurahan' && kecamatanId) {
        params.append('kecamatanId', kecamatanId);
    }

    if (params.toString()) {
        apiUrl += '?' + params.toString();
    }

    // Show loading indicator
    showLoading();

    // Fetch GeoJSON data
    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(geojson => {
            displayBoundaries(geojson, level);
            hideLoading();
        })
        .catch(error => {
            console.error('Error loading boundaries:', error);
            hideLoading();
            showError('Gagal memuat batas wilayah. Pastikan data geometri tersedia di database.');
        });
}

/**
 * Display GeoJSON boundaries on map
 */
function displayBoundaries(geojson, level) {
    // Remove existing layer if present
    if (currentGeoJsonLayer) {
        map.removeLayer(currentGeoJsonLayer);
    }

    // Check if features exist
    if (!geojson.features || geojson.features.length === 0) {
        showError('Tidak ada data geometri untuk wilayah yang dipilih');
        return;
    }

    // Create GeoJSON layer with styling and interactivity
    currentGeoJsonLayer = L.geoJSON(geojson, {
        style: function(feature) {
            return {
                fillColor: COLORS[level],
                weight: 2,
                opacity: 1,
                color: 'white',
                dashArray: '3',
                fillOpacity: 0.5
            };
        },
        onEachFeature: function(feature, layer) {
            // Bind popup with boundary info
            const props = feature.properties;
            let popupContent = `
                <div class="boundary-popup">
                    <h6>${props.nama}</h6>
                    <table class="table table-sm">
                        <tr><td><strong>Kode:</strong></td><td>${props.kode}</td></tr>
                        <tr><td><strong>Tingkat:</strong></td><td>${props.level}</td></tr>
            `;

            // Add parent info if available
            if (props.provinsiNama) {
                popupContent += `<tr><td><strong>Provinsi:</strong></td><td>${props.provinsiNama}</td></tr>`;
            }
            if (props.kotaNama) {
                popupContent += `<tr><td><strong>Kota:</strong></td><td>${props.kotaNama}</td></tr>`;
            }
            if (props.kecamatanNama) {
                popupContent += `<tr><td><strong>Kecamatan:</strong></td><td>${props.kecamatanNama}</td></tr>`;
            }

            popupContent += `</table></div>`;

            layer.bindPopup(popupContent);

            // Highlight on hover
            layer.on({
                mouseover: function(e) {
                    const layer = e.target;
                    layer.setStyle({
                        weight: 3,
                        color: '#666',
                        fillOpacity: 0.7
                    });
                    layer.bringToFront();
                },
                mouseout: function(e) {
                    currentGeoJsonLayer.resetStyle(e.target);
                },
                click: function(e) {
                    updateInfoPanel(feature.properties);
                    map.fitBounds(e.target.getBounds());
                }
            });
        }
    }).addTo(map);

    // Fit map to boundaries
    map.fitBounds(currentGeoJsonLayer.getBounds());

    currentLayer = level;
}

/**
 * Update info panel with boundary details
 */
function updateInfoPanel(properties) {
    const infoContent = document.getElementById('infoContent');

    let html = `
        <h5>${properties.nama}</h5>
        <table class="table table-sm">
            <tbody>
                <tr><th>Kode</th><td>${properties.kode}</td></tr>
                <tr><th>ID</th><td>${properties.id}</td></tr>
                <tr><th>Tingkat</th><td>${properties.level}</td></tr>
    `;

    if (properties.provinsiNama) {
        html += `<tr><th>Provinsi</th><td>${properties.provinsiNama}</td></tr>`;
    }
    if (properties.kotaNama) {
        html += `<tr><th>Kabupaten/Kota</th><td>${properties.kotaNama}</td></tr>`;
    }
    if (properties.kecamatanNama) {
        html += `<tr><th>Kecamatan</th><td>${properties.kecamatanNama}</td></tr>`;
    }

    html += `
            </tbody>
        </table>
    `;

    infoContent.innerHTML = html;
}

/**
 * Clear all boundaries from map
 */
function clearMap() {
    if (currentGeoJsonLayer) {
        map.removeLayer(currentGeoJsonLayer);
        currentGeoJsonLayer = null;
        currentLayer = null;
    }

    document.getElementById('infoContent').innerHTML = '<p class="text-muted">Klik pada wilayah di peta untuk melihat informasi detail.</p>';
}

/**
 * Reset map view to Indonesia
 */
function resetView() {
    map.setView(INDONESIA_CENTER, INDONESIA_ZOOM);
}

/**
 * Show loading indicator
 */
function showLoading() {
    document.getElementById('loadingSpinner').style.display = 'inline-block';
    document.getElementById('btnLoadBoundaries').disabled = true;
}

/**
 * Hide loading indicator
 */
function hideLoading() {
    document.getElementById('loadingSpinner').style.display = 'none';
    document.getElementById('btnLoadBoundaries').disabled = false;
}

/**
 * Zoom to selected administrative boundary
 */
function zoomToSelection() {
    const provinsiId = document.getElementById('filterProvinsi').value;
    const kotaId = document.getElementById('filterKota').value;
    const kecamatanId = document.getElementById('filterKecamatan').value;
    const kelurahanId = document.getElementById('filterKelurahan').value;

    // Determine which level to load based on selection
    let level, id;
    if (kelurahanId) {
        level = 'kelurahan';
        id = kelurahanId;
    } else if (kecamatanId) {
        level = 'kecamatan';
        id = kecamatanId;
    } else if (kotaId) {
        level = 'kota';
        id = kotaId;
    } else if (provinsiId) {
        level = 'provinsi';
        id = provinsiId;
    } else {
        showError('Pilih wilayah terlebih dahulu');
        return;
    }

    // Fetch single boundary and zoom to it
    fetch(`/api/map/${level}`)
        .then(response => response.json())
        .then(geojson => {
            // Find the feature with matching ID
            const feature = geojson.features.find(f => f.properties.id == id);

            if (feature) {
                // Remove existing layer
                if (currentGeoJsonLayer) {
                    map.removeLayer(currentGeoJsonLayer);
                }

                // Add single feature
                currentGeoJsonLayer = L.geoJSON(feature, {
                    style: {
                        fillColor: COLORS[level],
                        weight: 3,
                        opacity: 1,
                        color: 'red',
                        dashArray: '3',
                        fillOpacity: 0.5
                    },
                    onEachFeature: function(feature, layer) {
                        const props = feature.properties;
                        let popupContent = `
                            <div class="boundary-popup">
                                <h6>${props.nama}</h6>
                                <table class="table table-sm">
                                    <tr><td><strong>Kode:</strong></td><td>${props.kode}</td></tr>
                                    <tr><td><strong>Tingkat:</strong></td><td>${props.level}</td></tr>
                                </table>
                            </div>
                        `;
                        layer.bindPopup(popupContent);
                    }
                }).addTo(map);

                // Zoom to feature
                map.fitBounds(currentGeoJsonLayer.getBounds());
                updateInfoPanel(feature.properties);
            } else {
                showError('Wilayah tidak ditemukan');
            }
        })
        .catch(error => {
            console.error('Error zooming to selection:', error);
            showError('Gagal memuat batas wilayah');
        });
}

/**
 * Show error message
 */
function showError(message) {
    alert(message);
}
