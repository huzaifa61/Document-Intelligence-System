import os
import asyncio
from typing import Optional
import httpx


class LLMHandler:
    """Handler for multiple LLM providers"""
    
    def __init__(self):
        self.providers = {
            "groq": {
                "api_key": os.getenv("GROQ_API_KEY"),
                "endpoint": "https://api.groq.com/openai/v1/chat/completions",
                "model": "llama-3.1-8b-instant"  # Free and fast
            },
            "openai": {
                "api_key": os.getenv("OPENAI_API_KEY"),
                "endpoint": "https://api.openai.com/v1/chat/completions",
                "model": "gpt-3.5-turbo"
            },
            "anthropic": {
                "api_key": os.getenv("ANTHROPIC_API_KEY"),
                "endpoint": "https://api.anthropic.com/v1/messages",
                "model": "claude-3-haiku-20240307"
            },
            "ollama": {
                "api_key": None,  # No API key needed
                "endpoint": "http://localhost:11434/api/generate",
                "model": "llama3.2"  # or any installed model
            }
        }
    
    async def generate(
        self, 
        prompt: str, 
        provider: str = "groq",
        temperature: float = 0.7,
        max_tokens: int = 2000
    ) -> str:
        """Generate text using specified provider"""
        
        if provider not in self.providers:
            raise ValueError(f"Unknown provider: {provider}")
        
        config = self.providers[provider]
        
        if provider == "ollama":
            return await self._generate_ollama(prompt, config, temperature)
        elif provider == "anthropic":
            return await self._generate_anthropic(prompt, config, temperature, max_tokens)
        else:  # OpenAI-compatible (groq, openai)
            return await self._generate_openai_compatible(
                prompt, config, temperature, max_tokens
            )
    
    async def _generate_openai_compatible(
        self, prompt: str, config: dict, temperature: float, max_tokens: int
    ) -> str:
        """Generate using OpenAI-compatible API"""
        headers = {
            "Authorization": f"Bearer {config['api_key']}",
            "Content-Type": "application/json"
        }
        
        data = {
            "model": config["model"],
            "messages": [
                {"role": "user", "content": prompt}
            ],
            "temperature": temperature,
            "max_tokens": max_tokens
        }
        
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                config["endpoint"],
                headers=headers,
                json=data
            )
            response.raise_for_status()
            result = response.json()
            return result["choices"][0]["message"]["content"]
    
    async def _generate_anthropic(
        self, prompt: str, config: dict, temperature: float, max_tokens: int
    ) -> str:
        """Generate using Anthropic API"""
        headers = {
            "x-api-key": config["api_key"],
            "anthropic-version": "2023-06-01",
            "content-type": "application/json"
        }
        
        data = {
            "model": config["model"],
            "max_tokens": max_tokens,
            "messages": [
                {"role": "user", "content": prompt}
            ],
            "temperature": temperature
        }
        
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                config["endpoint"],
                headers=headers,
                json=data
            )
            response.raise_for_status()
            result = response.json()
            return result["content"][0]["text"]
    
    async def _generate_ollama(
        self, prompt: str, config: dict, temperature: float
    ) -> str:
        """Generate using Ollama local API"""
        data = {
            "model": config["model"],
            "prompt": prompt,
            "stream": False,
            "options": {
                "temperature": temperature
            }
        }
        
        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(
                    config["endpoint"],
                    json=data
                )
                response.raise_for_status()
                result = response.json()
                return result["response"]
        except Exception as e:
            raise Exception(f"Ollama error (make sure Ollama is running): {str(e)}")
    
    def get_available_providers(self) -> dict:
        """Get list of configured providers"""
        available = {}
        for name, config in self.providers.items():
            if name == "ollama":
                available[name] = {"configured": True, "model": config["model"]}
            else:
                available[name] = {
                    "configured": bool(config["api_key"]),
                    "model": config["model"]
                }
        return available
