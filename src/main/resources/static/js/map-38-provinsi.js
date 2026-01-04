/**
 * 38 Provinsi Indonesia Map Visualization
 * Supports: Provinsi, Kabupaten/Kota, Kecamatan, Kelurahan/Desa
 */

// Global variables
let map;
let currentGeoJsonLayer;
let provinsiData = null;
let kabupatenData = null; // This actually contains kelurahan-level data
let currentLayer = 'provinsi';

// Aggregated data
let aggregatedKabupaten = [];
let aggregatedKecamatan = [];

// Indonesia center coordinates
const INDONESIA_CENTER = [-2.5489, 118.0149];
const INDONESIA_ZOOM = 5;

// Color schemes
const COLORS = {
    provinsi: '#3388ff',
    kabupaten: '#ff7800',
    kecamatan: '#2ecc71',
    kelurahan: '#e74c3c'
};

// Color palette for provinces
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

// Initialize on page load
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
            <h6>Tingkat Administrasi</h6>
            <div class="legend-item">
                <span class="legend-color" style="background: ${COLORS.provinsi}"></span> Provinsi
            </div>
            <div class="legend-item">
                <span class="legend-color" style="background: ${COLORS.kabupaten}"></span> Kabupaten/Kota
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
 * Load GeoJSON data from static files
 */
function loadGeoJSONData() {
    showLoading();

    Promise.all([
        fetch('/json/provinsi-indonesia.json').then(res => res.json()),
        fetch('/json/kabupaten-indonesia.json').then(res => res.json())
    ])
    .then(([provinsi, kabupaten]) => {
        provinsiData = provinsi;
        kabupatenData = kabupaten;

        // Process aggregated data
        processAggregatedData();

        // Update statistics
        updateStatistics();

        // Populate filter dropdowns
        populateProvinsiFilter();

        // Display province list
        displayProvinsiList();

        // Load default layer
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
 * Process aggregated data for kabupaten and kecamatan
 */
function processAggregatedData() {
    if (!kabupatenData || !kabupatenData.features) return;

    const kabupatenMap = new Map();
    const kecamatanMap = new Map();

    kabupatenData.features.forEach(feature => {
        const props = feature.properties || {};
        const provinsi = props.WADMPR || '';
        const kabupaten = props.WADMKK || '';
        const kecamatan = props.WADMKC || '';

        // Aggregate kabupaten
        const kabKey = `${provinsi}|${kabupaten}`;
        if (kabupaten && !kabupatenMap.has(kabKey)) {
            kabupatenMap.set(kabKey, {
                provinsi: provinsi,
                nama: kabupaten,
                features: []
            });
        }
        if (kabupaten) {
            kabupatenMap.get(kabKey).features.push(feature);
        }

        // Aggregate kecamatan
        const kecKey = `${provinsi}|${kabupaten}|${kecamatan}`;
        if (kecamatan && !kecamatanMap.has(kecKey)) {
            kecamatanMap.set(kecKey, {
                provinsi: provinsi,
                kabupaten: kabupaten,
                nama: kecamatan,
                features: []
            });
        }
        if (kecamatan) {
            kecamatanMap.get(kecKey).features.push(feature);
        }
    });

    aggregatedKabupaten = Array.from(kabupatenMap.values());
    aggregatedKecamatan = Array.from(kecamatanMap.values());
}

/**
 * Update statistics panel
 */
function updateStatistics() {
    if (provinsiData && provinsiData.features) {
        document.getElementById('statProvinsi').textContent = provinsiData.features.length;
    }

    document.getElementById('statKabupaten').textContent = aggregatedKabupaten.length;
    document.getElementById('statKecamatan').textContent = aggregatedKecamatan.length;

    if (kabupatenData && kabupatenData.features) {
        document.getElementById('statKelurahan').textContent = kabupatenData.features.length;
    }
}

/**
 * Populate province filter dropdown
 */
function populateProvinsiFilter() {
    const select = document.getElementById('filterProvinsi');

    const provinces = new Set();
    if (kabupatenData && kabupatenData.features) {
        kabupatenData.features.forEach(feature => {
            if (feature.properties && feature.properties.WADMPR) {
                provinces.add(feature.properties.WADMPR);
            }
        });
    }

    Array.from(provinces).sort().forEach(name => {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        select.appendChild(option);
    });
}

/**
 * Populate kabupaten filter based on selected province
 */
function populateKabupatenFilter(provinsiName) {
    const select = document.getElementById('filterKabupaten');
    select.innerHTML = '<option value="">Semua Kabupaten/Kota</option>';

    if (!provinsiName) {
        select.disabled = true;
        return;
    }

    const kabupatenList = aggregatedKabupaten
        .filter(k => k.provinsi === provinsiName)
        .map(k => k.nama)
        .sort();

    kabupatenList.forEach(name => {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        select.appendChild(option);
    });

    select.disabled = false;
}

/**
 * Populate kecamatan filter based on selected kabupaten
 */
function populateKecamatanFilter(provinsiName, kabupatenName) {
    const select = document.getElementById('filterKecamatan');
    select.innerHTML = '<option value="">Semua Kecamatan</option>';

    if (!kabupatenName) {
        select.disabled = true;
        return;
    }

    const kecamatanList = aggregatedKecamatan
        .filter(k => k.provinsi === provinsiName && k.kabupaten === kabupatenName)
        .map(k => k.nama)
        .sort();

    kecamatanList.forEach(name => {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        select.appendChild(option);
    });

    select.disabled = false;
}

/**
 * Populate kelurahan filter based on selected kecamatan
 */
function populateKelurahanFilter(provinsiName, kabupatenName, kecamatanName) {
    const select = document.getElementById('filterKelurahan');
    select.innerHTML = '<option value="">Semua Kelurahan/Desa</option>';

    if (!kecamatanName) {
        select.disabled = true;
        return;
    }

    const kelurahanList = kabupatenData.features
        .filter(f => {
            const props = f.properties || {};
            return props.WADMPR === provinsiName &&
                   props.WADMKK === kabupatenName &&
                   props.WADMKC === kecamatanName;
        })
        .map(f => f.properties.WADMKD || f.properties.NAMOBJ)
        .filter(Boolean)
        .sort();

    [...new Set(kelurahanList)].forEach(name => {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        select.appendChild(option);
    });

    select.disabled = false;
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

    clearCurrentLayer();

    currentGeoJsonLayer = L.geoJSON(provinsiData, {
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
            layer.bindPopup(`<h6>${name}</h6><p><strong>Tipe:</strong> Provinsi</p>`);

            layer.on({
                mouseover: highlightFeature,
                mouseout: resetHighlight,
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
 * Display kabupaten layer based on filters
 */
function displayKabupatenLayer(filterProvinsi = null) {
    if (!kabupatenData) return;

    clearCurrentLayer();
    showLoading();

    let filteredFeatures;

    if (filterProvinsi) {
        // Get all kelurahan features for the province, then we'll style by kabupaten
        filteredFeatures = kabupatenData.features.filter(f =>
            f.properties && f.properties.WADMPR === filterProvinsi
        );
    } else {
        filteredFeatures = kabupatenData.features;
    }

    // Create a map of kabupaten to color
    const kabupatenColors = new Map();
    let colorIndex = 0;
    filteredFeatures.forEach(f => {
        const kab = f.properties.WADMKK;
        if (kab && !kabupatenColors.has(kab)) {
            kabupatenColors.set(kab, PROVINCE_COLORS[colorIndex % PROVINCE_COLORS.length]);
            colorIndex++;
        }
    });

    currentGeoJsonLayer = L.geoJSON({type: 'FeatureCollection', features: filteredFeatures}, {
        style: function(feature) {
            const kab = feature.properties.WADMKK;
            return {
                fillColor: kabupatenColors.get(kab) || COLORS.kabupaten,
                weight: 1,
                opacity: 1,
                color: 'white',
                fillOpacity: 0.5
            };
        },
        onEachFeature: function(feature, layer) {
            const props = feature.properties || {};
            layer.bindPopup(`
                <h6>${props.WADMKK || 'Unknown'}</h6>
                <p><strong>Provinsi:</strong> ${props.WADMPR || '-'}</p>
            `);

            layer.on({
                mouseover: highlightFeature,
                mouseout: resetHighlight,
                click: function(e) {
                    map.fitBounds(e.target.getBounds());
                    updateInfoPanel(feature, 'Kabupaten/Kota');
                }
            });
        }
    }).addTo(map);

    const uniqueKab = new Set(filteredFeatures.map(f => f.properties.WADMKK)).size;
    document.getElementById('statSelected').textContent = uniqueKab + ' Kab/Kota';
    currentLayer = 'kabupaten';
    updateLayerButtons('kabupaten');

    if (filteredFeatures.length > 0) {
        map.fitBounds(currentGeoJsonLayer.getBounds());
    }

    hideLoading();
}

/**
 * Display kecamatan layer based on filters
 */
function displayKecamatanLayer(filterProvinsi = null, filterKabupaten = null) {
    if (!kabupatenData) return;

    clearCurrentLayer();
    showLoading();

    let filteredFeatures = kabupatenData.features;

    if (filterProvinsi) {
        filteredFeatures = filteredFeatures.filter(f =>
            f.properties && f.properties.WADMPR === filterProvinsi
        );
    }

    if (filterKabupaten) {
        filteredFeatures = filteredFeatures.filter(f =>
            f.properties && f.properties.WADMKK === filterKabupaten
        );
    }

    // Create a map of kecamatan to color
    const kecamatanColors = new Map();
    let colorIndex = 0;
    filteredFeatures.forEach(f => {
        const kec = f.properties.WADMKC;
        if (kec && !kecamatanColors.has(kec)) {
            kecamatanColors.set(kec, PROVINCE_COLORS[colorIndex % PROVINCE_COLORS.length]);
            colorIndex++;
        }
    });

    currentGeoJsonLayer = L.geoJSON({type: 'FeatureCollection', features: filteredFeatures}, {
        style: function(feature) {
            const kec = feature.properties.WADMKC;
            return {
                fillColor: kecamatanColors.get(kec) || COLORS.kecamatan,
                weight: 1,
                opacity: 1,
                color: 'white',
                fillOpacity: 0.5
            };
        },
        onEachFeature: function(feature, layer) {
            const props = feature.properties || {};
            layer.bindPopup(`
                <h6>${props.WADMKC || 'Unknown'}</h6>
                <p><strong>Kabupaten:</strong> ${props.WADMKK || '-'}</p>
                <p><strong>Provinsi:</strong> ${props.WADMPR || '-'}</p>
            `);

            layer.on({
                mouseover: highlightFeature,
                mouseout: resetHighlight,
                click: function(e) {
                    map.fitBounds(e.target.getBounds());
                    updateInfoPanel(feature, 'Kecamatan');
                }
            });
        }
    }).addTo(map);

    const uniqueKec = new Set(filteredFeatures.map(f => f.properties.WADMKC)).size;
    document.getElementById('statSelected').textContent = uniqueKec + ' Kecamatan';
    currentLayer = 'kecamatan';
    updateLayerButtons('kecamatan');

    if (filteredFeatures.length > 0) {
        map.fitBounds(currentGeoJsonLayer.getBounds());
    }

    hideLoading();
}

/**
 * Display kelurahan layer based on filters
 */
function displayKelurahanLayer(filterProvinsi = null, filterKabupaten = null, filterKecamatan = null, filterKelurahan = null) {
    if (!kabupatenData) return;

    clearCurrentLayer();
    showLoading();

    let filteredFeatures = kabupatenData.features;

    if (filterProvinsi) {
        filteredFeatures = filteredFeatures.filter(f =>
            f.properties && f.properties.WADMPR === filterProvinsi
        );
    }

    if (filterKabupaten) {
        filteredFeatures = filteredFeatures.filter(f =>
            f.properties && f.properties.WADMKK === filterKabupaten
        );
    }

    if (filterKecamatan) {
        filteredFeatures = filteredFeatures.filter(f =>
            f.properties && f.properties.WADMKC === filterKecamatan
        );
    }

    if (filterKelurahan) {
        filteredFeatures = filteredFeatures.filter(f => {
            const props = f.properties || {};
            return (props.WADMKD === filterKelurahan || props.NAMOBJ === filterKelurahan);
        });
    }

    currentGeoJsonLayer = L.geoJSON({type: 'FeatureCollection', features: filteredFeatures}, {
        style: function(feature) {
            return {
                fillColor: COLORS.kelurahan,
                weight: 1,
                opacity: 1,
                color: 'white',
                fillOpacity: 0.5
            };
        },
        onEachFeature: function(feature, layer) {
            const props = feature.properties || {};
            const name = props.WADMKD || props.NAMOBJ || 'Unknown';
            layer.bindPopup(`
                <h6>${name}</h6>
                <table class="table table-sm mb-0">
                    <tr><td><strong>Kecamatan:</strong></td><td>${props.WADMKC || '-'}</td></tr>
                    <tr><td><strong>Kabupaten:</strong></td><td>${props.WADMKK || '-'}</td></tr>
                    <tr><td><strong>Provinsi:</strong></td><td>${props.WADMPR || '-'}</td></tr>
                    ${props.LUAS ? `<tr><td><strong>Luas:</strong></td><td>${props.LUAS.toFixed(2)} km²</td></tr>` : ''}
                </table>
            `);

            layer.on({
                mouseover: highlightFeature,
                mouseout: resetHighlight,
                click: function(e) {
                    map.fitBounds(e.target.getBounds());
                    updateInfoPanel(feature, 'Kelurahan/Desa');
                }
            });
        }
    }).addTo(map);

    document.getElementById('statSelected').textContent = filteredFeatures.length + ' Kelurahan';
    currentLayer = 'kelurahan';
    updateLayerButtons('kelurahan');

    if (filteredFeatures.length > 0) {
        map.fitBounds(currentGeoJsonLayer.getBounds());
    }

    hideLoading();
}

/**
 * Highlight feature on hover
 */
function highlightFeature(e) {
    const layer = e.target;
    layer.setStyle({
        weight: 3,
        color: '#333',
        fillOpacity: 0.7
    });
    layer.bringToFront();
}

/**
 * Reset highlight on mouseout
 */
function resetHighlight(e) {
    if (currentGeoJsonLayer) {
        currentGeoJsonLayer.resetStyle(e.target);
    }
}

/**
 * Update layer button states
 */
function updateLayerButtons(activeLayer) {
    document.querySelectorAll('.btn-layer').forEach(btn => {
        btn.classList.remove('active');
    });

    const btnId = 'btn' + activeLayer.charAt(0).toUpperCase() + activeLayer.slice(1);
    const btn = document.getElementById(btnId);
    if (btn) {
        btn.classList.add('active');
    }
}

/**
 * Update info panel with feature details
 */
function updateInfoPanel(feature, type) {
    const props = feature.properties || {};
    const container = document.getElementById('infoContent');

    const name = props.NAMOBJ || props.WADMKD || props.WADMKC || props.WADMKK || props.WADMPR || 'Unknown';

    let html = `
        <h5>${name}</h5>
        <table class="table table-sm">
            <tbody>
                <tr><th>Tipe</th><td>${type}</td></tr>
    `;

    if (props.WADMPR) html += `<tr><th>Provinsi</th><td>${props.WADMPR}</td></tr>`;
    if (props.WADMKK) html += `<tr><th>Kabupaten/Kota</th><td>${props.WADMKK}</td></tr>`;
    if (props.WADMKC) html += `<tr><th>Kecamatan</th><td>${props.WADMKC}</td></tr>`;
    if (props.WADMKD) html += `<tr><th>Kelurahan/Desa</th><td>${props.WADMKD}</td></tr>`;
    if (props.KDPPUM) html += `<tr><th>Kode Provinsi</th><td>${props.KDPPUM}</td></tr>`;
    if (props.KDPKAB) html += `<tr><th>Kode Kabupaten</th><td>${props.KDPKAB}</td></tr>`;
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
        clearFilters();
        displayProvinsiLayer();
    });

    document.getElementById('btnKabupaten').addEventListener('click', function() {
        const provinsi = document.getElementById('filterProvinsi').value;
        displayKabupatenLayer(provinsi || null);
    });

    document.getElementById('btnKecamatan').addEventListener('click', function() {
        const provinsi = document.getElementById('filterProvinsi').value;
        const kabupaten = document.getElementById('filterKabupaten').value;

        if (!provinsi) {
            alert('Pilih provinsi terlebih dahulu untuk melihat kecamatan');
            return;
        }

        displayKecamatanLayer(provinsi, kabupaten || null);
    });

    document.getElementById('btnKelurahan').addEventListener('click', function() {
        const provinsi = document.getElementById('filterProvinsi').value;
        const kabupaten = document.getElementById('filterKabupaten').value;
        const kecamatan = document.getElementById('filterKecamatan').value;

        if (!provinsi || !kabupaten) {
            alert('Pilih provinsi dan kabupaten terlebih dahulu untuk melihat kelurahan/desa');
            return;
        }

        displayKelurahanLayer(provinsi, kabupaten, kecamatan || null);
    });

    // Load data button
    document.getElementById('btnLoadData').addEventListener('click', loadBasedOnFilters);

    // Clear map button
    document.getElementById('btnClearMap').addEventListener('click', function() {
        clearCurrentLayer();
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
        clearFilters();
        displayProvinsiLayer();
        map.setView(INDONESIA_CENTER, INDONESIA_ZOOM);
    });

    // Clear filters button
    document.getElementById('btnClearFilters').addEventListener('click', clearFilters);

    // Province filter change
    document.getElementById('filterProvinsi').addEventListener('change', function() {
        const provinsi = this.value;
        populateKabupatenFilter(provinsi);
        resetKecamatanFilter();
        resetKelurahanFilter();

        if (provinsi && currentLayer !== 'provinsi') {
            loadBasedOnFilters();
        }
    });

    // Kabupaten filter change
    document.getElementById('filterKabupaten').addEventListener('change', function() {
        const provinsi = document.getElementById('filterProvinsi').value;
        const kabupaten = this.value;
        populateKecamatanFilter(provinsi, kabupaten);
        resetKelurahanFilter();

        if (kabupaten && (currentLayer === 'kecamatan' || currentLayer === 'kelurahan')) {
            loadBasedOnFilters();
        }
    });

    // Kecamatan filter change
    document.getElementById('filterKecamatan').addEventListener('change', function() {
        const provinsi = document.getElementById('filterProvinsi').value;
        const kabupaten = document.getElementById('filterKabupaten').value;
        const kecamatan = this.value;
        populateKelurahanFilter(provinsi, kabupaten, kecamatan);

        if (kecamatan && currentLayer === 'kelurahan') {
            loadBasedOnFilters();
        }
    });

    // Kelurahan filter change
    document.getElementById('filterKelurahan').addEventListener('change', function() {
        if (this.value && currentLayer === 'kelurahan') {
            loadBasedOnFilters();
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
 * Load layer based on current filters
 */
function loadBasedOnFilters() {
    const provinsi = document.getElementById('filterProvinsi').value;
    const kabupaten = document.getElementById('filterKabupaten').value;
    const kecamatan = document.getElementById('filterKecamatan').value;
    const kelurahan = document.getElementById('filterKelurahan').value;

    if (currentLayer === 'provinsi') {
        displayProvinsiLayer();
    } else if (currentLayer === 'kabupaten') {
        displayKabupatenLayer(provinsi || null);
    } else if (currentLayer === 'kecamatan') {
        displayKecamatanLayer(provinsi || null, kabupaten || null);
    } else if (currentLayer === 'kelurahan') {
        displayKelurahanLayer(provinsi || null, kabupaten || null, kecamatan || null, kelurahan || null);
    }
}

/**
 * Clear all filters
 */
function clearFilters() {
    document.getElementById('filterProvinsi').value = '';
    resetKabupatenFilter();
    resetKecamatanFilter();
    resetKelurahanFilter();
}

/**
 * Reset kabupaten filter
 */
function resetKabupatenFilter() {
    const select = document.getElementById('filterKabupaten');
    select.innerHTML = '<option value="">Pilih Provinsi Dulu</option>';
    select.disabled = true;
}

/**
 * Reset kecamatan filter
 */
function resetKecamatanFilter() {
    const select = document.getElementById('filterKecamatan');
    select.innerHTML = '<option value="">Pilih Kabupaten Dulu</option>';
    select.disabled = true;
}

/**
 * Reset kelurahan filter
 */
function resetKelurahanFilter() {
    const select = document.getElementById('filterKelurahan');
    select.innerHTML = '<option value="">Pilih Kecamatan Dulu</option>';
    select.disabled = true;
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

    // Search in kabupaten data (all levels)
    if (kabupatenData && kabupatenData.features) {
        const seen = new Set();
        let count = 0;

        kabupatenData.features.forEach((feature, index) => {
            if (count >= 15) return;

            const props = feature.properties || {};
            const searchFields = [
                props.NAMOBJ,
                props.WADMKK,
                props.WADMKC,
                props.WADMKD
            ].filter(Boolean);

            for (const field of searchFields) {
                if (field.toLowerCase().includes(query) && !seen.has(field)) {
                    seen.add(field);

                    let type = 'kelurahan';
                    if (field === props.WADMKK) type = 'kabupaten';
                    else if (field === props.WADMKC) type = 'kecamatan';

                    results.push({
                        type: type,
                        name: field,
                        province: props.WADMPR,
                        kabupaten: props.WADMKK,
                        kecamatan: props.WADMKC,
                        index: index,
                        feature: feature
                    });
                    count++;
                    break;
                }
            }
        });
    }

    return results.slice(0, 20);
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

    const typeLabels = {
        provinsi: '<span class="badge bg-primary">Provinsi</span>',
        kabupaten: '<span class="badge bg-warning text-dark">Kab/Kota</span>',
        kecamatan: '<span class="badge bg-success">Kecamatan</span>',
        kelurahan: '<span class="badge bg-danger">Kelurahan</span>'
    };

    let html = '';
    results.forEach((result, idx) => {
        const subtitle = result.province ? `<small class="text-muted d-block">${result.province}</small>` : '';

        html += `
            <div class="search-dropdown-item" data-idx="${idx}">
                ${typeLabels[result.type]} ${result.name}${subtitle}
            </div>
        `;
    });

    dropdown.innerHTML = html;
    dropdown.style.display = 'block';

    // Store results for click handling
    dropdown.searchResults = results;

    // Add click handlers
    dropdown.querySelectorAll('.search-dropdown-item').forEach(item => {
        item.addEventListener('click', function() {
            const idx = parseInt(this.dataset.idx);
            const result = dropdown.searchResults[idx];

            if (result.type === 'provinsi') {
                zoomToProvinsi(result.index);
            } else {
                // Set filters and display
                if (result.province) {
                    document.getElementById('filterProvinsi').value = result.province;
                    populateKabupatenFilter(result.province);
                }

                if (result.kabupaten) {
                    document.getElementById('filterKabupaten').value = result.kabupaten;
                    populateKecamatanFilter(result.province, result.kabupaten);
                }

                if (result.kecamatan && result.type !== 'kabupaten') {
                    document.getElementById('filterKecamatan').value = result.kecamatan;
                    populateKelurahanFilter(result.province, result.kabupaten, result.kecamatan);
                }

                // Zoom to feature
                const tempLayer = L.geoJSON(result.feature);
                map.fitBounds(tempLayer.getBounds());

                // Display appropriate layer
                if (result.type === 'kabupaten') {
                    displayKabupatenLayer(result.province);
                } else if (result.type === 'kecamatan') {
                    displayKecamatanLayer(result.province, result.kabupaten);
                } else {
                    displayKelurahanLayer(result.province, result.kabupaten, result.kecamatan);
                }

                updateInfoPanel(result.feature, result.type.charAt(0).toUpperCase() + result.type.slice(1));
            }

            dropdown.style.display = 'none';
            document.getElementById('searchWilayah').value = '';
        });
    });
}

/**
 * Clear current layer from map
 */
function clearCurrentLayer() {
    if (currentGeoJsonLayer) {
        map.removeLayer(currentGeoJsonLayer);
        currentGeoJsonLayer = null;
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
