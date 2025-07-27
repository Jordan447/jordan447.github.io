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
    initPSDGenerator();
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
        'psd-generator': 'PSD Generator',
        'example1': 'Medical Report Tool',
        'example2': 'Shift Logger',
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
    [img]https://i.imgur.com/ODe46mh.png[/img]
    
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

function initPSDGenerator() {
    const generateBtn = document.getElementById('psd-generateBtn');
    const downloadBtn = document.getElementById('psd-downloadBtn');
    const previewImage = document.getElementById('psd-previewImage');
    const resultsDiv = document.getElementById('psd-results');
    
    let psdFile = null;
    let generatedImageUrl = null;
    
    // First try to load the PSD file
    loadPSD().then(() => {
        console.log('PSD loaded successfully');
    }).catch(err => {
        console.error('PSD load error:', err);
        alert('Error loading template file. Please make sure SA_GC_TEMP.psd is in the same directory and try again.');
    });

    generateBtn.addEventListener('click', async function() {
        // Get form values
        const formData = {
            fullName: document.getElementById('psd-fullName').value,
            fullAddress: document.getElementById('psd-fullAddress').value,
            fullSig: document.getElementById('psd-fullSig').value,
            fullExpiration: document.getElementById('psd-fullExpiration').value,
            fullDate: document.getElementById('psd-fullDate').value,
            fullRecNo: document.getElementById('psd-fullRecNo').value
        };
        
        // Validate inputs
        if (Object.values(formData).some(val => !val)) {
            alert('Please fill in all fields');
            return;
        }
        
        generateBtn.disabled = true;
        generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
        
        try {
            if (!psdFile) {
                throw new Error('Template not loaded yet');
            }
            
            const updatedCanvas = await updatePSDLayers(psdFile, formData);
            generatedImageUrl = updatedCanvas.toDataURL('image/png');
            previewImage.src = generatedImageUrl;
            downloadBtn.disabled = false;
            resultsDiv.style.display = 'block';
            
            // Scroll to results
            resultsDiv.scrollIntoView({ behavior: 'smooth' });
        } catch (error) {
            console.error('Generation error:', error);
            alert('Error generating document: ' + error.message);
        } finally {
            generateBtn.disabled = false;
            generateBtn.innerHTML = '<i class="fas fa-cog"></i> Generate Document';
        }
    });
    
    downloadBtn.addEventListener('click', function() {
        if (!generatedImageUrl) return;
        
        const link = document.createElement('a');
        link.href = generatedImageUrl;
        link.download = 'generated-document.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
    
    async function loadPSD() {
        return new Promise((resolve, reject) => {
            fetch('SA_GC_TEMP.psd')
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.arrayBuffer();
                })
                .then(arrayBuffer => {
                    try {
                        psdFile = PSD.fromArrayBuffer(arrayBuffer);
                        psdFile.parse();
                        resolve();
                    } catch (parseError) {
                        reject(new Error('Failed to parse PSD file'));
                    }
                })
                .catch(error => {
                    reject(new Error('Failed to load PSD file. Make sure SA_GC_TEMP.psd is in the same directory.'));
                });
        });
    }
    
    function updatePSDLayers(psd, data) {
        const layers = psd.layers;
        let foundLayers = 0;
        
        function processLayers(layers) {
            layers.forEach(layer => {
                if (layer.children) {
                    processLayers(layer.children);
                }
                
                if (layer.text) {
                    switch(layer.name) {
                        case 'FULL_NAME':
                            layer.text.text = data.fullName;
                            foundLayers++;
                            break;
                        case 'FULL_ADDRESS':
                            layer.text.text = data.fullAddress;
                            foundLayers++;
                            break;
                        case 'FULL_SIG':
                            layer.text.text = data.fullSig;
                            foundLayers++;
                            break;
                        case 'FULL_EXPRIRATION':
                            layer.text.text = data.fullExpiration;
                            foundLayers++;
                            break;
                        case 'FULL_DATEI':
                            layer.text.text = data.fullDate;
                            foundLayers++;
                            break;
                        case 'FULL_RECNO':
                            layer.text.text = data.fullRecNo;
                            foundLayers++;
                            break;
                    }
                }
            });
        }
        
        processLayers(layers);
        
        if (foundLayers < 6) {
            throw new Error(`Could not find all required layers (found ${foundLayers}/6)`);
        }
        
        return psd.image.toCanvas();
    }
}