#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function configureAI() {
  console.log('🤖 AI Tutor - AI Provider Configuration\n');
  
  console.log('Available AI Providers:');
  console.log('1. Google Gemini (Free tier: 15 req/min, 1M tokens/day)');
  console.log('2. OpenAI (Paid service)');
  console.log('3. Mock/Demo (No API key needed, uses sample data)');
  console.log('');
  
  const choice = await question('Choose your provider (1-3): ');
  
  let provider = 'mock';
  let apiKey = '';
  
  switch (choice) {
    case '1':
      provider = 'gemini';
      console.log('\n📝 To get a Gemini API key:');
      console.log('1. Go to https://makersuite.google.com/app/apikey');
      console.log('2. Create a new API key');
      console.log('3. Copy the key below\n');
      apiKey = await question('Enter your Gemini API key (or press Enter to skip): ');
      break;
      
    case '2':
      provider = 'openai';
      console.log('\n📝 To get an OpenAI API key:');
      console.log('1. Go to https://platform.openai.com/api-keys');
      console.log('2. Create a new secret key');
      console.log('3. Copy the key below\n');
      apiKey = await question('Enter your OpenAI API key (or press Enter to skip): ');
      break;
      
    case '3':
    default:
      provider = 'mock';
      console.log('\n✅ Using mock provider - no API key needed!');
      break;
  }
  
  // Read existing .env or create new one
  const envPath = path.join(__dirname, '.env');
  let envContent = '';
  
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
  }
  
  // Update or add AI_PROVIDER
  if (envContent.includes('AI_PROVIDER=')) {
    envContent = envContent.replace(/AI_PROVIDER=.*/, `AI_PROVIDER=${provider}`);
  } else {
    envContent += `\nAI_PROVIDER=${provider}`;
  }
  
  // Update or add API key if provided
  if (provider === 'gemini' && apiKey) {
    if (envContent.includes('GEMINI_API_KEY=')) {
      envContent = envContent.replace(/GEMINI_API_KEY=.*/, `GEMINI_API_KEY=${apiKey}`);
    } else {
      envContent += `\nGEMINI_API_KEY=${apiKey}`;
    }
  } else if (provider === 'openai' && apiKey) {
    if (envContent.includes('OPENAI_API_KEY=')) {
      envContent = envContent.replace(/OPENAI_API_KEY=.*/, `OPENAI_API_KEY=${apiKey}`);
    } else {
      envContent += `\nOPENAI_API_KEY=${apiKey}`;
    }
  }
  
  // Add default PORT if not exists
  if (!envContent.includes('PORT=')) {
    envContent += `\nPORT=5000`;
  }
  
  // Write .env file
  fs.writeFileSync(envPath, envContent.trim() + '\n');
  
  console.log(`\n✅ Configuration saved!`);
  console.log(`🤖 AI Provider: ${provider.toUpperCase()}`);
  
  if (apiKey) {
    console.log(`🔑 API Key: ${apiKey.substring(0, 10)}...`);
  } else if (provider !== 'mock') {
    console.log(`⚠️  No API key provided - will use mock data until you add one to .env`);
  }
  
  console.log('\n🚀 Start the server with: npm run dev');
  
  rl.close();
}

configureAI().catch(console.error);
