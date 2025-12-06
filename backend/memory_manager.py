import chromadb
from chromadb.config import Settings
from typing import List, Dict
import uuid
import json
from datetime import datetime


class MemoryManager:
    """Manages document memory using ChromaDB vector database"""
    
    def __init__(self, persist_directory: str = "./chroma_db"):
        """Initialize ChromaDB client"""
        self.client = chromadb.Client(Settings(
            persist_directory=persist_directory,
            anonymized_telemetry=False
        ))
        
        # Create or get collection
        self.collection = self.client.get_or_create_collection(
            name="document_memory",
            metadata={"description": "Stores processed documents with embeddings"}
        )
    
    def store_document(
        self,
        text: str,
        summary: str,
        facts: List[str],
        questions: List[dict]
    ) -> str:
        """Store a processed document in memory"""
        doc_id = str(uuid.uuid4())
        
        # Create metadata
        metadata = {
            "timestamp": datetime.now().isoformat(),
            "summary": summary,
            "facts": json.dumps(facts),
            "questions": json.dumps(questions),
            "doc_length": len(text)
        }
        
        # Store document with embedding
        self.collection.add(
            documents=[text],
            metadatas=[metadata],
            ids=[doc_id]
        )
        
        # Also store summary separately for better retrieval
        summary_id = f"{doc_id}_summary"
        self.collection.add(
            documents=[summary],
            metadatas={
                **metadata,
                "type": "summary",
                "parent_id": doc_id
            },
            ids=[summary_id]
        )
        
        return doc_id
    
    def query(self, query_text: str, top_k: int = 5) -> List[Dict]:
        """Query the memory for relevant documents"""
        results = self.collection.query(
            query_texts=[query_text],
            n_results=top_k
        )
        
        # Format results
        formatted_results = []
        if results['documents'] and len(results['documents']) > 0:
            for i, doc in enumerate(results['documents'][0]):
                metadata = results['metadatas'][0][i]
                distance = results['distances'][0][i] if results['distances'] else None
                
                formatted_results.append({
                    "text": doc,
                    "summary": metadata.get("summary", ""),
                    "facts": json.loads(metadata.get("facts", "[]")),
                    "questions": json.loads(metadata.get("questions", "[]")),
                    "timestamp": metadata.get("timestamp", ""),
                    "relevance_score": 1 - distance if distance else None
                })
        
        return formatted_results
    
    def get_stats(self) -> Dict:
        """Get memory statistics"""
        count = self.collection.count()
        
        # Get some sample documents
        samples = []
        if count > 0:
            results = self.collection.get(limit=5)
            if results['documents']:
                for i, doc in enumerate(results['documents']):
                    metadata = results['metadatas'][i]
                    samples.append({
                        "preview": doc[:200] + "..." if len(doc) > 200 else doc,
                        "timestamp": metadata.get("timestamp", ""),
                        "summary": metadata.get("summary", "")[:100] + "..."
                    })
        
        return {
            "total_documents": count,
            "collection_name": self.collection.name,
            "samples": samples
        }
    
    def clear(self):
        """Clear all memory"""
        # Delete and recreate collection
        self.client.delete_collection(name="document_memory")
        self.collection = self.client.get_or_create_collection(
            name="document_memory",
            metadata={"description": "Stores processed documents with embeddings"}
        )
    
    def delete_document(self, doc_id: str):
        """Delete a specific document"""
        try:
            self.collection.delete(ids=[doc_id, f"{doc_id}_summary"])
            return True
        except Exception as e:
            print(f"Error deleting document: {e}")
            return False
