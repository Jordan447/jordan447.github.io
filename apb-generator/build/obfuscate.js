const JavaScriptObfuscator = require('javascript-obfuscator');
const fs = require('fs').promises;
const path = require('path');
const CleanCSS = require('clean-css');
const htmlMinifier = require('html-minifier');

async function minifyCSS(css) {
  const minified = new CleanCSS({
    level: 2,
    format: 'keep-breaks'
  }).minify(css);
  return minified.styles;
}

async function minifyHTML(html) {
  return htmlMinifier.minify(html, {
    removeComments: true,
    collapseWhitespace: true,
    minifyJS: true,
    minifyCSS: true,
    removeAttributeQuotes: true,
    removeEmptyAttributes: true,
    removeOptionalTags: true,
    removeRedundantAttributes: true,
    useShortDoctype: true,
    collapseBooleanAttributes: true
  });
}

async function obfuscateJS(js) {
  const obfuscationResult = JavaScriptObfuscator.obfuscate(js, {
    compact: true,
    controlFlowFlattening: true,
    controlFlowFlatteningThreshold: 0.75,
    deadCodeInjection: false,
    debugProtection: false,
    debugProtectionInterval: 0,
    disableConsoleOutput: false,
    identifierNamesGenerator: 'hexadecimal',
    log: false,
    numbersToExpressions: false,
    renameGlobals: false,
    selfDefending: true,
    simplify: true,
    splitStrings: true,
    splitStringsChunkLength: 10,
    stringArray: true,
    stringArrayEncoding: ['base64'],
    stringArrayIndexShift: true,
    stringArrayWrappersCount: 1,
    stringArrayWrappersChainedCalls: true,
    stringArrayWrappersParametersMaxCount: 2,
    stringArrayWrappersType: 'variable',
    stringArrayThreshold: 0.75,
    unicodeEscapeSequence: false
  });

  return obfuscationResult.getObfuscatedCode();
}

async function copyFile(source, destination) {
  try {
    await fs.copyFile(source, destination);
    console.log(`Copied: ${path.basename(source)}`);
  } catch (error) {
    console.error(`Error copying ${source}:`, error);
  }
}

async function processFiles() {
  try {
    // Create dist directory if it doesn't exist
    await fs.mkdir('dist', { recursive: true });
    
    console.log('Starting obfuscation process...');
    
    // Read source files
    const htmlSource = await fs.readFile('src/index.html', 'utf8');
    const cssSource = await fs.readFile('src/styles.css', 'utf8');
    const jsSource = await fs.readFile('src/script.js', 'utf8');
    
    console.log('Minifying HTML...');
    const minifiedHTML = await minifyHTML(htmlSource);
    
    console.log('Minifying CSS...');
    const minifiedCSS = await minifyCSS(cssSource);
    
    console.log('Obfuscating JavaScript...');
    const obfuscatedJS = await obfuscateJS(jsSource);
    
    // Write obfuscated files
    await fs.writeFile('dist/index.html', minifiedHTML);
    await fs.writeFile('dist/styles.css', minifiedCSS);
    await fs.writeFile('dist/script.js', obfuscatedJS);
    
    // Copy image files if they exist
    const imageFiles = ['Bulletin.png', 'Bulletin2.png'];
    for (const image of imageFiles) {
      const srcPath = path.join('src', image);
      const destPath = path.join('dist', image);
      try {
        await fs.access(srcPath);
        await copyFile(srcPath, destPath);
      } catch {
        console.log(`Image not found: ${image}`);
      }
    }
    
    console.log('✅ Obfuscation complete! Files saved to /dist');
    console.log('📁 Files generated:');
    console.log('   - dist/index.html (minified)');
    console.log('   - dist/styles.css (minified)');
    console.log('   - dist/script.js (obfuscated)');
    
  } catch (error) {
    console.error('Error during obfuscation:', error);
    process.exit(1);
  }
}

processFiles();