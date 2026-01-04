// DOM Elements
const wantedTextInput = document.getElementById('wantedText');
const bulletinToggle = document.getElementById('bulletinToggle');
const bulletinSelect = document.getElementById('bulletinSelect');
const nameToggle = document.getElementById('nameToggle');
const chargeInput = document.getElementById('charge');
const suspectNameInput = document.getElementById('suspectName');
const descriptionInput = document.getElementById('description');
const contactInput = document.getElementById('contact');
const detectiveInput = document.getElementById('detective');
const dateInput = document.getElementById('date');
const createdByInput = document.getElementById('createdBy');
const apbTextInput = document.getElementById('apbText');

// New Image Layout Elements
const imageLayoutSelect = document.getElementById('imageLayout');
const imageConfigArea = document.getElementById('imageConfigArea');
const imageConfigs = document.querySelectorAll('.image-config');

// Image Inputs
const mugshotUrlInput = document.getElementById('mugshotUrl');
const wideImageUrlInput = document.getElementById('wideImageUrl');

// Dynamic Images Elements
const multipleImagesList = document.getElementById('multipleImagesList');
const addImageBtn = document.getElementById('addImageBtn');
const imageCountDisplay = document.getElementById('imageCount');
const multipleImagesGrid = document.getElementById('multipleImagesGrid');

// Preview Elements
const bulletinContainer = document.getElementById('bulletinContainer');
const bulletinImage = document.getElementById('bulletinImage');
const pWanted = document.getElementById('pWanted');
const pCharge = document.getElementById('pCharge');
const pName = document.getElementById('pName');
const pDescription = document.getElementById('pDescription');
const pContact = document.getElementById('pContact');
const pDetective = document.getElementById('pDetective');
const pDate = document.getElementById('pDate');
const pApbText = document.getElementById('pApbText');
const pCreatedBy = document.getElementById('pCreatedBy');

// Image Containers
const mugshotContainer = document.getElementById('mugshotContainer');
const multipleContainer = document.getElementById('multipleContainer');
const wideContainer = document.getElementById('wideContainer');

// Image Elements
const mugshot = document.getElementById('mugshot');
const wideImage = document.getElementById('wideImage');

// Buttons
const generateBtn = document.getElementById('generateBtn');
const resetBtn = document.getElementById('resetBtn');
const downloadBtn = document.getElementById('downloadBtn');
const copyBtn = document.getElementById('copyBtn');
const templatesBtn = document.getElementById('templatesBtn');
const saveCurrentTemplateBtn = document.getElementById('saveCurrentTemplate');

// Template Modal Elements
const templatesModal = document.getElementById('templates-modal');
const templatesGrid = document.getElementById('templatesGrid');
const closeModalButtons = document.querySelectorAll('.close-modal');

// Image Editor Modal Elements
const imageEditorModal = document.getElementById('image-editor-modal');
const editorImage = document.getElementById('editorImage');
const aspectRatioSelect = document.getElementById('aspectRatio');
const rotateLeftBtn = document.getElementById('rotateLeft');
const rotateRightBtn = document.getElementById('rotateRight');
const flipHorizontalBtn = document.getElementById('flipHorizontal');
const flipVerticalBtn = document.getElementById('flipVertical');
const zoomInBtn = document.getElementById('zoomIn');
const zoomOutBtn = document.getElementById('zoomOut');
const zoomResetBtn = document.getElementById('zoomReset');
const cancelEditBtn = document.getElementById('cancelEdit');
const applyEditBtn = document.getElementById('applyEdit');
const editMugshotBtn = document.getElementById('editMugshotBtn');
const editWideImageBtn = document.getElementById('editWideImageBtn');

// Character Count Elements
const wantedCount = document.getElementById('wanted-count');
const chargeCount = document.getElementById('charge-count');
const nameCount = document.getElementById('name-count');
const descriptionCount = document.getElementById('description-count');
const contactCount = document.getElementById('contact-count');
const detectiveCount = document.getElementById('detective-count');
const dateCount = document.getElementById('date-count');
const apbTextCount = document.getElementById('apbtext-count');
const createdByCount = document.getElementById('createdby-count');

// Success Modal
const successMessage = document.getElementById('success-message');
const closeSuccess = document.getElementById('close-success');

// Dark Mode Toggle
const darkModeSwitch = document.getElementById('dark-mode-switch');

// Store image data URLs
let mugshotDataURL = null;
let wideImageDataURL = null;
let multipleImageDataURLs = {};
let currentBulletinImage = 'Bulletin.png'; // Default

// Store current editing image info
let currentEditingImage = {
    type: null, // 'mugshot', 'wide', or index for multiple
    inputElement: null,
    originalUrl: null,
    loadedDataURL: null
};

// Cropper instance
let cropper = null;

// Maximum number of multiple images (reduced to 3)
const MAX_MULTIPLE_IMAGES = 3;

// Templates storage
const TEMPLATES_STORAGE_KEY = 'apb_templates';

// Initialize character counts
function updateCharacterCounts() {
    wantedCount.textContent = wantedTextInput.value.length;
    chargeCount.textContent = chargeInput.value.length;
    nameCount.textContent = suspectNameInput.value.length;
    descriptionCount.textContent = descriptionInput.value.length;
    contactCount.textContent = contactInput.value.length;
    detectiveCount.textContent = detectiveInput.value.length;
    dateCount.textContent = dateInput.value.length;
    apbTextCount.textContent = apbTextInput.value.length;
    createdByCount.textContent = createdByInput.value.length;
}

// Validation functions
function validateField(input, type) {
    const value = input.value.trim();
    const fieldName = input.previousElementSibling?.textContent || 'This field';
    let isValid = true;
    let message = '';
    
    // Clear previous validation messages
    const existingMsg = input.nextElementSibling?.classList?.contains('validation-message');
    if (existingMsg) {
        input.nextElementSibling.remove();
    }
    
    if (input.hasAttribute('required') && !value) {
        isValid = false;
        message = `${fieldName} is required`;
    } else if (type === 'url' && value) {
        try {
            new URL(value);
        } catch (e) {
            isValid = false;
            message = 'Please enter a valid URL (e.g., https://example.com/image.jpg)';
        }
    } else if (type === 'name' && value) {
        // Name should have at least first and last name
        const nameParts = value.split(' ').filter(part => part.trim().length > 0);
        if (nameParts.length < 2) {
            isValid = false;
            message = 'Please enter full name (first and last name)';
        }
    }
    
    if (!isValid) {
        const validationMsg = document.createElement('div');
        validationMsg.className = 'validation-message error';
        validationMsg.textContent = message;
        input.parentNode.insertBefore(validationMsg, input.nextSibling);
        input.classList.add('invalid');
    } else {
        input.classList.remove('invalid');
    }
    
    return isValid;
}

function validateAllFields() {
    const validations = [
        validateField(wantedTextInput, 'text'),
        validateField(chargeInput, 'text'),
        validateField(suspectNameInput, 'name'),
        validateField(contactInput, 'text')
    ];
    
    // Validate image URLs based on layout
    const layout = imageLayoutSelect.value;
    if (layout === 'mugshot' && mugshotUrlInput.value.trim()) {
        validations.push(validateField(mugshotUrlInput, 'url'));
    } else if (layout === 'wide' && wideImageUrlInput.value.trim()) {
        validations.push(validateField(wideImageUrlInput, 'url'));
    } else if (layout === 'multiple') {
        const imageInputs = document.querySelectorAll('.multiple-image-url');
        imageInputs.forEach(input => {
            if (input.value.trim()) {
                validations.push(validateField(input, 'url'));
            }
        });
    }
    
    return validations.every(v => v);
}

// Convert suspect name to MDC URL format
function convertNameToMDCUrl(name) {
    if (!name || name.trim() === '') return null;
    
    // Remove extra spaces and split into parts
    const nameParts = name.trim().split(' ').filter(part => part !== '');
    
    if (nameParts.length < 2) return null;
    
    // Format: FirstName_Lastname.png
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join('_'); // Handle middle names
    
    return `https://mdc.gta.world/img/persons/${firstName}_${lastName}.png`;
}

// Check if name has changed and auto-fill mugshot URL
function handleSuspectNameChange() {
    const layout = imageLayoutSelect.value;
    const suspectName = suspectNameInput.value.trim();
    
    // Only auto-fill for single mugshot layout
    if (layout !== 'mugshot' || !suspectName) return;
    
    const mdcUrl = convertNameToMDCUrl(suspectName);
    
    if (mdcUrl) {
        // Check if the URL is already set to avoid unnecessary updates
        if (mugshotUrlInput.value !== mdcUrl) {
            mugshotUrlInput.value = mdcUrl;
            validateField(mugshotUrlInput, 'url');
            
            // Show notification
            showAutoFillNotification(`Auto-filled from GTA World MDC: ${suspectName}`);
            
            // Trigger image load
            setTimeout(() => handleMugshotInput(), 300);
        }
    }
}

// Show auto-fill notification
function showAutoFillNotification(message) {
    // Remove existing notification
    const existingNotification = document.querySelector('.auto-fill-notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create new notification
    const notification = document.createElement('div');
    notification.className = 'auto-fill-notification';
    notification.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>${message}</span>
    `;
    
    // Insert after mugshot URL input
    const mugshotFormGroup = mugshotUrlInput.closest('.form-group');
    if (mugshotFormGroup) {
        mugshotFormGroup.appendChild(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }
}

// Handle image layout selection
function handleImageLayoutChange() {
    const layout = imageLayoutSelect.value;
    
    // Hide all image configs
    imageConfigs.forEach(config => {
        config.style.display = 'none';
    });
    
    // Show selected config
    document.querySelector(`.image-config[data-layout="${layout}"]`).style.display = 'block';
    
    // Update preview layout
    updateImagePreviewLayout(layout);
    
    // Update add button state
    updateAddButtonState();
}

// Update image preview layout
function updateImagePreviewLayout(layout) {
    // Hide all containers
    mugshotContainer.style.display = 'none';
    multipleContainer.style.display = 'none';
    wideContainer.style.display = 'none';
    
    // Show selected container
    switch(layout) {
        case 'mugshot':
            mugshotContainer.style.display = 'block';
            break;
        case 'multiple':
            multipleContainer.style.display = 'block';
            updateMultipleImagesGrid();
            break;
        case 'wide':
            wideContainer.style.display = 'block';
            break;
        case 'none':
            // Nothing to show
            break;
    }
}

// Add new image input row
function addImageInput() {
    const rows = document.querySelectorAll('.dynamic-image-row');
    const currentCount = rows.length;
    
    // Check if we've reached the maximum
    if (currentCount >= MAX_MULTIPLE_IMAGES) {
        showValidationMessage(`Maximum of ${MAX_MULTIPLE_IMAGES} images reached.`, 'warning');
        return;
    }
    
    const newIndex = currentCount;
    
    const newRow = document.createElement('div');
    newRow.className = 'dynamic-image-row';
    newRow.setAttribute('data-index', newIndex);
    
    newRow.innerHTML = `
        <div class="input-with-button">
            <input type="text" class="multiple-image-url" placeholder="Image URL" data-index="${newIndex}">
            <button type="button" class="small-btn edit-image-btn" data-index="${newIndex}" title="Edit Image">
                <i class="fas fa-crop"></i>
            </button>
        </div>
        <button type="button" class="remove-image-btn" data-index="${newIndex}" title="Remove image">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    multipleImagesList.appendChild(newRow);
    updateImageCount();
    
    // Add event listeners to new input
    const newInput = newRow.querySelector('input');
    const editBtn = newRow.querySelector('.edit-image-btn');
    const removeBtn = newRow.querySelector('.remove-image-btn');
    
    let timeout;
    newInput.addEventListener('input', function() {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            validateField(this, 'url');
            handleMultipleImages();
        }, 800);
    });
    
    newInput.addEventListener('blur', () => {
        validateField(newInput, 'url');
        handleMultipleImages();
    });
    
    editBtn.addEventListener('click', function() {
        const index = parseInt(this.getAttribute('data-index'));
        openImageEditor('multiple', index, newInput);
    });
    
    removeBtn.addEventListener('click', function() {
        const index = parseInt(this.getAttribute('data-index'));
        removeImageInput(index);
    });
    
    // Update button states
    updateRemoveButtonStates();
    updateAddButtonState();
}

// Remove image input row
function removeImageInput(index) {
    const row = document.querySelector(`.dynamic-image-row[data-index="${index}"]`);
    if (!row) return;
    
    // Confirm removal if there's content
    const input = row.querySelector('input');
    if (input.value.trim() && document.querySelectorAll('.dynamic-image-row').length > 1) {
        if (!confirm('Remove this image? The URL will be lost.')) {
            return;
        }
    }
    
    row.remove();
    
    // Re-index remaining rows
    const rows = document.querySelectorAll('.dynamic-image-row');
    rows.forEach((row, newIndex) => {
        row.setAttribute('data-index', newIndex);
        const input = row.querySelector('input');
        input.setAttribute('data-index', newIndex);
        const editBtn = row.querySelector('.edit-image-btn');
        editBtn.setAttribute('data-index', newIndex);
        const btn = row.querySelector('.remove-image-btn');
        btn.setAttribute('data-index', newIndex);
    });
    
    // Remove data URL for this index
    delete multipleImageDataURLs[index];
    
    updateImageCount();
    handleMultipleImages();
    updateRemoveButtonStates();
    updateAddButtonState();
}

// Update image count display
function updateImageCount() {
    const count = document.querySelectorAll('.dynamic-image-row').length;
    const imageCountElement = document.getElementById('imageCount');
    if (imageCountElement) {
        imageCountElement.textContent = count;
        
        // Update display with max limit
        const displayText = `Current: <span id="imageCount">${count}</span> / ${MAX_MULTIPLE_IMAGES} images added`;
        imageCountDisplay.innerHTML = displayText;
        
        // Add warning if at max
        if (count >= MAX_MULTIPLE_IMAGES) {
            imageCountDisplay.innerHTML += ' <span class="max-limit">(MAX)</span>';
        }
    }
}

// Update remove button states (disable if only one remains)
function updateRemoveButtonStates() {
    const rows = document.querySelectorAll('.dynamic-image-row');
    const removeBtns = document.querySelectorAll('.remove-image-btn');
    
    if (rows.length <= 1) {
        removeBtns.forEach(btn => {
            btn.disabled = true;
            btn.title = "At least one image is required";
        });
    } else {
        removeBtns.forEach(btn => {
            btn.disabled = false;
            btn.title = "Remove image";
        });
    }
}

// Update add button state based on current count
function updateAddButtonState() {
    const layout = imageLayoutSelect.value;
    const rows = document.querySelectorAll('.dynamic-image-row');
    const currentCount = rows.length;
    
    if (layout === 'multiple') {
        if (currentCount >= MAX_MULTIPLE_IMAGES) {
            addImageBtn.disabled = true;
            addImageBtn.innerHTML = '<i class="fas fa-ban"></i> Maximum Reached';
            addImageBtn.title = `Maximum of ${MAX_MULTIPLE_IMAGES} images reached`;
        } else {
            addImageBtn.disabled = false;
            addImageBtn.innerHTML = '<i class="fas fa-plus"></i> Add Another Image';
            addImageBtn.title = `Add image (${MAX_MULTIPLE_IMAGES - currentCount} remaining)`;
        }
    }
}

// Update preview function
function updatePreview() {
    pWanted.textContent = wantedTextInput.value.toUpperCase() || 'WANTED';
    pCharge.textContent = chargeInput.value || 'CHARGE NOT SPECIFIED';
    
    // Update APB text
    pApbText.textContent = apbTextInput.value || 'APB';
    
    // Update suspect name based on toggle
    if (nameToggle.checked) {
        const suspectName = suspectNameInput.value.toUpperCase() || 'UNKNOWN SUSPECT';
        pName.textContent = suspectName;
        pName.style.display = 'block';
    } else {
        pName.textContent = '';
        pName.style.display = 'none';
    }
    
    pDescription.textContent = descriptionInput.value || 'No description provided.';
    pContact.textContent = contactInput.value || 'CONTACT INFORMATION NOT PROVIDED';
    pDetective.textContent = detectiveInput.value || 'Detective/Deputies Name Not Specified';
    pDate.textContent = dateInput.value || 'Date Not Specified';
    pCreatedBy.textContent = createdByInput.value || 'Created by SIB';
    
    // Update bulletin image visibility and source
    if (bulletinToggle.checked) {
        bulletinContainer.classList.remove('hidden');
        bulletinImage.src = currentBulletinImage;
    } else {
        bulletinContainer.classList.add('hidden');
    }
    
    // Update image layout
    updateImagePreviewLayout(imageLayoutSelect.value);
    
    updateCharacterCounts();
}

// Load image for editing with CORS proxy support
function loadImageForEditing(url) {
    return new Promise((resolve, reject) => {
        if (!url) {
            resolve(null);
            return;
        }
        
        // If already a data URL, return it
        if (url.startsWith('data:image')) {
            resolve(url);
            return;
        }
        
        // For local files like Bulletin.png, use direct URL
        if (url.includes('.png') && !url.includes('http')) {
            resolve(url);
            return;
        }
        
        // Check if it's a GTA World/MDC URL
        const isMDCImage = url.includes('gta.world') || url.includes('mdc.gta.world');
        
        // Always use CORS proxy for MDC images to avoid CORS issues
        const proxyUrl = isMDCImage ? 
            `https://corsproxy.io/?${encodeURIComponent(url)}` :
            url;
        
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        img.onload = function() {
            try {
                const canvas = document.createElement('canvas');
                canvas.width = img.naturalWidth;
                canvas.height = img.naturalHeight;
                const ctx = canvas.getContext('2d');
                
                // Draw white background first for transparency
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                
                // Draw the image
                ctx.drawImage(img, 0, 0);
                
                // Convert to data URL
                const dataURL = canvas.toDataURL('image/png');
                resolve(dataURL);
                
            } catch (error) {
                console.error('Error converting image to data URL:', error);
                reject(error);
            }
        };
        
        img.onerror = function() {
            console.error('Image load failed for editing:', url);
            reject(new Error('Failed to load image'));
        };
        
        img.src = proxyUrl;
    });
}

// Convert any image to data URL (for preview)
function imageToDataURL(url) {
    return new Promise((resolve) => {
        if (!url) {
            resolve(null);
            return;
        }
        
        // If already a data URL, return it
        if (url.startsWith('data:image')) {
            resolve(url);
            return;
        }
        
        // For local files like Bulletin.png, use direct URL
        if (url.includes('.png') && !url.includes('http')) {
            resolve(url);
            return;
        }
        
        // Check if it's a GTA World URL
        if (url.includes('gta.world') || url.includes('mdc.gta.world')) {
            // Try with CORS proxy for MDC images
            const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
            const img = new Image();
            img.crossOrigin = 'anonymous';
            
            img.onload = function() {
                try {
                    const canvas = document.createElement('canvas');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    const ctx = canvas.getContext('2d');
                    
                    // Draw white background first
                    ctx.fillStyle = '#ffffff';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    
                    ctx.drawImage(img, 0, 0);
                    resolve(canvas.toDataURL('image/png'));
                } catch (error) {
                    console.log('Direct conversion failed for MDC image');
                    resolve(null);
                }
            };
            
            img.onerror = function() {
                console.log('MDC image load failed, trying fallback');
                resolve(null);
            };
            
            img.src = proxyUrl;
            return;
        }
        
        // For other URLs, try to convert
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        img.onload = function() {
            try {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                
                // Draw white background first
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                
                ctx.drawImage(img, 0, 0);
                resolve(canvas.toDataURL('image/png'));
            } catch (error) {
                console.log('Could not convert to data URL:', error);
                resolve(url);
            }
        };
        
        img.onerror = function() {
            console.log('Image load failed:', url);
            resolve(null);
        };
        
        img.src = url;
    });
}

// Handle mugshot URL input
async function handleMugshotInput() {
    const url = mugshotUrlInput.value.trim();
    const layout = imageLayoutSelect.value;
    
    if (layout !== 'mugshot' || !url) {
        mugshot.style.display = 'none';
        mugshot.src = '';
        mugshotDataURL = null;
        return;
    }
    
    mugshot.style.display = 'block';
    mugshot.src = '';
    
    try {
        mugshotDataURL = await imageToDataURL(url);
        
        if (mugshotDataURL) {
            mugshot.src = mugshotDataURL;
            mugshot.style.display = 'block';
        } else {
            mugshot.style.display = 'none';
        }
    } catch (error) {
        console.error('Error handling mugshot:', error);
        mugshot.style.display = 'none';
        mugshotDataURL = null;
    }
}

// Handle wide image URL input
async function handleWideImageInput() {
    const url = wideImageUrlInput.value.trim();
    const layout = imageLayoutSelect.value;
    
    if (layout !== 'wide' || !url) {
        wideImage.style.display = 'none';
        wideImage.src = '';
        wideImageDataURL = null;
        return;
    }
    
    wideImage.style.display = 'block';
    wideImage.src = '';
    
    try {
        wideImageDataURL = await imageToDataURL(url);
        
        if (wideImageDataURL) {
            wideImage.src = wideImageDataURL;
            wideImage.style.display = 'block';
        } else {
            wideImage.style.display = 'none';
        }
    } catch (error) {
        console.error('Error handling wide image:', error);
        wideImage.style.display = 'none';
        wideImageDataURL = null;
    }
}

// Update multiple images grid in preview
function updateMultipleImagesGrid() {
    if (!multipleImagesGrid) return;
    
    // Clear existing grid items
    multipleImagesGrid.innerHTML = '';
    
    // Get all image inputs with values
    const imageInputs = document.querySelectorAll('.multiple-image-url');
    const validImages = Array.from(imageInputs)
        .map((input, index) => ({
            index,
            url: input.value.trim(),
            dataURL: multipleImageDataURLs[index]
        }))
        .filter(img => img.url || img.dataURL);
    
    const imageCount = validImages.length;
    
    // Set grid class based on image count
    multipleImagesGrid.className = 'image-grid';
    if (imageCount > 0) {
        multipleImagesGrid.classList.add(`grid-${Math.min(imageCount, 3)}`);
    }
    
    // Create grid items
    validImages.forEach((img, i) => {
        const gridItem = document.createElement('div');
        gridItem.className = 'grid-item';
        gridItem.setAttribute('data-index', i);
        
        // Add image number badge
        const numberBadge = document.createElement('span');
        numberBadge.className = 'image-number';
        numberBadge.textContent = i + 1;
        gridItem.appendChild(numberBadge);
        
        const imgElement = document.createElement('img');
        imgElement.id = `gridImage${i}`;
        imgElement.alt = `Image ${i + 1}`;
        
        if (img.dataURL) {
            imgElement.src = img.dataURL;
            imgElement.style.display = 'block';
        } else {
            imgElement.style.display = 'none';
        }
        
        gridItem.appendChild(imgElement);
        multipleImagesGrid.appendChild(gridItem);
    });
}

// Handle multiple image URLs
async function handleMultipleImages() {
    const layout = imageLayoutSelect.value;
    if (layout !== 'multiple') return;
    
    // Clear data URLs
    multipleImageDataURLs = {};
    
    // Get all image inputs
    const imageInputs = document.querySelectorAll('.multiple-image-url');
    const promises = Array.from(imageInputs).map(async (input, index) => {
        const url = input.value.trim();
        if (!url) return;
        
        try {
            const dataURL = await imageToDataURL(url);
            if (dataURL) {
                multipleImageDataURLs[index] = dataURL;
            }
        } catch (error) {
            console.error(`Error loading image ${index + 1}:`, error);
        }
    });
    
    await Promise.all(promises);
    updateMultipleImagesGrid();
}

// Templates Management
function loadTemplates() {
    const templates = JSON.parse(localStorage.getItem(TEMPLATES_STORAGE_KEY)) || [];
    return templates;
}

function saveTemplates(templates) {
    localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(templates));
}

function renderTemplates() {
    const templates = loadTemplates();
    templatesGrid.innerHTML = '';
    
    if (templates.length === 0) {
        templatesGrid.innerHTML = `
            <div class="no-templates">
                <i class="fas fa-folder-open fa-3x"></i>
                <p>No templates saved yet</p>
                <p class="hint">Save your current configuration as a template for future use</p>
            </div>
        `;
        return;
    }
    
    templates.forEach((template, index) => {
        const templateCard = document.createElement('div');
        templateCard.className = 'template-card';
        
        const previewText = template.suspectName ? 
            `${template.wantedText} - ${template.suspectName}` : 
            template.wantedText;
        
        templateCard.innerHTML = `
            <div class="template-header">
                <h3 class="template-name">${template.name}</h3>
                <span class="template-date">${new Date(template.date).toLocaleDateString()}</span>
            </div>
            <div class="template-preview">
                ${previewText}<br>
                ${template.charge.substring(0, 50)}${template.charge.length > 50 ? '...' : ''}
            </div>
            <div class="template-actions">
                <button type="button" class="small-btn load-template-btn" data-index="${index}">
                    <i class="fas fa-check"></i> Load
                </button>
                <button type="button" class="small-btn delete-template-btn" data-index="${index}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        templatesGrid.appendChild(templateCard);
    });
    
    // Add event listeners
    document.querySelectorAll('.load-template-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            loadTemplate(index);
        });
    });
    
    document.querySelectorAll('.delete-template-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            deleteTemplate(index);
        });
    });
}

function saveCurrentAsTemplate() {
    const templateName = prompt('Enter a name for this template:', `APB Template ${new Date().toLocaleDateString()}`);
    
    if (!templateName) return;
    
    // Get current form data
    const template = {
        name: templateName,
        date: new Date().toISOString(),
        wantedText: wantedTextInput.value,
        bulletinToggle: bulletinToggle.checked,
        bulletinSelect: bulletinSelect.value,
        nameToggle: nameToggle.checked,
        suspectName: suspectNameInput.value,
        charge: chargeInput.value,
        description: descriptionInput.value,
        contact: contactInput.value,
        detective: detectiveInput.value,
        dateValue: dateInput.value,
        createdBy: createdByInput.value,
        apbText: apbTextInput.value,
        imageLayout: imageLayoutSelect.value,
        mugshotUrl: mugshotUrlInput.value,
        wideImageUrl: wideImageUrlInput.value,
        multipleImages: Array.from(document.querySelectorAll('.multiple-image-url')).map(input => input.value)
    };
    
    const templates = loadTemplates();
    templates.push(template);
    saveTemplates(templates);
    
    renderTemplates();
    showValidationMessage(`Template "${templateName}" saved successfully!`, 'success');
}

function loadTemplate(index) {
    const templates = loadTemplates();
    const template = templates[index];
    
    if (!template) return;
    
    // Load form data
    wantedTextInput.value = template.wantedText;
    bulletinToggle.checked = template.bulletinToggle;
    bulletinSelect.value = template.bulletinSelect;
    nameToggle.checked = template.nameToggle;
    suspectNameInput.value = template.suspectName;
    chargeInput.value = template.charge;
    descriptionInput.value = template.description;
    contactInput.value = template.contact;
    detectiveInput.value = template.detective;
    dateInput.value = template.dateValue;
    createdByInput.value = template.createdBy;
    apbTextInput.value = template.apbText;
    imageLayoutSelect.value = template.imageLayout;
    mugshotUrlInput.value = template.mugshotUrl;
    wideImageUrlInput.value = template.wideImageUrl;
    
    // Load multiple images
    multipleImagesList.innerHTML = '';
    template.multipleImages.forEach((url, i) => {
        if (i === 0) {
            const firstInput = multipleImagesList.querySelector('input');
            if (firstInput) {
                firstInput.value = url;
            }
        } else {
            addImageInput();
            const inputs = document.querySelectorAll('.multiple-image-url');
            if (inputs[i]) {
                inputs[i].value = url;
            }
        }
    });
    
    // Update everything
    handleImageLayoutChange();
    handleMugshotInput();
    handleWideImageInput();
    handleMultipleImages();
    updatePreview();
    
    // Close modal
    templatesModal.classList.remove('visible');
    
    showValidationMessage(`Template "${template.name}" loaded successfully!`, 'success');
}

function deleteTemplate(index) {
    if (!confirm('Are you sure you want to delete this template?')) return;
    
    const templates = loadTemplates();
    templates.splice(index, 1);
    saveTemplates(templates);
    
    renderTemplates();
    showValidationMessage('Template deleted successfully!', 'success');
}

// Image Editor Functions
function openImageEditor(type, index = null, inputElement = null) {
    let imageUrl = '';
    
    if (type === 'mugshot') {
        imageUrl = mugshotUrlInput.value.trim();
        currentEditingImage.inputElement = mugshotUrlInput;
    } else if (type === 'wide') {
        imageUrl = wideImageUrlInput.value.trim();
        currentEditingImage.inputElement = wideImageUrlInput;
    } else if (type === 'multiple' && index !== null) {
        const input = document.querySelector(`.multiple-image-url[data-index="${index}"]`);
        if (input) {
            imageUrl = input.value.trim();
            currentEditingImage.inputElement = input;
        }
    }
    
    if (!imageUrl) {
        showValidationMessage('Please enter an image URL first', 'warning');
        return;
    }
    
    currentEditingImage.type = type;
    currentEditingImage.index = index;
    currentEditingImage.originalUrl = imageUrl; // Store original URL
    
    // Reset editor image
    editorImage.src = '';
    editorImage.style.display = 'none';
    
    // Clear any existing cropper
    if (cropper) {
        cropper.destroy();
        cropper = null;
    }
    
    // Show loading state
    showValidationMessage('Loading image for editing...', 'warning');
    
    // Load image through CORS proxy for MDC/GTA World images
    loadImageForEditing(imageUrl).then(dataURL => {
        if (!dataURL) {
            showValidationMessage('Failed to load image for editing. Please check the URL or try a different image.', 'error');
            return;
        }
        
        editorImage.src = dataURL;
        editorImage.style.display = 'block';
        
        // Store the data URL for later use
        currentEditingImage.loadedDataURL = dataURL;
        
        // Initialize cropper after image is displayed
        setTimeout(() => {
            if (cropper) {
                cropper.destroy();
            }
            
            cropper = new Cropper(editorImage, {
                viewMode: 2,
                dragMode: 'crop',
                autoCropArea: 1,
                restore: false,
                guides: true,
                center: true,
                highlight: true,
                cropBoxMovable: true,
                cropBoxResizable: true,
                toggleDragModeOnDblclick: false,
                aspectRatio: NaN,
                checkCrossOrigin: false, // Important: Disable cross-origin check
                ready: function() {
                    console.log('Cropper is ready for editing');
                    
                    // Update image info
                    const naturalWidth = editorImage.naturalWidth;
                    const naturalHeight = editorImage.naturalHeight;
                    document.getElementById('imageInfo').textContent = 
                        `Original size: ${naturalWidth}×${naturalHeight}`;
                }
            });
            
            // Set aspect ratio from select
            const ratio = aspectRatioSelect.value;
            if (ratio !== 'free') {
                const [x, y] = ratio.split(':').map(Number);
                cropper.setAspectRatio(x / y);
            }
            
            imageEditorModal.classList.add('visible');
            
        }, 100);
        
    }).catch(error => {
        console.error('Error loading image for editing:', error);
        showValidationMessage('Failed to load image. The image may have CORS restrictions.', 'error');
    });
}

function closeImageEditor() {
    if (cropper) {
        cropper.destroy();
        cropper = null;
    }
    imageEditorModal.classList.remove('visible');
    editorImage.src = '';
    editorImage.style.display = 'none';
    currentEditingImage = {
        type: null,
        inputElement: null,
        originalUrl: null,
        loadedDataURL: null
    };
}

function applyImageEdit() {
    if (!cropper) {
        showValidationMessage('No image to save. Please crop an image first.', 'warning');
        return;
    }
    
    try {
        // Get cropped canvas
        const canvas = cropper.getCroppedCanvas({
            width: 800,
            height: 800,
            fillColor: '#fff',
            imageSmoothingEnabled: true,
            imageSmoothingQuality: 'high'
        });
        
        if (!canvas) {
            showValidationMessage('Could not get cropped image. Please try again.', 'error');
            return;
        }
        
        // Convert to data URL
        const dataURL = canvas.toDataURL('image/png');
        
        // Store in the appropriate data URL variable
        if (currentEditingImage.type === 'mugshot') {
            mugshotDataURL = dataURL;
            mugshot.src = dataURL;
            mugshot.style.display = 'block';
            
            // Always store as data URL for edited images
            mugshotUrlInput.value = dataURL;
            
        } else if (currentEditingImage.type === 'wide') {
            wideImageDataURL = dataURL;
            wideImage.src = dataURL;
            wideImage.style.display = 'block';
            
            // Always store as data URL for edited images
            wideImageUrlInput.value = dataURL;
            
        } else if (currentEditingImage.type === 'multiple') {
            const index = currentEditingImage.index;
            multipleImageDataURLs[index] = dataURL;
            
            // Update the specific grid image
            const gridImage = document.getElementById(`gridImage${index}`);
            if (gridImage) {
                gridImage.src = dataURL;
                gridImage.style.display = 'block';
            }
            
            // Update the input with data URL
            if (currentEditingImage.inputElement) {
                currentEditingImage.inputElement.value = dataURL;
            }
            
            updateMultipleImagesGrid();
        }
        
        showValidationMessage('Image edited successfully!', 'success');
        closeImageEditor();
        
    } catch (error) {
        console.error('Error applying image edit:', error);
        showValidationMessage('Error saving edited image. Please try again.', 'error');
    }
}

// Modal Management
function openTemplatesModal() {
    renderTemplates();
    templatesModal.classList.add('visible');
}

function closeAllModals() {
    templatesModal.classList.remove('visible');
    imageEditorModal.classList.remove('visible');
    if (cropper) {
        cropper.destroy();
        cropper = null;
    }
    editorImage.src = '';
    editorImage.style.display = 'none';
}

// Show validation message
function showValidationMessage(message, type = 'success') {
    // Remove existing messages
    const existingMessages = document.querySelectorAll('.validation-message.global');
    existingMessages.forEach(msg => msg.remove());
    
    const validationMsg = document.createElement('div');
    validationMsg.className = `validation-message ${type} global`;
    validationMsg.textContent = message;
    validationMsg.style.position = 'fixed';
    validationMsg.style.top = '80px';
    validationMsg.style.right = '20px';
    validationMsg.style.zIndex = '1000';
    validationMsg.style.maxWidth = '300px';
    
    document.body.appendChild(validationMsg);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (validationMsg.parentNode) {
            validationMsg.remove();
        }
    }, 5000);
}

// Wait for all images to load
function waitForImages() {
    return new Promise((resolve) => {
        const images = document.querySelectorAll('#poster img');
        let loadedCount = 0;
        const totalImages = images.length;
        
        if (totalImages === 0) {
            resolve();
            return;
        }
        
        images.forEach(img => {
            if (img.complete) {
                loadedCount++;
                if (loadedCount === totalImages) resolve();
            } else {
                img.onload = function() {
                    loadedCount++;
                    if (loadedCount === totalImages) resolve();
                };
                img.onerror = function() {
                    loadedCount++;
                    if (loadedCount === totalImages) resolve();
                };
            }
        });
        
        setTimeout(resolve, 5000);
    });
}

// Create a cloned poster with data URLs
function createPosterClone() {
    const original = document.getElementById('poster');
    const clone = original.cloneNode(true);
    const layout = imageLayoutSelect.value;
    
    // Update images in clone
    if (bulletinToggle.checked) {
        const bulletinContainer = clone.querySelector('.bulletin-image-container');
        if (bulletinContainer) {
            bulletinContainer.classList.remove('hidden');
            bulletinContainer.style.display = 'block';
            
            const bulletinImg = clone.querySelector('.bulletin-image');
            if (bulletinImg) {
                bulletinImg.src = currentBulletinImage;
                bulletinImg.style.display = 'block';
                bulletinImg.style.width = '100%';
                bulletinImg.style.height = 'auto';
            }
        }
    } else {
        const bulletinContainer = clone.querySelector('.bulletin-image-container');
        if (bulletinContainer) {
            bulletinContainer.style.display = 'none';
        }
    }
    
    // Update images based on layout
    switch(layout) {
        case 'mugshot':
            if (mugshotDataURL) {
                const mugshotImg = clone.querySelector('#mugshot');
                if (mugshotImg) {
                    mugshotImg.src = mugshotDataURL;
                    mugshotImg.style.display = 'block';
                    mugshotImg.style.width = '200px';
                    mugshotImg.style.height = '200px';
                }
            }
            break;
            
        case 'multiple':
            const gridContainer = clone.querySelector('.multiple-layout');
            if (gridContainer) {
                gridContainer.style.display = 'block';
                
                // Get all image inputs
                const imageInputs = document.querySelectorAll('.multiple-image-url');
                const grid = clone.querySelector('.image-grid');
                if (grid) {
                    grid.innerHTML = '';
                    
                    const validImages = Array.from(imageInputs).filter((input, index) => {
                        const url = input.value.trim();
                        return url && multipleImageDataURLs[index];
                    });
                    
                    // Set grid class
                    const imageCount = validImages.length;
                    grid.className = 'image-grid';
                    if (imageCount > 0) {
                        grid.classList.add(`grid-${Math.min(imageCount, 3)}`);
                    }
                    
                    validImages.forEach((input, index) => {
                        if (!multipleImageDataURLs[index]) return;
                        
                        const gridItem = document.createElement('div');
                        gridItem.className = 'grid-item';
                        
                        // Add image number badge
                        const numberBadge = document.createElement('span');
                        numberBadge.className = 'image-number';
                        numberBadge.textContent = index + 1;
                        gridItem.appendChild(numberBadge);
                        
                        const img = document.createElement('img');
                        img.src = multipleImageDataURLs[index];
                        img.style.display = 'block';
                        img.style.width = '100%';
                        img.style.height = '100%';
                        img.style.objectFit = 'cover';
                        
                        gridItem.appendChild(img);
                        grid.appendChild(gridItem);
                    });
                }
            }
            break;
            
        case 'wide':
            if (wideImageDataURL) {
                const wideImg = clone.querySelector('#wideImage');
                if (wideImg) {
                    wideImg.src = wideImageDataURL;
                    wideImg.style.display = 'block';
                    wideImg.style.width = '100%';
                    wideImg.style.maxHeight = '250px';
                }
            }
            break;
            
        case 'none':
            // Hide all image containers
            const imageContainers = clone.querySelectorAll('.image-container');
            imageContainers.forEach(container => {
                container.style.display = 'none';
            });
            break;
    }
    
    // Update name visibility in clone
    const nameElement = clone.querySelector('#pName');
    if (nameElement) {
        if (nameToggle.checked) {
            nameElement.style.display = 'block';
            nameElement.textContent = suspectNameInput.value.toUpperCase() || 'UNKNOWN SUSPECT';
        } else {
            nameElement.style.display = 'none';
            nameElement.textContent = '';
        }
    }
    
    // Update APB text in clone
    const apbTextElement = clone.querySelector('#pApbText');
    if (apbTextElement) {
        apbTextElement.textContent = apbTextInput.value || 'APB';
    }
    
    // Style the clone for capture
    clone.style.position = 'absolute';
    clone.style.left = '-9999px';
    clone.style.top = '0';
    clone.style.width = '600px';
    clone.style.background = '#eaeaea';
    clone.style.visibility = 'visible';
    clone.style.opacity = '1';
    clone.style.zIndex = '9999';
    
    return clone;
}

// Main function to generate APB Poster
async function generateAPBPoster() {
    // Validate fields first
    if (!validateAllFields()) {
        showValidationMessage('Please fix the validation errors before generating the poster.', 'error');
        return;
    }
    
    const originalText = generateBtn.innerHTML;
    generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
    generateBtn.disabled = true;
    
    try {
        await waitForImages();
        
        const clone = createPosterClone();
        document.body.appendChild(clone);
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const canvas = await html2canvas(clone, {
            scale: 2,
            backgroundColor: '#eaeaea',
            logging: false,
            useCORS: true,
            allowTaint: true,
            imageTimeout: 15000
        });
        
        document.body.removeChild(clone);
        
        const link = document.createElement('a');
        const fileName = `apb-poster-${new Date().getTime()}.png`;
        link.download = fileName;
        link.href = canvas.toDataURL('image/png');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        successMessage.classList.add('visible');
        
    } catch (error) {
        console.error('Error generating poster:', error);
        
        try {
            const canvas = await html2canvas(document.getElementById('poster'), {
                scale: 2,
                backgroundColor: '#eaeaea',
                logging: false,
                useCORS: true,
                allowTaint: true,
                imageTimeout: 15000
            });
            
            const link = document.createElement('a');
            const fileName = `apb-poster-${new Date().getTime()}.png`;
            link.download = fileName;
            link.href = canvas.toDataURL('image/png');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            successMessage.classList.add('visible');
            
        } catch (fallbackError) {
            console.error('Fallback also failed:', fallbackError);
            showValidationMessage('Error generating poster. Please try:\n\n1. Using Chrome browser\n2. Running from a local web server\n3. Making sure bulletin images are in the same folder\n4. Trying a different image URL', 'error');
        }
    } finally {
        generateBtn.innerHTML = originalText;
        generateBtn.disabled = false;
    }
}

// Set up event listeners for real-time preview
function setupEventListeners() {
    wantedTextInput.addEventListener('input', function() {
        validateField(this, 'text');
        updatePreview();
    });
    
    bulletinToggle.addEventListener('change', updatePreview);
    nameToggle.addEventListener('change', updatePreview);
    
    chargeInput.addEventListener('input', function() {
        validateField(this, 'text');
        updatePreview();
    });
    
    suspectNameInput.addEventListener('input', function() {
        validateField(this, 'name');
        updatePreview();
    });
    
    descriptionInput.addEventListener('input', updatePreview);
    
    contactInput.addEventListener('input', function() {
        validateField(this, 'text');
        updatePreview();
    });
    
    detectiveInput.addEventListener('input', updatePreview);
    dateInput.addEventListener('input', updatePreview);
    apbTextInput.addEventListener('input', updatePreview);
    createdByInput.addEventListener('input', updatePreview);
    
    // Handle bulletin selection change
    bulletinSelect.addEventListener('change', function() {
        currentBulletinImage = this.value;
        updatePreview();
    });
    
    // New image layout listeners
    imageLayoutSelect.addEventListener('change', function() {
        handleImageLayoutChange();
        updatePreview();
    });
    
    // Handle suspect name change for auto-fill
    let nameTimeout;
    suspectNameInput.addEventListener('input', function() {
        clearTimeout(nameTimeout);
        nameTimeout = setTimeout(() => {
            handleSuspectNameChange();
            updatePreview();
        }, 800);
    });
    
    suspectNameInput.addEventListener('blur', () => {
        handleSuspectNameChange();
        updatePreview();
    });
    
    // Handle wide image URL input
    let wideImageTimeout;
    wideImageUrlInput.addEventListener('input', function() {
        clearTimeout(wideImageTimeout);
        wideImageTimeout = setTimeout(() => {
            validateField(this, 'url');
            handleWideImageInput();
        }, 800);
    });
    wideImageUrlInput.addEventListener('blur', function() {
        validateField(this, 'url');
        handleWideImageInput();
    });
    
    // Handle mugshot URL input
    let mugshotTimeout;
    mugshotUrlInput.addEventListener('input', function() {
        clearTimeout(mugshotTimeout);
        mugshotTimeout = setTimeout(() => {
            validateField(this, 'url');
            handleMugshotInput();
        }, 800);
    });
    mugshotUrlInput.addEventListener('blur', function() {
        validateField(this, 'url');
        handleMugshotInput();
    });
    
    // Add image button
    addImageBtn.addEventListener('click', addImageInput);
    
    // Set up initial dynamic image inputs
    const initialInput = document.querySelector('.multiple-image-url');
    const initialEditBtn = document.querySelector('.edit-image-btn');
    const initialRemoveBtn = document.querySelector('.remove-image-btn');
    
    let initialTimeout;
    if (initialInput) {
        initialInput.addEventListener('input', function() {
            clearTimeout(initialTimeout);
            initialTimeout = setTimeout(() => {
                validateField(this, 'url');
                handleMultipleImages();
            }, 800);
        });
        
        initialInput.addEventListener('blur', function() {
            validateField(this, 'url');
            handleMultipleImages();
        });
    }
    
    if (initialEditBtn) {
        initialEditBtn.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            openImageEditor('multiple', index, initialInput);
        });
    }
    
    if (initialRemoveBtn) {
        initialRemoveBtn.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            removeImageInput(index);
        });
    }
    
    // Image editor buttons
    editMugshotBtn.addEventListener('click', () => openImageEditor('mugshot'));
    editWideImageBtn.addEventListener('click', () => openImageEditor('wide'));
    
    // Image editor controls
    aspectRatioSelect.addEventListener('change', function() {
        if (!cropper) return;
        const ratio = this.value;
        if (ratio === 'free') {
            cropper.setAspectRatio(NaN);
        } else {
            const [x, y] = ratio.split(':').map(Number);
            cropper.setAspectRatio(x / y);
        }
    });
    
    rotateLeftBtn.addEventListener('click', () => {
        if (cropper) cropper.rotate(-90);
    });
    
    rotateRightBtn.addEventListener('click', () => {
        if (cropper) cropper.rotate(90);
    });
    
    flipHorizontalBtn.addEventListener('click', () => {
        if (cropper) {
            const data = cropper.getData();
            cropper.scaleX(-data.scaleX || -1);
        }
    });
    
    flipVerticalBtn.addEventListener('click', () => {
        if (cropper) {
            const data = cropper.getData();
            cropper.scaleY(-data.scaleY || -1);
        }
    });
    
    zoomInBtn.addEventListener('click', () => {
        if (cropper) cropper.zoom(0.1);
    });
    
    zoomOutBtn.addEventListener('click', () => {
        if (cropper) cropper.zoom(-0.1);
    });
    
    zoomResetBtn.addEventListener('click', () => {
        if (cropper) cropper.reset();
    });
    
    // Apply and Cancel buttons
    applyEditBtn.addEventListener('click', applyImageEdit);
    cancelEditBtn.addEventListener('click', closeImageEditor);
    
    // Template buttons
    templatesBtn.addEventListener('click', openTemplatesModal);
    saveCurrentTemplateBtn.addEventListener('click', saveCurrentAsTemplate);
    
    // Modal close buttons
    closeModalButtons.forEach(btn => {
        btn.addEventListener('click', closeAllModals);
    });
    
    // Close modal on ESC key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeAllModals();
        }
    });
    
    // Close modal on outside click
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            closeAllModals();
        }
    });
    
    // Initial button states
    updateRemoveButtonStates();
    updateAddButtonState();
}

// Download as PNG
downloadBtn.addEventListener('click', generateAPBPoster);
generateBtn.addEventListener('click', generateAPBPoster);

// Copy APB text
copyBtn.addEventListener('click', function() {
    let apbText = `${pWanted.textContent}\n${pCharge.textContent}\n\n`;
    
    if (nameToggle.checked) {
        apbText += `SUSPECT: ${pName.textContent}\n\n`;
    }
    
    apbText += `${pDescription.textContent}\n\nAny information, please contact:\n${pContact.textContent}\nATTENTION: ${pDetective.textContent}\n\n${pDate.textContent} | ${pApbText.textContent} | ${pCreatedBy.textContent}`;
    
    navigator.clipboard.writeText(apbText).then(() => {
        const originalText = copyBtn.innerHTML;
        copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
        copyBtn.style.backgroundColor = '#28a745';
        
        setTimeout(() => {
            copyBtn.innerHTML = originalText;
            copyBtn.style.backgroundColor = '';
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy text: ', err);
        showValidationMessage('Failed to copy text to clipboard. Please try again.', 'error');
    });
});

// Reset form
resetBtn.addEventListener('click', function() {
    if (confirm('Are you sure you want to reset the form? All data will be lost.')) {
        wantedTextInput.value = 'WANTED';
        bulletinToggle.checked = true;
        nameToggle.checked = true;
        chargeInput.value = 'FA 201. CAPITAL MURDER';
        suspectNameInput.value = '';
        descriptionInput.value = '';
        contactInput.value = 'HOMICIDE BUREAU • PH: ######';
        detectiveInput.value = '';
        dateInput.value = 'Friday, December 5, 2025';
        createdByInput.value = 'Created by SIB';
        apbTextInput.value = 'APB';
        
        // Reset image layout
        imageLayoutSelect.value = 'mugshot';
        mugshotUrlInput.value = '';
        wideImageUrlInput.value = '';
        
        // Reset multiple images (keep only one empty input)
        multipleImagesList.innerHTML = `
            <div class="dynamic-image-row" data-index="0">
                <div class="input-with-button">
                    <input type="text" class="multiple-image-url" placeholder="Image URL" data-index="0">
                    <button type="button" class="small-btn edit-image-btn" data-index="0" title="Edit Image">
                        <i class="fas fa-crop"></i>
                    </button>
                </div>
                <button type="button" class="remove-image-btn" data-index="0" title="Remove image">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        // Reset preview images
        mugshot.src = '';
        mugshot.style.display = 'none';
        wideImage.src = '';
        wideImage.style.display = 'none';
        
        if (multipleImagesGrid) {
            multipleImagesGrid.innerHTML = '';
            multipleImagesGrid.className = 'image-grid';
        }
        
        // Reset data URLs
        mugshotDataURL = null;
        wideImageDataURL = null;
        multipleImageDataURLs = {};
        
        currentBulletinImage = 'Bulletin.png';
        bulletinSelect.value = 'Bulletin.png';
        
        // Re-setup event listeners for dynamic images
        const initialInput = multipleImagesList.querySelector('.multiple-image-url');
        const initialEditBtn = multipleImagesList.querySelector('.edit-image-btn');
        const initialRemoveBtn = multipleImagesList.querySelector('.remove-image-btn');
        
        if (initialInput && initialEditBtn && initialRemoveBtn) {
            let initialTimeout;
            initialInput.addEventListener('input', function() {
                clearTimeout(initialTimeout);
                initialTimeout = setTimeout(() => {
                    validateField(this, 'url');
                    handleMultipleImages();
                }, 800);
            });
            
            initialInput.addEventListener('blur', function() {
                validateField(this, 'url');
                handleMultipleImages();
            });
            
            initialEditBtn.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                openImageEditor('multiple', index, initialInput);
            });
            
            initialRemoveBtn.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                removeImageInput(index);
            });
        }
        
        // Clear validation messages
        document.querySelectorAll('.validation-message').forEach(msg => msg.remove());
        document.querySelectorAll('.invalid').forEach(el => el.classList.remove('invalid'));
        
        // Update layout
        updateImageCount();
        updateRemoveButtonStates();
        updateAddButtonState();
        handleImageLayoutChange();
        updatePreview();
    }
});

// Close success modal
closeSuccess.addEventListener('click', function() {
    successMessage.classList.remove('visible');
});

// Dark mode toggle
function toggleDarkMode() {
    if (darkModeSwitch.checked) {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
    }
}

// Check for saved theme preference
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
    darkModeSwitch.checked = true;
    document.documentElement.setAttribute('data-theme', 'dark');
} else {
    document.documentElement.setAttribute('data-theme', 'light');
}

darkModeSwitch.addEventListener('change', toggleDarkMode);

// Initialize everything on page load
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    updatePreview();
    updateImageCount();
    updateAddButtonState();
    
    // Initialize image layout
    handleImageLayoutChange();
    
    // Load initial bulletin image
    bulletinImage.src = currentBulletinImage;
    bulletinImage.onerror = function() {
        console.warn('Bulletin image not found:', currentBulletinImage);
    };
    
    console.log('APB Generator with templates and image editing initialized successfully');
});