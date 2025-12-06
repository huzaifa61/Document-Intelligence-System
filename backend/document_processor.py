from typing import List
from llm_handler import LLMHandler


class DocumentProcessor:
    """Processes documents through the 3-step pipeline"""
    
    def __init__(self, llm_handler: LLMHandler):
        self.llm = llm_handler
    
    async def summarize(self, text: str, provider: str = "groq") -> str:
        """Step 1: Summarize the document"""
        prompt = f"""Summarize the following document concisely. 
Focus on the main ideas, key points, and important details.
Keep the summary clear and informative.

Document:
{text}

Summary:"""
        
        return await self.llm.generate(prompt, provider=provider, temperature=0.3)
    
    async def extract_facts(
        self, text: str, summary: str, provider: str = "groq"
    ) -> List[str]:
        """Step 2: Extract key facts from the document"""
        prompt = f"""Based on the document and its summary, extract the most important facts.
List each fact as a separate bullet point. Be specific and factual.

Document:
{text}

Summary:
{summary}

Extract 5-10 key facts in bullet point format:"""
        
        response = await self.llm.generate(prompt, provider=provider, temperature=0.3)
        
        # Parse bullet points
        facts = []
        for line in response.split('\n'):
            line = line.strip()
            if line and (line.startswith('-') or line.startswith('•') or line.startswith('*')):
                fact = line.lstrip('-•* ').strip()
                if fact:
                    facts.append(fact)
            elif line and not any(line.startswith(x) for x in ['Extract', 'Facts', 'Key']):
                # Handle numbered lists
                import re
                match = re.match(r'^\d+[\.)]\s*(.+)$', line)
                if match:
                    facts.append(match.group(1).strip())
        
        return facts if facts else [response]  # Fallback to full response
    
    async def generate_questions(
        self, text: str, summary: str, facts: List[str], provider: str = "groq"
    ) -> List[dict]:
        """Step 3: Generate questions based on the document"""
        facts_text = '\n'.join([f"- {fact}" for fact in facts])
        
        prompt = f"""Based on the document, summary, and extracted facts, generate 5-7 insightful questions 
that test understanding of the content. Include both factual and analytical questions.

Document Summary:
{summary}

Key Facts:
{facts_text}

Generate questions in the following format:
Q: [Question]
Type: [factual/analytical/inference]

Questions:"""
        
        response = await self.llm.generate(prompt, provider=provider, temperature=0.5)
        
        # Parse questions
        questions = []
        current_q = None
        current_type = None
        
        for line in response.split('\n'):
            line = line.strip()
            if line.startswith('Q:') or line.startswith('Question:'):
                if current_q:
                    questions.append({
                        "question": current_q,
                        "type": current_type or "general"
                    })
                current_q = line.split(':', 1)[1].strip()
                current_type = None
            elif line.startswith('Type:'):
                current_type = line.split(':', 1)[1].strip().lower()
            elif line and current_q is None and '?' in line:
                # Handle questions without Q: prefix
                current_q = line
        
        # Add the last question
        if current_q:
            questions.append({
                "question": current_q,
                "type": current_type or "general"
            })
        
        return questions if questions else [{"question": response, "type": "general"}]
