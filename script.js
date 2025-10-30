document.addEventListener('DOMContentLoaded', function() {
    // Initialize theme
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const html = document.documentElement;
    const currentTheme = localStorage.getItem('theme') || 'light';

    // Set initial theme
    html.setAttribute('data-theme', currentTheme);
    updateThemeButton(currentTheme);

    // Theme toggle button click
    themeToggleBtn.addEventListener('click', toggleTheme);

    // Initialize dropdown functionality
    initDropdowns();

    // Initialize the current tool
    let currentTool = 'dashboard';
    switchTool(currentTool);

    // Initialize tool functionalities
    initCitationsCalculator();
    initPatrolLogGenerator();
    initTrafficWarningGenerator();
    initTrapCasefileGenerator();
    initSupplementalReportGenerator();
    initStolenVehicleReportGenerator();
    initStolenPlateReportGenerator();
    initTrapDatabaseUpdateGenerator();
});

function initDropdowns() {
    // Dropdown toggle functionality
    document.querySelectorAll('.dropdown-btn').forEach(button => {
        button.addEventListener('click', function(e) {
            // Only prevent default for the dropdown button itself
            if (e.target.classList.contains('dropdown-btn') || 
                e.target.classList.contains('dropdown-icon') || 
                e.target.parentElement.classList.contains('dropdown-btn')) {
                e.preventDefault();
            }
            
            const parent = this.closest('.sidebar-dropdown');
            parent.classList.toggle('active');
            
            // Close other dropdowns
            document.querySelectorAll('.sidebar-dropdown').forEach(dropdown => {
                if (dropdown !== parent) {
                    dropdown.classList.remove('active');
                }
            });
        });
    });

    // Handle clicks on all sidebar menu items (including Dashboard and Changelog)
    document.querySelectorAll('.sidebar-menu a[data-tool]').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const tool = this.getAttribute('data-tool');
            switchTool(tool);
            
            // If it's in a dropdown, keep the parent dropdown open
            const dropdown = this.closest('.dropdown-container');
            if (dropdown) {
                const dropdownParent = dropdown.closest('.sidebar-dropdown');
                dropdownParent.classList.add('active');
            }
        });
    });

    // Close dropdowns when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.sidebar-dropdown')) {
            document.querySelectorAll('.sidebar-dropdown').forEach(dropdown => {
                dropdown.classList.remove('active');
            });
        }
    });
}

function toggleTheme() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeButton(newTheme);
}

function updateThemeButton(theme) {
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const icon = themeToggleBtn.querySelector('i');
    const text = themeToggleBtn.querySelector('span');
    
    if (theme === 'dark') {
        icon.className = 'fas fa-sun';
        text.textContent = 'Light Mode';
    } else {
        icon.className = 'fas fa-moon';
        text.textContent = 'Dark Mode';
    }
}

function switchTool(tool) {
    // Update current tool
    currentTool = tool;
    
    // Update active menu items
    document.querySelectorAll('.sidebar-menu a').forEach(item => {
        item.classList.remove('active');
    });
    
    // Find and activate the correct menu item
    const activeItem = document.querySelector(`.sidebar-menu a[data-tool="${tool}"]`);
    if (activeItem) {
        activeItem.classList.add('active');
        
        // If it's in a dropdown, open that dropdown
        const dropdown = activeItem.closest('.dropdown-container');
        if (dropdown) {
            const dropdownParent = dropdown.closest('.sidebar-dropdown');
            dropdownParent.classList.add('active');
        }
    }
    
    // Update current tool title
    const toolTitles = {
        'dashboard': 'Dashboard',
        'citations': 'Unpaid Citations Calculator',
        'patrol': 'Patrol Log Generator',
        'traffic-warning': 'Traffic Warning Generator',
        'trap-casefile': 'TRAP Casefile Generator',
        'supplemental-report': 'Supplemental Report Generator',
        'stolen-vehicle': 'Stolen Vehicle Report Generator',
        'stolen-plate': 'Stolen Plate Report Generator',
        'trap-database-update': 'Database Update Generator',
        'tbd': 'Medical Report Tool',
        'changelog': 'Changelog'
    };
    document.getElementById('current-tool').textContent = toolTitles[tool] || 'Tool Panel';
    
    // Show the selected tool section
    document.querySelectorAll('.tool-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(`${tool}-section`).classList.add('active');
    
    // Scroll to top
    window.scrollTo(0, 0);
}

function initCitationsCalculator() {
    // DOM Elements
    const countBtn = document.getElementById('countBtn');
    const templateBtn = document.getElementById('templateBtn');
    const copyBtn = document.getElementById('copyBtn');
    const inputText = document.getElementById('inputText');
    const fullName = document.getElementById('fullName');
    const fswFiled = document.getElementById('fswFiled');
    const outputDiv = document.getElementById('output');
    const summaryDiv = document.getElementById('summary');
    const resultsDiv = document.getElementById('results');
    const templateContent = document.getElementById('templateContent');
    const templateOutput = document.getElementById('templateOutput');
    
    let grandTotal = 0;
    let totalFines = 0;
    
    // Count amounts button click
    countBtn.addEventListener('click', countAmounts);
    
    // Generate template button click
    templateBtn.addEventListener('click', generateTemplate);
    
    // Copy template button click
    copyBtn.addEventListener('click', copyTemplate);
    
    function countAmounts() {
        const text = inputText.value;
        
        // Clear previous results
        outputDiv.innerHTML = '';
        summaryDiv.innerHTML = '';
        grandTotal = 0;
        totalFines = 0;
        
        // Regular expression to match dollar amounts ending with 0
        const regex = /\$[\d,]+0\b/g;
        const matches = text.match(regex);
        
        if (!matches || matches.length === 0) {
            outputDiv.innerHTML = '<p>No dollar amounts ending with 0 found.</p>';
            templateBtn.disabled = true;
            resultsDiv.style.display = 'block';
            return;
        }
        
        // Count occurrences of each amount
        const amountCounts = {};
        matches.forEach(amount => {
            amountCounts[amount] = (amountCounts[amount] || 0) + 1;
            totalFines++;
        });
        
        // Convert to array and sort by amount (descending)
        const sortedAmounts = Object.entries(amountCounts)
            .sort((a, b) => {
                const numA = parseFloat(a[0].replace(/[$,]/g, ''));
                const numB = parseFloat(b[0].replace(/[$,]/g, ''));
                return numB - numA;
            });
        
        // Display counts in a table
        let tableHTML = `
            <table>
                <thead>
                    <tr>
                        <th>Amount</th>
                        <th>Count</th>
                        <th>Subtotal</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        sortedAmounts.forEach(([amount, count]) => {
            const numericValue = parseFloat(amount.replace(/[$,]/g, ''));
            const subtotal = numericValue * count;
            grandTotal += subtotal;
            
            tableHTML += `
                <tr>
                    <td>${amount}</td>
                    <td>${count}</td>
                    <td>${formatCurrency(subtotal)}</td>
                </tr>
            `;
        });
        
        tableHTML += `
                </tbody>
            </table>
        `;
        
        outputDiv.innerHTML = tableHTML;
        
        // Display grand total
        summaryDiv.innerHTML = `
            <p><strong>Total Fines Count:</strong> ${totalFines}</p>
            <p><strong>Grand Total Amount:</strong> ${formatCurrency(grandTotal)}</p>
        `;
        
        // Enable template button and show results
        templateBtn.disabled = false;
        resultsDiv.style.display = 'block';
    }
    
    function generateTemplate() {
        const name = fullName.value || "First Last";
        const fsw = fswFiled.value;
        
        // Generate the template with the new format
        templateContent.textContent = `[b]Full Name:[/b] ${name}
[b]Amount of Unpaid Fines:[/b] ${totalFines}
[b]Amount Owed:[/b] ${formatCurrency(grandTotal)}
[b]FSW Filed:[/b] ${fsw}`;
        
        templateOutput.style.display = 'block';
        templateOutput.scrollIntoView({ behavior: 'smooth' });
    }
    
    function copyTemplate() {
        const range = document.createRange();
        range.selectNode(templateContent);
        window.getSelection().removeAllRanges();
        window.getSelection().addRange(range);
        document.execCommand('copy');
        window.getSelection().removeAllRanges();
        
        // Show copied feedback
        const originalHTML = copyBtn.innerHTML;
        copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
        setTimeout(() => {
            copyBtn.innerHTML = originalHTML;
        }, 2000);
    }
    
    function formatCurrency(value) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(value);
    }
}

function initPatrolLogGenerator() {
    // Form functionality
    const form = document.getElementById('patrol-form');
    const addReportBtn = document.getElementById('add-report');
    const reportsContainer = document.getElementById('reports-container');
    const outputContainer = document.getElementById('output-container');
    const bbcodeOutput = document.getElementById('bbcode-output');
    const copyBtn = document.getElementById('copy-bbcode');
    
    // Add report field
    addReportBtn.addEventListener('click', () => {
        const reportItem = document.createElement('div');
        reportItem.className = 'report-item';
        reportItem.innerHTML = `
            <input type="text" class="report-name" placeholder="Report Name (e.g., Arrest Report)">
            <input type="text" class="report-url" placeholder="Report URL">
            <button type="button" class="remove-report"><i class="fas fa-times"></i></button>
        `;
        reportsContainer.appendChild(reportItem);
        
        // Add event listener to remove button
        reportItem.querySelector('.remove-report').addEventListener('click', () => {
            reportsContainer.removeChild(reportItem);
        });
    });

    // Form submission
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Show spinner
        const submitBtn = document.getElementById('submit-btn');
        submitBtn.querySelector('.spinner').classList.add('visible');
        submitBtn.querySelector('.btn-text').textContent = 'Generating...';
        submitBtn.disabled = true;
        
        // Simulate processing delay
        setTimeout(() => {
            generateBBcode();
            
            // Hide spinner
            submitBtn.querySelector('.spinner').classList.remove('visible');
            submitBtn.querySelector('.btn-text').textContent = 'Generate BB Code';
            submitBtn.disabled = false;
        }, 500);
    });

    // Generate BBcode
    function generateBBcode() {
        // Get form values
        const reportDate = document.getElementById('report-date').value;
        const reportTime = document.getElementById('report-time').value;
        const patrolNumber = document.getElementById('patrol-number').value;
        const traineeName = document.getElementById('trainee-name').value;
        const employeeNumber = document.getElementById('employee-number').value;
        const callsign = document.getElementById('callsign').value;
        const narrative = document.getElementById('narrative').value;
        
        // Get reports
        const reportItems = document.querySelectorAll('.report-item');
        const reports = [];
        
        reportItems.forEach(item => {
            const name = item.querySelector('.report-name').value;
            const url = item.querySelector('.report-url').value;
            
            if (name && url) {
                reports.push({ name, url });
            } else if (name) {
                reports.push({ name, url: '#' });
            }
        });
        
        // Generate BBcode
        let bbcode = `[center][color=Transparent][/color]
    [img]https://i.postimg.cc/gjxmBXm7/image.png[/img]
    
    [color=grey][size=100]LOS SANTOS COUNTY SHERIFF'S DEPARTMENT[/size][/color]
    [color=black][size=150][b]FIELD TRAINING KING PATROL LOG[/b][/size][/color]
    [/center]
    
    
                    [transtable=Arial]
                    [tr]
                    [td][b]REPORT DATE[/b][/td]
                    [td][b]REPORT TIME[/b][/td]
                    [td][b]PATROL #[/b][/td][/tr]
                    [tr]
                    [td]${reportDate}[/td]
                    [td]${reportTime}[/td]
                    [td]${patrolNumber}[/td]
                    [/tr]
                    [/transtable]
    
                    [transtable=Arial]
                    [tr]
                    [td][b]TRAINEE NAME[/b][/td]
                    [td][b]EMPLOYEE NUMBER[/b][/td]
                    [td][b]CALLSIGN[/b][/td]
                    [/tr]
                    [tr]
                    [td]${traineeName}[/TD]
                    [td]${employeeNumber}[/TD]
                    [td]${callsign}[/TD][/transtable]
    
    [transtable=Arial][tr]
                    [td][b][center]ASSOCIATED REPORTS & PATROL NARRATIVE[/center][/b][/td][/tr][/transtable][hr][/hr]
                    [transtable=Arial]
                    [tr]
                    [td][justify][b]INSTRUCTIONS:[/b] Please fill out the "Associated Reports" section if you handle/fill out any reports during your King patrol. Provide the link in the specified area and also include a general name for the report (i.e. Arrest Report - John Doe). If you do not use/need the reports section, please fill in the "REPORT NAME" with D.N.A.
                    
For the "Patrol Narrative", please try and use general timestamps to log your patrol (i.e. 1345 - Traffic stop on a black sedan, Hawick Avenue. I noticed the vehicle driving quite recklessly and it was picked up on my dashcam. I decided to pull the vehicle over and the plates read, XXXXXX. After approaching the driver and asking for a backup unit, I decided to issue a citation for reckless driving). Again, this is an example, but please provide depth to the scenarios you find yourself in during the patrol. However, utilize time stamps to track everything that you encounter during your patrol. For example:
[list][*]1600 - Start of patrol under 111 King.
[*]1622 - I performed a traffic stop on a black Asbo on Elgin Avenue. I required a backup unit since the vehicle matched the description from a crime broadcast from earlier. You could then expand on that and write about what occurred before or after, for example.
[*]1648 - 923s were heard around Davis LTD. Utilize that to write about what you did, did you respond? Did you find the shooter? All of this can be included.
[*]1700 - End of patrol.[/list][/justify][/td][/tr][/transtable][hr][/hr]`;
        
        // Add associated reports if any
        if (reports.length > 0) {
            bbcode += `\n                    [transtable=Arial]
                    [tr][td][b]ASSOCIATED REPORTS[/b][/TD][/TR]
                    [tr][td][list]`;
            
            reports.forEach(report => {
                bbcode += `\n[*][url=${report.url}]${report.name}[/url]`;
            });
            
            bbcode += `\n[/list][/TD][/TR][/transtable][hr][/hr]`;
        } else {
            bbcode += `\n                    [transtable=Arial]
                    [tr][td][b]ASSOCIATED REPORTS[/b][/TD][/TR]
                    [tr][td][list][*]D.N.A.[/list][/TD][/TR][/transtable][hr][/hr]`;
        }
        
        // Add narrative
        bbcode += `\n                    [transtable=Arial]
                    [tr][td][b]PATROL NARRATIVE[/b][/TD][/TR]
                    [tr][td]
${narrative}
[/TD][/TR][/transtable][hr][/hr]
                    [transtable=Arial]
                    [tr]
                    [td][b][center]SIGNATURE[/center][/b][/td][/tr][/transtable][hr][/hr]
                    [transtable=Arial]
                    [tr]
                    [td][b]TRAINEE SIGNATURE[/b][/td]
                    [td][b]DATE[/b][/td][/tr]
                    [tr]
                    [td][i]${traineeName}[/i][/TD]
                    [td]${reportDate}[/TD][/tr][/transtable]`;
        
        // Display the BBcode
        bbcodeOutput.value = bbcode;
        outputContainer.style.display = 'block';
        
        // Scroll to the output
        outputContainer.scrollIntoView({ behavior: 'smooth' });
        
        // Copy to clipboard automatically
        copyToClipboard();
    }

    // Copy to clipboard
    function copyToClipboard() {
        bbcodeOutput.select();
        document.execCommand('copy');
        
        // Show feedback
        const originalHTML = copyBtn.innerHTML;
        copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
        setTimeout(() => {
            copyBtn.innerHTML = originalHTML;
        }, 2000);
    }

    // Copy button
    copyBtn.addEventListener('click', copyToClipboard);
}

// Traffic Warning Generator Functions
function initTrafficWarningGenerator() {
    // Set default date to today
    const today = new Date();
    document.getElementById('date').value = today.toISOString().split('T')[0];
    
    // Set default time to current time
    document.getElementById('time').value = today.toTimeString().slice(0,5);
    
    // Initialize the preview
    updateTrafficWarningPreview();
    
    // Close success message
    document.getElementById('close-traffic-success').addEventListener('click', function() {
        document.getElementById('traffic-success-message').classList.remove('visible');
    });
}

// GTA V lore-friendly data for traffic warnings
const streetNames = [
    "Vinewood Blvd", "Mirror Park Ave", "Davis Ave", "Strawberry Ave", 
    "Elgin Ave", "Popular St", "Innocence Blvd", "Alta St", 
    "Power St", "Adam's Apple Blvd", "Spanish Ave", "Portola Dr"
];

const lastNames = [
    "DeSanta", "Phillips", "Johnston", "Harris", "Clinton", 
    "Espinoza", "Bell", "Richards", "Atkins", "Simpson"
];

const firstNames = [
    "Michael", "Franklin", "Trevor", "Lamar", "Amanda", 
    "Jimmy", "Tracey", "Dave", "Steve", "Andreas"
];

function getRandomElement(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function generateRandomTrafficData() {
    // Set random location
    const street1 = getRandomElement(streetNames);
    let street2;
    do {
        street2 = getRandomElement(streetNames);
    } while (street2 === street1);
    
    document.getElementById('location').value = `${street1} & ${street2}`;
    
    // Set random driver name
    const firstName = getRandomElement(firstNames);
    const lastName = getRandomElement(lastNames);
    document.getElementById('driverName').value = `${lastName}, ${firstName}`;
    
    // Set random license plate
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    let plate = '';
    for (let i = 0; i < 3; i++) {
        plate += letters.charAt(Math.floor(Math.random() * letters.length));
    }
    plate += ' ';
    for (let i = 0; i < 4; i++) {
        plate += numbers.charAt(Math.floor(Math.random() * numbers.length));
    }
    document.getElementById('licensePlate').value = plate;
    
    // Set random badge number
    document.getElementById('badgeNumber').value = Math.floor(1000 + Math.random() * 9000);
    
    // Set random officer name
    const officerFirst = getRandomElement(firstNames);
    const officerLast = getRandomElement(lastNames);
    document.getElementById('officerName').value = `${officerFirst} ${officerLast}`;
    
    // Set random address
    document.getElementById('address').value = `${Math.floor(100 + Math.random() * 9000)} ${getRandomElement(streetNames)}`;
    
    // Set random vehicle color
    const colors = ["Metallic Black", "Classic Red", "Racing Green", "Metallic Blue", "Sunset Orange", "Silver", "Yellow", "White"];
    document.getElementById('vehicleColor').value = getRandomElement(colors);
    
    // Set random vehicle model based on make
    const vehicleModels = {
        "Albany": ["Emperor", "Cavalcade", "Romero", "Virgo"],
        "Bravado": ["Buffalo", "Banshee", "Gauntlet", "Gresley"],
        "Declasse": ["Tornado", "Sabre", "Rancher", "Premier"],
        "Grotti": ["Carbonizzare", "Cheetah", "Turismo"],
        "Karin": ["Sultan", "Futo", "Asterope", "Dilettante"],
        "Vapid": ["Dominator", "Stanier", "Bullet", "Sandking"]
    };
    
    const makeSelect = document.getElementById('vehicleMake');
    const makes = Array.from(makeSelect.options)
        .map(option => option.value)
        .filter(value => value !== "");
    const randomMake = getRandomElement(makes);
    makeSelect.value = randomMake;
    
    if (vehicleModels[randomMake]) {
        document.getElementById('vehicleModel').value = getRandomElement(vehicleModels[randomMake]);
    } else {
        document.getElementById('vehicleModel').value = "Unknown";
    }
    
    // Set random infraction
    const infractionSelect = document.getElementById('infractionType');
    const infractions = Array.from(infractionSelect.options)
        .map(option => option.value)
        .filter(value => value !== "");
    document.getElementById('infractionType').value = getRandomElement(infractions);
    
    // Set random description
    const descriptions = [
        "Vehicle was observed exceeding the posted speed limit by more than 15 mph in a residential area.",
        "Driver failed to come to a complete stop at a clearly marked stop sign, creating a hazardous situation.",
        "Vehicle was parked in a designated no-parking zone, obstructing traffic flow.",
        "Driver was observed using a mobile device while operating a motor vehicle.",
        "Vehicle made an illegal U-turn at a controlled intersection."
    ];
    document.getElementById('violationDescription').value = getRandomElement(descriptions);
    
    // Set random comments
    const comments = [
        "Driver was cooperative and acknowledged the violation.",
        "Driver appeared unaware of the traffic regulation.",
        "Weather conditions were clear at the time of the violation.",
        "Traffic was light at the time of the observed violation."
    ];
    document.getElementById('officerComments').value = getRandomElement(comments);
    
    // Update the preview
    updateTrafficWarningPreview();
}

function updateTrafficWarningPreview() {
    const preview = document.getElementById('trafficWarningPreview');
    const agency = document.getElementById('agency').value;
    const agencyName = agency === 'LSPD' ? 'LOS SANTOS POLICE DEPARTMENT' : 'LOS SANTOS SHERIFF\'S DEPARTMENT';
    
    // Get form values
    const badgeNumber = document.getElementById('badgeNumber').value || 'N/A';
    const officerName = document.getElementById('officerName').value || 'N/A';
    const date = document.getElementById('date').value || 'N/A';
    const time = document.getElementById('time').value || 'N/A';
    const location = document.getElementById('location').value || 'N/A';
    const driverName = document.getElementById('driverName').value || 'N/A';
    const dlNumber = document.getElementById('dlNumber').value || 'N/A';
    const dlState = document.getElementById('dlState').value || 'N/A';
    const address = document.getElementById('address').value || 'N/A';
    const city = document.getElementById('city').value || 'N/A';
    const vehicleMake = document.getElementById('vehicleMake').value || 'N/A';
    const vehicleModel = document.getElementById('vehicleModel').value || 'N/A';
    const vehicleColor = document.getElementById('vehicleColor').value || 'N/A';
    const licensePlate = document.getElementById('licensePlate').value || 'N/A';
    const plateState = document.getElementById('plateState').value || 'N/A';
    const infractionType = document.getElementById('infractionType').value || 'N/A';
    const violationDescription = document.getElementById('violationDescription').value || 'N/A';
    const officerComments = document.getElementById('officerComments').value || 'N/A';
    
    // Format date for display
    const displayDate = date !== 'N/A' ? new Date(date).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    }) : 'N/A';
    
    // Generate preview HTML
    preview.innerHTML = `
        <div class="warning-header">
            <div class="agency-name">${agencyName}</div>
            <div class="form-title">TRAFFIC WARNING NOTICE</div>
        </div>
        
        <div class="officer-info-grid">
            <div class="officer-info-item">
                <div class="officer-info-label">BADGE/ID NUMBER</div>
                <div class="officer-info-value">${badgeNumber}</div>
            </div>
            <div class="officer-info-item">
                <div class="officer-info-label">OFFICER NAME</div>
                <div class="officer-info-value">${officerName}</div>
            </div>
            <div class="officer-info-item">
                <div class="officer-info-label">DATE OF VIOLATION</div>
                <div class="officer-info-value">${displayDate}</div>
            </div>
            <div class="officer-info-item">
                <div class="officer-info-label">TIME OF VIOLATION</div>
                <div class="officer-info-value">${time}</div>
            </div>
            <div class="officer-info-item" style="grid-column: 1 / -1;">
                <div class="officer-info-label">LOCATION OF VIOLATION</div>
                <div class="officer-info-value">${location}</div>
            </div>
        </div>
        
        <div class="section-separator"></div>
        
        <div class="info-section">
            <div class="info-label">DRIVER INFORMATION</div>
            <div class="form-row">
                <div>
                    <div class="info-label">Full Name:</div>
                    <div class="info-value">${driverName}</div>
                </div>
                <div>
                    <div class="info-label">License Number:</div>
                    <div class="info-value">${dlNumber}</div>
                </div>
            </div>
            <div class="form-row">
                <div>
                    <div class="info-label">License State:</div>
                    <div class="info-value">${dlState}</div>
                </div>
                <div>
                    <div class="info-label">Address:</div>
                    <div class="info-value">${address}, ${city}</div>
                </div>
            </div>
        </div>
        
        <div class="section-separator"></div>
        
        <div class="info-section">
            <div class="info-label">VEHICLE INFORMATION</div>
            <div class="form-row">
                <div>
                    <div class="info-label">Make/Model:</div>
                    <div class="info-value">${vehicleMake} / ${vehicleModel}</div>
                </div>
                <div>
                    <div class="info-label">Color:</div>
                    <div class="info-value">${vehicleColor}</div>
                </div>
            </div>
            <div class="form-row">
                <div>
                    <div class="info-label">License Plate:</div>
                    <div class="info-value">${licensePlate}</div>
                </div>
                <div>
                    <div class="info-label">Plate State:</div>
                    <div class="info-value">${plateState}</div>
                </div>
            </div>
        </div>
        
        <div class="section-separator"></div>
        
        <div class="violation-section">
            <div class="info-label">VIOLATION DETAILS</div>
            <div class="violation-grid">
                <div class="info-label">Infraction Type:</div>
                <div class="info-value">${infractionType}</div>
                
                <div class="info-label">Description:</div>
                <div class="info-value">${violationDescription}</div>
            </div>
        </div>
        
        <div class="info-section">
            <div class="info-label">OFFICER COMMENTS</div>
            <div class="info-value">${officerComments}</div>
        </div>
        
        <div class="officer-signature">
            <div class="info-section">
                <div class="info-label">OFFICER SIGNATURE</div>
                <div class="signature-area">${officerName}</div>
            </div>
        </div>
        
        <div class="notice-section">
            <strong>NOTICE:</strong> This document serves as an official warning for the traffic violation detailed above. 
            Failure to comply with traffic regulations may result in citation or arrest. This warning will be recorded in 
            the department's database for future reference.
        </div>
        
        <div class="form-note">
            This is a warning notice only. No fine is assessed at this time.
        </div>
    `;
}

function downloadTrafficWarningAsPNG() {
    const preview = document.getElementById('trafficWarningPreview');
    const agency = document.getElementById('agency').value;
    const agencyName = agency === 'LSPD' ? 'LOS SANTOS POLICE DEPARTMENT' : 'LOS SANTOS SHERIFF\'S DEPARTMENT';
    
    // Get form values
    const badgeNumber = document.getElementById('badgeNumber').value || 'N/A';
    const officerName = document.getElementById('officerName').value || 'N/A';
    const date = document.getElementById('date').value || 'N/A';
    const time = document.getElementById('time').value || 'N/A';
    const location = document.getElementById('location').value || 'N/A';
    const driverName = document.getElementById('driverName').value || 'N/A';
    const dlNumber = document.getElementById('dlNumber').value || 'N/A';
    const dlState = document.getElementById('dlState').value || 'N/A';
    const address = document.getElementById('address').value || 'N/A';
    const city = document.getElementById('city').value || 'N/A';
    const vehicleMake = document.getElementById('vehicleMake').value || 'N/A';
    const vehicleModel = document.getElementById('vehicleModel').value || 'N/A';
    const vehicleColor = document.getElementById('vehicleColor').value || 'N/A';
    const licensePlate = document.getElementById('licensePlate').value || 'N/A';
    const plateState = document.getElementById('plateState').value || 'N/A';
    const infractionType = document.getElementById('infractionType').value || 'N/A';
    const violationDescription = document.getElementById('violationDescription').value || 'N/A';
    const officerComments = document.getElementById('officerComments').value || 'N/A';
    
    // Format date for display
    const displayDate = date !== 'N/A' ? new Date(date).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    }) : 'N/A';
    
    // Create a temporary div for PNG export with always black text on white background
    const pngContainer = document.createElement('div');
    pngContainer.style.position = 'absolute';
    pngContainer.style.left = '-9999px';
    pngContainer.style.top = '-9999px';
    pngContainer.style.width = '800px';
    pngContainer.style.padding = '25px';
    pngContainer.style.backgroundColor = 'white';
    pngContainer.style.color = 'black';
    pngContainer.style.fontFamily = 'Arial, sans-serif';
    
    pngContainer.innerHTML = `
        <div class="warning-form-png">
            <div class="warning-header-png">
                <div class="agency-name-png">${agencyName}</div>
                <div class="form-title-png">TRAFFIC WARNING NOTICE</div>
            </div>
            
            <div class="officer-info-grid-png">
                <div class="officer-info-item-png">
                    <div class="officer-info-label-png">BADGE/ID NUMBER</div>
                    <div class="officer-info-value-png">${badgeNumber}</div>
                </div>
                <div class="officer-info-item-png">
                    <div class="officer-info-label-png">OFFICER NAME</div>
                    <div class="officer-info-value-png">${officerName}</div>
                </div>
                <div class="officer-info-item-png">
                    <div class="officer-info-label-png">DATE OF VIOLATION</div>
                    <div class="officer-info-value-png">${displayDate}</div>
                </div>
                <div class="officer-info-item-png">
                    <div class="officer-info-label-png">TIME OF VIOLATION</div>
                    <div class="officer-info-value-png">${time}</div>
                </div>
                <div class="officer-info-item-png" style="grid-column: 1 / -1;">
                    <div class="officer-info-label-png">LOCATION OF VIOLATION</div>
                    <div class="officer-info-value-png">${location}</div>
                </div>
            </div>
            
            <div class="section-separator-png"></div>
            
            <div class="info-section-png">
                <div class="info-label-png">DRIVER INFORMATION</div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                    <div>
                        <div class="info-label-png">Full Name:</div>
                        <div class="info-value-png">${driverName}</div>
                    </div>
                    <div>
                        <div class="info-label-png">License Number:</div>
                        <div class="info-value-png">${dlNumber}</div>
                    </div>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 10px;">
                    <div>
                        <div class="info-label-png">License State:</div>
                        <div class="info-value-png">${dlState}</div>
                    </div>
                    <div>
                        <div class="info-label-png">Address:</div>
                        <div class="info-value-png">${address}, ${city}</div>
                    </div>
                </div>
            </div>
            
            <div class="section-separator-png"></div>
            
            <div class="info-section-png">
                <div class="info-label-png">VEHICLE INFORMATION</div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                    <div>
                        <div class="info-label-png">Make/Model:</div>
                        <div class="info-value-png">${vehicleMake} / ${vehicleModel}</div>
                    </div>
                    <div>
                        <div class="info-label-png">Color:</div>
                        <div class="info-value-png">${vehicleColor}</div>
                    </div>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 10px;">
                    <div>
                        <div class="info-label-png">License Plate:</div>
                        <div class="info-value-png">${licensePlate}</div>
                    </div>
                    <div>
                        <div class="info-label-png">Plate State:</div>
                        <div class="info-value-png">${plateState}</div>
                    </div>
                </div>
            </div>
            
            <div class="section-separator-png"></div>
            
            <div class="violation-section-png">
                <div class="info-label-png">VIOLATION DETAILS</div>
                <div class="violation-grid-png">
                    <div class="info-label-png">Infraction Type:</div>
                    <div class="info-value-png">${infractionType}</div>
                    
                    <div class="info-label-png">Description:</div>
                    <div class="info-value-png">${violationDescription}</div>
                </div>
            </div>
            
            <div class="info-section-png">
                <div class="info-label-png">OFFICER COMMENTS</div>
                <div class="info-value-png">${officerComments}</div>
            </div>
            
            <div class="officer-signature-png">
                <div class="info-section-png">
                    <div class="info-label-png">OFFICER SIGNATURE</div>
                    <div class="signature-area-png">${officerName}</div>
                </div>
            </div>
            
            <div class="notice-section-png">
                <strong>NOTICE:</strong> This document serves as an official warning for the traffic violation detailed above. 
                Failure to comply with traffic regulations may result in citation or arrest. This warning will be recorded in 
                the department's database for future reference.
            </div>
            
            <div class="form-note">
                This is a warning notice only. No fine is assessed at this time.
            </div>
        </div>
    `;
    
    document.body.appendChild(pngContainer);
    
    // Use html2canvas to capture the PNG container
    html2canvas(pngContainer, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
    }).then(canvas => {
        // Create download link
        const link = document.createElement('a');
        link.download = `traffic_warning_${new Date().getTime()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        
        // Remove temporary container
        document.body.removeChild(pngContainer);
        
        // Show success message
        document.getElementById('traffic-success-message').classList.add('visible');
    });
}

// TRAP Casefile Generator Functions
function initTrapCasefileGenerator() {
    // Person management
    const personsContainer = document.getElementById('persons-container');
    const addPersonBtn = document.getElementById('add-person-btn');
    let personCount = 0;

    function addPerson() {
        personCount++;
        const personSection = document.createElement('div');
        personSection.className = 'person-section';
        personSection.innerHTML = `
            <div class="person-header">
                <h3 class="person-number">Person #${personCount}</h3>
                <div class="person-actions">
                    <button class="remove-person">
                        <i class="fas fa-trash"></i> Remove
                    </button>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="person-name-${personCount}">Full Name</label>
                    <input type="text" id="person-name-${personCount}" placeholder="Forename Surname">
                </div>
                <div class="form-group">
                    <label for="person-classification-${personCount}">Classification</label>
                    <select id="person-classification-${personCount}">
                        <option value="Victim">Victim</option>
                        <option value="Suspect">Suspect</option>
                        <option value="Witness">Witness</option>
                        <option value="Informant">Informant</option>
                    </select>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="person-dob-${personCount}">Date of Birth</label>
                    <input type="text" id="person-dob-${personCount}" placeholder="e.g., 05/15/1990">
                </div>
                <div class="form-group">
                    <label for="person-phone-${personCount}">Phone Number</label>
                    <input type="text" id="person-phone-${personCount}" placeholder="e.g., 555-1234">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="person-residence-${personCount}">Residence</label>
                    <input type="text" id="person-residence-${personCount}" placeholder="e.g., 123 Main Street">
                </div>
                <div class="form-group">
                    <label for="person-relation-${personCount}">Relation to Incident</label>
                    <input type="text" id="person-relation-${personCount}" placeholder="e.g., Owner of the property">
                </div>
            </div>
        `;
        personsContainer.appendChild(personSection);
        
        // Add event listener to remove button
        const removeBtn = personSection.querySelector('.remove-person');
        removeBtn.addEventListener('click', () => {
            personSection.remove();
            updatePersonNumbers();
        });
    }

    function updatePersonNumbers() {
        const personSections = personsContainer.querySelectorAll('.person-section');
        personCount = personSections.length;
        personSections.forEach((section, index) => {
            const personNumber = section.querySelector('.person-number');
            personNumber.textContent = `Person #${index + 1}`;
        });
    }

    addPersonBtn.addEventListener('click', addPerson);

    // Add initial person
    addPerson();

    // Evidence management
    const evidenceContainer = document.getElementById('evidence-container');
    const addEvidenceBtn = document.getElementById('add-evidence-btn');
    const evidenceModal = document.getElementById('evidence-modal');
    const evidenceTypeOptions = document.querySelectorAll('.evidence-type-option');
    const evidenceSpoilerCheckbox = document.getElementById('evidence-spoiler');
    const evidenceTitleInput = document.getElementById('evidence-title');
    const evidencePreview = document.getElementById('evidence-preview');
    const addEvidenceConfirmBtn = document.getElementById('add-evidence-confirm');
    const cancelEvidenceBtn = document.getElementById('cancel-evidence');
    const closeModalBtn = document.getElementById('close-modal');
    const urlOptions = document.getElementById('url-options');
    const urlClickableCheckbox = document.getElementById('url-clickable');

    let selectedEvidenceType = '';
    let evidenceCount = 0;
    let editingEvidenceItem = null;

    // Open evidence modal
    addEvidenceBtn.addEventListener('click', () => {
        evidenceModal.classList.add('active');
        selectedEvidenceType = '';
        evidenceTypeOptions.forEach(option => option.classList.remove('selected'));
        evidenceSpoilerCheckbox.checked = false;
        evidenceTitleInput.value = '';
        evidencePreview.style.display = 'none';
        urlOptions.classList.remove('active');
        urlClickableCheckbox.checked = false;
        editingEvidenceItem = null;
        addEvidenceConfirmBtn.innerHTML = '<i class="fas fa-plus"></i> Add Evidence';
    });

    // Close evidence modal
    function closeEvidenceModal() {
        evidenceModal.classList.remove('active');
    }

    closeModalBtn.addEventListener('click', closeEvidenceModal);
    cancelEvidenceBtn.addEventListener('click', closeEvidenceModal);

    // Select evidence type
    evidenceTypeOptions.forEach(option => {
        option.addEventListener('click', () => {
            evidenceTypeOptions.forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');
            selectedEvidenceType = option.getAttribute('data-type');
            
            // Show/hide URL options
            if (selectedEvidenceType === 'url') {
                urlOptions.classList.add('active');
            } else {
                urlOptions.classList.remove('active');
            }
            
            updateEvidencePreview();
        });
    });

    // Update evidence preview when inputs change
    evidenceSpoilerCheckbox.addEventListener('change', updateEvidencePreview);
    evidenceTitleInput.addEventListener('input', updateEvidencePreview);
    urlClickableCheckbox.addEventListener('change', updateEvidencePreview);

    function updateEvidencePreview() {
        if (!selectedEvidenceType) {
            evidencePreview.style.display = 'none';
            return;
        }
        
        let previewContent = '';
        const isSpoiler = evidenceSpoilerCheckbox.checked;
        const title = evidenceTitleInput.value.trim();
        
        switch(selectedEvidenceType) {
            case 'text':
                previewContent = '[Text content here]';
                break;
            case 'image':
                previewContent = '[img]https://example.com/image.jpg[/img]';
                break;
            case 'url':
                const isClickable = urlClickableCheckbox.checked;
                if (isClickable) {
                    previewContent = '[url=https://example.com]Clickable Text[/url]';
                } else {
                    previewContent = '[url]https://example.com[/url]';
                }
                break;
        }
        
        // Title is now outside the spoiler
        let finalPreview = '';
        if (title) {
            finalPreview = `[${title}:] `;
        }
        
        if (isSpoiler) {
            finalPreview += `[spoiler]\n${previewContent}\n[/spoiler]`;
        } else {
            finalPreview += previewContent;
        }
        
        evidencePreview.textContent = finalPreview;
        evidencePreview.style.display = 'block';
    }

    // Function to toggle URL text field visibility
    function toggleUrlTextInput(evidenceItem, isVisible) {
        const urlTextInput = evidenceItem.querySelector('.url-text-input');
        if (urlTextInput) {
            if (isVisible) {
                urlTextInput.classList.add('active');
            } else {
                urlTextInput.classList.remove('active');
            }
        }
    }

    // Add evidence
    addEvidenceConfirmBtn.addEventListener('click', () => {
        if (!selectedEvidenceType) {
            alert('Please select an evidence type');
            return;
        }
        
        if (editingEvidenceItem) {
            // Update existing evidence item
            updateEvidenceItem(editingEvidenceItem);
        } else {
            // Create new evidence item
            evidenceCount++;
            const evidenceItem = document.createElement('div');
            evidenceItem.className = 'evidence-item';
            evidenceItem.setAttribute('data-type', selectedEvidenceType);
            
            createEvidenceContent(evidenceItem, selectedEvidenceType, evidenceSpoilerCheckbox.checked, evidenceTitleInput.value.trim(), urlClickableCheckbox.checked);
            evidenceContainer.appendChild(evidenceItem);
            
            setupEvidenceEventListeners(evidenceItem);
        }
        
        closeEvidenceModal();
    });

    // Function to create evidence content
    function createEvidenceContent(evidenceItem, type, isSpoiler, title, isClickable) {
        let evidenceContent = '';
        
        switch(type) {
            case 'text':
                evidenceContent = `
                    <div class="evidence-title-input">
                        <input type="text" class="evidence-title-field" placeholder="Evidence Title" value="${title}">
                    </div>
                    <div class="evidence-line-with-title">
                        <textarea class="evidence-text-content" placeholder="Enter text evidence here..."></textarea>
                    </div>
                `;
                break;
            case 'image':
                evidenceContent = `
                    <div class="evidence-title-input">
                        <input type="text" class="evidence-title-field" placeholder="Image Title (Optional)" value="${title}">
                    </div>
                    <div class="image-urls-container">
                        <div class="image-url-line">
                            <input type="text" class="evidence-image-url" placeholder="Image URL">
                            <div class="evidence-line-actions">
                                <button class="remove-image-btn"><i class="fas fa-trash"></i></button>
                            </div>
                        </div>
                    </div>
                    <button class="add-image-btn"><i class="fas fa-plus"></i> Add Another Image</button>
                `;
                break;
            case 'url':
                evidenceContent = `
                    <div class="evidence-title-input">
                        <input type="text" class="evidence-title-field" placeholder="Link Title (Optional)" value="${title}">
                    </div>
                    <div class="checkbox-group url-options-inline">
                        <input type="checkbox" class="url-clickable-field" ${isClickable ? 'checked' : ''}>
                        <label>Use clickable text</label>
                    </div>
                    <div class="evidence-line">
                        <input type="text" class="evidence-url" placeholder="URL">
                    </div>
                    <div class="url-text-input ${isClickable ? 'active' : ''}">
                        <div class="evidence-line">
                            <input type="text" class="evidence-url-text" placeholder="Link Text" value="">
                        </div>
                    </div>
                `;
                break;
        }
        
        evidenceItem.innerHTML = `
            <div class="evidence-header">
                <div class="evidence-type">
                    <span class="evidence-number">${evidenceCount}.</span>
                    ${type.charAt(0).toUpperCase() + type.slice(1)} Evidence
                </div>
                <div class="evidence-actions">
                    <div class="checkbox-group">
                        <input type="checkbox" class="evidence-spoiler-field" ${isSpoiler ? 'checked' : ''}>
                        <label>Spoiler</label>
                    </div>
                    <button class="edit-evidence">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="remove-evidence">
                        <i class="fas fa-trash"></i> Remove
                    </button>
                </div>
            </div>
            <div class="evidence-content">
                ${evidenceContent}
            </div>
        `;
    }

    // Function to update existing evidence item
    function updateEvidenceItem(evidenceItem) {
        const type = evidenceItem.getAttribute('data-type');
        const isSpoiler = evidenceSpoilerCheckbox.checked;
        const title = evidenceTitleInput.value.trim();
        const isClickable = urlClickableCheckbox.checked;
        
        createEvidenceContent(evidenceItem, type, isSpoiler, title, isClickable);
        setupEvidenceEventListeners(evidenceItem);
    }

    // Function to setup event listeners for evidence items
    function setupEvidenceEventListeners(evidenceItem) {
        // Add event listeners for dynamic elements
        const removeBtn = evidenceItem.querySelector('.remove-evidence');
        removeBtn.addEventListener('click', () => {
            evidenceItem.remove();
            updateEvidenceNumbers();
        });
        
        // Add event listener for edit button
        const editBtn = evidenceItem.querySelector('.edit-evidence');
        editBtn.addEventListener('click', () => {
            editEvidenceItem(evidenceItem);
        });
        
        // For URL type, add functionality to toggle clickable text
        if (evidenceItem.getAttribute('data-type') === 'url') {
            const urlClickableField = evidenceItem.querySelector('.url-clickable-field');
            urlClickableField.addEventListener('change', () => {
                toggleUrlTextInput(evidenceItem, urlClickableField.checked);
            });
        }
        
        // For image type, add functionality to add/remove images
        if (evidenceItem.getAttribute('data-type') === 'image') {
            const addImageBtn = evidenceItem.querySelector('.add-image-btn');
            const imageUrlsContainer = evidenceItem.querySelector('.image-urls-container');
            
            addImageBtn.addEventListener('click', () => {
                const newImageLine = document.createElement('div');
                newImageLine.className = 'image-url-line';
                newImageLine.innerHTML = `
                    <input type="text" class="evidence-image-url" placeholder="Image URL">
                    <div class="evidence-line-actions">
                        <button class="remove-image-btn"><i class="fas fa-trash"></i></button>
                    </div>
                `;
                imageUrlsContainer.appendChild(newImageLine);
                
                // Add event listener to remove button
                const removeImageBtn = newImageLine.querySelector('.remove-image-btn');
                removeImageBtn.addEventListener('click', () => {
                    newImageLine.remove();
                });
            });
            
            // Add event listeners to existing remove buttons
            const removeImageBtns = evidenceItem.querySelectorAll('.remove-image-btn');
            removeImageBtns.forEach(btn => {
                btn.addEventListener('click', function() {
                    this.closest('.image-url-line').remove();
                });
            });
        }
    }

    // Function to edit an evidence item
    function editEvidenceItem(evidenceItem) {
        const type = evidenceItem.getAttribute('data-type');
        const titleField = evidenceItem.querySelector('.evidence-title-field');
        const spoilerField = evidenceItem.querySelector('.evidence-spoiler-field');
        
        // Set modal values based on existing evidence
        selectedEvidenceType = type;
        evidenceTypeOptions.forEach(option => {
            if (option.getAttribute('data-type') === type) {
                option.classList.add('selected');
            } else {
                option.classList.remove('selected');
            }
        });
        
        evidenceTitleInput.value = titleField ? titleField.value : '';
        evidenceSpoilerCheckbox.checked = spoilerField ? spoilerField.checked : false;
        
        // Handle URL-specific options
        if (type === 'url') {
            urlOptions.classList.add('active');
            const urlClickableField = evidenceItem.querySelector('.url-clickable-field');
            urlClickableCheckbox.checked = urlClickableField ? urlClickableField.checked : false;
            
            // Populate URL fields if they exist
            const urlField = evidenceItem.querySelector('.evidence-url');
            const urlTextField = evidenceItem.querySelector('.evidence-url-text');
            
            if (urlField) {
                // Store the current URL value to restore after modal opens
                setTimeout(() => {
                    const urlInput = document.querySelector('#evidence-modal .evidence-url');
                    if (urlInput) urlInput.value = urlField.value;
                }, 100);
            }
            
            if (urlTextField) {
                setTimeout(() => {
                    const urlTextInput = document.querySelector('#evidence-modal .evidence-url-text');
                    if (urlTextInput) urlTextInput.value = urlTextField.value;
                }, 100);
            }
        } else {
            urlOptions.classList.remove('active');
            urlClickableCheckbox.checked = false;
        }
        
        // Update preview
        updateEvidencePreview();
        
        // Set editing mode
        editingEvidenceItem = evidenceItem;
        addEvidenceConfirmBtn.innerHTML = '<i class="fas fa-save"></i> Update Evidence';
        
        // Open modal
        evidenceModal.classList.add('active');
    }

    // Update evidence numbers when items are removed
    function updateEvidenceNumbers() {
        const evidenceItems = evidenceContainer.querySelectorAll('.evidence-item');
        evidenceCount = evidenceItems.length;
        evidenceItems.forEach((item, index) => {
            const evidenceNumber = item.querySelector('.evidence-number');
            evidenceNumber.textContent = `${index + 1}.`;
        });
    }

    // Generate BB Code for TRAP Casefile
    const generateBtn = document.getElementById('generate-casefile-btn');
    const outputContainer = document.getElementById('casefile-output-container');
    const titleOutput = document.getElementById('casefile-title-output');
    const bbcodeOutput = document.getElementById('casefile-bbcode-output');
    const copyTitleBtn = document.getElementById('copy-casefile-title-btn');
    const copyBbcodeBtn = document.getElementById('copy-casefile-bbcode-btn');
    const resetBtn = document.getElementById('reset-casefile-btn');

    generateBtn.addEventListener('click', () => {
        // Get case information
        const caseTitle = document.getElementById('case-title').value;
        const caseDate = document.getElementById('case-date').value;
        
        // Generate title - use the date exactly as entered
        const generatedTitle = `[${caseDate}] ${caseTitle}`;
        titleOutput.textContent = generatedTitle;
        
        // Generate BB Code
        let bbcode = `[font=Arial][color=black]\n\n`;
        bbcode += `[center][img]https://i.imgur.com/LEWTXbL.png[/img]\n\n`;
        bbcode += `[size=125][b]SHERIFF'S DEPARTMENT\nCOUNTY OF LOS SANTOS[/b]\n[i]"A Tradition of Service Since 1850"[/i][/size]\n\n`;
        bbcode += `[size=110][u]CASE PACKAGE[/u][/size][/center][hr][/hr]\n\n`;
        bbcode += `[font=arial][color=black][indent][size=105][b]Investigative Background and Assignment[/b][/size]\n\n`;
        bbcode += `[indent]\n`;
        
        // Add investigative background
        const timeDate = document.getElementById('time-date').value;
        const penalCode = document.getElementById('penal-code').value;
        const location = document.getElementById('location').value;
        const investigators = document.getElementById('investigators').value;
        
        bbcode += `[b]Time & Date:[/b] ${timeDate || '0000, Month Day, Year'}\n`;
        bbcode += `[b]Penal Code (if Criminal):[/b] ${penalCode || '123MC, PENAL CODE TITLE; 456MC, PENAL CODE TITLE'}\n`;
        bbcode += `[b]Location:[/b] ${location || ''}\n\n`;
        bbcode += `[b]Handling Investigator(s):[/b] ${investigators || 'Rank Forename Surname (Lead); Rank Forename Surname; Rank Forename Surname'}\n`;
        bbcode += `[/indent]\n\n`;
        
        // Add involved persons
        bbcode += `[size=105][b]Involved Persons[/b][/size]\n`;
        bbcode += `[indent]`;
        
        const personSections = personsContainer.querySelectorAll('.person-section');
        personSections.forEach((section, index) => {
            const name = section.querySelector(`#person-name-${index+1}`).value || `Forename Surname`;
            const classification = section.querySelector(`#person-classification-${index+1}`).value;
            const dob = section.querySelector(`#person-dob-${index+1}`).value;
            const phone = section.querySelector(`#person-phone-${index+1}`).value;
            const residence = section.querySelector(`#person-residence-${index+1}`).value;
            const relation = section.querySelector(`#person-relation-${index+1}`).value;
            
            // Use date of birth exactly as entered
            let formattedDob = dob || '';
            
            bbcode += `[u]Person #${index+1} - ${name}[/u]\n`;
            bbcode += `[b]Classification:[/b] ${classification}\n`;
            bbcode += `[b]Date of Birth:[/b] ${formattedDob}\n`;
            bbcode += `[b]Phone Number:[/b] ${phone}\n`;
            bbcode += `[b]Residence:[/b] ${residence}\n`;
            bbcode += `[b]Relation to Incident:[/b] ${relation}\n\n`;
        });
        
        bbcode += `[/indent]\n\n`;
        
        // Add narrative
        const narrative = document.getElementById('narrative').value;
        bbcode += `[size=105][b]Narrative[/b][/size]\n`;
        bbcode += `[indent]${narrative || 'Write narrative here.'}[/indent]\n\n`;
        
        // Add evidence
        bbcode += `[size=105][b]Evidence[/b][/size]\n`;
        bbcode += `[list=1]`;
        
        const evidenceItems = evidenceContainer.querySelectorAll('.evidence-item');
        evidenceItems.forEach(item => {
            const type = item.getAttribute('data-type');
            const isSpoiler = item.querySelector('.evidence-spoiler-field').checked;
            const titleField = item.querySelector('.evidence-title-field');
            const title = titleField ? titleField.value.trim() : '';
            
            let evidenceContent = '';
            
            switch(type) {
                case 'text':
                    const textContent = item.querySelector('.evidence-text-content').value;
                    evidenceContent = textContent;
                    break;
                case 'image':
                    const imageUrls = item.querySelectorAll('.evidence-image-url');
                    let imageContent = '';
                    imageUrls.forEach(urlInput => {
                        if (urlInput.value.trim()) {
                            imageContent += `[img]${urlInput.value}[/img]\n`;
                        }
                    });
                    evidenceContent = imageContent;
                    break;
                case 'url':
                    const url = item.querySelector('.evidence-url').value;
                    const urlText = item.querySelector('.evidence-url-text');
                    if (urlText && urlText.value) {
                        evidenceContent = `[url=${url}]${urlText.value}[/url]`;
                    } else {
                        evidenceContent = `[url]${url}[/url]`;
                    }
                    break;
            }
            
            // Title is now outside the spoiler
            let finalEvidence = '';
            if (title) {
                finalEvidence = `${title}: `;
            }
            
            if (isSpoiler) {
                finalEvidence += `[spoiler]\n${evidenceContent}[/spoiler]`;
            } else {
                finalEvidence += evidenceContent;
            }
            
            bbcode += `[*] ${finalEvidence}\n`;
        });
        
        bbcode += `[/list]`;
        
        bbcodeOutput.textContent = bbcode;
        outputContainer.style.display = 'block';
        
        // Scroll to output
        outputContainer.scrollIntoView({ behavior: 'smooth' });
    });

    // Copy functionality
    copyTitleBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(titleOutput.textContent)
            .then(() => {
                showCopySuccess(copyTitleBtn);
            })
            .catch(err => {
                console.error('Failed to copy: ', err);
            });
    });

    copyBbcodeBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(bbcodeOutput.textContent)
            .then(() => {
                showCopySuccess(copyBbcodeBtn);
            })
            .catch(err => {
                console.error('Failed to copy: ', err);
            });
    });

    function showCopySuccess(button) {
        const originalText = button.innerHTML;
        button.innerHTML = '<i class="fas fa-check"></i> Copied!';
        button.disabled = true;
        
        setTimeout(() => {
            button.innerHTML = originalText;
            button.disabled = false;
        }, 2000);
    }

    // Reset form
    resetBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to reset the form? All data will be lost.')) {
            document.getElementById('case-title').value = '';
            document.getElementById('case-date').value = '';
            document.getElementById('time-date').value = '';
            document.getElementById('penal-code').value = '';
            document.getElementById('location').value = '';
            document.getElementById('investigators').value = '';
            document.getElementById('narrative').value = '';
            
            // Remove all persons except the first one
            const personSections = personsContainer.querySelectorAll('.person-section');
            for (let i = 1; i < personSections.length; i++) {
                personSections[i].remove();
            }
            
            // Reset first person
            document.getElementById('person-name-1').value = '';
            document.getElementById('person-classification-1').value = 'Victim';
            document.getElementById('person-dob-1').value = '';
            document.getElementById('person-phone-1').value = '';
            document.getElementById('person-residence-1').value = '';
            document.getElementById('person-relation-1').value = '';
            
            // Remove all evidence
            evidenceContainer.innerHTML = '';
            evidenceCount = 0;
            
            // Hide output
            outputContainer.style.display = 'none';
            
            alert('Form has been reset.');
        }
    });
}

// Supplemental Report Generator Functions
function initSupplementalReportGenerator() {
    const evidenceContainer = document.getElementById('supplemental-evidence-container');
    const addEvidenceBtn = document.getElementById('add-supplemental-evidence-btn');
    const evidenceModal = document.getElementById('evidence-modal');
    const evidenceTypeOptions = document.querySelectorAll('.evidence-type-option');
    const evidenceSpoilerCheckbox = document.getElementById('evidence-spoiler');
    const evidenceTitleInput = document.getElementById('evidence-title');
    const evidencePreview = document.getElementById('evidence-preview');
    const addEvidenceConfirmBtn = document.getElementById('add-evidence-confirm');
    const cancelEvidenceBtn = document.getElementById('cancel-evidence');
    const closeModalBtn = document.getElementById('close-modal');
    const urlOptions = document.getElementById('url-options');
    const urlClickableCheckbox = document.getElementById('url-clickable');

    let selectedEvidenceType = '';
    let evidenceCount = 0;
    let editingEvidenceItem = null;

    // Open evidence modal
    addEvidenceBtn.addEventListener('click', () => {
        evidenceModal.classList.add('active');
        selectedEvidenceType = '';
        evidenceTypeOptions.forEach(option => option.classList.remove('selected'));
        evidenceSpoilerCheckbox.checked = false;
        evidenceTitleInput.value = '';
        evidencePreview.style.display = 'none';
        urlOptions.classList.remove('active');
        urlClickableCheckbox.checked = false;
        editingEvidenceItem = null;
        addEvidenceConfirmBtn.innerHTML = '<i class="fas fa-plus"></i> Add Evidence';
    });

    // Close evidence modal
    function closeEvidenceModal() {
        evidenceModal.classList.remove('active');
    }

    closeModalBtn.addEventListener('click', closeEvidenceModal);
    cancelEvidenceBtn.addEventListener('click', closeEvidenceModal);

    // Select evidence type
    evidenceTypeOptions.forEach(option => {
        option.addEventListener('click', () => {
            evidenceTypeOptions.forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');
            selectedEvidenceType = option.getAttribute('data-type');
            
            // Show/hide URL options
            if (selectedEvidenceType === 'url') {
                urlOptions.classList.add('active');
            } else {
                urlOptions.classList.remove('active');
            }
            
            updateEvidencePreview();
        });
    });

    // Update evidence preview when inputs change
    evidenceSpoilerCheckbox.addEventListener('change', updateEvidencePreview);
    evidenceTitleInput.addEventListener('input', updateEvidencePreview);
    urlClickableCheckbox.addEventListener('change', updateEvidencePreview);

    function updateEvidencePreview() {
        if (!selectedEvidenceType) {
            evidencePreview.style.display = 'none';
            return;
        }
        
        let previewContent = '';
        const isSpoiler = evidenceSpoilerCheckbox.checked;
        const title = evidenceTitleInput.value.trim();
        
        switch(selectedEvidenceType) {
            case 'text':
                previewContent = '[Text content here]';
                break;
            case 'image':
                previewContent = '[img]https://example.com/image.jpg[/img]';
                break;
            case 'url':
                const isClickable = urlClickableCheckbox.checked;
                if (isClickable) {
                    previewContent = '[url=https://example.com]Clickable Text[/url]';
                } else {
                    previewContent = '[url]https://example.com[/url]';
                }
                break;
        }
        
        // Title is now outside the spoiler
        let finalPreview = '';
        if (title) {
            finalPreview = `${title}: `;
        }
        
        if (isSpoiler) {
            finalPreview += `[spoiler]\n${previewContent}\n[/spoiler]`;
        } else {
            finalPreview += previewContent;
        }
        
        evidencePreview.textContent = finalPreview;
        evidencePreview.style.display = 'block';
    }

    // Function to toggle URL text field visibility
    function toggleUrlTextInput(evidenceItem, isVisible) {
        const urlTextInput = evidenceItem.querySelector('.url-text-input');
        if (urlTextInput) {
            if (isVisible) {
                urlTextInput.classList.add('active');
            } else {
                urlTextInput.classList.remove('active');
            }
        }
    }

    // Add evidence
    addEvidenceConfirmBtn.addEventListener('click', () => {
        if (!selectedEvidenceType) {
            alert('Please select an evidence type');
            return;
        }
        
        if (editingEvidenceItem) {
            // Update existing evidence item
            updateEvidenceItem(editingEvidenceItem);
        } else {
            // Create new evidence item
            evidenceCount++;
            const evidenceItem = document.createElement('div');
            evidenceItem.className = 'evidence-item';
            evidenceItem.setAttribute('data-type', selectedEvidenceType);
            
            createEvidenceContent(evidenceItem, selectedEvidenceType, evidenceSpoilerCheckbox.checked, evidenceTitleInput.value.trim(), urlClickableCheckbox.checked);
            evidenceContainer.appendChild(evidenceItem);
            
            setupEvidenceEventListeners(evidenceItem);
        }
        
        closeEvidenceModal();
    });

    // Function to create evidence content
    function createEvidenceContent(evidenceItem, type, isSpoiler, title, isClickable) {
        let evidenceContent = '';
        
        switch(type) {
            case 'text':
                evidenceContent = `
                    <div class="evidence-title-input">
                        <input type="text" class="evidence-title-field" placeholder="Evidence Title" value="${title}">
                    </div>
                    <div class="evidence-line-with-title">
                        <textarea class="evidence-text-content" placeholder="Enter text evidence here..."></textarea>
                    </div>
                `;
                break;
            case 'image':
                evidenceContent = `
                    <div class="evidence-title-input">
                        <input type="text" class="evidence-title-field" placeholder="Image Title (Optional)" value="${title}">
                    </div>
                    <div class="image-urls-container">
                        <div class="image-url-line">
                            <input type="text" class="evidence-image-url" placeholder="Image URL">
                            <div class="evidence-line-actions">
                                <button class="remove-image-btn"><i class="fas fa-trash"></i></button>
                            </div>
                        </div>
                    </div>
                    <button class="add-image-btn"><i class="fas fa-plus"></i> Add Another Image</button>
                `;
                break;
            case 'url':
                evidenceContent = `
                    <div class="evidence-title-input">
                        <input type="text" class="evidence-title-field" placeholder="Link Title (Optional)" value="${title}">
                    </div>
                    <div class="checkbox-group url-options-inline">
                        <input type="checkbox" class="url-clickable-field" ${isClickable ? 'checked' : ''}>
                        <label>Use clickable text</label>
                    </div>
                    <div class="evidence-line">
                        <input type="text" class="evidence-url" placeholder="URL">
                    </div>
                    <div class="url-text-input ${isClickable ? 'active' : ''}">
                        <div class="evidence-line">
                            <input type="text" class="evidence-url-text" placeholder="Link Text" value="">
                        </div>
                    </div>
                `;
                break;
        }
        
        evidenceItem.innerHTML = `
            <div class="evidence-header">
                <div class="evidence-type">
                    <span class="evidence-number">${evidenceCount}.</span>
                    ${type.charAt(0).toUpperCase() + type.slice(1)} Evidence
                </div>
                <div class="evidence-actions">
                    <div class="checkbox-group">
                        <input type="checkbox" class="evidence-spoiler-field" ${isSpoiler ? 'checked' : ''}>
                        <label>Spoiler</label>
                    </div>
                    <button class="edit-evidence">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="remove-evidence">
                        <i class="fas fa-trash"></i> Remove
                    </button>
                </div>
            </div>
            <div class="evidence-content">
                ${evidenceContent}
            </div>
        `;
    }

    // Function to update existing evidence item
    function updateEvidenceItem(evidenceItem) {
        const type = evidenceItem.getAttribute('data-type');
        const isSpoiler = evidenceSpoilerCheckbox.checked;
        const title = evidenceTitleInput.value.trim();
        const isClickable = urlClickableCheckbox.checked;
        
        createEvidenceContent(evidenceItem, type, isSpoiler, title, isClickable);
        setupEvidenceEventListeners(evidenceItem);
    }

    // Function to setup event listeners for evidence items
    function setupEvidenceEventListeners(evidenceItem) {
        // Add event listeners for dynamic elements
        const removeBtn = evidenceItem.querySelector('.remove-evidence');
        removeBtn.addEventListener('click', () => {
            evidenceItem.remove();
            updateEvidenceNumbers();
        });
        
        // Add event listener for edit button
        const editBtn = evidenceItem.querySelector('.edit-evidence');
        editBtn.addEventListener('click', () => {
            editEvidenceItem(evidenceItem);
        });
        
        // For URL type, add functionality to toggle clickable text
        if (evidenceItem.getAttribute('data-type') === 'url') {
            const urlClickableField = evidenceItem.querySelector('.url-clickable-field');
            urlClickableField.addEventListener('change', () => {
                toggleUrlTextInput(evidenceItem, urlClickableField.checked);
            });
        }
        
        // For image type, add functionality to add/remove images
        if (evidenceItem.getAttribute('data-type') === 'image') {
            const addImageBtn = evidenceItem.querySelector('.add-image-btn');
            const imageUrlsContainer = evidenceItem.querySelector('.image-urls-container');
            
            addImageBtn.addEventListener('click', () => {
                const newImageLine = document.createElement('div');
                newImageLine.className = 'image-url-line';
                newImageLine.innerHTML = `
                    <input type="text" class="evidence-image-url" placeholder="Image URL">
                    <div class="evidence-line-actions">
                        <button class="remove-image-btn"><i class="fas fa-trash"></i></button>
                    </div>
                `;
                imageUrlsContainer.appendChild(newImageLine);
                
                // Add event listener to remove button
                const removeImageBtn = newImageLine.querySelector('.remove-image-btn');
                removeImageBtn.addEventListener('click', () => {
                    newImageLine.remove();
                });
            });
            
            // Add event listeners to existing remove buttons
            const removeImageBtns = evidenceItem.querySelectorAll('.remove-image-btn');
            removeImageBtns.forEach(btn => {
                btn.addEventListener('click', function() {
                    this.closest('.image-url-line').remove();
                });
            });
        }
    }

    // Function to edit an evidence item
    function editEvidenceItem(evidenceItem) {
        const type = evidenceItem.getAttribute('data-type');
        const titleField = evidenceItem.querySelector('.evidence-title-field');
        const spoilerField = evidenceItem.querySelector('.evidence-spoiler-field');
        
        // Set modal values based on existing evidence
        selectedEvidenceType = type;
        evidenceTypeOptions.forEach(option => {
            if (option.getAttribute('data-type') === type) {
                option.classList.add('selected');
            } else {
                option.classList.remove('selected');
            }
        });
        
        evidenceTitleInput.value = titleField ? titleField.value : '';
        evidenceSpoilerCheckbox.checked = spoilerField ? spoilerField.checked : false;
        
        // Handle URL-specific options
        if (type === 'url') {
            urlOptions.classList.add('active');
            const urlClickableField = evidenceItem.querySelector('.url-clickable-field');
            urlClickableCheckbox.checked = urlClickableField ? urlClickableField.checked : false;
            
            // Populate URL fields if they exist
            const urlField = evidenceItem.querySelector('.evidence-url');
            const urlTextField = evidenceItem.querySelector('.evidence-url-text');
            
            if (urlField) {
                // Store the current URL value to restore after modal opens
                setTimeout(() => {
                    const urlInput = document.querySelector('#evidence-modal .evidence-url');
                    if (urlInput) urlInput.value = urlField.value;
                }, 100);
            }
            
            if (urlTextField) {
                setTimeout(() => {
                    const urlTextInput = document.querySelector('#evidence-modal .evidence-url-text');
                    if (urlTextInput) urlTextInput.value = urlTextField.value;
                }, 100);
            }
        } else {
            urlOptions.classList.remove('active');
            urlClickableCheckbox.checked = false;
        }
        
        // Update preview
        updateEvidencePreview();
        
        // Set editing mode
        editingEvidenceItem = evidenceItem;
        addEvidenceConfirmBtn.innerHTML = '<i class="fas fa-save"></i> Update Evidence';
        
        // Open modal
        evidenceModal.classList.add('active');
    }

    // Update evidence numbers when items are removed
    function updateEvidenceNumbers() {
        const evidenceItems = evidenceContainer.querySelectorAll('.evidence-item');
        evidenceCount = evidenceItems.length;
        evidenceItems.forEach((item, index) => {
            const evidenceNumber = item.querySelector('.evidence-number');
            evidenceNumber.textContent = `${index + 1}.`;
        });
    }

    // Generate BB Code for Supplemental Report
    const generateBtn = document.getElementById('generate-supplemental-btn');
    const outputContainer = document.getElementById('supplemental-output-container');
    const bbcodeOutput = document.getElementById('supplemental-bbcode-output');
    const copyBbcodeBtn = document.getElementById('copy-supplemental-bbcode-btn');
    const resetBtn = document.getElementById('reset-supplemental-btn');

    generateBtn.addEventListener('click', () => {
        // Get form values
        const narrative = document.getElementById('supplemental-narrative').value;
        const filedBy = document.getElementById('supplemental-filed-by').value;
        
        // Generate BB Code
        let bbcode = `[font=Arial][color=black]\n\n`;
        bbcode += `[center][img]https://i.imgur.com/LEWTXbL.png[/img]\n\n`;
        bbcode += `[size=125][b]SHERIFF'S DEPARTMENT\nCOUNTY OF LOS SANTOS[/b]\n[i]"A Tradition of Service Since 1850"[/i][/size]\n\n`;
        bbcode += `[size=110][u]SUPPLEMENTAL REPORT[/u][/size][/center][hr][/hr]\n\n`;
        bbcode += `[font=arial][color=black]\n`;
        
        // Add narrative
        bbcode += `[size=105][b]Narrative[/b][/size]\n`;
        bbcode += `[indent]${narrative || 'Write narrative here.'}[/indent]\n\n`;
        
        // Add evidence
        bbcode += `[size=105][b]Evidence[/b][/size]\n`;
        bbcode += `[list=1]`;
        
        const evidenceItems = evidenceContainer.querySelectorAll('.evidence-item');
        if (evidenceItems.length === 0) {
            bbcode += `[*] EL Number: Description of evidence\n`;
        } else {
            evidenceItems.forEach(item => {
                const type = item.getAttribute('data-type');
                const isSpoiler = item.querySelector('.evidence-spoiler-field').checked;
                const titleField = item.querySelector('.evidence-title-field');
                const title = titleField ? titleField.value.trim() : '';
                
                let evidenceContent = '';
                
                switch(type) {
                    case 'text':
                        const textContent = item.querySelector('.evidence-text-content').value;
                        evidenceContent = textContent;
                        break;
                    case 'image':
                        const imageUrls = item.querySelectorAll('.evidence-image-url');
                        let imageContent = '';
                        imageUrls.forEach(urlInput => {
                            if (urlInput.value.trim()) {
                                imageContent += `[img]${urlInput.value}[/img]\n`;
                            }
                        });
                        evidenceContent = imageContent;
                        break;
                    case 'url':
                        const url = item.querySelector('.evidence-url').value;
                        const urlText = item.querySelector('.evidence-url-text');
                        if (urlText && urlText.value) {
                            evidenceContent = `[url=${url}]${urlText.value}[/url]`;
                        } else {
                            evidenceContent = `[url]${url}[/url]`;
                        }
                        break;
                }
                
                // Title is now outside the spoiler
                let finalEvidence = '';
                if (title) {
                    finalEvidence = `${title}: `;
                }
                
                if (isSpoiler) {
                    finalEvidence += `[spoiler]\n${evidenceContent}[/spoiler]`;
                } else {
                    finalEvidence += evidenceContent;
                }
                
                bbcode += `[*] ${finalEvidence}\n`;
            });
        }
        
        bbcode += `[/list]\n\n`;
        
        // Add filed by
        bbcode += `[size=105][b]Filed By:[/b][/size]\n`;
        bbcode += `[indent]${filedBy || 'Rank Forename Surname'}[/indent]`;
        
        bbcodeOutput.textContent = bbcode;
        outputContainer.style.display = 'block';
        
        // Scroll to output
        outputContainer.scrollIntoView({ behavior: 'smooth' });
    });

    // Copy functionality
    copyBbcodeBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(bbcodeOutput.textContent)
            .then(() => {
                showCopySuccess(copyBbcodeBtn);
            })
            .catch(err => {
                console.error('Failed to copy: ', err);
            });
    });

    function showCopySuccess(button) {
        const originalText = button.innerHTML;
        button.innerHTML = '<i class="fas fa-check"></i> Copied!';
        button.disabled = true;
        
        setTimeout(() => {
            button.innerHTML = originalText;
            button.disabled = false;
        }, 2000);
    }

    // Reset form
    resetBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to reset the form? All data will be lost.')) {
            document.getElementById('supplemental-narrative').value = '';
            document.getElementById('supplemental-filed-by').value = '';
            
            // Remove all evidence
            evidenceContainer.innerHTML = '';
            evidenceCount = 0;
            
            // Hide output
            outputContainer.style.display = 'none';
            
            alert('Form has been reset.');
        }
    });
}

// Stolen Vehicle Report Generator Functions
function initStolenVehicleReportGenerator() {
    // Conditional field for stolen items
    const itemsStolenSelect = document.getElementById('sv-items-stolen');
    const stolenItemsContainer = document.getElementById('sv-stolen-items-container');

    itemsStolenSelect.addEventListener('change', () => {
        if (itemsStolenSelect.value === 'Yes') {
            stolenItemsContainer.style.display = 'block';
        } else {
            stolenItemsContainer.style.display = 'none';
        }
    });

    // Evidence management for stolen vehicle report
    const evidenceContainer = document.getElementById('sv-evidence-container');
    const addEvidenceBtn = document.getElementById('sv-add-evidence-btn');
    const evidenceModal = document.getElementById('evidence-modal');
    const evidenceTypeOptions = document.querySelectorAll('.evidence-type-option');
    const evidenceSpoilerCheckbox = document.getElementById('evidence-spoiler');
    const evidenceTitleInput = document.getElementById('evidence-title');
    const evidencePreview = document.getElementById('evidence-preview');
    const addEvidenceConfirmBtn = document.getElementById('add-evidence-confirm');
    const cancelEvidenceBtn = document.getElementById('cancel-evidence');
    const closeModalBtn = document.getElementById('close-modal');
    const urlOptions = document.getElementById('url-options');
    const urlClickableCheckbox = document.getElementById('url-clickable');

    let selectedEvidenceType = '';
    let evidenceCount = 0;
    let editingEvidenceItem = null;

    // Open evidence modal for stolen vehicle report
    addEvidenceBtn.addEventListener('click', () => {
        evidenceModal.classList.add('active');
        selectedEvidenceType = '';
        evidenceTypeOptions.forEach(option => option.classList.remove('selected'));
        evidenceSpoilerCheckbox.checked = false;
        evidenceTitleInput.value = '';
        evidencePreview.style.display = 'none';
        urlOptions.classList.remove('active');
        urlClickableCheckbox.checked = false;
        editingEvidenceItem = null;
        addEvidenceConfirmBtn.innerHTML = '<i class="fas fa-plus"></i> Add Evidence';
    });

    // Close evidence modal
    function closeEvidenceModal() {
        evidenceModal.classList.remove('active');
    }

    closeModalBtn.addEventListener('click', closeEvidenceModal);
    cancelEvidenceBtn.addEventListener('click', closeEvidenceModal);

    // Select evidence type
    evidenceTypeOptions.forEach(option => {
        option.addEventListener('click', () => {
            evidenceTypeOptions.forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');
            selectedEvidenceType = option.getAttribute('data-type');
            
            // Show/hide URL options
            if (selectedEvidenceType === 'url') {
                urlOptions.classList.add('active');
            } else {
                urlOptions.classList.remove('active');
            }
            
            updateEvidencePreview();
        });
    });

    // Update evidence preview when inputs change
    evidenceSpoilerCheckbox.addEventListener('change', updateEvidencePreview);
    evidenceTitleInput.addEventListener('input', updateEvidencePreview);
    urlClickableCheckbox.addEventListener('change', updateEvidencePreview);

    function updateEvidencePreview() {
        if (!selectedEvidenceType) {
            evidencePreview.style.display = 'none';
            return;
        }
        
        let previewContent = '';
        const isSpoiler = evidenceSpoilerCheckbox.checked;
        const title = evidenceTitleInput.value.trim();
        
        switch(selectedEvidenceType) {
            case 'text':
                previewContent = '[Text content here]';
                break;
            case 'image':
                previewContent = '[img]https://example.com/image.jpg[/img]';
                break;
            case 'url':
                const isClickable = urlClickableCheckbox.checked;
                if (isClickable) {
                    previewContent = '[url=https://example.com]Clickable Text[/url]';
                } else {
                    previewContent = '[url]https://example.com[/url]';
                }
                break;
        }
        
        // Title is now outside the spoiler
        let finalPreview = '';
        if (title) {
            finalPreview = `${title}: `;
        }
        
        if (isSpoiler) {
            finalPreview += `[spoiler]\n${previewContent}\n[/spoiler]`;
        } else {
            finalPreview += previewContent;
        }
        
        evidencePreview.textContent = finalPreview;
        evidencePreview.style.display = 'block';
    }

    // Function to toggle URL text field visibility
    function toggleUrlTextInput(evidenceItem, isVisible) {
        const urlTextInput = evidenceItem.querySelector('.url-text-input');
        if (urlTextInput) {
            if (isVisible) {
                urlTextInput.classList.add('active');
            } else {
                urlTextInput.classList.remove('active');
            }
        }
    }

    // Add evidence
    addEvidenceConfirmBtn.addEventListener('click', () => {
        if (!selectedEvidenceType) {
            alert('Please select an evidence type');
            return;
        }
        
        if (editingEvidenceItem) {
            // Update existing evidence item
            updateEvidenceItem(editingEvidenceItem);
        } else {
            // Create new evidence item
            evidenceCount++;
            const evidenceItem = document.createElement('div');
            evidenceItem.className = 'evidence-item';
            evidenceItem.setAttribute('data-type', selectedEvidenceType);
            
            createEvidenceContent(evidenceItem, selectedEvidenceType, evidenceSpoilerCheckbox.checked, evidenceTitleInput.value.trim(), urlClickableCheckbox.checked);
            evidenceContainer.appendChild(evidenceItem);
            
            setupEvidenceEventListeners(evidenceItem);
        }
        
        closeEvidenceModal();
    });

    // Function to create evidence content
    function createEvidenceContent(evidenceItem, type, isSpoiler, title, isClickable) {
        let evidenceContent = '';
        
        switch(type) {
            case 'text':
                evidenceContent = `
                    <div class="evidence-title-input">
                        <input type="text" class="evidence-title-field" placeholder="Evidence Title" value="${title}">
                    </div>
                    <div class="evidence-line-with-title">
                        <textarea class="evidence-text-content" placeholder="Enter text evidence here..."></textarea>
                    </div>
                `;
                break;
            case 'image':
                evidenceContent = `
                    <div class="evidence-title-input">
                        <input type="text" class="evidence-title-field" placeholder="Image Title (Optional)" value="${title}">
                    </div>
                    <div class="image-urls-container">
                        <div class="image-url-line">
                            <input type="text" class="evidence-image-url" placeholder="Image URL">
                            <div class="evidence-line-actions">
                                <button class="remove-image-btn"><i class="fas fa-trash"></i></button>
                            </div>
                        </div>
                    </div>
                    <button class="add-image-btn"><i class="fas fa-plus"></i> Add Another Image</button>
                `;
                break;
            case 'url':
                evidenceContent = `
                    <div class="evidence-title-input">
                        <input type="text" class="evidence-title-field" placeholder="Link Title (Optional)" value="${title}">
                    </div>
                    <div class="checkbox-group url-options-inline">
                        <input type="checkbox" class="url-clickable-field" ${isClickable ? 'checked' : ''}>
                        <label>Use clickable text</label>
                    </div>
                    <div class="evidence-line">
                        <input type="text" class="evidence-url" placeholder="URL">
                    </div>
                    <div class="url-text-input ${isClickable ? 'active' : ''}">
                        <div class="evidence-line">
                            <input type="text" class="evidence-url-text" placeholder="Link Text" value="">
                        </div>
                    </div>
                `;
                break;
        }
        
        evidenceItem.innerHTML = `
            <div class="evidence-header">
                <div class="evidence-type">
                    <span class="evidence-number">${evidenceCount}.</span>
                    ${type.charAt(0).toUpperCase() + type.slice(1)} Evidence
                </div>
                <div class="evidence-actions">
                    <div class="checkbox-group">
                        <input type="checkbox" class="evidence-spoiler-field" ${isSpoiler ? 'checked' : ''}>
                        <label>Spoiler</label>
                    </div>
                    <button class="edit-evidence">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="remove-evidence">
                        <i class="fas fa-trash"></i> Remove
                    </button>
                </div>
            </div>
            <div class="evidence-content">
                ${evidenceContent}
            </div>
        `;
    }

    // Function to update existing evidence item
    function updateEvidenceItem(evidenceItem) {
        const type = evidenceItem.getAttribute('data-type');
        const isSpoiler = evidenceSpoilerCheckbox.checked;
        const title = evidenceTitleInput.value.trim();
        const isClickable = urlClickableCheckbox.checked;
        
        createEvidenceContent(evidenceItem, type, isSpoiler, title, isClickable);
        setupEvidenceEventListeners(evidenceItem);
    }

    // Function to setup event listeners for evidence items
    function setupEvidenceEventListeners(evidenceItem) {
        // Add event listeners for dynamic elements
        const removeBtn = evidenceItem.querySelector('.remove-evidence');
        removeBtn.addEventListener('click', () => {
            evidenceItem.remove();
            updateEvidenceNumbers();
        });
        
        // Add event listener for edit button
        const editBtn = evidenceItem.querySelector('.edit-evidence');
        editBtn.addEventListener('click', () => {
            editEvidenceItem(evidenceItem);
        });
        
        // For URL type, add functionality to toggle clickable text
        if (evidenceItem.getAttribute('data-type') === 'url') {
            const urlClickableField = evidenceItem.querySelector('.url-clickable-field');
            urlClickableField.addEventListener('change', () => {
                toggleUrlTextInput(evidenceItem, urlClickableField.checked);
            });
        }
        
        // For image type, add functionality to add/remove images
        if (evidenceItem.getAttribute('data-type') === 'image') {
            const addImageBtn = evidenceItem.querySelector('.add-image-btn');
            const imageUrlsContainer = evidenceItem.querySelector('.image-urls-container');
            
            addImageBtn.addEventListener('click', () => {
                const newImageLine = document.createElement('div');
                newImageLine.className = 'image-url-line';
                newImageLine.innerHTML = `
                    <input type="text" class="evidence-image-url" placeholder="Image URL">
                    <div class="evidence-line-actions">
                        <button class="remove-image-btn"><i class="fas fa-trash"></i></button>
                    </div>
                `;
                imageUrlsContainer.appendChild(newImageLine);
                
                // Add event listener to remove button
                const removeImageBtn = newImageLine.querySelector('.remove-image-btn');
                removeImageBtn.addEventListener('click', () => {
                    newImageLine.remove();
                });
            });
            
            // Add event listeners to existing remove buttons
            const removeImageBtns = evidenceItem.querySelectorAll('.remove-image-btn');
            removeImageBtns.forEach(btn => {
                btn.addEventListener('click', function() {
                    this.closest('.image-url-line').remove();
                });
            });
        }
    }

    // Function to edit an evidence item
    function editEvidenceItem(evidenceItem) {
        const type = evidenceItem.getAttribute('data-type');
        const titleField = evidenceItem.querySelector('.evidence-title-field');
        const spoilerField = evidenceItem.querySelector('.evidence-spoiler-field');
        
        // Set modal values based on existing evidence
        selectedEvidenceType = type;
        evidenceTypeOptions.forEach(option => {
            if (option.getAttribute('data-type') === type) {
                option.classList.add('selected');
            } else {
                option.classList.remove('selected');
            }
        });
        
        evidenceTitleInput.value = titleField ? titleField.value : '';
        evidenceSpoilerCheckbox.checked = spoilerField ? spoilerField.checked : false;
        
        // Handle URL-specific options
        if (type === 'url') {
            urlOptions.classList.add('active');
            const urlClickableField = evidenceItem.querySelector('.url-clickable-field');
            urlClickableCheckbox.checked = urlClickableField ? urlClickableField.checked : false;
            
            // Populate URL fields if they exist
            const urlField = evidenceItem.querySelector('.evidence-url');
            const urlTextField = evidenceItem.querySelector('.evidence-url-text');
            
            if (urlField) {
                // Store the current URL value to restore after modal opens
                setTimeout(() => {
                    const urlInput = document.querySelector('#evidence-modal .evidence-url');
                    if (urlInput) urlInput.value = urlField.value;
                }, 100);
            }
            
            if (urlTextField) {
                setTimeout(() => {
                    const urlTextInput = document.querySelector('#evidence-modal .evidence-url-text');
                    if (urlTextInput) urlTextInput.value = urlTextField.value;
                }, 100);
            }
        } else {
            urlOptions.classList.remove('active');
            urlClickableCheckbox.checked = false;
        }
        
        // Update preview
        updateEvidencePreview();
        
        // Set editing mode
        editingEvidenceItem = evidenceItem;
        addEvidenceConfirmBtn.innerHTML = '<i class="fas fa-save"></i> Update Evidence';
        
        // Open modal
        evidenceModal.classList.add('active');
    }

    // Update evidence numbers when items are removed
    function updateEvidenceNumbers() {
        const evidenceItems = evidenceContainer.querySelectorAll('.evidence-item');
        evidenceCount = evidenceItems.length;
        evidenceItems.forEach((item, index) => {
            const evidenceNumber = item.querySelector('.evidence-number');
            evidenceNumber.textContent = `${index + 1}.`;
        });
    }

    // Generate BB Code for Stolen Vehicle Report
    const generateBtn = document.getElementById('sv-generate-btn');
    const outputContainer = document.getElementById('sv-output-container');
    const titleOutput = document.getElementById('sv-title-output');
    const bbcodeOutput = document.getElementById('sv-bbcode-output');
    const copyTitleBtn = document.getElementById('sv-copy-title-btn');
    const copyBbcodeBtn = document.getElementById('sv-copy-bbcode-btn');
    const resetBtn = document.getElementById('sv-reset-btn');

    generateBtn.addEventListener('click', () => {
        // Get form values
        const caseTitle = document.getElementById('sv-case-title').value;
        const timeDate = document.getElementById('sv-time-date').value;
        const location = document.getElementById('sv-location').value;
        const vehicleDetails = document.getElementById('sv-vehicle-details').value;
        const vehiclePlate = document.getElementById('sv-vehicle-plate').value;
        const vehicleOwner = document.getElementById('sv-vehicle-owner').value;
        const callId = document.getElementById('sv-call-id').value;
        const narrative = document.getElementById('sv-narrative').value;
        const victimStatement = document.getElementById('sv-victim-statement').value;
        const armedRobbery = document.getElementById('sv-armed-robbery').value;
        const itemsStolen = document.getElementById('sv-items-stolen').value;
        const stolenItems = document.getElementById('sv-stolen-items').value;
        const fingerprints = document.getElementById('sv-fingerprints').value;
        const recovered = document.getElementById('sv-recovered').value;
        const ssbReport = document.getElementById('sv-ssb-report').value;
        const additionalInfo = document.getElementById('sv-additional-info').value;
        
        // Generate Title
        const generatedTitle = caseTitle || '[PLATE] Vehicle Make Model (Status)';
        titleOutput.textContent = generatedTitle;
        
        // Generate BB Code
        let bbcode = `[divbox=transparent]\n`;
        bbcode += `[center][img]https://i.imgur.com/5Jhd9NC.png[/img]\n`;
        bbcode += `[hr][/hr]\n`;
        bbcode += `[size=150][b][b]Taskforce for Regional Autotheft Prevention - Stolen Vehicle Database[/b][/b][/size]\n`;
        bbcode += `[hr][/hr]\n`;
        bbcode += `[/divbox]\n`;
        bbcode += `[hr][/hr]\n`;
        bbcode += `[divbox=#323564][center][color=white][b]Stolen Vehicle Report[/b][/color][/center][/divbox]\n`;
        bbcode += `[divbox=transparent]\n`;
        bbcode += `[br][/br]\n`;
        bbcode += `[b]Time & Date:[/b] ${timeDate || 'DAY/MM/YEAR'}\n`;
        bbcode += `[b]Location:[/b] ${location || 'AREA/STREET'}\n`;
        bbcode += `[b]Vehicle Color, Make, & Model:[/b] ${vehicleDetails || 'COLOR MAKE MODEL'}\n`;
        bbcode += `[b]Vehicle Plate:[/b] ${vehiclePlate || 'PLATE'}\n`;
        bbcode += `[b]Owner:[/b] ${vehicleOwner || 'OWNER FIRST LAST'}\n`;
        bbcode += `[b]Call-ID:[/b] ${callId || '#XXXX/Self-Initiated'}\n`;
        bbcode += `[b]Narrative:[/b][list]\n`;
        bbcode += `[*] ${narrative || 'Write Narrative Here'}\n`;
        bbcode += `[/list]\n`;
        bbcode += `[b]Victim Statement:[/b][list]\n`;
        bbcode += `[*] ${victimStatement || 'Attach Statement Here'}\n`;
        bbcode += `[/list]\n`;
        
        // Add evidence section
        bbcode += `[b]Evidence:[/b]\n`;
        bbcode += `[list]\n`;
        
        const evidenceItems = evidenceContainer.querySelectorAll('.evidence-item');
        if (evidenceItems.length > 0) {
            evidenceItems.forEach(item => {
                const type = item.getAttribute('data-type');
                const isSpoiler = item.querySelector('.evidence-spoiler-field').checked;
                const titleField = item.querySelector('.evidence-title-field');
                const title = titleField ? titleField.value.trim() : '';
                
                let evidenceContent = '';
                
                switch(type) {
                    case 'text':
                        const textContent = item.querySelector('.evidence-text-content').value;
                        evidenceContent = textContent;
                        break;
                    case 'image':
                        const imageUrls = item.querySelectorAll('.evidence-image-url');
                        let imageContent = '';
                        imageUrls.forEach(urlInput => {
                            if (urlInput.value.trim()) {
                                imageContent += `[img]${urlInput.value}[/img]\n`;
                            }
                        });
                        evidenceContent = imageContent;
                        break;
                    case 'url':
                        const url = item.querySelector('.evidence-url').value;
                        const urlText = item.querySelector('.evidence-url-text');
                        if (urlText && urlText.value) {
                            evidenceContent = `[url=${url}]${urlText.value}[/url]`;
                        } else {
                            evidenceContent = `[url]${url}[/url]`;
                        }
                        break;
                }
                
                // Title is now outside the spoiler
                let finalEvidence = '';
                if (title) {
                    finalEvidence = `${title}: `;
                }
                
                if (isSpoiler) {
                    finalEvidence += `[spoiler]\n${evidenceContent}[/spoiler]`;
                } else {
                    finalEvidence += evidenceContent;
                }
                
                bbcode += `[*] ${finalEvidence}\n`;
            });
        } else {
            bbcode += `[*] - Photos/Videos (Add/Delete lines as needed)\n`;
            bbcode += `[*] - CCTV\n`;
            bbcode += `[*] - Additional Statements\n`;
        }
        
        bbcode += `[/list]\n`;
        
        // Add additional information
        bbcode += `[b]Armed Robbery?[/b] ${armedRobbery}\n`;
        bbcode += `[b]Additional Items Stolen?[/b] ${itemsStolen}\n`;
        
        if (itemsStolen === 'Yes' && stolenItems) {
            bbcode += `[b]If Yes;[/b]\n`;
            bbcode += `[list][*]${stolenItems}[/list]\n`;
        } else {
            bbcode += `[b]If Yes;[/b]\n`;
            bbcode += `[list][*]List Items Here, If No: Delete this line[/list]\n`;
        }
        
        bbcode += `[b]Finger prints taken?[/b] ${fingerprints}\n`;
        bbcode += `[b]Recovered?[/b] ${recovered}\n`;
        bbcode += `[b]Link to SSB report:[/b] ${ssbReport || ''}\n`;
        bbcode += `[b]Additional Information:[/b] ${additionalInfo || ''}\n`;
        bbcode += `[br][/br]\n`;
        bbcode += `[/divbox]`;
        
        bbcodeOutput.textContent = bbcode;
        outputContainer.style.display = 'block';
        
        // Scroll to output
        outputContainer.scrollIntoView({ behavior: 'smooth' });
    });

    // Copy functionality
    copyTitleBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(titleOutput.textContent)
            .then(() => {
                showCopySuccess(copyTitleBtn);
            })
            .catch(err => {
                console.error('Failed to copy: ', err);
            });
    });

    copyBbcodeBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(bbcodeOutput.textContent)
            .then(() => {
                showCopySuccess(copyBbcodeBtn);
            })
            .catch(err => {
                console.error('Failed to copy: ', err);
            });
    });

    function showCopySuccess(button) {
        const originalText = button.innerHTML;
        button.innerHTML = '<i class="fas fa-check"></i> Copied!';
        button.disabled = true;
        
        setTimeout(() => {
            button.innerHTML = originalText;
            button.disabled = false;
        }, 2000);
    }

    // Reset form
    resetBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to reset the form? All data will be lost.')) {
            // Reset all form fields
            document.getElementById('sv-case-title').value = '';
            document.getElementById('sv-time-date').value = '';
            document.getElementById('sv-location').value = '';
            document.getElementById('sv-vehicle-details').value = '';
            document.getElementById('sv-vehicle-plate').value = '';
            document.getElementById('sv-vehicle-owner').value = '';
            document.getElementById('sv-call-id').value = '';
            document.getElementById('sv-narrative').value = '';
            document.getElementById('sv-victim-statement').value = '';
            document.getElementById('sv-armed-robbery').value = 'No';
            document.getElementById('sv-items-stolen').value = 'No';
            document.getElementById('sv-stolen-items').value = '';
            document.getElementById('sv-fingerprints').value = 'No';
            document.getElementById('sv-recovered').value = 'No';
            document.getElementById('sv-ssb-report').value = '';
            document.getElementById('sv-additional-info').value = '';
            
            // Hide stolen items container
            stolenItemsContainer.style.display = 'none';
            
            // Remove all evidence
            evidenceContainer.innerHTML = '';
            evidenceCount = 0;
            
            // Hide output
            outputContainer.style.display = 'none';
            
            alert('Form has been reset.');
        }
    });
}

// Stolen Plate Report Generator Functions
function initStolenPlateReportGenerator() {
    // Conditional fields for recovery information
    const recoveredSelect = document.getElementById('sp-recovered');
    const recoveredTypeContainer = document.getElementById('sp-recovered-type-container');
    const vehicleDetailsContainer = document.getElementById('sp-vehicle-details-container');

    recoveredSelect.addEventListener('change', () => {
        if (recoveredSelect.value === 'Yes') {
            recoveredTypeContainer.style.display = 'block';
        } else {
            recoveredTypeContainer.style.display = 'none';
            vehicleDetailsContainer.style.display = 'none';
        }
    });

    // Conditional field for vehicle details
    const recoveredTypeSelect = document.getElementById('sp-recovered-type');
    recoveredTypeSelect.addEventListener('change', () => {
        if (recoveredTypeSelect.value === 'Vehicle') {
            vehicleDetailsContainer.style.display = 'block';
        } else {
            vehicleDetailsContainer.style.display = 'none';
        }
    });

    // Evidence management
    const evidenceContainer = document.getElementById('sp-evidence-container');
    const addEvidenceBtn = document.getElementById('sp-add-evidence-btn');
    const evidenceModal = document.getElementById('evidence-modal');
    const evidenceTypeOptions = document.querySelectorAll('.evidence-type-option');
    const evidenceSpoilerCheckbox = document.getElementById('evidence-spoiler');
    const evidenceTitleInput = document.getElementById('evidence-title');
    const evidencePreview = document.getElementById('evidence-preview');
    const addEvidenceConfirmBtn = document.getElementById('add-evidence-confirm');
    const cancelEvidenceBtn = document.getElementById('cancel-evidence');
    const closeModalBtn = document.getElementById('close-modal');
    const urlOptions = document.getElementById('url-options');
    const urlClickableCheckbox = document.getElementById('url-clickable');

    let selectedEvidenceType = '';
    let evidenceCount = 0;
    let editingEvidenceItem = null;

    // Open evidence modal
    addEvidenceBtn.addEventListener('click', () => {
        evidenceModal.classList.add('active');
        selectedEvidenceType = '';
        evidenceTypeOptions.forEach(option => option.classList.remove('selected'));
        evidenceSpoilerCheckbox.checked = false;
        evidenceTitleInput.value = '';
        evidencePreview.style.display = 'none';
        urlOptions.classList.remove('active');
        urlClickableCheckbox.checked = false;
        editingEvidenceItem = null;
        addEvidenceConfirmBtn.innerHTML = '<i class="fas fa-plus"></i> Add Evidence';
    });

    // Close evidence modal
    function closeEvidenceModal() {
        evidenceModal.classList.remove('active');
    }

    closeModalBtn.addEventListener('click', closeEvidenceModal);
    cancelEvidenceBtn.addEventListener('click', closeEvidenceModal);

    // Select evidence type
    evidenceTypeOptions.forEach(option => {
        option.addEventListener('click', () => {
            evidenceTypeOptions.forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');
            selectedEvidenceType = option.getAttribute('data-type');
            
            // Show/hide URL options
            if (selectedEvidenceType === 'url') {
                urlOptions.classList.add('active');
            } else {
                urlOptions.classList.remove('active');
            }
            
            updateEvidencePreview();
        });
    });

    // Update evidence preview when inputs change
    evidenceSpoilerCheckbox.addEventListener('change', updateEvidencePreview);
    evidenceTitleInput.addEventListener('input', updateEvidencePreview);
    urlClickableCheckbox.addEventListener('change', updateEvidencePreview);

    function updateEvidencePreview() {
        if (!selectedEvidenceType) {
            evidencePreview.style.display = 'none';
            return;
        }
        
        let previewContent = '';
        const isSpoiler = evidenceSpoilerCheckbox.checked;
        const title = evidenceTitleInput.value.trim();
        
        switch(selectedEvidenceType) {
            case 'text':
                previewContent = '[Text content here]';
                break;
            case 'image':
                previewContent = '[img]https://example.com/image.jpg[/img]';
                break;
            case 'url':
                const isClickable = urlClickableCheckbox.checked;
                if (isClickable) {
                    previewContent = '[url=https://example.com]Clickable Text[/url]';
                } else {
                    previewContent = '[url]https://example.com[/url]';
                }
                break;
        }
        
        // Title is now outside the spoiler
        let finalPreview = '';
        if (title) {
            finalPreview = `${title}: `;
        }
        
        if (isSpoiler) {
            finalPreview += `[spoiler]\n${previewContent}\n[/spoiler]`;
        } else {
            finalPreview += previewContent;
        }
        
        evidencePreview.textContent = finalPreview;
        evidencePreview.style.display = 'block';
    }

    // Function to toggle URL text field visibility
    function toggleUrlTextInput(evidenceItem, isVisible) {
        const urlTextInput = evidenceItem.querySelector('.url-text-input');
        if (urlTextInput) {
            if (isVisible) {
                urlTextInput.classList.add('active');
            } else {
                urlTextInput.classList.remove('active');
            }
        }
    }

    // Add evidence
    addEvidenceConfirmBtn.addEventListener('click', () => {
        if (!selectedEvidenceType) {
            alert('Please select an evidence type');
            return;
        }
        
        if (editingEvidenceItem) {
            // Update existing evidence item
            updateEvidenceItem(editingEvidenceItem);
        } else {
            // Create new evidence item
            evidenceCount++;
            const evidenceItem = document.createElement('div');
            evidenceItem.className = 'evidence-item';
            evidenceItem.setAttribute('data-type', selectedEvidenceType);
            
            createEvidenceContent(evidenceItem, selectedEvidenceType, evidenceSpoilerCheckbox.checked, evidenceTitleInput.value.trim(), urlClickableCheckbox.checked);
            evidenceContainer.appendChild(evidenceItem);
            
            setupEvidenceEventListeners(evidenceItem);
        }
        
        closeEvidenceModal();
    });

    // Function to create evidence content
    function createEvidenceContent(evidenceItem, type, isSpoiler, title, isClickable) {
        let evidenceContent = '';
        
        switch(type) {
            case 'text':
                evidenceContent = `
                    <div class="evidence-title-input">
                        <input type="text" class="evidence-title-field" placeholder="Evidence Title" value="${title}">
                    </div>
                    <div class="evidence-line-with-title">
                        <textarea class="evidence-text-content" placeholder="Enter text evidence here..."></textarea>
                    </div>
                `;
                break;
            case 'image':
                evidenceContent = `
                    <div class="evidence-title-input">
                        <input type="text" class="evidence-title-field" placeholder="Image Title (Optional)" value="${title}">
                    </div>
                    <div class="image-urls-container">
                        <div class="image-url-line">
                            <input type="text" class="evidence-image-url" placeholder="Image URL">
                            <div class="evidence-line-actions">
                                <button class="remove-image-btn"><i class="fas fa-trash"></i></button>
                            </div>
                        </div>
                    </div>
                    <button class="add-image-btn"><i class="fas fa-plus"></i> Add Another Image</button>
                `;
                break;
            case 'url':
                evidenceContent = `
                    <div class="evidence-title-input">
                        <input type="text" class="evidence-title-field" placeholder="Link Title (Optional)" value="${title}">
                    </div>
                    <div class="checkbox-group url-options-inline">
                        <input type="checkbox" class="url-clickable-field" ${isClickable ? 'checked' : ''}>
                        <label>Use clickable text</label>
                    </div>
                    <div class="evidence-line">
                        <input type="text" class="evidence-url" placeholder="URL">
                    </div>
                    <div class="url-text-input ${isClickable ? 'active' : ''}">
                        <div class="evidence-line">
                            <input type="text" class="evidence-url-text" placeholder="Link Text" value="">
                        </div>
                    </div>
                `;
                break;
        }
        
        evidenceItem.innerHTML = `
            <div class="evidence-header">
                <div class="evidence-type">
                    <span class="evidence-number">${evidenceCount}.</span>
                    ${type.charAt(0).toUpperCase() + type.slice(1)} Evidence
                </div>
                <div class="evidence-actions">
                    <div class="checkbox-group">
                        <input type="checkbox" class="evidence-spoiler-field" ${isSpoiler ? 'checked' : ''}>
                        <label>Spoiler</label>
                    </div>
                    <button class="edit-evidence">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="remove-evidence">
                        <i class="fas fa-trash"></i> Remove
                    </button>
                </div>
            </div>
            <div class="evidence-content">
                ${evidenceContent}
            </div>
        `;
    }

    // Function to update existing evidence item
    function updateEvidenceItem(evidenceItem) {
        const type = evidenceItem.getAttribute('data-type');
        const isSpoiler = evidenceSpoilerCheckbox.checked;
        const title = evidenceTitleInput.value.trim();
        const isClickable = urlClickableCheckbox.checked;
        
        createEvidenceContent(evidenceItem, type, isSpoiler, title, isClickable);
        setupEvidenceEventListeners(evidenceItem);
    }

    // Function to setup event listeners for evidence items
    function setupEvidenceEventListeners(evidenceItem) {
        // Add event listeners for dynamic elements
        const removeBtn = evidenceItem.querySelector('.remove-evidence');
        removeBtn.addEventListener('click', () => {
            evidenceItem.remove();
            updateEvidenceNumbers();
        });
        
        // Add event listener for edit button
        const editBtn = evidenceItem.querySelector('.edit-evidence');
        editBtn.addEventListener('click', () => {
            editEvidenceItem(evidenceItem);
        });
        
        // For URL type, add functionality to toggle clickable text
        if (evidenceItem.getAttribute('data-type') === 'url') {
            const urlClickableField = evidenceItem.querySelector('.url-clickable-field');
            urlClickableField.addEventListener('change', () => {
                toggleUrlTextInput(evidenceItem, urlClickableField.checked);
            });
        }
        
        // For image type, add functionality to add/remove images
        if (evidenceItem.getAttribute('data-type') === 'image') {
            const addImageBtn = evidenceItem.querySelector('.add-image-btn');
            const imageUrlsContainer = evidenceItem.querySelector('.image-urls-container');
            
            addImageBtn.addEventListener('click', () => {
                const newImageLine = document.createElement('div');
                newImageLine.className = 'image-url-line';
                newImageLine.innerHTML = `
                    <input type="text" class="evidence-image-url" placeholder="Image URL">
                    <div class="evidence-line-actions">
                        <button class="remove-image-btn"><i class="fas fa-trash"></i></button>
                    </div>
                `;
                imageUrlsContainer.appendChild(newImageLine);
                
                // Add event listener to remove button
                const removeImageBtn = newImageLine.querySelector('.remove-image-btn');
                removeImageBtn.addEventListener('click', () => {
                    newImageLine.remove();
                });
            });
            
            // Add event listeners to existing remove buttons
            const removeImageBtns = evidenceItem.querySelectorAll('.remove-image-btn');
            removeImageBtns.forEach(btn => {
                btn.addEventListener('click', function() {
                    this.closest('.image-url-line').remove();
                });
            });
        }
    }

    // Function to edit an evidence item
    function editEvidenceItem(evidenceItem) {
        const type = evidenceItem.getAttribute('data-type');
        const titleField = evidenceItem.querySelector('.evidence-title-field');
        const spoilerField = evidenceItem.querySelector('.evidence-spoiler-field');
        
        // Set modal values based on existing evidence
        selectedEvidenceType = type;
        evidenceTypeOptions.forEach(option => {
            if (option.getAttribute('data-type') === type) {
                option.classList.add('selected');
            } else {
                option.classList.remove('selected');
            }
        });
        
        evidenceTitleInput.value = titleField ? titleField.value : '';
        evidenceSpoilerCheckbox.checked = spoilerField ? spoilerField.checked : false;
        
        // Handle URL-specific options
        if (type === 'url') {
            urlOptions.classList.add('active');
            const urlClickableField = evidenceItem.querySelector('.url-clickable-field');
            urlClickableCheckbox.checked = urlClickableField ? urlClickableField.checked : false;
            
            // Populate URL fields if they exist
            const urlField = evidenceItem.querySelector('.evidence-url');
            const urlTextField = evidenceItem.querySelector('.evidence-url-text');
            
            if (urlField) {
                // Store the current URL value to restore after modal opens
                setTimeout(() => {
                    const urlInput = document.querySelector('#evidence-modal .evidence-url');
                    if (urlInput) urlInput.value = urlField.value;
                }, 100);
            }
            
            if (urlTextField) {
                setTimeout(() => {
                    const urlTextInput = document.querySelector('#evidence-modal .evidence-url-text');
                    if (urlTextInput) urlTextInput.value = urlTextField.value;
                }, 100);
            }
        } else {
            urlOptions.classList.remove('active');
            urlClickableCheckbox.checked = false;
        }
        
        // Update preview
        updateEvidencePreview();
        
        // Set editing mode
        editingEvidenceItem = evidenceItem;
        addEvidenceConfirmBtn.innerHTML = '<i class="fas fa-save"></i> Update Evidence';
        
        // Open modal
        evidenceModal.classList.add('active');
    }

    // Update evidence numbers when items are removed
    function updateEvidenceNumbers() {
        const evidenceItems = evidenceContainer.querySelectorAll('.evidence-item');
        evidenceCount = evidenceItems.length;
        evidenceItems.forEach((item, index) => {
            const evidenceNumber = item.querySelector('.evidence-number');
            evidenceNumber.textContent = `${index + 1}.`;
        });
    }

    // Generate BB Code for Stolen Plate Report
    const generateBtn = document.getElementById('sp-generate-btn');
    const outputContainer = document.getElementById('sp-output-container');
    const titleOutput = document.getElementById('sp-title-output');
    const bbcodeOutput = document.getElementById('sp-bbcode-output');
    const copyTitleBtn = document.getElementById('sp-copy-title-btn');
    const copyBbcodeBtn = document.getElementById('sp-copy-bbcode-btn');
    const resetBtn = document.getElementById('sp-reset-btn');

    generateBtn.addEventListener('click', () => {
        // Get form values
        const caseTitle = document.getElementById('sp-case-title').value;
        const timeDate = document.getElementById('sp-time-date').value;
        const location = document.getElementById('sp-location').value;
        const vehiclePlate = document.getElementById('sp-vehicle-plate').value;
        const vehicleDetails = document.getElementById('sp-vehicle-details').value;
        const vehicleOwner = document.getElementById('sp-vehicle-owner').value;
        const callId = document.getElementById('sp-call-id').value;
        const narrative = document.getElementById('sp-narrative').value;
        const victimStatement = document.getElementById('sp-victim-statement').value;
        const fingerprints = document.getElementById('sp-fingerprints').value;
        const recovered = document.getElementById('sp-recovered').value;
        const recoveredType = document.getElementById('sp-recovered-type').value;
        const recoveredVehicleDetails = document.getElementById('sp-recovered-vehicle-details').value;
        const ssbReport = document.getElementById('sp-ssb-report').value;
        const additionalInfo = document.getElementById('sp-additional-info').value;
        
        // Generate Title
        const generatedTitle = caseTitle || '[PLATE] Vehicle Make Model (Status)';
        titleOutput.textContent = generatedTitle;
        
        // Generate BB Code
        let bbcode = `[divbox=transparent]\n`;
        bbcode += `[center][img]https://i.imgur.com/5Jhd9NC.png[/img]\n`;
        bbcode += `[hr][/hr]\n`;
        bbcode += `[size=150][b][b]Taskforce for Regional Autotheft Prevention - Stolen Vehicle Database[/b][/b][/size]\n`;
        bbcode += `[hr][/hr]\n`;
        bbcode += `[/divbox]\n`;
        bbcode += `[hr][/hr]\n`;
        bbcode += `[divbox=#323564][center][color=white][b]Stolen Plate Report[/b][/color][/center][/divbox]\n`;
        bbcode += `[divbox=transparent]\n`;
        bbcode += `[br][/br]\n`;
        bbcode += `[b]Time & Date:[/b] ${timeDate || 'DAY/MM/YEAR'}\n`;
        bbcode += `[b]Location:[/b] ${location || 'AREA/STREET'}\n`;
        bbcode += `[b]Vehicle Plate:[/b] ${vehiclePlate || 'PLATE'}\n`;
        bbcode += `[b]Vehicle Color Make Model of Plate:[/b] ${vehicleDetails || 'COLOR MAKE MODEL OF PLATE #'}\n`;
        bbcode += `[b]Owner:[/b] ${vehicleOwner || 'OWNER FIRST LAST'}\n`;
        bbcode += `[b]Call-ID:[/b] ${callId || '#XXXX/Self-Initiated'}\n`;
        bbcode += `[b]Narrative:[/b][list]\n`;
        bbcode += `[*] ${narrative || 'Write Narrative Here'}\n`;
        bbcode += `[/list]\n`;
        bbcode += `[b]Victim Statement:[/b][list]\n`;
        bbcode += `[*] ${victimStatement || 'Attach Statement Here'}\n`;
        bbcode += `[/list]\n`;
        
        // Add evidence section
        bbcode += `[b]Evidence:[/b]\n`;
        bbcode += `[list]\n`;
        
        const evidenceItems = evidenceContainer.querySelectorAll('.evidence-item');
        if (evidenceItems.length > 0) {
            evidenceItems.forEach(item => {
                const type = item.getAttribute('data-type');
                const isSpoiler = item.querySelector('.evidence-spoiler-field').checked;
                const titleField = item.querySelector('.evidence-title-field');
                const title = titleField ? titleField.value.trim() : '';
                
                let evidenceContent = '';
                
                switch(type) {
                    case 'text':
                        const textContent = item.querySelector('.evidence-text-content').value;
                        evidenceContent = textContent;
                        break;
                    case 'image':
                        const imageUrls = item.querySelectorAll('.evidence-image-url');
                        let imageContent = '';
                        imageUrls.forEach(urlInput => {
                            if (urlInput.value.trim()) {
                                imageContent += `[img]${urlInput.value}[/img]\n`;
                            }
                        });
                        evidenceContent = imageContent;
                        break;
                    case 'url':
                        const url = item.querySelector('.evidence-url').value;
                        const urlText = item.querySelector('.evidence-url-text');
                        if (urlText && urlText.value) {
                            evidenceContent = `[url=${url}]${urlText.value}[/url]`;
                        } else {
                            evidenceContent = `[url]${url}[/url]`;
                        }
                        break;
                }
                
                // Title is now outside the spoiler
                let finalEvidence = '';
                if (title) {
                    finalEvidence = `${title}: `;
                }
                
                if (isSpoiler) {
                    finalEvidence += `[spoiler]\n${evidenceContent}[/spoiler]`;
                } else {
                    finalEvidence += evidenceContent;
                }
                
                bbcode += `[*] ${finalEvidence}\n`;
            });
        } else {
            bbcode += `[*] - Photos/Videos (Add/Delete lines as needed)\n`;
            bbcode += `[*] - CCTV\n`;
            bbcode += `[*] - Additional Statements\n`;
        }
        
        bbcode += `[/list]\n`;
        
        // Add additional information
        bbcode += `[b]Finger prints taken?[/b] ${fingerprints}\n`;
        bbcode += `[b]Recovered?[/b] ${recovered}\n`;
        
        if (recovered === 'Yes') {
            bbcode += `[b]If Yes; Was it on a person or a vehicle?[/b] ${recoveredType}\n`;
            
            if (recoveredType === 'Vehicle' && recoveredVehicleDetails) {
                bbcode += `[b]If Vehicle; Make Model, & VIN?[/b] ${recoveredVehicleDetails}\n`;
            } else {
                bbcode += `[b]If Vehicle; Make Model, & VIN?[/b] MAKE MODEL VIN\n`;
            }
        } else {
            bbcode += `[b]If Yes; Was it on a person or a vehicle?[/b] Person/Vehicle\n`;
            bbcode += `[b]If Vehicle; Make Model, & VIN?[/b] MAKE MODEL VIN\n`;
        }
        
        bbcode += `[b]Link to SSB report:[/b] ${ssbReport || ''}\n`;
        bbcode += `[b]Additional Information:[/b] ${additionalInfo || ''}\n`;
        bbcode += `[br][/br]\n`;
        bbcode += `[/divbox]`;
        
        bbcodeOutput.textContent = bbcode;
        outputContainer.style.display = 'block';
        
        // Scroll to output
        outputContainer.scrollIntoView({ behavior: 'smooth' });
    });

    // Copy functionality
    copyTitleBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(titleOutput.textContent)
            .then(() => {
                showCopySuccess(copyTitleBtn);
            })
            .catch(err => {
                console.error('Failed to copy: ', err);
            });
    });

    copyBbcodeBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(bbcodeOutput.textContent)
            .then(() => {
                showCopySuccess(copyBbcodeBtn);
            })
            .catch(err => {
                console.error('Failed to copy: ', err);
            });
    });

    function showCopySuccess(button) {
        const originalText = button.innerHTML;
        button.innerHTML = '<i class="fas fa-check"></i> Copied!';
        button.disabled = true;
        
        setTimeout(() => {
            button.innerHTML = originalText;
            button.disabled = false;
        }, 2000);
    }

    // Reset form
    resetBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to reset the form? All data will be lost.')) {
            // Reset all form fields
            document.getElementById('sp-case-title').value = '';
            document.getElementById('sp-time-date').value = '';
            document.getElementById('sp-location').value = '';
            document.getElementById('sp-vehicle-plate').value = '';
            document.getElementById('sp-vehicle-details').value = '';
            document.getElementById('sp-vehicle-owner').value = '';
            document.getElementById('sp-call-id').value = '';
            document.getElementById('sp-narrative').value = '';
            document.getElementById('sp-victim-statement').value = '';
            document.getElementById('sp-fingerprints').value = 'No';
            document.getElementById('sp-recovered').value = 'No';
            document.getElementById('sp-recovered-type').value = 'Person';
            document.getElementById('sp-recovered-vehicle-details').value = '';
            document.getElementById('sp-ssb-report').value = '';
            document.getElementById('sp-additional-info').value = '';
            
            // Hide conditional containers
            recoveredTypeContainer.style.display = 'none';
            vehicleDetailsContainer.style.display = 'none';
            
            // Remove all evidence
            evidenceContainer.innerHTML = '';
            evidenceCount = 0;
            
            // Hide output
            outputContainer.style.display = 'none';
            
            alert('Form has been reset.');
        }
    });
}

// TRAP Database Update Generator Functions - UPDATED WITH EVIDENCE MANAGEMENT SYSTEM
function initTrapDatabaseUpdateGenerator() {
    // Update type selection
    const updateTypeSelect = document.getElementById('trap-update-type');
    const updateSections = document.querySelectorAll('#trap-database-update-section .update-section');

    updateTypeSelect.addEventListener('change', () => {
        const selectedType = updateTypeSelect.value;
        
        // Hide all sections
        updateSections.forEach(section => {
            section.style.display = 'none';
        });
        
        // Show selected section
        document.getElementById(`trap-${selectedType}-section`).style.display = 'block';
    });

    // Evidence management for suspect section - USING TRAP CASEFILE SYSTEM
    const suspectEvidenceContainer = document.getElementById('trap-suspect-evidence-container');
    const addSuspectEvidenceBtn = document.getElementById('trap-add-suspect-evidence-btn');
    const evidenceModal = document.getElementById('trap-suspect-evidence-modal');
    const evidenceTypeOptions = document.querySelectorAll('#trap-suspect-evidence-modal .evidence-type-option');
    const evidenceSpoilerCheckbox = document.getElementById('trap-suspect-evidence-spoiler');
    const evidenceTitleInput = document.getElementById('trap-suspect-evidence-title');
    const evidencePreview = document.getElementById('trap-suspect-evidence-preview');
    const addEvidenceConfirmBtn = document.getElementById('trap-suspect-add-evidence-confirm');
    const cancelEvidenceBtn = document.getElementById('trap-suspect-cancel-evidence');
    const closeModalBtn = document.getElementById('trap-suspect-close-modal');
    const urlOptions = document.getElementById('trap-suspect-url-options');
    const urlClickableCheckbox = document.getElementById('trap-suspect-url-clickable');

    let selectedEvidenceType = '';
    let evidenceCount = 0;
    let editingEvidenceItem = null;

    // Open evidence modal for suspect section
    addSuspectEvidenceBtn.addEventListener('click', () => {
        evidenceModal.classList.add('active');
        selectedEvidenceType = '';
        evidenceTypeOptions.forEach(option => option.classList.remove('selected'));
        evidenceSpoilerCheckbox.checked = false;
        evidenceTitleInput.value = '';
        evidencePreview.style.display = 'none';
        urlOptions.classList.remove('active');
        urlClickableCheckbox.checked = false;
        editingEvidenceItem = null;
        addEvidenceConfirmBtn.innerHTML = '<i class="fas fa-plus"></i> Add Evidence';
    });

    // Close evidence modal
    function closeEvidenceModal() {
        evidenceModal.classList.remove('active');
    }

    closeModalBtn.addEventListener('click', closeEvidenceModal);
    cancelEvidenceBtn.addEventListener('click', closeEvidenceModal);

    // Select evidence type
    evidenceTypeOptions.forEach(option => {
        option.addEventListener('click', () => {
            evidenceTypeOptions.forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');
            selectedEvidenceType = option.getAttribute('data-type');
            
            // Show/hide URL options
            if (selectedEvidenceType === 'url') {
                urlOptions.classList.add('active');
            } else {
                urlOptions.classList.remove('active');
            }
            
            updateEvidencePreview();
        });
    });

    // Update evidence preview when inputs change
    evidenceSpoilerCheckbox.addEventListener('change', updateEvidencePreview);
    evidenceTitleInput.addEventListener('input', updateEvidencePreview);
    urlClickableCheckbox.addEventListener('change', updateEvidencePreview);

    function updateEvidencePreview() {
        if (!selectedEvidenceType) {
            evidencePreview.style.display = 'none';
            return;
        }
        
        let previewContent = '';
        const isSpoiler = evidenceSpoilerCheckbox.checked;
        const title = evidenceTitleInput.value.trim();
        
        switch(selectedEvidenceType) {
            case 'text':
                previewContent = '[Text content here]';
                break;
            case 'image':
                previewContent = '[img]https://example.com/image.jpg[/img]';
                break;
            case 'url':
                const isClickable = urlClickableCheckbox.checked;
                if (isClickable) {
                    previewContent = '[url=https://example.com]Clickable Text[/url]';
                } else {
                    previewContent = '[url]https://example.com[/url]';
                }
                break;
        }
        
        // Title is now outside the spoiler
        let finalPreview = '';
        if (title) {
            finalPreview = `${title}: `;
        }
        
        if (isSpoiler) {
            finalPreview += `[spoiler]\n${previewContent}\n[/spoiler]`;
        } else {
            finalPreview += previewContent;
        }
        
        evidencePreview.textContent = finalPreview;
        evidencePreview.style.display = 'block';
    }

    // Function to toggle URL text field visibility
    function toggleUrlTextInput(evidenceItem, isVisible) {
        const urlTextInput = evidenceItem.querySelector('.url-text-input');
        if (urlTextInput) {
            if (isVisible) {
                urlTextInput.classList.add('active');
            } else {
                urlTextInput.classList.remove('active');
            }
        }
    }

    // Add evidence
    addEvidenceConfirmBtn.addEventListener('click', () => {
        if (!selectedEvidenceType) {
            alert('Please select an evidence type');
            return;
        }
        
        if (editingEvidenceItem) {
            // Update existing evidence item
            updateEvidenceItem(editingEvidenceItem);
        } else {
            // Create new evidence item
            evidenceCount++;
            const evidenceItem = document.createElement('div');
            evidenceItem.className = 'evidence-item';
            evidenceItem.setAttribute('data-type', selectedEvidenceType);
            
            createEvidenceContent(evidenceItem, selectedEvidenceType, evidenceSpoilerCheckbox.checked, evidenceTitleInput.value.trim(), urlClickableCheckbox.checked);
            suspectEvidenceContainer.appendChild(evidenceItem);
            
            setupEvidenceEventListeners(evidenceItem);
        }
        
        closeEvidenceModal();
    });

    // Function to create evidence content
    function createEvidenceContent(evidenceItem, type, isSpoiler, title, isClickable) {
        let evidenceContent = '';
        
        switch(type) {
            case 'text':
                evidenceContent = `
                    <div class="evidence-title-input">
                        <input type="text" class="evidence-title-field" placeholder="Evidence Title" value="${title}">
                    </div>
                    <div class="evidence-line-with-title">
                        <textarea class="evidence-text-content" placeholder="Enter text evidence here..."></textarea>
                    </div>
                `;
                break;
            case 'image':
                evidenceContent = `
                    <div class="evidence-title-input">
                        <input type="text" class="evidence-title-field" placeholder="Image Title (Optional)" value="${title}">
                    </div>
                    <div class="image-urls-container">
                        <div class="image-url-line">
                            <input type="text" class="evidence-image-url" placeholder="Image URL">
                            <div class="evidence-line-actions">
                                <button class="remove-image-btn"><i class="fas fa-trash"></i></button>
                            </div>
                        </div>
                    </div>
                    <button class="add-image-btn"><i class="fas fa-plus"></i> Add Another Image</button>
                `;
                break;
            case 'url':
                evidenceContent = `
                    <div class="evidence-title-input">
                        <input type="text" class="evidence-title-field" placeholder="Link Title (Optional)" value="${title}">
                    </div>
                    <div class="checkbox-group url-options-inline">
                        <input type="checkbox" class="url-clickable-field" ${isClickable ? 'checked' : ''}>
                        <label>Use clickable text</label>
                    </div>
                    <div class="evidence-line">
                        <input type="text" class="evidence-url" placeholder="URL">
                    </div>
                    <div class="url-text-input ${isClickable ? 'active' : ''}">
                        <div class="evidence-line">
                            <input type="text" class="evidence-url-text" placeholder="Link Text" value="">
                        </div>
                    </div>
                `;
                break;
        }
        
        evidenceItem.innerHTML = `
            <div class="evidence-header">
                <div class="evidence-type">
                    <span class="evidence-number">${evidenceCount}.</span>
                    ${type.charAt(0).toUpperCase() + type.slice(1)} Evidence
                </div>
                <div class="evidence-actions">
                    <div class="checkbox-group">
                        <input type="checkbox" class="evidence-spoiler-field" ${isSpoiler ? 'checked' : ''}>
                        <label>Spoiler</label>
                    </div>
                    <button class="edit-evidence">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="remove-evidence">
                        <i class="fas fa-trash"></i> Remove
                    </button>
                </div>
            </div>
            <div class="evidence-content">
                ${evidenceContent}
            </div>
        `;
    }

    // Function to update existing evidence item
    function updateEvidenceItem(evidenceItem) {
        const type = evidenceItem.getAttribute('data-type');
        const isSpoiler = evidenceSpoilerCheckbox.checked;
        const title = evidenceTitleInput.value.trim();
        const isClickable = urlClickableCheckbox.checked;
        
        createEvidenceContent(evidenceItem, type, isSpoiler, title, isClickable);
        setupEvidenceEventListeners(evidenceItem);
    }

    // Function to setup event listeners for evidence items
    function setupEvidenceEventListeners(evidenceItem) {
        // Add event listeners for dynamic elements
        const removeBtn = evidenceItem.querySelector('.remove-evidence');
        removeBtn.addEventListener('click', () => {
            evidenceItem.remove();
            updateEvidenceNumbers();
        });
        
        // Add event listener for edit button
        const editBtn = evidenceItem.querySelector('.edit-evidence');
        editBtn.addEventListener('click', () => {
            editEvidenceItem(evidenceItem);
        });
        
        // For URL type, add functionality to toggle clickable text
        if (evidenceItem.getAttribute('data-type') === 'url') {
            const urlClickableField = evidenceItem.querySelector('.url-clickable-field');
            urlClickableField.addEventListener('change', () => {
                toggleUrlTextInput(evidenceItem, urlClickableField.checked);
            });
        }
        
        // For image type, add functionality to add/remove images
        if (evidenceItem.getAttribute('data-type') === 'image') {
            const addImageBtn = evidenceItem.querySelector('.add-image-btn');
            const imageUrlsContainer = evidenceItem.querySelector('.image-urls-container');
            
            addImageBtn.addEventListener('click', () => {
                const newImageLine = document.createElement('div');
                newImageLine.className = 'image-url-line';
                newImageLine.innerHTML = `
                    <input type="text" class="evidence-image-url" placeholder="Image URL">
                    <div class="evidence-line-actions">
                        <button class="remove-image-btn"><i class="fas fa-trash"></i></button>
                    </div>
                `;
                imageUrlsContainer.appendChild(newImageLine);
                
                // Add event listener to remove button
                const removeImageBtn = newImageLine.querySelector('.remove-image-btn');
                removeImageBtn.addEventListener('click', () => {
                    newImageLine.remove();
                });
            });
            
            // Add event listeners to existing remove buttons
            const removeImageBtns = evidenceItem.querySelectorAll('.remove-image-btn');
            removeImageBtns.forEach(btn => {
                btn.addEventListener('click', function() {
                    this.closest('.image-url-line').remove();
                });
            });
        }
    }

    // Function to edit an evidence item
    function editEvidenceItem(evidenceItem) {
        const type = evidenceItem.getAttribute('data-type');
        const titleField = evidenceItem.querySelector('.evidence-title-field');
        const spoilerField = evidenceItem.querySelector('.evidence-spoiler-field');
        
        // Set modal values based on existing evidence
        selectedEvidenceType = type;
        evidenceTypeOptions.forEach(option => {
            if (option.getAttribute('data-type') === type) {
                option.classList.add('selected');
            } else {
                option.classList.remove('selected');
            }
        });
        
        evidenceTitleInput.value = titleField ? titleField.value : '';
        evidenceSpoilerCheckbox.checked = spoilerField ? spoilerField.checked : false;
        
        // Handle URL-specific options
        if (type === 'url') {
            urlOptions.classList.add('active');
            const urlClickableField = evidenceItem.querySelector('.url-clickable-field');
            urlClickableCheckbox.checked = urlClickableField ? urlClickableField.checked : false;
            
            // Populate URL fields if they exist
            const urlField = evidenceItem.querySelector('.evidence-url');
            const urlTextField = evidenceItem.querySelector('.evidence-url-text');
            
            if (urlField) {
                // Store the current URL value to restore after modal opens
                setTimeout(() => {
                    const urlInput = document.querySelector('#trap-suspect-evidence-modal .evidence-url');
                    if (urlInput) urlInput.value = urlField.value;
                }, 100);
            }
            
            if (urlTextField) {
                setTimeout(() => {
                    const urlTextInput = document.querySelector('#trap-suspect-evidence-modal .evidence-url-text');
                    if (urlTextInput) urlTextInput.value = urlTextField.value;
                }, 100);
            }
        } else {
            urlOptions.classList.remove('active');
            urlClickableCheckbox.checked = false;
        }
        
        // Update preview
        updateEvidencePreview();
        
        // Set editing mode
        editingEvidenceItem = evidenceItem;
        addEvidenceConfirmBtn.innerHTML = '<i class="fas fa-save"></i> Update Evidence';
        
        // Open modal
        evidenceModal.classList.add('active');
    }

    // Update evidence numbers when items are removed
    function updateEvidenceNumbers() {
        const evidenceItems = suspectEvidenceContainer.querySelectorAll('.evidence-item');
        evidenceCount = evidenceItems.length;
        evidenceItems.forEach((item, index) => {
            const evidenceNumber = item.querySelector('.evidence-number');
            evidenceNumber.textContent = `${index + 1}.`;
        });
    }

    // Generate BB Code
    const generateBtn = document.getElementById('trap-generate-btn');
    const outputContainer = document.getElementById('trap-output-container');
    const bbcodeOutput = document.getElementById('trap-bbcode-output');
    const copyBbcodeBtn = document.getElementById('trap-copy-bbcode-btn');
    const resetBtn = document.getElementById('trap-reset-btn');

    generateBtn.addEventListener('click', () => {
        const updateType = updateTypeSelect.value;
        let bbcode = '';
        
        switch(updateType) {
            case 'general':
                const generalNarrative = document.getElementById('trap-general-narrative').value;
                bbcode = `[divbox=#323564][center][color=white][b]General Update[/b][/color][/center][/divbox]\n`;
                bbcode += `[divbox=transparent]${generalNarrative || 'ENTER UPDATE NARRATIVE HERE'}[/divbox]`;
                break;
                
            case 'forensics':
                const forensicsUpdate = document.getElementById('trap-forensics-update').value;
                bbcode = `[divbox=#323564][center][color=white][b]Forensics Update[/b][/color][/center][/divbox]\n`;
                bbcode += `[divbox=transparent]${forensicsUpdate || 'ENTER FORENSICS UPDATE HERE'}[/divbox]`;
                break;
                
            case 'suspect':
                const suspectPhoto = document.getElementById('trap-suspect-photo').value;
                const suspectName = document.getElementById('trap-suspect-name').value;
                const relationIncident = document.getElementById('trap-relation-incident').value;
                
                bbcode = `[divbox=#323564][center][color=white][b]Potential Suspect[/b][/color][/center][/divbox]\n`;
                bbcode += `[divbox=transparent][center]`;
                
                if (suspectPhoto) {
                    bbcode += `[img]${suspectPhoto}[/img]\n`;
                }
                
                bbcode += `${suspectName || 'FIRSTNAME LASTNAME'}[/center]\n`;
                bbcode += `[b]Relation to incident:[/b]\n`;
                bbcode += `${relationIncident ? relationIncident.split('\n').map(line => line ? `- ${line}` : '-').join('\n') : '-'}\n`;
                bbcode += `[b]Evidence:[/b]\n`;
                bbcode += `[list]`;
                
                const evidenceItems = suspectEvidenceContainer.querySelectorAll('.evidence-item');
                if (evidenceItems.length > 0) {
                    evidenceItems.forEach(item => {
                        const type = item.getAttribute('data-type');
                        const isSpoiler = item.querySelector('.evidence-spoiler-field').checked;
                        const titleField = item.querySelector('.evidence-title-field');
                        const title = titleField ? titleField.value.trim() : '';
                        
                        let evidenceContent = '';
                        
                        switch(type) {
                            case 'text':
                                const textContent = item.querySelector('.evidence-text-content').value;
                                evidenceContent = textContent;
                                break;
                            case 'image':
                                const imageUrls = item.querySelectorAll('.evidence-image-url');
                                let imageContent = '';
                                imageUrls.forEach(urlInput => {
                                    if (urlInput.value.trim()) {
                                        imageContent += `[img]${urlInput.value}[/img]\n`;
                                    }
                                });
                                evidenceContent = imageContent;
                                break;
                            case 'url':
                                const url = item.querySelector('.evidence-url').value;
                                const urlText = item.querySelector('.evidence-url-text');
                                if (urlText && urlText.value) {
                                    evidenceContent = `[url=${url}]${urlText.value}[/url]`;
                                } else {
                                    evidenceContent = `[url]${url}[/url]`;
                                }
                                break;
                        }
                        
                        // Title is now outside the spoiler
                        let finalEvidence = '';
                        if (title) {
                            finalEvidence = `${title}: `;
                        }
                        
                        if (isSpoiler) {
                            finalEvidence += `[spoiler]\n${evidenceContent}[/spoiler]`;
                        } else {
                            finalEvidence += evidenceContent;
                        }
                        
                        bbcode += `[*] ${finalEvidence}\n`;
                    });
                } else {
                    bbcode += `[*]\n`;
                }
                
                bbcode += `[/list]\n`;
                bbcode += `[/divbox]`;
                break;
                
            case 'warrant':
                const warrantStatus = document.getElementById('trap-warrant-status').value;
                bbcode = `[divbox=#323564][center][color=white][b]Warrant Status Update[/b][/color][/center][/divbox]\n`;
                bbcode += `[divbox=transparent]${warrantStatus || 'ENTER WARRANT STATUS HERE'}[/divbox]`;
                break;
        }
        
        bbcodeOutput.textContent = bbcode;
        outputContainer.style.display = 'block';
        
        // Scroll to output
        outputContainer.scrollIntoView({ behavior: 'smooth' });
    });

    // Copy functionality
    copyBbcodeBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(bbcodeOutput.textContent)
            .then(() => {
                showCopySuccess(copyBbcodeBtn);
            })
            .catch(err => {
                console.error('Failed to copy: ', err);
            });
    });

    function showCopySuccess(button) {
        const originalText = button.innerHTML;
        button.innerHTML = '<i class="fas fa-check"></i> Copied!';
        button.disabled = true;
        
        setTimeout(() => {
            button.innerHTML = originalText;
            button.disabled = false;
        }, 2000);
    }

    // Reset form
    resetBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to reset the form? All data will be lost.')) {
            // Reset all form fields
            document.getElementById('trap-update-type').value = 'general';
            document.getElementById('trap-general-narrative').value = '';
            document.getElementById('trap-forensics-update').value = '';
            document.getElementById('trap-suspect-photo').value = '';
            document.getElementById('trap-suspect-name').value = '';
            document.getElementById('trap-relation-incident').value = '';
            document.getElementById('trap-warrant-status').value = '';
            
            // Reset evidence
            suspectEvidenceContainer.innerHTML = '';
            evidenceCount = 0;
            
            // Show general section by default
            updateSections.forEach(section => {
                section.style.display = 'none';
            });
            document.getElementById('trap-general-section').style.display = 'block';
            
            // Hide output
            outputContainer.style.display = 'none';
            
            alert('Form has been reset.');
        }
    });

    // Initialize the form
    updateSections.forEach(section => {
        section.style.display = 'none';
    });
    document.getElementById('trap-general-section').style.display = 'block';
}