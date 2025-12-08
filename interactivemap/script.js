// Welcome modal management - ALWAYS SHOW ON LOAD
function showWelcomeModal() {
    const modal = document.getElementById('welcome-modal');
    modal.classList.add('show');
}

function hideWelcomeModal() {
    const modal = document.getElementById('welcome-modal');
    modal.classList.remove('show');
}

// Simple coordinate system setup for GTA V Map
const CUSTOM_CRS = L.extend({}, L.CRS.Simple, {
    projection: L.Projection.LonLat,
    scale: function(zoom) {
        return Math.pow(2, zoom);
    },
    zoom: function(sc) {
        return Math.log(sc) / Math.log(2);
    },
    transformation: new L.Transformation(0.02072, 117.3, -0.0205, 172.8),
    infinite: true
});

// Initialize the map
var mymap = L.map('map', {
    crs: CUSTOM_CRS,
    minZoom: 1,
    maxZoom: 5,
    maxNativeZoom: 5,
    preferCanvas: true,
    center: [0, 0],
    zoom: 3,
    attributionControl: false,
    doubleClickZoom: false
});

// Create tile layers
var SateliteStyle = L.tileLayer('mapStyles/styleSatelite/{z}/{x}/{y}.jpg', {
    minZoom: 0,
    maxZoom: 8,
    noWrap: true,
    continuousWorld: false,
    attribution: 'GTA V Map',
    id: 'satellite'
});

var AtlasStyle = L.tileLayer('mapStyles/styleAtlas/{z}/{x}/{y}.jpg', {
    minZoom: 0,
    maxZoom: 5,
    noWrap: true,
    continuousWorld: false,
    attribution: 'GTA V Map',
    id: 'atlas'
});

var GridStyle = L.tileLayer('mapStyles/styleGrid/{z}/{x}/{y}.png', {
    minZoom: 0,
    maxZoom: 5,
    noWrap: true,
    continuousWorld: false,
    attribution: 'GTA V Map',
    id: 'grid'
});

// Get saved map layer from cookie or default to satellite
function getSavedMapLayer() {
    const savedLayer = getCookie('gtav_map_layer');
    return savedLayer || 'satellite';
}

// Set the saved map layer
function setMapLayer(layerId) {
    setCookie('gtav_map_layer', layerId, 365);
    
    // Remove all tile layers
    mymap.eachLayer(function(layer) {
        if (layer instanceof L.TileLayer) {
            mymap.removeLayer(layer);
        }
    });
    
    // Add the selected layer
    switch(layerId) {
        case 'atlas':
            AtlasStyle.addTo(mymap);
            break;
        case 'grid':
            GridStyle.addTo(mymap);
            break;
        case 'satellite':
        default:
            SateliteStyle.addTo(mymap);
            break;
    }
}

// Draggable panel functionality - FIXED VERSION
function initDraggablePanel() {
    const panel = document.getElementById('coord-input');
    const dragHandle = panel.querySelector('.drag-handle');
    const panelHeader = panel.querySelector('.panel-header');
    const toggleBtn = panel.querySelector('.panel-toggle');
    
    let isDragging = false;
    let startX, startY;
    let panelX = 20, panelY = 20; // Default position

    // Get panel position from cookie or use default
    const savedPosition = getCookie('gtav_panel_position');
    if (savedPosition && savedPosition.x && savedPosition.y) {
        panelX = savedPosition.x;
        panelY = savedPosition.y;
    }
    
    // Set initial position
    panel.style.left = panelX + 'px';
    panel.style.top = panelY + 'px';

    // Make entire header draggable (except buttons and inputs)
    panelHeader.addEventListener('mousedown', startDrag);
    dragHandle.addEventListener('mousedown', startDrag);

    // Toggle panel collapse
    toggleBtn.addEventListener('click', function() {
        panel.classList.toggle('collapsed');
        const icon = toggleBtn.querySelector('i');
        if (panel.classList.contains('collapsed')) {
            icon.className = 'fas fa-window-maximize';
            toggleBtn.title = 'Maximize';
        } else {
            icon.className = 'fas fa-window-minimize';
            toggleBtn.title = 'Minimize';
        }
        // Save panel state
        setCookie('gtav_panel_collapsed', panel.classList.contains('collapsed') ? 'true' : 'false', 365);
    });

    // Load panel collapsed state
    const isCollapsed = getCookie('gtav_panel_collapsed') === 'true';
    if (isCollapsed) {
        panel.classList.add('collapsed');
        const icon = toggleBtn.querySelector('i');
        icon.className = 'fas fa-window-maximize';
        toggleBtn.title = 'Maximize';
    }

    function startDrag(e) {
        // Don't drag if clicking on buttons or inputs
        if (e.target.closest('button') || e.target.closest('input')) {
            return;
        }
        
        e.preventDefault();
        e.stopPropagation();
        
        isDragging = true;
        startX = e.clientX - panelX;
        startY = e.clientY - panelY;
        
        panel.classList.add('dragging');
        dragHandle.style.cursor = 'grabbing';
        
        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', stopDrag);
    }

    function drag(e) {
        if (!isDragging) return;
        
        e.preventDefault();
        
        // Calculate new position
        let newX = e.clientX - startX;
        let newY = e.clientY - startY;
        
        // Boundary checking - keep panel within viewport
        const panelRect = panel.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        // Check boundaries
        if (newX < 10) newX = 10;
        if (newY < 10) newY = 10;
        if (newX + panelRect.width > viewportWidth - 10) {
            newX = viewportWidth - panelRect.width - 10;
        }
        if (newY + panelRect.height > viewportHeight - 10) {
            newY = viewportHeight - panelRect.height - 10;
        }
        
        // Update position
        panelX = newX;
        panelY = newY;
        
        panel.style.left = panelX + 'px';
        panel.style.top = panelY + 'px';
    }

    function stopDrag() {
        if (!isDragging) return;
        
        isDragging = false;
        panel.classList.remove('dragging');
        dragHandle.style.cursor = 'grab';
        
        // Save position to cookie
        setCookie('gtav_panel_position', {
            x: panelX,
            y: panelY
        }, 365);
        
        document.removeEventListener('mousemove', drag);
        document.removeEventListener('mouseup', stopDrag);
    }

    // Touch support for mobile
    panelHeader.addEventListener('touchstart', function(e) {
        if (e.target.closest('button') || e.target.closest('input')) {
            return;
        }
        
        e.preventDefault();
        const touch = e.touches[0];
        isDragging = true;
        startX = touch.clientX - panelX;
        startY = touch.clientY - panelY;
        
        panel.classList.add('dragging');
        
        document.addEventListener('touchmove', touchDrag, { passive: false });
        document.addEventListener('touchend', touchStop);
    }, { passive: false });

    function touchDrag(e) {
        if (!isDragging) return;
        
        e.preventDefault();
        const touch = e.touches[0];
        
        let newX = touch.clientX - startX;
        let newY = touch.clientY - startY;
        
        // Boundary checking
        const panelRect = panel.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        if (newX < 10) newX = 10;
        if (newY < 10) newY = 10;
        if (newX + panelRect.width > viewportWidth - 10) {
            newX = viewportWidth - panelRect.width - 10;
        }
        if (newY + panelRect.height > viewportHeight - 10) {
            newY = viewportHeight - panelRect.height - 10;
        }
        
        panelX = newX;
        panelY = newY;
        
        panel.style.left = panelX + 'px';
        panel.style.top = panelY + 'px';
    }

    function touchStop() {
        if (!isDragging) return;
        
        isDragging = false;
        panel.classList.remove('dragging');
        
        setCookie('gtav_panel_position', {
            x: panelX,
            y: panelY
        }, 365);
        
        document.removeEventListener('touchmove', touchDrag);
        document.removeEventListener('touchend', touchStop);
    }

    // Prevent text selection while dragging
    panelHeader.addEventListener('selectstart', function(e) {
        if (isDragging) {
            e.preventDefault();
        }
    });
}

// Create custom HTML markers using Font Awesome
function createBlipIcon(color = '#e74c3c') {
    return L.divIcon({
        className: 'custom-marker',
        html: `<div style="
            background: ${color};
            width: 20px;
            height: 20px;
            border-radius: 50%;
            border: 1px solid white;
            box-shadow: 0 0 4px rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 10px;
        "><i class="fas fa-map-marker-alt"></i></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 20],
        popupAnchor: [0, -20]
    });
}

function createSelectedIcon() {
    return L.divIcon({
        className: 'custom-marker selected',
        html: `<div style="
            background: #3498db;
            width: 26px;
            height: 26px;
            border-radius: 50%;
            border: 2px solid white;
            box-shadow: 0 0 6px rgba(52, 152, 219, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 12px;
            animation: markerPulse 1.5s infinite;
        "><i class="fas fa-map-pin"></i></div>`,
        iconSize: [26, 26],
        iconAnchor: [13, 26],
        popupAnchor: [0, -26]
    });
}

function createEditModeIcon() {
    return L.divIcon({
        className: 'custom-marker editable',
        html: `<div style="
            background: #3498db;
            width: 26px;
            height: 26px;
            border-radius: 50%;
            border: 2px solid #2ecc71;
            box-shadow: 0 0 8px rgba(46, 204, 113, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 12px;
            animation: markerPulse 1.5s infinite;
            cursor: move;
        "><i class="fas fa-arrows-alt"></i></div>`,
        iconSize: [26, 26],
        iconAnchor: [13, 26],
        popupAnchor: [0, -26]
    });
}

// Create layer groups
var ExampleGroup = L.layerGroup();
var SavedMarkersGroup = L.layerGroup();

// Cookie management functions
function setCookie(name, value, days = 365) {
    const d = new Date();
    d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = "expires=" + d.toUTCString();
    document.cookie = name + "=" + JSON.stringify(value) + ";" + expires + ";path=/";
}

function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) {
            const cookieValue = c.substring(nameEQ.length, c.length);
            try {
                return JSON.parse(cookieValue);
            } catch (e) {
                return cookieValue;
            }
        }
    }
    return null;
}

// Marker management
let savedMarkers = getCookie('gtav_saved_markers') || [];
let selectedMarker = null;
let isEditMode = false;
let doubleClickFeedback = null;

// Save a new marker
function saveMarker(x, y, name) {
    const markerData = {
        id: 'marker_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        x: parseFloat(x),
        y: parseFloat(y),
        name: name || `Marker ${savedMarkers.length + 1}`,
        timestamp: new Date().toISOString(),
        color: '#e74c3c'
    };

    savedMarkers.push(markerData);
    setCookie('gtav_saved_markers', savedMarkers);
    placeMarkerOnMap(markerData);
    updateMarkerList();
    return markerData;
}

// Update existing marker
function updateMarker(id, updates) {
    const index = savedMarkers.findIndex(m => m.id === id);
    if (index !== -1) {
        savedMarkers[index] = { ...savedMarkers[index], ...updates };
        setCookie('gtav_saved_markers', savedMarkers);
        
        SavedMarkersGroup.clearLayers();
        savedMarkers.forEach(marker => placeMarkerOnMap(marker));
        updateMarkerList();
        
        if (selectedMarker && selectedMarker.id === id) {
            selectedMarker = savedMarkers[index];
        }
        return savedMarkers[index];
    }
    return null;
}

// Delete a marker
function deleteMarker(id) {
    savedMarkers = savedMarkers.filter(marker => marker.id !== id);
    setCookie('gtav_saved_markers', savedMarkers);
    
    SavedMarkersGroup.clearLayers();
    savedMarkers.forEach(marker => placeMarkerOnMap(marker));
    updateMarkerList();
    
    if (selectedMarker && selectedMarker.id === id) {
        clearSelection();
    }
}

// Place marker on the map
function placeMarkerOnMap(markerData) {
    const isCurrentlySelected = selectedMarker && selectedMarker.id === markerData.id;
    const marker = L.marker([markerData.y, markerData.x], {
        icon: isCurrentlySelected && isEditMode ? createEditModeIcon() : 
               isCurrentlySelected ? createSelectedIcon() : createBlipIcon(markerData.color),
        draggable: isCurrentlySelected && isEditMode,
        autoPan: true
    }).addTo(SavedMarkersGroup);

    marker.markerData = markerData;

    const popupContent = `
        <div style="text-align: center; min-width: 160px;">
            <div style="font-weight: bold; font-size: 14px; margin-bottom: 5px;">${markerData.name}</div>
            <div style="font-size: 11px; color: #666; margin-bottom: 10px;">
                X: ${markerData.x.toFixed(2)} | Y: ${markerData.y.toFixed(2)}
            </div>
            <div style="display: flex; gap: 8px; justify-content: center;">
                <button onclick="selectMarker('${markerData.id}')" 
                        style="padding: 4px 8px; background: #3498db; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 11px;">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button onclick="deleteMarker('${markerData.id}')" 
                        style="padding: 4px 8px; background: #e74c3c; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 11px;">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        </div>
    `;

    marker.bindPopup(popupContent);

    marker.on('dragend', function(event) {
        if (!isEditMode) return;
        
        const newPos = event.target.getLatLng();
        updateMarker(markerData.id, {
            x: newPos.lng,
            y: newPos.lat
        });
        
        if (selectedMarker && selectedMarker.id === markerData.id) {
            document.getElementById('edit-x').value = newPos.lng.toFixed(2);
            document.getElementById('edit-y').value = newPos.lat.toFixed(2);
        }
    });

    marker.on('click', function() {
        selectMarker(markerData.id);
    });

    return marker;
}

// Update marker draggable state
function updateMarkerDraggableState() {
    const layers = SavedMarkersGroup._layers;
    for (const layerId in layers) {
        const marker = layers[layerId];
        if (marker.markerData) {
            const isSelected = selectedMarker && selectedMarker.id === marker.markerData.id;
            marker.dragging.disable();
            if (isSelected && isEditMode) {
                marker.dragging.enable();
                marker.setIcon(createEditModeIcon());
            } else if (isSelected) {
                marker.setIcon(createSelectedIcon());
            } else {
                marker.setIcon(createBlipIcon(marker.markerData.color));
            }
        }
    }
}

// Show visual feedback for double-click
function showDoubleClickFeedback(latlng) {
    if (doubleClickFeedback) {
        mymap.removeLayer(doubleClickFeedback);
    }
    
    doubleClickFeedback = L.circle(latlng, {
        color: '#3498db',
        fillColor: '#3498db',
        fillOpacity: 0.3,
        radius: 50
    }).addTo(mymap);
    
    setTimeout(() => {
        if (doubleClickFeedback) {
            mymap.removeLayer(doubleClickFeedback);
            doubleClickFeedback = null;
        }
    }, 1000);
}

// Handle map double-click
function handleMapDoubleClick(e) {
    const x = e.latlng.lng.toFixed(2);
    const y = e.latlng.lat.toFixed(2);
    
    showDoubleClickFeedback(e.latlng);
    hideInstructionTooltip();
    
    if (isEditMode) {
        document.getElementById('edit-x').value = x;
        document.getElementById('edit-y').value = y;
        showNotification(`Coordinates copied to edit form: X=${x}, Y=${y}`);
    } else {
        document.getElementById('coord-x').value = x;
        document.getElementById('coord-y').value = y;
        document.getElementById('marker-name').focus();
        showNotification(`Coordinates copied to form: X=${x}, Y=${y}`);
    }
}

// Show notification
function showNotification(message) {
    const existingNotification = document.querySelector('.coord-notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = 'coord-notification';
    notification.innerHTML = `
        <div style="
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #2ecc71;
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 1001;
            font-size: 14px;
            animation: slideIn 0.3s ease;
            display: flex;
            align-items: center;
            gap: 10px;
        ">
            <i class="fas fa-check-circle"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }
    }, 3000);
}

// Hide instruction tooltip
function hideInstructionTooltip() {
    const instruction = document.getElementById('map-instruction');
    if (instruction) {
        instruction.style.opacity = '0';
        instruction.style.transition = 'opacity 0.5s ease';
        setTimeout(() => {
            instruction.style.display = 'none';
        }, 500);
    }
}

// Select a marker
function selectMarker(id) {
    if (selectedMarker) {
        const prevMarker = getMarkerElement(selectedMarker.id);
        if (prevMarker) prevMarker.classList.remove('selected');
    }

    const marker = savedMarkers.find(m => m.id === id);
    if (marker) {
        selectedMarker = marker;
        
        const listItem = getMarkerElement(id);
        if (listItem) {
            listItem.classList.add('selected');
            listItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
        
        enterEditMode();
        updateMarkerDraggableState();
        
        const mapMarker = getMapMarker(id);
        if (mapMarker) {
            mapMarker.openPopup();
            mymap.setView([marker.y, marker.x], mymap.getZoom(), {
                animate: true,
                duration: 0.5
            });
        }
    }
}

// Helper function to get marker element from list
function getMarkerElement(id) {
    return document.querySelector(`.marker-item[data-id="${id}"]`);
}

// Helper function to get map marker by ID
function getMapMarker(id) {
    const layers = SavedMarkersGroup._layers;
    for (const layerId in layers) {
        if (layers[layerId].markerData && layers[layerId].markerData.id === id) {
            return layers[layerId];
        }
    }
    return null;
}

// Update marker list in sidebar
function updateMarkerList() {
    const markerList = document.getElementById('marker-list');
    
    if (savedMarkers.length === 0) {
        markerList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-map-marker-alt"></i>
                <p>No markers saved yet</p>
                <p style="font-size: 12px; margin-top: 5px;">Double-click the map to add coordinates</p>
            </div>
        `;
        return;
    }

    markerList.innerHTML = '';
    savedMarkers.forEach((marker) => {
        const markerItem = document.createElement('div');
        markerItem.className = 'marker-item';
        markerItem.dataset.id = marker.id;
        markerItem.innerHTML = `
            <div class="marker-header">
                <div class="marker-name">
                    <i class="fas fa-map-marker-alt" style="color: ${marker.color || '#e74c3c'}"></i>
                    ${marker.name}
                </div>
                <div class="marker-actions">
                    <button onclick="event.stopPropagation(); selectMarker('${marker.id}')" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="event.stopPropagation(); deleteMarker('${marker.id}')" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="marker-coords">
                X: ${marker.x.toFixed(2)} | Y: ${marker.y.toFixed(2)}
            </div>
        `;
        
        if (selectedMarker && selectedMarker.id === marker.id) {
            markerItem.classList.add('selected');
        }
        
        markerItem.onclick = () => selectMarker(marker.id);
        markerList.appendChild(markerItem);
    });
}

// Enter edit mode
function enterEditMode() {
    if (!selectedMarker) return;
    
    isEditMode = true;
    document.getElementById('normal-mode').style.display = 'none';
    document.getElementById('edit-mode').style.display = 'block';
    document.getElementById('coord-input').classList.add('edit-mode-indicator');
    
    document.getElementById('edit-name').value = selectedMarker.name;
    document.getElementById('edit-x').value = selectedMarker.x.toFixed(2);
    document.getElementById('edit-y').value = selectedMarker.y.toFixed(2);
    
    updateMarkerDraggableState();
    document.getElementById('edit-name').focus();
}

// Exit edit mode
function exitEditMode() {
    isEditMode = false;
    document.getElementById('normal-mode').style.display = 'block';
    document.getElementById('edit-mode').style.display = 'none';
    document.getElementById('coord-input').classList.remove('edit-mode-indicator');
    clearSelection();
}

// Clear selection
function clearSelection() {
    if (selectedMarker) {
        const listItem = getMarkerElement(selectedMarker.id);
        if (listItem) listItem.classList.remove('selected');
        
        const mapMarker = getMapMarker(selectedMarker.id);
        if (mapMarker) {
            mapMarker.closePopup();
        }
        
        selectedMarker = null;
    }
    
    updateMarkerDraggableState();
    exitEditMode();
}

// Event Listeners
document.getElementById('place-marker').addEventListener('click', function() {
    const x = document.getElementById('coord-x').value;
    const y = document.getElementById('coord-y').value;
    const name = document.getElementById('marker-name').value;

    if (!x || !y) {
        alert('Please enter both X and Y coordinates');
        return;
    }

    const markerData = saveMarker(x, y, name);
    
    document.getElementById('coord-x').value = '';
    document.getElementById('coord-y').value = '';
    document.getElementById('marker-name').value = '';
    
    selectMarker(markerData.id);
});

document.getElementById('save-edit').addEventListener('click', function() {
    if (!selectedMarker) return;
    
    const newName = document.getElementById('edit-name').value;
    const newX = document.getElementById('edit-x').value;
    const newY = document.getElementById('edit-y').value;
    
    if (!newName || !newX || !newY) {
        alert('Please fill all fields');
        return;
    }
    
    updateMarker(selectedMarker.id, {
        name: newName,
        x: parseFloat(newX),
        y: parseFloat(newY)
    });
    
    exitEditMode();
});

document.getElementById('cancel-edit').addEventListener('click', exitEditMode);

// Map double-click handler
mymap.on('dblclick', handleMapDoubleClick);

// Initialize example marker
L.marker([0, 0], {icon: createBlipIcon('#3498db')})
    .addTo(ExampleGroup)
    .bindPopup(`
        <div style="text-align: center; min-width: 180px;">
            <strong>Welcome to GTA V Map!</strong><br><br>
            <small>• Double-click anywhere on the map to copy coordinates</small><br>
            <small>• Drag markers to move them (edit mode only)</small><br>
            <small>• Click markers to edit them</small><br>
            <small>• Drag the control panel anywhere</small>
        </div>
    `);

// Load saved markers and show welcome modal on page load
window.addEventListener('load', function() {
    console.log('Loading saved markers:', savedMarkers.length);
    savedMarkers.forEach(marker => placeMarkerOnMap(marker));
    updateMarkerList();
    
    // Initialize draggable panel FIRST
    initDraggablePanel();
    
    // Set the saved map layer
    const savedLayer = getSavedMapLayer();
    setMapLayer(savedLayer);
    
    // Add layer groups to map
    ExampleGroup.addTo(mymap);
    SavedMarkersGroup.addTo(mymap);
    
    // Add layer control
    var layersControl = L.control.layers({
        "Satellite": SateliteStyle,
        "Atlas": AtlasStyle,
        "Grid": GridStyle
    }, {
        "Example Markers": ExampleGroup,
        "Saved Markers": SavedMarkersGroup
    }, {
        collapsed: false
    }).addTo(mymap);
    
    // Listen for layer changes to save the selection
    mymap.on('baselayerchange', function(e) {
        let layerId = 'satellite';
        if (e.name === 'Atlas') layerId = 'atlas';
        if (e.name === 'Grid') layerId = 'grid';
        setCookie('gtav_map_layer', layerId, 365);
    });
    
    // ALWAYS show welcome modal on load
    setTimeout(showWelcomeModal, 500);
    
    setTimeout(hideInstructionTooltip, 5000);
    
    // Modal event listeners
    document.getElementById('got-it-btn').addEventListener('click', hideWelcomeModal);
    document.querySelector('.close-modal').addEventListener('click', hideWelcomeModal);
    
    document.getElementById('welcome-modal').addEventListener('click', function(e) {
        if (e.target === this) {
            hideWelcomeModal();
        }
    });
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && document.getElementById('welcome-modal').classList.contains('show')) {
            hideWelcomeModal();
        }
    });
});

// Make functions globally accessible
window.selectMarker = selectMarker;
window.deleteMarker = deleteMarker;