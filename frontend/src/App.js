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
    const [memoryStats, setMemoryStats] = useState(null);
    const [activeTab, setActiveTab] = useState('process');
    const [query, setQuery] = useState('');
    const [queryResult, setQueryResult] = useState(null);
    const [step, setStep] = useState(0);

    useEffect(() => {
        fetchProviders();
        fetchMemoryStats();
    }, []);

    const fetchProviders = async () => {
        try {
            const response = await axios.get(`${API_BASE}/providers`);
            setProviders(response.data);
        } catch (error) {
            console.error('Error fetching providers:', error);
        }
    };

    const fetchMemoryStats = async () => {
        try {
            const response = await axios.get(`${API_BASE}/memory-stats`);
            setMemoryStats(response.data);
        } catch (error) {
            console.error('Error fetching memory stats:', error);
        }
    };

    const processDocument = async () => {
        if (!text.trim()) {
            alert('Please enter some text');
            return;
        }

        setProcessing(true);
        setResult(null);
        setStep(0);

        try {
            // Simulate step-by-step processing
            setStep(1);
            await new Promise(resolve => setTimeout(resolve, 500));

            const response = await axios.post(`${API_BASE}/process-document`, {
                text,
                use_memory: true,
                provider
            });

            setStep(2);
            await new Promise(resolve => setTimeout(resolve, 500));

            setStep(3);
            await new Promise(resolve => setTimeout(resolve, 500));

            setResult(response.data);
            fetchMemoryStats();
        } catch (error) {
            alert(`Error: ${error.response?.data?.detail || error.message}`);
        } finally {
            setProcessing(false);
            setStep(0);
        }
    };

    const queryMemory = async () => {
        if (!query.trim()) {
            alert('Please enter a query');
            return;
        }

        setProcessing(true);
        setQueryResult(null);

        try {
            const response = await axios.post(`${API_BASE}/query-memory`, {
                query,
                provider
            });
            setQueryResult(response.data);
        } catch (error) {
            alert(`Error: ${error.response?.data?.detail || error.message}`);
        } finally {
            setProcessing(false);
        }
    };

    const clearMemory = async () => {
        if (!window.confirm('Are you sure you want to clear all memory?')) {
            return;
        }

        try {
            await axios.delete(`${API_BASE}/memory`);
            setMemoryStats(null);
            alert('Memory cleared successfully');
            fetchMemoryStats();
        } catch (error) {
            alert(`Error: ${error.response?.data?.detail || error.message}`);
        }
    };

    const loadSampleDocument = () => {
        const sample = `Artificial Intelligence (AI) has transformed numerous industries over the past decade. Machine learning algorithms now power everything from recommendation systems to autonomous vehicles. 

Deep learning, a subset of machine learning, uses neural networks with multiple layers to process complex patterns in data. These networks have achieved remarkable success in image recognition, natural language processing, and game playing.

The development of large language models like GPT and others has revolutionized how we interact with computers. These models can understand context, generate human-like text, and even write code.

However, AI also raises important ethical questions about bias, privacy, and the future of work. As AI systems become more capable, ensuring they align with human values becomes increasingly critical.`;
        setText(sample);
    };

    return (
        <div className="App">
            <header className="header">
                <h1>📄 Document Intelligence System</h1>
                <p>Process documents with AI-powered summarization, fact extraction, and question generation</p>
            </header>

            <div className="tabs">
                <button
                    className={activeTab === 'process' ? 'tab active' : 'tab'}
                    onClick={() => setActiveTab('process')}
                >
                    Process Document
                </button>
                <button
                    className={activeTab === 'query' ? 'tab active' : 'tab'}
                    onClick={() => setActiveTab('query')}
                >
                    Query Memory
                </button>
                <button
                    className={activeTab === 'memory' ? 'tab active' : 'tab'}
                    onClick={() => setActiveTab('memory')}
                >
                    Memory Stats
                </button>
            </div>

            <div className="content">
                {activeTab === 'process' && (
                    <div className="section">
                        <div className="provider-selector">
                            <label>AI Provider:</label>
                            <select value={provider} onChange={(e) => setProvider(e.target.value)}>
                                {Object.entries(providers).map(([name, info]) => (
                                    <option key={name} value={name} disabled={!info.configured}>
                                        {name.toUpperCase()} {info.configured ? `(${info.model})` : '(Not configured)'}
                                    </option>
                                ))}
                            </select>
                            <button onClick={loadSampleDocument} className="btn-secondary">
                                Load Sample
                            </button>
                        </div>

                        <div className="input-section">
                            <label>Input Document:</label>
                            <textarea
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                placeholder="Paste or type your document here..."
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

                        {processing && (
                            <div className="pipeline">
                                <div className={`pipeline-step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
                                    <div className="step-icon">😊</div>
                                    <div className="step-label">Step 1: Summarize</div>
                                </div>
                                <div className="pipeline-arrow">→</div>
                                <div className={`pipeline-step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
                                    <div className="step-icon">🔍</div>
                                    <div className="step-label">Step 2: Extract Facts</div>
                                </div>
                                <div className="pipeline-arrow">→</div>
                                <div className={`pipeline-step ${step >= 3 ? 'active' : ''}`}>
                                    <div className="step-icon">❓</div>
                                    <div className="step-label">Step 3: Generate Q's</div>
                                </div>
                            </div>
                        )}

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
                                    <h3>❓ Generated Questions</h3>
                                    {result.questions.map((q, index) => (
                                        <div key={index} className="question-item">
                                            <span className="question-type">{q.type}</span>
                                            <span className="question-text">{q.question}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'query' && (
                    <div className="section">
                        <div className="provider-selector">
                            <label>AI Provider:</label>
                            <select value={provider} onChange={(e) => setProvider(e.target.value)}>
                                {Object.entries(providers).map(([name, info]) => (
                                    <option key={name} value={name} disabled={!info.configured}>
                                        {name.toUpperCase()} {info.configured ? `(${info.model})` : '(Not configured)'}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="input-section">
                            <label>Query Memory:</label>
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Ask a question about your documents..."
                                onKeyPress={(e) => e.key === 'Enter' && queryMemory()}
                            />
                            <button
                                onClick={queryMemory}
                                disabled={processing}
                                className="btn-primary"
                            >
                                {processing ? 'Searching...' : '🔍 Search Memory'}
                            </button>
                        </div>

                        {queryResult && (
                            <div className="results">
                                <div className="result-card">
                                    <h3>💡 Answer</h3>
                                    <p>{queryResult.answer}</p>
                                </div>

                                <div className="result-card">
                                    <h3>📚 Sources ({queryResult.sources.length})</h3>
                                    {queryResult.sources.map((source, index) => (
                                        <div key={index} className="source-item">
                                            <div className="source-header">
                                                <span className="source-number">Source {index + 1}</span>
                                                {source.relevance_score && (
                                                    <span className="relevance-score">
                            {(source.relevance_score * 100).toFixed(1)}% relevant
                          </span>
                                                )}
                                            </div>
                                            <p className="source-text">{source.text.substring(0, 200)}...</p>
                                            {source.summary && <p className="source-summary">Summary: {source.summary}</p>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'memory' && (
                    <div className="section">
                        <div className="memory-stats">
                            <h3>🧠 Memory Statistics</h3>
                            {memoryStats ? (
                                <>
                                    <div className="stat-item">
                                        <span className="stat-label">Total Documents:</span>
                                        <span className="stat-value">{memoryStats.total_documents}</span>
                                    </div>
                                    <div className="stat-item">
                                        <span className="stat-label">Collection:</span>
                                        <span className="stat-value">{memoryStats.collection_name}</span>
                                    </div>

                                    {memoryStats.samples && memoryStats.samples.length > 0 && (
                                        <div className="result-card">
                                            <h4>Recent Documents</h4>
                                            {memoryStats.samples.map((sample, index) => (
                                                <div key={index} className="sample-item">
                                                    <p><strong>Preview:</strong> {sample.preview}</p>
                                                    <p className="sample-meta">
                                                        <small>{sample.timestamp}</small>
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <button onClick={clearMemory} className="btn-danger">
                                        🗑️ Clear Memory
                                    </button>
                                </>
                            ) : (
                                <p>No documents in memory yet.</p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default App;
