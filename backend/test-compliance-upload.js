import axios from 'axios';
import fs from 'fs';
import path from 'path';

// Define target files
const specPath = path.resolve('sample_spec.pdf');
const submittalPath = path.resolve('sample_submittal.pdf');

// Create dummy PDF files if they don't exist
if (!fs.existsSync(specPath)) {
  fs.writeFileSync(specPath, '%PDF-1.4 dummy specification file contents');
}
if (!fs.existsSync(submittalPath)) {
  fs.writeFileSync(submittalPath, '%PDF-1.4 dummy submittal file contents');
}

async function runTest() {
  try {
    const formData = new FormData();
    
    // Read files as Blobs
    const specBuffer = fs.readFileSync(specPath);
    const submittalBuffer = fs.readFileSync(submittalPath);
    
    const specBlob = new Blob([specBuffer], { type: 'application/pdf' });
    const submittalBlob = new Blob([submittalBuffer], { type: 'application/pdf' });
    
    formData.append('specification', specBlob, 'sample_spec.pdf');
    formData.append('submittal', submittalBlob, 'sample_submittal.pdf');

    console.log('Sending spec compliance comparison request to backend...');
    const response = await axios.post('http://localhost:3000/api/v1/ai/compare-specs', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    console.log('\n--- SUCCESS ---');
    console.log('Status Code:', response.status);
    console.log('Data:', JSON.stringify(response.data, null, 2));

  } catch (error) {
    console.error('\n--- FAILED ---');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Error Data:', error.response.data);
    } else {
      console.error('Error Message:', error.message);
    }
  } finally {
    // Clean up dummy files
    try {
      if (fs.existsSync(specPath)) fs.unlinkSync(specPath);
      if (fs.existsSync(submittalPath)) fs.unlinkSync(submittalPath);
    } catch (e) {
      // ignore clean up errors
    }
  }
}

runTest();
