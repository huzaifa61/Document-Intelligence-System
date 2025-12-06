import os
from dotenv import load_dotenv

# Load .env file FIRST before importing anything else
load_dotenv()

# Verify key is loaded
print(f"🔑 API Key loaded: {os.getenv('GROQ_API_KEY', 'NOT FOUND')[:20]}...")

import json
import io
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import uvicorn

# Import file processing libraries
from PyPDF2 import PdfReader
from docx import Document

from llm_handler import LLMHandler
from document_processor import DocumentProcessor
from memory_manager import MemoryManager

app = FastAPI(title="Document Intelligence System")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize components
llm_handler = LLMHandler()
doc_processor = DocumentProcessor(llm_handler)
memory_manager = MemoryManager()


class ProcessRequest(BaseModel):
    text: str
    use_memory: bool = True
    provider: str = "groq"


class QueryRequest(BaseModel):
    query: str
    provider: str = "groq"


def extract_text_from_pdf(file_content: bytes) -> str:
    """Extract text from PDF file"""
    try:
        pdf_file = io.BytesIO(file_content)
        reader = PdfReader(pdf_file)
        text = ""
        for page in reader.pages:
            text += page.extract_text() + "\n"
        return text.strip()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error reading PDF: {str(e)}")


def extract_text_from_docx(file_content: bytes) -> str:
    """Extract text from DOCX file"""
    try:
        docx_file = io.BytesIO(file_content)
        doc = Document(docx_file)
        text = ""
        for paragraph in doc.paragraphs:
            text += paragraph.text + "\n"
        return text.strip()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error reading DOCX: {str(e)}")


def extract_text_from_txt(file_content: bytes) -> str:
    """Extract text from TXT file"""
    try:
        return file_content.decode('utf-8').strip()
    except UnicodeDecodeError:
        try:
            return file_content.decode('latin-1').strip()
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Error reading TXT: {str(e)}")


@app.post("/api/upload-document")
async def upload_document(
    file: UploadFile = File(...),
    use_memory: bool = True,
    provider: str = "groq"
):
    """Upload and process a document file (PDF, DOCX, TXT)"""
    try:
        # Read file content
        file_content = await file.read()

        # Extract text based on file type
        filename = file.filename.lower()

        if filename.endswith('.pdf'):
            text = extract_text_from_pdf(file_content)
        elif filename.endswith('.docx'):
            text = extract_text_from_docx(file_content)
        elif filename.endswith('.txt'):
            text = extract_text_from_txt(file_content)
        else:
            raise HTTPException(
                status_code=400,
                detail="Unsupported file type. Please upload PDF, DOCX, or TXT files."
            )

        if not text or len(text.strip()) < 10:
            raise HTTPException(
                status_code=400,
                detail="Could not extract enough text from the file. Please check the file content."
            )

        # Process through the pipeline (same as text input)
        summary = await doc_processor.summarize(text, provider)
        facts = await doc_processor.extract_facts(text, summary, provider)
        questions = await doc_processor.generate_questions(text, summary, facts, provider)

        # Store in memory if enabled
        if use_memory:
            memory_manager.store_document(
                text=text,
                summary=summary,
                facts=facts,
                questions=questions
            )

        return {
            "success": True,
            "filename": file.filename,
            "text": text[:500] + "..." if len(text) > 500 else text,  # Preview
            "full_text_length": len(text),
            "summary": summary,
            "facts": facts,
            "questions": questions
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/process-document")
async def process_document(request: ProcessRequest):
    """Process document through the 3-step pipeline"""
    try:
        # Step 1: Summarize
        summary = await doc_processor.summarize(request.text, request.provider)
        
        # Step 2: Extract Facts
        facts = await doc_processor.extract_facts(request.text, summary, request.provider)
        
        # Step 3: Generate Questions
        questions = await doc_processor.generate_questions(
            request.text, summary, facts, request.provider
        )
        
        # Store in memory if enabled
        if request.use_memory:
            memory_manager.store_document(
                text=request.text,
                summary=summary,
                facts=facts,
                questions=questions
            )
        
        return {
            "success": True,
            "summary": summary,
            "facts": facts,
            "questions": questions
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/query-memory")
async def query_memory(request: QueryRequest):
    """Query the memory system"""
    try:
        results = memory_manager.query(request.query, top_k=5)
        
        # Generate answer using retrieved context
        context = "\n\n".join([r["text"] for r in results])
        answer = await llm_handler.generate(
            prompt=f"""Based on the following context, answer the question.

Context:
{context}

Question: {request.query}

Answer:""",
            provider=request.provider
        )
        
        return {
            "success": True,
            "answer": answer,
            "sources": results
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/memory-stats")
async def get_memory_stats():
    """Get memory system statistics"""
    return memory_manager.get_stats()


@app.delete("/api/memory")
async def clear_memory():
    """Clear all memory"""
    memory_manager.clear()
    return {"success": True, "message": "Memory cleared"}


@app.get("/api/providers")
async def get_providers():
    """Get available LLM providers"""
    return llm_handler.get_available_providers()


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
