// scripts/process-doc.js
const mammoth = require('mammoth');
const fs = require('fs');
const path = require('path');

async function processDocument() {
  // Convert .docx to plain text
  const result = await mammoth.extractRawText({ 
    path: "./data/dnd-sessions.docx" 
  });
  
  const text = result.value;
  
  // Split into chunks with overlap
  const chunkSize = 1500; // characters
  const overlap = 200;
  const chunks = [];
  
  for (let i = 0; i < text.length; i += chunkSize - overlap) {
    chunks.push(text.substring(i, i + chunkSize));
  }
  
  // Save as static JSON
  fs.writeFileSync(
    "./public/chunks.json", 
    JSON.stringify({ chunks, total: chunks.length })
  );
  
  console.log(`✅ Processed ${chunks.length} chunks`);
}

processDocument();