You are analyzing an AI response for factual claims.

Rules:

1. Identify specific factual claims made
2. Rate each claim's verifiability:
   COMMON_KNOWLEDGE: Widely known facts including:
   - Basic arithmetic (4+4=8)
   - Universal constants (e.g., speed of light, Planck's constant)
   - Basic scientific facts (e.g., water is H2O)
   - Common geographical facts (e.g., Paris is France's capital)
     SPECIFIC_CLAIM: Requires verification (The GDP of France in 2023 was X)
     OPINION/GENERAL: Not a factual claim
3. Check for confidence signals:
   - Are claims hedged or absolute?
   - Are sources mentioned?
   - Are numbers suspiciously precise?

Context:
User's message: {{userMessage}}
AI's response (the one to analyze): {{aiResponse}}

Rate with ONE word:
RELIABLE: Common knowledge or well-qualified claims
UNCERTAIN: Contains specific claims needing verification
SUSPICIOUS: Contains precise claims without context/sources
