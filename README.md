# 📄 Document Intelligence System

An AI-powered document processing application that automatically summarizes documents, extracts key facts, and generates comprehension questions. Built with React, FastAPI, and multiple LLM providers with persistent memory using vector databases.

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://your-vercel-url.vercel.app)
[![Backend](https://img.shields.io/badge/backend-FastAPI-009688)](https://fastapi.tiangolo.com/)
[![Frontend](https://img.shields.io/badge/frontend-React-61DAFB)](https://reactjs.org/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## ✨ Features

### 🚀 Document Processing Pipeline
- **3-Step AI Pipeline**: Automatically processes documents through summarization, fact extraction, and question generation
- **Multi-Format Support**: Upload PDF, DOCX, or TXT files, or paste text directly
- **Real-time Processing**: See your documents analyzed in seconds

### 🧠 Intelligent Memory System
- **Vector Database**: Stores all processed documents using ChromaDB
- **Semantic Search**: Query your document library with natural language
- **Context Retention**: Build a knowledge base over time

### 🤖 Multiple AI Providers
- **Groq**: Free, ultra-fast inference (Recommended)
- **Ollama**: 100% free, runs locally for complete privacy
- **OpenAI**: GPT-3.5 Turbo and GPT-4 support
- **Anthropic**: Claude 3 models (Haiku, Sonnet, Opus)

### 📱 Modern UI/UX
- Beautiful gradient design
- Fully responsive (mobile, tablet, desktop)
- Real-time progress indicators
- Drag-and-drop file upload

## 🎯 Use Cases

- **Students**: Quickly summarize study materials and generate practice questions
- **Researchers**: Extract key findings from academic papers
- **Business**: Process reports and meeting notes
- **Content Creators**: Analyze articles and generate insights
- **Knowledge Management**: Build a searchable document repository

## 🛠️ Tech Stack

### Backend
- **Framework**: FastAPI (Python 3.11)
- **Vector Database**: ChromaDB
- **File Processing**: PyPDF2, python-docx
- **LLM Integration**: OpenAI, Anthropic, Groq, Ollama APIs
- **Async**: httpx for async HTTP requests

### Frontend
- **Framework**: React 18
- **HTTP Client**: Axios
- **Styling**: Custom CSS3 with animations
- **Build Tool**: Create React App

### Infrastructure
- **Backend Hosting**: Render (Free tier)
- **Frontend Hosting**: Vercel (Free tier)
- **CI/CD**: Automatic deployment from GitHub

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 16+
- Git

### 1. Clone Repository
```bash
git clone https://github.com/huzaifa61/Document-Intelligence-System.git
cd Document-Intelligence-System
```

### 2. Backend Setup
```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env and add your API key (get free key from https://console.groq.com/)

# Start backend
python app.py
```

Backend runs on: http://localhost:8000

### 3. Frontend Setup
```bash
# In a new terminal
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

Frontend runs on: http://localhost:3000

## 🔑 Getting API Keys

### Groq (Recommended - Free & Fast)
1. Visit [Groq Console](https://console.groq.com/)
2. Sign up (takes 30 seconds)
3. Create API key
4. Add to `.env`: `GROQ_API_KEY=your_key`

### Ollama (Completely Free - Local)
1. Download from [Ollama.ai](https://ollama.ai/)
2. Install and run: `ollama serve`
3. Pull a model: `ollama pull llama3.2`
4. No API key needed!

### OpenAI (Paid)
1. Visit [OpenAI Platform](https://platform.openai.com/)
2. Get API key
3. Add to `.env`: `OPENAI_API_KEY=your_key`

### Anthropic (Paid)
1. Visit [Anthropic Console](https://console.anthropic.com/)
2. Get API key
3. Add to `.env`: `ANTHROPIC_API_KEY=your_key`

## 📖 Usage

### Processing Documents

**Text Input:**
1. Select "Text Input" mode
2. Paste your document
3. Click "Process Document"
4. View summary, facts, and questions

**File Upload:**
1. Select "Upload File" mode
2. Upload PDF, DOCX, or TXT
3. Click "Process Document"
4. See results with file information

### Querying Memory

1. Go to "Query Memory" tab
2. Ask questions like:
   - "What are the main points about AI?"
   - "Summarize the key findings"
   - "What did the document say about machine learning?"
3. Get AI-powered answers with relevant sources

### Managing Memory

1. Go to "Memory Stats" tab
2. View total documents stored
3. See recent document previews
4. Clear memory if needed

## 🌐 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/process-document` | Process text through pipeline |
| POST | `/api/upload-document` | Upload and process file |
| POST | `/api/query-memory` | Query stored documents |
| GET | `/api/memory-stats` | Get memory statistics |
| DELETE | `/api/memory` | Clear all memory |
| GET | `/api/providers` | List available providers |

Full API documentation: http://localhost:8000/docs

## 🐳 Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 🚀 Production Deployment

### Deploy Backend (Render)
1. Push code to GitHub
2. Go to [Render Dashboard](https://dashboard.render.com/)
3. Create new Web Service
4. Connect GitHub repository
5. Configure:
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app:app --host 0.0.0.0 --port $PORT`
6. Add environment variable: `GROQ_API_KEY`
7. Deploy!

### Deploy Frontend (Vercel)
1. Push code to GitHub
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Import GitHub repository
4. Configure:
   - **Root Directory**: `frontend`
   - **Framework**: Create React App
5. Add environment variable: `REACT_APP_API_URL` (your Render backend URL)
6. Deploy!

## 📊 Project Structure

```
doc-processor/
├── backend/
│   ├── app.py                    # Main FastAPI application
│   ├── llm_handler.py            # Multi-provider LLM handler
│   ├── document_processor.py    # 3-step pipeline
│   ├── memory_manager.py         # ChromaDB integration
│   ├── requirements.txt          # Python dependencies
│   ├── runtime.txt               # Python version
│   └── .env.example              # Environment template
│
├── frontend/
│   ├── src/
│   │   ├── App.js                # Main React component
│   │   ├── App.css               # Styling
│   │   ├── config.js             # API configuration
│   │   ├── index.js              # Entry point
│   │   └── index.css             # Global styles
│   ├── public/
│   │   └── index.html            # HTML template
│   └── package.json              # Node dependencies
│
├── docker-compose.yml            # Docker configuration
└── README.md                     # This file
```

## 🎨 Screenshots

### Process Document
![Process Document](screenshots/process.png)

### Query Memory
![Query Memory](screenshots/query.png)

### Mobile View
![Mobile View](screenshots/mobile.png)

## 🔧 Development

### Backend Development
```bash
cd backend
source venv/bin/activate

# Run with auto-reload
uvicorn app:app --reload

# Run tests (if implemented)
pytest
```

### Frontend Development
```bash
cd frontend

# Start dev server
npm start

# Build for production
npm run build

# Run linter
npm run lint
```

## 🐛 Troubleshooting

### Backend Issues

**"Module not found" errors:**
```bash
pip install -r requirements.txt
```

**ChromaDB errors:**
```bash
rm -rf chroma_db/
python app.py
```

**API key not loading:**
- Verify `.env` file exists in `backend/` directory
- Check no extra spaces in API key
- Restart backend after updating `.env`

### Frontend Issues

**"Cannot connect to backend":**
- Ensure backend is running on port 8000
- Check `config.js` has correct API URL

**Build errors:**
```bash
rm -rf node_modules package-lock.json
npm install
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [FastAPI](https://fastapi.tiangolo.com/)
- Powered by [Groq](https://groq.com/) for fast inference
- Vector storage by [ChromaDB](https://www.trychroma.com/)
- UI inspired by modern design trends

## 📧 Contact

- **Author**: Huzaifa Shaikh
- **Email**: huzaifa.shaikh.office@gmail.com
- **GitHub**: [@huzaifa61](https://github.com/huzaifa61)

## ⭐ Star History

If you find this project useful, please consider giving it a star!

---

**Made with ❤️ using Claude AI**
