import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE } from './config';
import './App.css';

function App() {
  const [text, setText] = useState('');
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [provider, setProvider] = useState('groq');
  const [providers, setProviders] = useState({});
  const [uploadedFile, setUploadedFile] = useState(null);
  const [inputMode, setInputMode] = useState('text'); // 'text' or 'file'

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    try {
      const response = await axios.get(`${API_BASE}/providers`);
      setProviders(response.data);
    } catch (error) {
      console.error('Error fetching providers:', error);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
      const validExtensions = ['.pdf', '.docx', '.txt'];
      const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
      
      if (!validTypes.includes(file.type) && !validExtensions.includes(fileExtension)) {
        alert('Please upload a PDF, DOCX, or TXT file');
        return;
      }
      
      setUploadedFile(file);
      setText(''); // Clear text input when file is selected
    }
  };

  const processDocument = async () => {
    if (inputMode === 'text') {
      if (!text.trim()) {
        alert('Please enter some text');
        return;
      }
      await processTextDocument();
    } else {
      if (!uploadedFile) {
        alert('Please select a file');
        return;
      }
      await processFileDocument();
    }
  };

  const processTextDocument = async () => {
    setProcessing(true);
    setResult(null);

    try {
      const response = await axios.post(`${API_BASE}/process-document`, {
        text,
        use_memory: true,
        provider
      });

      setResult(response.data);
    } catch (error) {
      alert(`Error: ${error.response?.data?.detail || error.message}`);
    } finally {
      setProcessing(false);
    }
  };

  const processFileDocument = async () => {
    setProcessing(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', uploadedFile);

      const response = await axios.post(`${API_BASE}/upload-document`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        params: {
          use_memory: true,
          provider: provider
        }
      });

      setResult(response.data);
    } catch (error) {
      alert(`Error: ${error.response?.data?.detail || error.message}`);
    } finally {
      setProcessing(false);
    }
  };

  const loadSample = () => {
    setInputMode('text');
    setUploadedFile(null);
    setText(`Artificial Intelligence has transformed industries over the past decade. Machine learning algorithms power recommendation systems and autonomous vehicles. Deep learning uses neural networks to process complex patterns in data. These technologies enable computers to learn from experience and improve their performance over time.`);
  };

  const clearFile = () => {
    setUploadedFile(null);
    const fileInput = document.getElementById('file-input');
    if (fileInput) fileInput.value = '';
  };

  return (
    <div className="App">
      <header className="header">
        <h1>📄 Document Intelligence System</h1>
        <p>AI-powered document processing with memory</p>
      </header>

      <div className="content">
        <div className="provider-selector">
          <label>AI Provider:</label>
          <select value={provider} onChange={(e) => setProvider(e.target.value)}>
            {Object.entries(providers).map(([name, info]) => (
              <option key={name} value={name} disabled={!info.configured}>
                {name.toUpperCase()} {info.configured ? '✓' : '✗'}
              </option>
            ))}
          </select>
          <button onClick={loadSample} className="btn-secondary">
            Load Sample
          </button>
        </div>

        <div className="input-mode-selector">
          <button 
            className={inputMode === 'text' ? 'mode-btn active' : 'mode-btn'}
            onClick={() => setInputMode('text')}
          >
            📝 Text Input
          </button>
          <button 
            className={inputMode === 'file' ? 'mode-btn active' : 'mode-btn'}
            onClick={() => setInputMode('file')}
          >
            📤 Upload File
          </button>
        </div>

        {inputMode === 'text' ? (
          <div className="input-section">
            <label>Input Document:</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste your document here..."
              rows={10}
            />
          </div>
        ) : (
          <div className="input-section">
            <label>Upload Document (PDF, DOCX, TXT):</label>
            <div className="file-upload-area">
              <input
                id="file-input"
                type="file"
                accept=".pdf,.docx,.txt"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
              <label htmlFor="file-input" className="file-upload-label">
                {uploadedFile ? (
                  <div className="file-selected">
                    <span className="file-icon">📄</span>
                    <span className="file-name">{uploadedFile.name}</span>
                    <button onClick={clearFile} className="clear-file-btn" type="button">✕</button>
                  </div>
                ) : (
                  <div className="file-upload-placeholder">
                    <span className="upload-icon">📤</span>
                    <span>Click to upload or drag and drop</span>
                    <span className="file-types">PDF, DOCX, or TXT</span>
                  </div>
                )}
              </label>
            </div>
          </div>
        )}

        <button 
          onClick={processDocument} 
          disabled={processing}
          className="btn-primary"
        >
          {processing ? 'Processing...' : '🚀 Process Document'}
        </button>

        {result && (
          <div className="results">
            {result.filename && (
              <div className="result-card file-info">
                <h3>📁 File Information</h3>
                <p><strong>Filename:</strong> {result.filename}</p>
                <p><strong>Text Length:</strong> {result.full_text_length || result.text?.length} characters</p>
              </div>
            )}

            <div className="result-card">
              <h3>📝 Summary</h3>
              <p>{result.summary}</p>
            </div>

            <div className="result-card">
              <h3>✅ Key Facts</h3>
              <ul>
                {result.facts.map((fact, index) => (
                  <li key={index}>{fact}</li>
                ))}
              </ul>
            </div>

            <div className="result-card">
              <h3>❓ Questions</h3>
              {result.questions.map((q, index) => (
                <div key={index} className="question-item">
                  <span className="question-type">{q.type}</span>
                  <span>{q.question}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
