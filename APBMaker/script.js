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

// Handle mugshot URL input
async function handleMugshotInput() {
    const url = mugshotUrlInput.value.trim();
    
    if (!url) {
        mugshot.style.display = 'none';
        mugshot.src = '';
        return;
    }
    
    // Try to load the image with error handling
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = function() {
        mugshot.src = url;
        mugshot.style.display = 'block';
    };
    
    img.onerror = function() {
        console.log('Failed to load image, trying without CORS:', url);
        // Try without CORS
        const img2 = new Image();
        img2.onload = function() {
            mugshot.src = url;
            mugshot.style.display = 'block';
        };
        img2.onerror = function() {
            console.error('Failed to load mugshot:', url);
            mugshot.style.display = 'none';
        };
        img2.src = url;
    };
    
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
        mugshotTimeout = setTimeout(handleMugshotInput, 800);
    });
    
    // Also handle on blur
    mugshotUrlInput.addEventListener('blur', handleMugshotInput);
}

// Create a simple clone of the poster for capture
function createPosterClone() {
    const original = document.getElementById('poster');
    const clone = original.cloneNode(true);
    
    // Set fixed dimensions
    clone.style.width = '600px';
    clone.style.height = 'auto';
    clone.style.position = 'fixed';
    clone.style.left = '0';
    clone.style.top = '0';
    clone.style.zIndex = '9999';
    clone.style.opacity = '0';
    clone.style.pointerEvents = 'none';
    
    // Make sure it's visible for capture
    clone.style.visibility = 'visible';
    clone.style.display = 'block';
    
    return clone;
}

// Simple function to generate the poster
async function generateAPBPoster() {
    // Show loading state
    const originalText = generateBtn.innerHTML;
    generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
    generateBtn.disabled = true;
    
    try {
        // Create a temporary container in the visible area
        const tempContainer = document.createElement('div');
        tempContainer.style.position = 'fixed';
        tempContainer.style.left = '0';
        tempContainer.style.top = '0';
        tempContainer.style.width = '600px';
        tempContainer.style.height = 'auto';
        tempContainer.style.zIndex = '9999';
        tempContainer.style.background = '#eaeaea';
        tempContainer.style.opacity = '0.01'; // Almost invisible but still capturable
        
        // Get the poster and append it to the temp container
        const poster = document.getElementById('poster').cloneNode(true);
        
        // Ensure proper styling for the cloned poster
        poster.style.width = '600px';
        poster.style.height = 'auto';
        poster.style.position = 'static';
        poster.style.display = 'block';
        poster.style.visibility = 'visible';
        
        tempContainer.appendChild(poster);
        document.body.appendChild(tempContainer);
        
        // Wait a moment for rendering
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Capture the temp container
        const canvas = await html2canvas(tempContainer, {
            scale: 2,
            backgroundColor: '#eaeaea',
            logging: true,
            useCORS: true,
            allowTaint: true
        });
        
        // Remove the temp container
        document.body.removeChild(tempContainer);
        
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
        
        // Alternative method: create a new canvas manually
        try {
            alert('Using alternative generation method...');
            
            // Get the poster element
            const posterElement = document.getElementById('poster');
            
            // Create an iframe to isolate the content
            const iframe = document.createElement('iframe');
            iframe.style.position = 'fixed';
            iframe.style.left = '-9999px';
            iframe.style.top = '0';
            iframe.style.width = '600px';
            iframe.style.height = '800px';
            iframe.style.border = 'none';
            document.body.appendChild(iframe);
            
            // Write the poster HTML to the iframe
            iframe.contentDocument.open();
            iframe.contentDocument.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { margin: 0; padding: 0; background: #eaeaea; }
                        .apb-form {
                            width: 600px;
                            background: #eaeaea;
                            display: flex;
                            flex-direction: column;
                            overflow-x: hidden;
                            border: 2px solid #000;
                            font-family: Arial, sans-serif;
                        }
                        .bulletin-image-container { 
                            width: 100%; 
                            overflow: hidden; 
                            border-bottom: 2px solid #000; 
                        }
                        .bulletin-image { 
                            width: 100%; 
                            height: auto; 
                            display: block; 
                        }
                        .apb-header {
                            background: #ffd800;
                            font-family: 'Anton', sans-serif;
                            font-size: 44px;
                            letter-spacing: 3px;
                            text-align: center;
                            padding: 8px 0;
                            color: #000;
                            text-transform: uppercase;
                        }
                        .charge-bar {
                            background: #5c5c5c;
                            color: #fff;
                            font-family: 'Oswald', sans-serif;
                            font-size: 22px;
                            font-weight: 700;
                            text-align: center;
                            padding: 10px 15px;
                            word-break: break-word;
                        }
                        .apb-body {
                            padding: 25px;
                            display: flex;
                            flex-direction: column;
                            align-items: center;
                            background: #eaeaea;
                        }
                        .photo-block {
                            text-align: center;
                            margin-bottom: 25px;
                            width: 100%;
                        }
                        #mugshot {
                            width: 200px;
                            height: 200px;
                            background: #ccc;
                            object-fit: cover;
                            margin: 0 auto;
                            border: 2px solid #000;
                            display: block;
                        }
                        .suspect-name {
                            margin-top: 10px;
                            font-family: 'Oswald', sans-serif;
                            font-size: 22px;
                            font-weight: 700;
                            text-transform: uppercase;
                            letter-spacing: 1px;
                            word-break: break-word;
                            color: #000000;
                        }
                        .text-block p {
                            font-family: 'Courier Prime', monospace;
                            font-size: 14px;
                            line-height: 1.5;
                            white-space: pre-wrap;
                            word-break: break-word;
                            overflow-wrap: break-word;
                            color: #000000;
                            margin: 0;
                        }
                        .contact-bar {
                            background: #4f5f3a;
                            color: #ffd800;
                            font-family: 'Oswald', sans-serif;
                            font-size: 14px;
                            text-align: center;
                            padding: 12px 15px;
                        }
                        .attention {
                            font-weight: bold;
                            margin-top: 6px;
                            font-size: 16px;
                            color: #ffd800;
                        }
                        .apb-footer {
                            background: #000000;
                            color: #ffffff;
                            font-family: 'Share Tech Mono', monospace;
                            font-size: 12px;
                            padding: 8px 12px;
                            display: flex;
                            justify-content: space-between;
                            flex-wrap: wrap;
                        }
                    </style>
                </head>
                <body>
                    ${posterElement.outerHTML}
                </body>
                </html>
            `);
            iframe.contentDocument.close();
            
            // Wait for iframe to load
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Capture the iframe content
            const canvas = await html2canvas(iframe.contentDocument.body, {
                scale: 2,
                backgroundColor: '#eaeaea',
                logging: true
            });
            
            // Remove iframe
            document.body.removeChild(iframe);
            
            // Download
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
            alert('Error generating poster. Please try:\n\n1. Using Chrome browser\n2. Running from a local web server\n3. Disabling ad blockers\n4. Trying without external images');
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
        console.warn('Bulletin.png not found');
    };
    
    console.log('APB Generator initialized successfully');
});