import { useState, useEffect } from 'react';
import { Loader2, Check, AlertCircle, Edit, Eye } from 'lucide-react';

const OCRProcessor = ({ image, onOCRComplete, onCancel }) => {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [extractedData, setExtractedData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({});

  const GEMINI_API_KEY = 'AIzaSyCduntbr1tA87eiUmB8stQcmqh_PPgyxuc';

  useEffect(() => {
    if (image) {
      processImage();
    }
  }, [image]);

  const processImage = async () => {
    setIsProcessing(true);
    setStatus('Initializing OCR...');
    setProgress(0);

    try {
      // Convert image to base64
      const base64 = await getBase64FromImage(image);
      setProgress(25);
      setStatus('Analyzing document...');

      // Call Gemini API
      const response = await callGeminiAPI(base64);
      setProgress(75);
      setStatus('Extracting information...');

      const structuredData = parseDocumentData(response);
      
      setExtractedData(structuredData);
      setEditedData(structuredData);
      setStatus('OCR Complete!');
      setIsProcessing(false);
    } catch (error) {
      console.error('OCR Error:', error);
      setStatus('OCR Failed. Please try again.');
      setIsProcessing(false);
    }
  };

  const getBase64FromImage = (imageSrc) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const dataURL = canvas.toDataURL('image/jpeg', 0.8);
        const base64 = dataURL.split(',')[1];
        resolve(base64);
      };
      img.onerror = reject;
      img.src = imageSrc;
    });
  };

  const callGeminiAPI = async (base64Image) => {
    try {
      // Convert base64 back to blob for FormData
      const response = await fetch(`data:image/jpeg;base64,${base64Image}`);
      const blob = await response.blob();
      
      const formData = new FormData();
      formData.append('image', blob, 'document.jpg');

      const apiResponse = await fetch('http://localhost:3001/api/gemini-ocr', {
        method: 'POST',
        body: formData,
      });

      if (!apiResponse.ok) {
        const errorData = await apiResponse.json();
        throw new Error(errorData.error || 'API request failed');
      }

      const extractedData = await apiResponse.json();
      return extractedData;
    } catch (error) {
      console.error('Proxy API Error:', error);
      throw new Error('Failed to extract data from Gemini API');
    }
  };

  const parseDocumentData = (geminiResponse) => {
    // Gemini API already returns structured data, just format it for our component
    const extractedFields = {
      rawText: JSON.stringify(geminiResponse, null, 2),
      fields: geminiResponse,
      documentType: geminiResponse.documentType
    };

    return extractedFields;
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    if (!isEditing) {
      setEditedData({ ...extractedData });
    }
  };

  const handleFieldChange = (field, value) => {
    setEditedData(prev => ({
      ...prev,
      fields: {
        ...prev.fields,
        [field]: value
      }
    }));
  };

  const handleConfirm = () => {
    onOCRComplete(isEditing ? editedData : extractedData);
  };

  if (isProcessing) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4">
          <div className="flex flex-col items-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
            <h3 className="text-lg font-semibold text-center mb-2">
              Processing Document
            </h3>
            <p className="text-sm text-gray-600 text-center mb-4">
              {status}
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <button
              onClick={onCancel}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (extractedData) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">
                Extracted Information
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={handleEditToggle}
                  className="flex items-center gap-2 px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
                >
                  {isEditing ? <Eye className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
                  {isEditing ? 'Preview' : 'Edit'}
                </button>
                <button
                  onClick={onCancel}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {/* Driving License - 3 inputs */}
              {extractedData.fields.documentType === 'drivingLicense' && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-medium mb-3 text-blue-900">Driving License Details</h4>
                  <div className="space-y-3">
                    <div className="bg-white p-3 rounded border border-blue-200">
                      <label className="text-xs font-medium text-blue-700 block mb-1">Full Name</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editedData.fields.name || ''}
                          onChange={(e) => handleFieldChange('name', e.target.value)}
                          className="w-full px-3 py-2 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <p className="text-sm font-medium text-gray-900">{extractedData.fields.name || 'Not detected'}</p>
                      )}
                    </div>
                    
                    <div className="bg-white p-3 rounded border border-blue-200">
                      <label className="text-xs font-medium text-blue-700 block mb-1">License Number</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editedData.fields.licenseNo || ''}
                          onChange={(e) => handleFieldChange('licenseNo', e.target.value)}
                          className="w-full px-3 py-2 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <p className="text-sm font-medium text-gray-900">{extractedData.fields.licenseNo || 'Not detected'}</p>
                      )}
                    </div>
                    
                    <div className="bg-white p-3 rounded border border-blue-200">
                      <label className="text-xs font-medium text-blue-700 block mb-1">Expiry Date</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editedData.fields.expiryDate || ''}
                          onChange={(e) => handleFieldChange('expiryDate', e.target.value)}
                          className="w-full px-3 py-2 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <p className="text-sm font-medium text-gray-900">{extractedData.fields.expiryDate || 'Not detected'}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Insurance - 2 inputs */}
              {extractedData.fields.documentType === 'insurance' && (
                <div className="bg-orange-50 rounded-lg p-4">
                  <h4 className="font-medium mb-3 text-orange-900">Insurance Details</h4>
                  <div className="space-y-3">
                    <div className="bg-white p-3 rounded border border-orange-200">
                      <label className="text-xs font-medium text-orange-700 block mb-1">Policy Number</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editedData.fields.policyNo || ''}
                          onChange={(e) => handleFieldChange('policyNo', e.target.value)}
                          className="w-full px-3 py-2 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      ) : (
                        <p className="text-sm font-medium text-gray-900">{extractedData.fields.policyNo || 'Not detected'}</p>
                      )}
                    </div>
                    
                    <div className="bg-white p-3 rounded border border-orange-200">
                      <label className="text-xs font-medium text-orange-700 block mb-1">Expiry Date</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editedData.fields.expiryDate || ''}
                          onChange={(e) => handleFieldChange('expiryDate', e.target.value)}
                          className="w-full px-3 py-2 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      ) : (
                        <p className="text-sm font-medium text-gray-900">{extractedData.fields.expiryDate || 'Not detected'}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Registration Certificate - 3 inputs */}
              {extractedData.fields.documentType === 'vehicleRC' && (
                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="font-medium mb-3 text-green-900">Registration Certificate Details</h4>
                  <div className="space-y-3">
                    <div className="bg-white p-3 rounded border border-green-200">
                      <label className="text-xs font-medium text-green-700 block mb-1">Vehicle Number</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editedData.fields.vehicleNo || ''}
                          onChange={(e) => handleFieldChange('vehicleNo', e.target.value)}
                          className="w-full px-3 py-2 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      ) : (
                        <p className="text-sm font-medium text-gray-900">{extractedData.fields.vehicleNo || 'Not detected'}</p>
                      )}
                    </div>
                    
                    <div className="bg-white p-3 rounded border border-green-200">
                      <label className="text-xs font-medium text-green-700 block mb-1">Chassis Number</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editedData.fields.chassisNo || ''}
                          onChange={(e) => handleFieldChange('chassisNo', e.target.value)}
                          className="w-full px-3 py-2 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      ) : (
                        <p className="text-sm font-medium text-gray-900">{extractedData.fields.chassisNo || 'Not detected'}</p>
                      )}
                    </div>
                    
                    <div className="bg-white p-3 rounded border border-green-200">
                      <label className="text-xs font-medium text-green-700 block mb-1">Expiry Date</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editedData.fields.expiryDate || ''}
                          onChange={(e) => handleFieldChange('expiryDate', e.target.value)}
                          className="w-full px-3 py-2 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      ) : (
                        <p className="text-sm font-medium text-gray-900">{extractedData.fields.expiryDate || 'Not detected'}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Fitness Certificate - 1 input */}
              {extractedData.fields.documentType === 'fitness' && (
                <div className="bg-purple-50 rounded-lg p-4">
                  <h4 className="font-medium mb-3 text-purple-900">Fitness Certificate Details</h4>
                  <div className="space-y-3">
                    <div className="bg-white p-3 rounded border border-purple-200">
                      <label className="text-xs font-medium text-purple-700 block mb-1">Certificate Number</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editedData.fields.certificateNo || ''}
                          onChange={(e) => handleFieldChange('certificateNo', e.target.value)}
                          className="w-full px-3 py-2 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      ) : (
                        <p className="text-sm font-medium text-gray-900">{extractedData.fields.certificateNo || 'Not detected'}</p>
                      )}
                    </div>
                    
                    <div className="bg-white p-3 rounded border border-purple-200">
                      <label className="text-xs font-medium text-purple-700 block mb-1">Expiry Date</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editedData.fields.expiryDate || ''}
                          onChange={(e) => handleFieldChange('expiryDate', e.target.value)}
                          className="w-full px-3 py-2 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      ) : (
                        <p className="text-sm font-medium text-gray-900">{extractedData.fields.expiryDate || 'Not detected'}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Fallback for unknown document types */}
              {!extractedData.fields.documentType && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium mb-3">Extracted Information</h4>
                  <div className="space-y-2">
                    {Object.entries(isEditing ? editedData.fields : extractedData.fields).map(([key, value]) => (
                      key !== 'documentType' && value && (
                        <div key={key} className="flex justify-between items-center">
                          <span className="text-sm font-medium capitalize text-gray-600">
                            {key.replace(/([A-Z])/g, ' $1').trim()}:
                          </span>
                          {isEditing ? (
                            <input
                              type="text"
                              value={value}
                              onChange={(e) => handleFieldChange(key, e.target.value)}
                              className="flex-1 ml-2 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          ) : (
                            <span className="text-sm text-gray-900 ml-2">{value}</span>
                          )}
                        </div>
                      )
                    ))}
                  </div>
                </div>
              )}

              {/* Raw text preview */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium mb-3">Raw Response</h4>
                <div className="text-xs text-gray-600 max-h-32 overflow-y-auto whitespace-pre-wrap">
                  {extractedData.rawText}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleConfirm}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Confirm & Continue
                </button>
                <button
                  onClick={onCancel}
                  className="px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default OCRProcessor;
