// Simple test to verify CONFIG is loaded
console.log('Testing CONFIG availability...');
setTimeout(() => {
  if (typeof CONFIG !== 'undefined') {
    console.log('✓ CONFIG is available:', CONFIG);
  } else {
    console.error('✗ CONFIG is not available');
  }
}, 1000);
