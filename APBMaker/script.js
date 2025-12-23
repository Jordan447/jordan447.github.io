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

// Store the original image sources
let originalMugshotSrc = '';
let mugshotLoaded = false;

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

// Handle mugshot URL input with CORS proxy fallback
async function handleMugshotInput() {
    const url = mugshotUrlInput.value.trim();
    
    if (!url) {
        mugshot.style.display = 'none';
        mugshot.src = '';
        originalMugshotSrc = '';
        mugshotLoaded = false;
        return;
    }
    
    originalMugshotSrc = url;
    mugshotLoaded = false;
    
    // Show loading state
    mugshot.style.display = 'block';
    mugshot.src = ''; // Clear previous image
    
    // Try to load the image directly first
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = function() {
        mugshot.src = url;
        mugshot.style.display = 'block';
        mugshotLoaded = true;
        console.log('Mugshot loaded directly:', url);
    };
    
    img.onerror = async function() {
        console.log('Direct load failed, trying CORS proxy:', url);
        
        // Try using a CORS proxy
        try {
            // Use a free CORS proxy service
            const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
            const img2 = new Image();
            img2.crossOrigin = 'anonymous';
            
            img2.onload = function() {
                mugshot.src = proxyUrl;
                mugshot.style.display = 'block';
                mugshotLoaded = true;
                console.log('Mugshot loaded via proxy:', url);
            };
            
            img2.onerror = function() {
                console.error('All methods failed for:', url);
                mugshot.style.display = 'none';
                mugshotLoaded = false;
                
                // Show placeholder
                mugshot.onerror = null; // Prevent infinite loop
                mugshot.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNDQ0NDQ0MiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjNjY2NjY2Ij5JbWFnZSBOb3QgTG9hZGVkPC90ZXh0Pjwvc3ZnPg==';
                mugshot.style.display = 'block';
            };
            
            img2.src = proxyUrl;
        } catch (error) {
            console.error('CORS proxy failed:', error);
            mugshot.style.display = 'none';
            mugshotLoaded = false;
        }
    };
    
    // Start loading
    img.src = url;
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
        mugshotTimeout = setTimeout(handleMugshotInput, 800); // Wait 800ms after typing stops
    });
    
    // Also handle on blur
    mugshotUrlInput.addEventListener('blur', handleMugshotInput);
}

// Simple function to convert image to data URL
function imageToDataURL(img) {
    return new Promise((resolve) => {
        try {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            resolve(canvas.toDataURL('image/png'));
        } catch (error) {
            console.error('Error converting image:', error);
            resolve(null);
        }
    });
}

// Main function to generate APB Poster
async function generateAPBPoster() {
    // Show loading state
    const originalText = generateBtn.innerHTML;
    generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
    generateBtn.disabled = true;
    
    try {
        // Get the poster element
        const posterElement = document.getElementById('poster');
        
        // Store original styles
        const originalPosition = posterElement.style.position;
        const originalLeft = posterElement.style.left;
        const originalTop = posterElement.style.top;
        
        // Position the poster for capture
        posterElement.style.position = 'fixed';
        posterElement.style.left = '0';
        posterElement.style.top = '0';
        posterElement.style.zIndex = '10000';
        posterElement.style.transform = 'translate(-10000px, -10000px)';
        
        // Wait a moment for repositioning
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Use html2canvas with CORS support
        const canvas = await html2canvas(posterElement, {
            scale: 2,
            backgroundColor: '#eaeaea',
            logging: false,
            useCORS: true, // Enable CORS
            allowTaint: true, // Allow tainted images
            foreignObjectRendering: false,
            removeContainer: true
        });
        
        // Restore original styles
        posterElement.style.position = originalPosition;
        posterElement.style.left = originalLeft;
        posterElement.style.top = originalTop;
        posterElement.style.transform = '';
        posterElement.style.zIndex = '';
        
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
        
        // Try without CORS options as fallback
        try {
            const canvas = await html2canvas(document.getElementById('poster'), {
                scale: 2,
                backgroundColor: '#eaeaea',
                logging: false
            });
            
            const link = document.createElement('a');
            const fileName = `apb-poster-fallback-${new Date().getTime()}.png`;
            link.download = fileName;
            link.href = canvas.toDataURL('image/png');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            successMessage.classList.add('visible');
        } catch (fallbackError) {
            console.error('Fallback also failed:', fallbackError);
            alert('Error generating poster. Tips:\n\n• Try using Chrome or Firefox\n• Run from a local web server\n• Use images from secure (https) sources\n• Try without external images first');
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
        originalMugshotSrc = '';
        mugshotLoaded = false;
        
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
    // Setup event listeners first
    setupEventListeners();
    
    // Initialize preview
    updatePreview();
    
    // Set initial mugshot display
    mugshot.style.display = 'none';
    
    // Load bulletin image with cache busting
    bulletinImage.src = 'Bulletin.png?' + new Date().getTime();
    bulletinImage.onerror = function() {
        console.warn('Bulletin.png not found, hiding bulletin header');
        bulletinContainer.style.display = 'none';
    };
    
    console.log('APB Generator initialized successfully');
});