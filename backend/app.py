import os
from dotenv import load_dotenv

# Load .env file FIRST before importing anything else
load_dotenv()

# Verify key is loaded
print(f"🔑 API Key loaded: {os.getenv('GROQ_API_KEY', 'NOT FOUND')[:20]}...")

import json
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import uvicorn

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
