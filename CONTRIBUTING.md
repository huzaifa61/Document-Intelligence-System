# Contributing to Document Intelligence System

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## 🤝 How to Contribute

### Reporting Bugs

If you find a bug, please create an issue with:
- Clear title and description
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable
- Environment details (OS, browser, Python/Node version)

### Suggesting Features

Feature requests are welcome! Please include:
- Clear description of the feature
- Use case and benefits
- Possible implementation approach
- Any relevant examples

### Code Contributions

1. **Fork the Repository**
   ```bash
   git clone https://github.com/huzaifa61/Document-Intelligence-System.git
   cd Document-Intelligence-System
   ```

2. **Create a Branch**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/bug-description
   ```

3. **Make Your Changes**
   - Follow the existing code style
   - Add comments for complex logic
   - Update documentation if needed
   - Write tests if applicable

4. **Test Your Changes**
   ```bash
   # Backend
   cd backend
   python -m pytest  # if tests exist
   
   # Frontend
   cd frontend
   npm test
   ```

5. **Commit Your Changes**
   ```bash
   git add .
   git commit -m "feat: add amazing feature"
   ```
   
   Use conventional commit messages:
   - `feat:` - New feature
   - `fix:` - Bug fix
   - `docs:` - Documentation changes
   - `style:` - Code style changes (formatting)
   - `refactor:` - Code refactoring
   - `test:` - Adding tests
   - `chore:` - Maintenance tasks

6. **Push and Create PR**
   ```bash
   git push origin feature/your-feature-name
   ```
   Then create a Pull Request on GitHub.

## 📋 Development Setup

### Backend Development
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python app.py
```

### Frontend Development
```bash
cd frontend
npm install
npm start
```

## 🎨 Code Style Guidelines

### Python (Backend)
- Follow PEP 8
- Use type hints
- Write docstrings for functions
- Keep functions focused and small
- Use async/await for I/O operations

Example:
```python
async def process_document(text: str, provider: str = "groq") -> dict:
    """
    Process a document through the AI pipeline.
    
    Args:
        text: Document text to process
        provider: LLM provider to use
        
    Returns:
        dict: Processing results with summary, facts, questions
    """
    # Implementation
```

### JavaScript/React (Frontend)
- Use functional components with hooks
- Use meaningful variable names
- Keep components focused
- Add PropTypes or TypeScript types
- Use async/await for API calls

Example:
```javascript
const ProcessDocument = ({ text, provider }) => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Component logic
};
```

### CSS
- Use meaningful class names
- Group related styles
- Add comments for complex sections
- Maintain mobile responsiveness

## 🧪 Testing

### Backend Tests
```bash
cd backend
pytest tests/
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 📝 Documentation

- Update README.md if you add features
- Add inline comments for complex logic
- Update API documentation if endpoints change
- Include usage examples

## 🔍 Pull Request Guidelines

Your PR should:
- Have a clear title and description
- Reference any related issues
- Include screenshots for UI changes
- Pass all tests (once implemented)
- Not break existing functionality
- Follow the project's code style

### PR Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Code refactoring

## Testing
Describe how you tested your changes

## Screenshots (if applicable)
Add screenshots here

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings generated
```

## 🎯 Areas for Contribution

We especially welcome contributions in:

- **New Features**
  - Additional file format support (e.g., Excel, PowerPoint)
  - Batch document processing
  - Document comparison
  - Export functionality (PDF, Word)
  - Multi-language support

- **Improvements**
  - Better error handling
  - Performance optimization
  - UI/UX enhancements
  - Test coverage
  - Documentation

- **Bug Fixes**
  - Fixing reported issues
  - Edge case handling
  - Mobile responsiveness

- **Documentation**
  - Tutorial videos
  - Usage examples
  - API documentation
  - Translation to other languages

## ❓ Questions?

If you have questions:
1. Check existing issues and discussions
2. Review the README.md
3. Create a new issue with the "question" label
4. Contact the maintainer

## 🙏 Thank You!

Your contributions help make this project better for everyone. We appreciate your time and effort!

---

**Happy Contributing! 🚀**
