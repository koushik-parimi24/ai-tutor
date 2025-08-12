const axios = require('axios');

// Test the diagram endpoint
async function testDiagramAPI() {
  try {
    console.log('Testing diagram API...');
    const response = await axios.post('http://localhost:5000/api/ai/diagram', {
      content: 'Machine learning algorithms and neural networks for beginners'
    });
    
    console.log('✅ Diagram API Response:');
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.log('❌ Diagram API Error:');
    console.log('Status:', error.response?.status);
    console.log('Data:', JSON.stringify(error.response?.data, null, 2));
  }
}

// Test the health endpoint
async function testHealthAPI() {
  try {
    console.log('\nTesting health API...');
    const response = await axios.get('http://localhost:5000/health');
    console.log('✅ Health API Response:');
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.log('❌ Health API Error:', error.message);
  }
}

// Run tests
async function runTests() {
  await testHealthAPI();
  await testDiagramAPI();
}

runTests();
