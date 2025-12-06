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

  const processDocument = async () => {
    if (!text.trim()) {
      alert('Please enter some text');
      return;
    }

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

  const loadSample = () => {
    setText(`Artificial Intelligence has transformed industries over the past decade. Machine learning algorithms power recommendation systems and autonomous vehicles. Deep learning uses neural networks to process complex patterns in data. These technologies enable computers to learn from experience and improve their performance over time.`);
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

        <div className="input-section">
          <label>Input Document:</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste your document here..."
            rows={10}
          />
          <button 
            onClick={processDocument} 
            disabled={processing}
            className="btn-primary"
          >
            {processing ? 'Processing...' : '🚀 Process Document'}
          </button>
        </div>

        {result && (
          <div className="results">
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
