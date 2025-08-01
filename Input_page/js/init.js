/**
 * Initialization script to ensure all services are properly loaded
 */

// Global error handler
window.addEventListener('error', function(e) {
  console.error('Global error:', e.error);
  if (typeof Swal !== 'undefined') {
    Swal.fire({
      title: "Application Error",
      text: "An unexpected error occurred. Please refresh the page.",
      icon: "error",
    });
  }
});

// Check if required dependencies are loaded
function checkDependencies() {
  const required = [
    { name: 'Handsontable', obj: 'Handsontable' },
    { name: 'Bootstrap', obj: 'bootstrap' },
    { name: 'SweetAlert2', obj: 'Swal' },
    { name: 'CONFIG', obj: 'CONFIG' }
  ];
  
  const missing = [];
  
  for (const dep of required) {
    if (typeof window[dep.obj] === 'undefined') {
      missing.push(dep.name);
    }
  }
  
  // If CONFIG is missing, create a minimal fallback
  if (typeof window.CONFIG === 'undefined') {
    console.warn('CONFIG not loaded, creating fallback');
    window.CONFIG = createFallbackConfig();
    // Remove CONFIG from missing list since we created a fallback
    const configIndex = missing.indexOf('CONFIG');
    if (configIndex > -1) {
      missing.splice(configIndex, 1);
    }
  }
  
  if (missing.length > 0) {
    console.error('Missing dependencies:', missing);
    alert(`Missing required dependencies: ${missing.join(', ')}. Please refresh the page.`);
    return false;
  }
  
  return true;
}

// Create a minimal fallback CONFIG object
function createFallbackConfig() {
  return {
    GEMINI_API_KEY: "AIzaSyB0tRWaZXYa-fC-_dAHBBvRTQkiMolpukI",
    GEMINI_MODEL: "gemini-2.5-flash-preview-05-20",
    TABLE_COLUMNS: [
      { data: "name", title: "Name", width: 150, required: true },
      { data: "length", title: "Length (m)", type: "numeric", width: 120, required: true },
      { data: "width", title: "Width (m)", type: "numeric", width: 120, required: true },
      { data: "height", title: "Height (m)", type: "numeric", width: 120, required: true },
      { data: "weight", title: "Weight (kg)", type: "numeric", width: 120, required: true },
      { data: "quantity", title: "Quantity", type: "numeric", width: 100, required: true },
      { data: "fragility", title: "Fragility", type: "dropdown", width: 120, required: true, source: ["LOW", "MEDIUM", "HIGH"], aiAssisted: true },
      { data: "loadBear", title: "LoadBear (kg)", type: "numeric", width: 130, required: true, aiAssisted: true },
      { data: "boxingType", title: "BoxingType", type: "dropdown", width: 130, required: true, source: ["BOX", "PALLET", "LOOSE", "CONTAINER", "CRATE"] },
      { data: "bundle", title: "Bundle", type: "dropdown", width: 120, required: true, source: ["YES", "NO"] },
      { data: "tempSensitivity", title: "Temperature Sensitivity", width: 170, required: true, aiAssisted: true }
    ],
    DEFAULT_ROW: {
      name: "", length: null, width: null, height: null, weight: null,
      quantity: "", fragility: "", loadBear: null, boxingType: "", bundle: "", tempSensitivity: ""
    },
    STORAGE_KEYS: {
      CARGO_DATA: "cargovortex-data",
      THEME: "cargovortex-theme",
      LAST_EXPORT: "cargovortex-last-export"
    },
    VALIDATION: {
      TEMP_SENSITIVITY_PATTERN: /^-?\d+°C to -?\d+°C$/,
      MIN_DIMENSIONS: 0.01, MAX_DIMENSIONS: 50,
      MIN_WEIGHT: 0.1, MAX_WEIGHT: 40000,
      MIN_QUANTITY: 1, MAX_QUANTITY: 10000,
      MIN_LOADBEAR: 0, MAX_LOADBEAR: 100000
    },
    AI: {
      MAX_CONTEXT_ITEMS: 10,
      CONFIDENCE_THRESHOLDS: { HIGH: 0.85, MEDIUM: 0.5, LOW: 0 }
    }
  };
}

// Initialize service globals
function initializeServices() {
  try {
    // Initialize AIService if available
    if (typeof AIService !== 'undefined' && typeof CONFIG !== 'undefined') {
      window.aiService = new AIService(CONFIG.GEMINI_API_KEY, CONFIG.GEMINI_MODEL);
      console.log('AI Service initialized');
    } else {
      console.warn('AIService not available');
    }
    
    // Initialize ExportService if available
    if (typeof ExportService !== 'undefined') {
      window.exportService = new ExportService();
      console.log('Export Service initialized');
    } else {
      console.warn('ExportService not available');
    }
    
    return true;
  } catch (error) {
    console.error('Error initializing services:', error);
    return false;
  }
}

// Wait for all scripts to load with retries
function waitForDependencies(maxRetries = 10, delay = 500) {
  return new Promise((resolve) => {
    let retries = 0;
    
    const checkInterval = setInterval(() => {
      retries++;
      
      if (checkDependencies()) {
        clearInterval(checkInterval);
        resolve(true);
      } else if (retries >= maxRetries) {
        clearInterval(checkInterval);
        console.error('Failed to load all dependencies after', maxRetries, 'retries');
        resolve(false);
      }
    }, delay);
  });
}

// Run initialization when DOM is ready
document.addEventListener('DOMContentLoaded', async function() {
  console.log('DOM loaded, waiting for dependencies...');
  
  // Wait for dependencies with retries
  const dependenciesLoaded = await waitForDependencies();
  
  if (dependenciesLoaded) {
    console.log('All dependencies loaded successfully');
    initializeServices();
  } else {
    console.error('Some dependencies failed to load');
    // Show a more helpful error message
    if (typeof alert !== 'undefined') {
      alert('Failed to load required scripts. Please check your internet connection and refresh the page.');
    }
  }
});
