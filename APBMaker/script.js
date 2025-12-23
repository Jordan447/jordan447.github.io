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

// Store loaded images
let loadedBulletinImage = null;
let loadedMugshotImage = null;

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

// Load an image with better error handling
function loadImage(url) {
    return new Promise((resolve, reject) => {
        if (!url) {
            reject(new Error('No URL provided'));
            return;
        }
        
        const img = new Image();
        img.crossOrigin = 'anonymous'; // Try to allow CORS
        
        img.onload = () => resolve(img);
        img.onerror = (err) => {
            console.warn('Failed to load image with CORS, trying without:', url);
            // Try without CORS
            const img2 = new Image();
            img2.onload = () => resolve(img2);
            img2.onerror = () => reject(new Error('Failed to load image: ' + url));
            img2.src = url;
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
        loadedMugshotImage = null;
        return;
    }
    
    try {
        const img = await loadImage(url);
        mugshot.src = url;
        mugshot.style.display = 'block';
        loadedMugshotImage = img;
    } catch (error) {
        console.error('Failed to load mugshot:', error);
        mugshot.style.display = 'none';
        loadedMugshotImage = null;
    }
}

// Preload bulletin image
async function preloadBulletinImage() {
    try {
        loadedBulletinImage = await loadImage('Bulletin.png');
        bulletinImage.src = 'Bulletin.png';
    } catch (error) {
        console.warn('Failed to preload bulletin image:', error);
        loadedBulletinImage = null;
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
        mugshotTimeout = setTimeout(() => handleMugshotInput(), 800);
    });
    
    mugshotUrlInput.addEventListener('blur', () => handleMugshotInput());
}

// Create a simple canvas-based poster as fallback
function createPosterWithCanvas() {
    return new Promise(async (resolve) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Set dimensions
        canvas.width = 600 * 2;
        canvas.height = 800 * 2;
        
        // Fill background
        ctx.fillStyle = '#eaeaea';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        let yPos = 0;
        
        // Draw bulletin image if enabled and loaded
        if (bulletinToggle.checked && loadedBulletinImage) {
            try {
                const imgHeight = (canvas.width / loadedBulletinImage.width) * loadedBulletinImage.height;
                ctx.drawImage(loadedBulletinImage, 0, yPos, canvas.width, imgHeight);
                yPos += imgHeight;
                
                // Draw border
                ctx.strokeStyle = '#000';
                ctx.lineWidth = 2;
                ctx.strokeRect(0, yPos - 2, canvas.width, 2);
            } catch (error) {
                console.log('Could not draw bulletin image');
            }
        }
        
        // Draw WANTED header
        const headerHeight = 60 * 2;
        ctx.fillStyle = '#ffd800';
        ctx.fillRect(0, yPos, canvas.width, headerHeight);
        ctx.fillStyle = '#000';
        ctx.font = 'bold 44px Anton, Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(pWanted.textContent, canvas.width / 2, yPos + headerHeight / 2);
        yPos += headerHeight;
        
        // Draw charge bar
        const chargeHeight = 50 * 2;
        ctx.fillStyle = '#5c5c5c';
        ctx.fillRect(0, yPos, canvas.width, chargeHeight);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 22px Oswald, Arial';
        ctx.textAlign = 'center';
        ctx.fillText(pCharge.textContent, canvas.width / 2, yPos + chargeHeight / 2);
        yPos += chargeHeight;
        
        // Draw mugshot if available
        const mugshotAreaY = yPos + 30 * 2;
        if (loadedMugshotImage) {
            try {
                const mugshotSize = 200 * 2;
                const mugshotX = canvas.width / 2 - mugshotSize / 2;
                
                // Draw white background
                ctx.fillStyle = '#fff';
                ctx.fillRect(mugshotX - 5, mugshotAreaY - 5, mugshotSize + 10, mugshotSize + 10);
                
                // Draw mugshot
                ctx.drawImage(loadedMugshotImage, mugshotX, mugshotAreaY, mugshotSize, mugshotSize);
                
                // Draw border
                ctx.strokeStyle = '#000';
                ctx.lineWidth = 4;
                ctx.strokeRect(mugshotX, mugshotAreaY, mugshotSize, mugshotSize);
                
                yPos = mugshotAreaY + mugshotSize + 30 * 2;
            } catch (error) {
                console.log('Could not draw mugshot');
                yPos += 60 * 2;
            }
        } else {
            yPos += 60 * 2;
        }
        
        // Draw suspect name
        ctx.fillStyle = '#000';
        ctx.font = 'bold 22px Oswald, Arial';
        ctx.textAlign = 'center';
        ctx.fillText(pName.textContent, canvas.width / 2, mugshotAreaY + (loadedMugshotImage ? 220 * 2 : 30 * 2));
        
        // Draw description
        ctx.fillStyle = '#000';
        ctx.font = '14px Courier Prime, monospace';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        
        const description = pDescription.textContent;
        const lineHeight = 20 * 2;
        const maxWidth = canvas.width - 100 * 2;
        const startX = 50 * 2;
        
        let lineY = yPos;
        const words = description.split(' ');
        let line = '';
        
        for (let i = 0; i < words.length; i++) {
            const testLine = line + words[i] + ' ';
            const metrics = ctx.measureText(testLine);
            
            if (metrics.width > maxWidth && i > 0) {
                ctx.fillText(line, startX, lineY);
                line = words[i] + ' ';
                lineY += lineHeight;
            } else {
                line = testLine;
            }
        }
        
        if (line) {
            ctx.fillText(line, startX, lineY);
        }
        
        lineY += 40 * 2;
        
        // Draw contact bar
        const contactHeight = 80 * 2;
        ctx.fillStyle = '#4f5f3a';
        ctx.fillRect(0, lineY, canvas.width, contactHeight);
        ctx.fillStyle = '#ffd800';
        ctx.font = '14px Oswald, Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Any information, please contact:', canvas.width / 2, lineY + 20 * 2);
        
        ctx.font = 'bold 14px Oswald, Arial';
        ctx.fillText(pContact.textContent, canvas.width / 2, lineY + 40 * 2);
        
        ctx.font = 'bold 16px Oswald, Arial';
        ctx.fillText(`ATTENTION: ${pDetective.textContent}`, canvas.width / 2, lineY + 60 * 2);
        
        lineY += contactHeight;
        
        // Draw footer
        const footerHeight = 40 * 2;
        ctx.fillStyle = '#000';
        ctx.fillRect(0, lineY, canvas.width, footerHeight);
        ctx.fillStyle = '#fff';
        ctx.font = '12px Share Tech Mono, monospace';
        
        // Date (left)
        ctx.textAlign = 'left';
        ctx.fillText(pDate.textContent, 50 * 2, lineY + footerHeight / 2);
        
        // APB (center)
        ctx.textAlign = 'center';
        ctx.fillText('APB', canvas.width / 2, lineY + footerHeight / 2);
        
        // Created by (right)
        ctx.textAlign = 'right';
        ctx.fillText('Created by SIB', canvas.width - 50 * 2, lineY + footerHeight / 2);
        
        resolve(canvas);
    });
}

// Main function to generate APB Poster
async function generateAPBPoster() {
    // Show loading state
    const originalText = generateBtn.innerHTML;
    generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
    generateBtn.disabled = true;
    
    try {
        // First try html2canvas with the visible element
        const posterElement = document.getElementById('poster');
        
        // Ensure all images are loaded
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const canvas = await html2canvas(posterElement, {
            scale: 2,
            backgroundColor: '#eaeaea',
            logging: false,
            useCORS: true,
            allowTaint: true,
            imageTimeout: 10000 // 10 second timeout
        });
        
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
        console.error('html2canvas failed, trying canvas method:', error);
        
        // Try canvas method as fallback
        try {
            const canvas = await createPosterWithCanvas();
            
            // Convert to blob and download
            canvas.toBlob((blob) => {
                const link = document.createElement('a');
                const fileName = `apb-poster-canvas-${new Date().getTime()}.png`;
                link.download = fileName;
                link.href = URL.createObjectURL(blob);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(link.href);
                
                successMessage.classList.add('visible');
            }, 'image/png');
            
        } catch (canvasError) {
            console.error('Canvas method also failed:', canvasError);
            alert('Failed to generate poster. Please try:\n\n1. Using Chrome browser\n2. Running from a local web server\n3. Using smaller images or different image URLs\n4. Checking console for errors (F12)');
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
        loadedMugshotImage = null;
        
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
document.addEventListener('DOMContentLoaded', async function() {
    // Setup event listeners first
    setupEventListeners();
    
    // Initialize preview
    updatePreview();
    
    // Set initial mugshot display
    mugshot.style.display = 'none';
    
    // Preload bulletin image
    await preloadBulletinImage();
    
    // Load bulletin image for preview
    bulletinImage.src = 'Bulletin.png';
    
    console.log('APB Generator initialized successfully');
});