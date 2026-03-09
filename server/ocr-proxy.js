const express = require('express');
const axios = require('axios');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

const app = express();
const port = 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Configure multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });

// Gemini API proxy endpoint
app.post('/api/gemini-ocr', upload.single('image'), async (req, res) => {
  try {
    const { prompt } = req.body;
    const imageBuffer = req.file?.buffer;
    
    if (!imageBuffer) {
      return res.status(400).json({ error: 'No image provided' });
    }

    // Convert image to base64
    const base64Image = imageBuffer.toString('base64');

    const geminiResponse = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyCduntbr1tA87eiUmB8stQcmqh_PPgyxuc`,
      {
        contents: [{
          parts: [{
            text: prompt || `
            Analyze this document and extract information. Return ONLY a JSON object with the following structure:
            
            For Driving License:
            {
              "documentType": "drivingLicense",
              "name": "Full name as shown",
              "licenseNo": "License number",
              "expiryDate": "Expiry date in DD/MM/YYYY format"
            }
            
            For Insurance Policy:
            {
              "documentType": "insurance",
              "policyNo": "Policy number",
              "expiryDate": "Expiry date in DD/MM/YYYY format"
            }
            
            For Registration Certificate:
            {
              "documentType": "vehicleRC",
              "vehicleNo": "Vehicle registration number",
              "chassisNo": "Chassis number",
              "expiryDate": "Expiry date in DD/MM/YYYY format"
            }
            
            For Fitness Certificate:
            {
              "documentType": "fitness",
              "certificateNo": "Certificate number",
              "expiryDate": "Expiry date in DD/MM/YYYY format"
            }
            
            Extract only information that is clearly visible in the document. If a field is not found, use empty string.
            `
          }, {
            inline_data: {
              mime_type: "image/jpeg",
              data: base64Image
            }
          }]
        }]
      },
      {
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );

    const data = geminiResponse.data;
    
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      const text = data.candidates[0].content.parts[0].text;
      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const extractedData = JSON.parse(jsonMatch[0]);
        return res.json(extractedData);
      }
    }
    
    res.status(400).json({ error: 'Failed to extract data from Gemini API' });
  } catch (error) {
    console.error('Gemini API Error:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Failed to process image',
      details: error.response?.data || error.message 
    });
  }
});

app.listen(port, () => {
  console.log(`OCR Proxy Server running on http://localhost:${port}`);
});
