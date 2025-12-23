// DOM Elements
const wantedTextInput = document.getElementById('wantedText');
const bulletinToggle = document.getElementById('bulletinToggle');
const chargeInput = document.getElementById('charge');
const suspectNameInput = document.getElementById('suspectName');
const descriptionInput = document.getElementById('description');
const contactInput = document.getElementById('contact');
const detectiveInput = document.getElementById('detective');
const dateInput = document.getElementById('date');
const mugshotUrlInput = document.getElementById('mugshotUrl');

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
const mugshot = document.getElementById('mugshot');

// Buttons
const generateBtn = document.getElementById('generateBtn');
const resetBtn = document.getElementById('resetBtn');
const downloadBtn = document.getElementById('downloadBtn');
const copyBtn = document.getElementById('copyBtn');

// Character Count Elements
const wantedCount = document.getElementById('wanted-count');
const chargeCount = document.getElementById('charge-count');
const nameCount = document.getElementById('name-count');
const descriptionCount = document.getElementById('description-count');
const contactCount = document.getElementById('contact-count');
const detectiveCount = document.getElementById('detective-count');
const dateCount = document.getElementById('date-count');

// Success Modal
const successMessage = document.getElementById('success-message');
const closeSuccess = document.getElementById('close-success');

// Dark Mode Toggle
const darkModeSwitch = document.getElementById('dark-mode-switch');

// Store image data URLs
let bulletinImageDataURL = null;
let mugshotImageDataURL = null;

// Initialize character counts
function updateCharacterCounts() {
    wantedCount.textContent = wantedTextInput.value.length;
    chargeCount.textContent = chargeInput.value.length;
    nameCount.textContent = suspectNameInput.value.length;
    descriptionCount.textContent = descriptionInput.value.length;
    contactCount.textContent = contactInput.value.length;
    detectiveCount.textContent = detectiveInput.value.length;
    dateCount.textContent = dateInput.value.length;
}

// Update preview function
function updatePreview() {
    pWanted.textContent = wantedTextInput.value.toUpperCase() || 'WANTED';
    pCharge.textContent = chargeInput.value || 'CHARGE NOT SPECIFIED';
    pName.textContent = suspectNameInput.value.toUpperCase() || 'UNKNOWN SUSPECT';
    pDescription.textContent = descriptionInput.value || 'No description provided.';
    pContact.textContent = contactInput.value || 'CONTACT INFORMATION NOT PROVIDED';
    pDetective.textContent = detectiveInput.value || 'Detective Name Not Specified';
    pDate.textContent = dateInput.value || 'Date Not Specified';
    
    // Update bulletin image visibility
    if (bulletinToggle.checked) {
        bulletinContainer.classList.remove('hidden');
    } else {
        bulletinContainer.classList.add('hidden');
    }
    
    updateCharacterCounts();
}

// Convert image to data URL to avoid CORS issues
function getImageDataURL(url) {
    return new Promise((resolve, reject) => {
        // For empty URLs, resolve with null
        if (!url || url.trim() === '') {
            resolve(null);
            return;
        }
        
        const img = new Image();
        
        img.onload = function() {
            try {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                const dataURL = canvas.toDataURL('image/png');
                resolve(dataURL);
            } catch (error) {
                console.error('Error converting image to data URL:', error);
                // Fall back to original URL
                resolve(url);
            }
        };
        
        img.onerror = function() {
            console.error('Failed to load image:', url);
            resolve(null); // Return null if image fails to load
        };
        
        // Set crossOrigin for CORS
        img.crossOrigin = 'anonymous';
        
        // Add timestamp to avoid cache issues for local files
        const timestamp = new Date().getTime();
        if (url.includes('Bulletin.png')) {
            img.src = url + '?t=' + timestamp;
        } else {
            img.src = url + (url.includes('?') ? '&' : '?') + 't=' + timestamp;
        }
    });
}

// Preload bulletin image
async function preloadBulletinImage() {
    try {
        bulletinImageDataURL = await getImageDataURL('Bulletin.png');
        if (bulletinImageDataURL) {
            bulletinImage.src = bulletinImageDataURL;
        }
    } catch (error) {
        console.error('Failed to preload bulletin image:', error);
    }
}

// Handle mugshot URL input
async function handleMugshotInput() {
    const url = mugshotUrlInput.value.trim();
    if (url) {
        try {
            mugshotImageDataURL = await getImageDataURL(url);
            if (mugshotImageDataURL) {
                mugshot.src = mugshotImageDataURL;
                mugshot.style.display = 'block';
            } else {
                mugshot.style.display = 'none';
            }
        } catch (error) {
            console.error('Failed to load mugshot:', error);
            mugshot.style.display = 'none';
        }
    } else {
        mugshot.style.display = 'none';
        mugshotImageDataURL = null;
    }
}

// Set up event listeners for real-time preview
function setupEventListeners() {
    wantedTextInput.addEventListener('input', updatePreview);
    bulletinToggle.addEventListener('change', updatePreview);
    chargeInput.addEventListener('input', updatePreview);
    suspectNameInput.addEventListener('input', updatePreview);
    descriptionInput.addEventListener('input', updatePreview);
    contactInput.addEventListener('input', updatePreview);
    detectiveInput.addEventListener('input', updatePreview);
    dateInput.addEventListener('input', updatePreview);
    
    // Handle mugshot URL input with debounce
    let mugshotTimeout;
    mugshotUrlInput.addEventListener('input', function() {
        clearTimeout(mugshotTimeout);
        mugshotTimeout = setTimeout(handleMugshotInput, 500); // Wait 500ms after typing stops
    });
}

// Main function to generate APB Poster
async function generateAPBPoster() {
    // Show loading state
    const originalText = generateBtn.innerHTML;
    generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
    generateBtn.disabled = true;
    
    try {
        // Create a clone of the poster element
        const posterOriginal = document.getElementById('poster');
        const posterClone = posterOriginal.cloneNode(true);
        
        // Update the clone with data URLs for images
        if (bulletinToggle.checked && bulletinImageDataURL) {
            const bulletinImg = posterClone.querySelector('.bulletin-image');
            if (bulletinImg) {
                bulletinImg.src = bulletinImageDataURL;
                // Set width to match original
                bulletinImg.style.width = '100%';
                bulletinImg.style.height = 'auto';
            }
        } else {
            // Hide bulletin container if not checked
            const bulletinContainer = posterClone.querySelector('.bulletin-image-container');
            if (bulletinContainer) {
                bulletinContainer.style.display = 'none';
            }
        }
        
        // Handle mugshot
        if (mugshotImageDataURL) {
            const mugshotImg = posterClone.querySelector('#mugshot');
            if (mugshotImg) {
                mugshotImg.src = mugshotImageDataURL;
                mugshotImg.style.display = 'block';
                mugshotImg.style.width = '200px';
                mugshotImg.style.height = '200px';
            }
        } else {
            // Hide mugshot if no image
            const mugshotImg = posterClone.querySelector('#mugshot');
            if (mugshotImg) {
                mugshotImg.style.display = 'none';
            }
        }
        
        // Set fixed dimensions for the clone
        posterClone.style.width = '600px';
        posterClone.style.position = 'fixed';
        posterClone.style.left = '-9999px';
        posterClone.style.top = '0';
        posterClone.style.zIndex = '10000';
        posterClone.style.background = '#eaeaea';
        
        // Add clone to body
        document.body.appendChild(posterClone);
        
        // Give images time to load
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Use html2canvas on the clone
        const canvas = await html2canvas(posterClone, {
            scale: 2,
            backgroundColor: '#eaeaea',
            logging: false,
            useCORS: true,
            allowTaint: true,
            imageTimeout: 15000 // 15 second timeout for images
        });
        
        // Clean up
        document.body.removeChild(posterClone);
        
        // Download the image
        const link = document.createElement('a');
        const fileName = `apb-poster-${new Date().getTime()}.png`;
        link.download = fileName;
        link.href = canvas.toDataURL('image/png');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Show success message
        successMessage.classList.add('visible');
        
    } catch (error) {
        console.error('Error generating poster:', error);
        
        // Try simpler approach as fallback
        try {
            // Create a simpler version without complex image handling
            const canvas = await html2canvas(document.getElementById('poster'), {
                scale: 2,
                backgroundColor: '#eaeaea',
                logging: false,
                useCORS: true
            });
            
            const link = document.createElement('a');
            const fileName = `apb-poster-simple-${new Date().getTime()}.png`;
            link.download = fileName;
            link.href = canvas.toDataURL('image/png');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            successMessage.classList.add('visible');
        } catch (fallbackError) {
            console.error('Fallback also failed:', fallbackError);
            alert('Error generating poster. Please try:\n\n1. Using Chrome or Firefox\n2. Running from a local web server (not file://)\n3. Using smaller images or no external images\n4. Check browser console for details (F12)');
        }
    } finally {
        // Reset button state
        generateBtn.innerHTML = originalText;
        generateBtn.disabled = false;
    }
}

// Download as PNG
downloadBtn.addEventListener('click', generateAPBPoster);
generateBtn.addEventListener('click', generateAPBPoster);

// Copy APB text
copyBtn.addEventListener('click', function() {
    const apbText = `${pWanted.textContent}\n${pCharge.textContent}\n\nSUSPECT: ${pName.textContent}\n\n${pDescription.textContent}\n\nAny information, please contact:\n${pContact.textContent}\nATTENTION: ${pDetective.textContent}\n\n${pDate.textContent} | APB | Created by SIB`;
    
    navigator.clipboard.writeText(apbText).then(() => {
        // Show temporary success indicator
        const originalText = copyBtn.innerHTML;
        copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
        copyBtn.style.backgroundColor = '#28a745';
        
        setTimeout(() => {
            copyBtn.innerHTML = originalText;
            copyBtn.style.backgroundColor = '';
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy text: ', err);
        alert('Failed to copy text to clipboard. Please try again.');
    });
});

// Reset form
resetBtn.addEventListener('click', function() {
    if (confirm('Are you sure you want to reset the form? All data will be lost.')) {
        wantedTextInput.value = 'WANTED';
        bulletinToggle.checked = true;
        chargeInput.value = 'FA 201. CAPITAL MURDER';
        suspectNameInput.value = 'CODY HASKINS';
        descriptionInput.value = 'Los Santos County Sheriff\'s Department\'s Homicide Bureau is seeking assistance in locating and apprehending Cody Haskins.\n\nCody Haskins is an individual wanted for two counts of capital murder, one which occurred on December 4, 2025 and the other on December 5, 2025 in early hours. Cody Haskins is believed to be ARMED AND DANGEROUS with a handgun which he used in both murders.\n\nHe was last seen wearing black sunglasses, blue surgical mask, grey hoodie, black gloves, black jacket, blue jeans and black shoes, riding a black bicycle in the area of Vespucci and Del Perro.\n\nIf spotted, do not approach alone. Notify the Homicide Bureau.';
        contactInput.value = 'HOMICIDE BUREAU • PH: 26771317';
        detectiveInput.value = 'Detective Stanley Strange';
        dateInput.value = 'Friday, December 5, 2025';
        mugshotUrlInput.value = '';
        mugshot.src = '';
        mugshot.style.display = 'none';
        mugshotImageDataURL = null;
        
        updatePreview();
        
        // Reload the bulletin image
        preloadBulletinImage();
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
document.addEventListener('DOMContentLoaded', async function() {
    // Setup event listeners first
    setupEventListeners();
    
    // Initialize preview
    updatePreview();
    
    // Set initial mugshot display
    mugshot.style.display = 'none';
    
    // Preload the bulletin image
    await preloadBulletinImage();
    
    // Show a default mugshot placeholder
    mugshot.onerror = function() {
        this.style.display = 'none';
    };
    
    // Update the bulletin image source if we have it
    if (bulletinImageDataURL) {
        bulletinImage.src = bulletinImageDataURL;
    }
    
    console.log('APB Generator initialized successfully');
});