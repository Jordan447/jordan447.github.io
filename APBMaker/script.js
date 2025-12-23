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
let mugshotDataURL = null;

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

// Use a CORS proxy for restricted images
function fetchWithProxy(url) {
    return new Promise((resolve, reject) => {
        // Use corsproxy.io as a free CORS proxy
        const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
        
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        img.onload = function() {
            try {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                
                // Draw white background first for transparency issues
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                
                ctx.drawImage(img, 0, 0);
                resolve(canvas.toDataURL('image/png'));
            } catch (error) {
                reject(error);
            }
        };
        
        img.onerror = reject;
        img.src = proxyUrl;
    });
}

// Handle GTA World images specifically
function getGTAMugshotDataURL(url) {
    return new Promise((resolve) => {
        // Try direct fetch first
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
                console.log('Direct conversion failed, trying proxy...');
                // Try CORS proxy
                fetchWithProxy(url).then(resolve).catch(() => resolve(null));
            }
        };
        
        img.onerror = function() {
            console.log('Direct load failed, trying proxy...');
            // Try CORS proxy
            fetchWithProxy(url).then(resolve).catch(() => resolve(null));
        };
        
        img.src = url;
    });
}

// Convert any image to data URL
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
        if (url.includes('Bulletin.png') || url.includes('bulletin.png')) {
            resolve(url);
            return;
        }
        
        // Check if it's a GTA World URL
        if (url.includes('gta.world') || url.includes('mdc.gta.world')) {
            getGTAMugshotDataURL(url).then(resolve).catch(() => resolve(null));
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
                resolve(url); // Fallback to direct URL
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
    
    if (!url) {
        mugshot.style.display = 'none';
        mugshot.src = '';
        mugshotDataURL = null;
        return;
    }
    
    // Show loading
    mugshot.style.display = 'block';
    mugshot.src = ''; // Clear previous
    
    try {
        mugshotDataURL = await imageToDataURL(url);
        
        if (mugshotDataURL) {
            mugshot.src = mugshotDataURL;
            mugshot.style.display = 'block';
            console.log('Mugshot loaded successfully');
        } else {
            mugshot.style.display = 'none';
            console.log('Failed to load mugshot');
        }
    } catch (error) {
        console.error('Error handling mugshot:', error);
        mugshot.style.display = 'none';
        mugshotDataURL = null;
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
        mugshotTimeout = setTimeout(handleMugshotInput, 800);
    });
    
    mugshotUrlInput.addEventListener('blur', handleMugshotInput);
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
        
        // Timeout after 5 seconds
        setTimeout(resolve, 5000);
    });
}

// Create a cloned poster with data URLs
function createPosterClone() {
    const original = document.getElementById('poster');
    const clone = original.cloneNode(true);
    
    // Update images in clone
    if (bulletinToggle.checked) {
        // Show bulletin container
        const bulletinContainer = clone.querySelector('.bulletin-image-container');
        if (bulletinContainer) {
            bulletinContainer.classList.remove('hidden');
            bulletinContainer.style.display = 'block';
            
            // Update bulletin image - use direct URL for local file
            const bulletinImg = clone.querySelector('.bulletin-image');
            if (bulletinImg) {
                bulletinImg.src = 'Bulletin.png';
                bulletinImg.style.display = 'block';
                bulletinImg.style.width = '100%';
                bulletinImg.style.height = 'auto';
            }
        }
    } else {
        // Hide bulletin container if not enabled
        const bulletinContainer = clone.querySelector('.bulletin-image-container');
        if (bulletinContainer) {
            bulletinContainer.style.display = 'none';
        }
    }
    
    if (mugshotDataURL) {
        const mugshotImg = clone.querySelector('#mugshot');
        if (mugshotImg) {
            mugshotImg.src = mugshotDataURL;
            mugshotImg.style.display = 'block';
            mugshotImg.style.width = '200px';
            mugshotImg.style.height = '200px';
        }
    } else {
        // Hide mugshot if no image
        const mugshotImg = clone.querySelector('#mugshot');
        if (mugshotImg) {
            mugshotImg.style.display = 'none';
        }
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
    // Show loading state
    const originalText = generateBtn.innerHTML;
    generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
    generateBtn.disabled = true;
    
    try {
        // Wait for images to load
        await waitForImages();
        
        // Create a clone with proper image URLs
        const clone = createPosterClone();
        document.body.appendChild(clone);
        
        // Give browser time to render the clone
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Capture with html2canvas
        const canvas = await html2canvas(clone, {
            scale: 2,
            backgroundColor: '#eaeaea',
            logging: false,
            useCORS: true,
            allowTaint: true,
            imageTimeout: 15000
        });
        
        // Remove clone
        document.body.removeChild(clone);
        
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
        
        // Fallback: Try direct capture
        try {
            console.log('Trying direct capture fallback...');
            
            // Direct capture of the original element
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
            alert('Error generating poster. Please try:\n\n1. Using Chrome browser\n2. Running from a local web server (not file://)\n3. Making sure Bulletin.png is in the same folder\n4. Trying a different mugshot URL');
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
        mugshotDataURL = null;
        
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
    
    // Load bulletin image
    bulletinImage.src = 'Bulletin.png';
    bulletinImage.onerror = function() {
        console.warn('Bulletin.png not found in the same folder');
    };
    
    console.log('APB Generator initialized successfully');
});