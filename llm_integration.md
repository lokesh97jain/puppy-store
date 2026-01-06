# LLM / Tool Integration

## 1. Feature Choice: "Ask the Puppy Expert" 💬

Users could ask questions like:
- "Is this puppy good for apartment living?"
- "How much exercise does this breed need?"
- "What should I feed a 6-month-old puppy?"

The app would surfaces an AI response that is:
- **Helpful and concise**
- **Grounded in trusted guidance**
- **Safe** (avoids medical/legal claims)

---

## 2. Architecture Overview: Backend-Only LLM Calls 🏗️

**CRITICAL PRINCIPLE:** The mobile app would **never** call the LLM provider directly.

```
┌─────────────┐
│ Mobile App  │
└──────┬──────┘
       │
       │ POST /v1/puppy-expert
       │ { puppyId, question }
       ↓
┌──────────────────┐
│  Backend API     │ ← Handles all LLM logic
│                  │
│  • Validates     │   • Prompt construction
│  • Rate limits   │   • Safety enforcement
│  • Calls LLM     │   • Cost control
│  • Logs metrics  │   • API key protection
└──────┬───────────┘
       │
       ↓
┌──────────────────┐
│   LLM Provider   │
│ (Claude/GPT-4)   │
└──────────────────┘
```

**Why backend-only?**
- ✅ Protects API keys from mobile app decompilation
- ✅ Centralized safety rules (can't be bypassed by user)
- ✅ Rate limiting and cost control per user
- ✅ Consistent logging and observability

---

## 3. Model Selection

A capable instruction-following model (e.g., **Claude Sonnet, GPT, or similar**) would be appropriate.

**Selection criteria:**
- Strong instruction following → Reliably refuses unsafe medical questions
- Low hallucination rate → More accurate for factual content
- JSON output support → Structured responses easy to parse
- Reasonable cost and latency at deployment time

Model choice would be evaluated based on safety behavior, latency, and cost during implementation.

---

## 4. API Design

### Endpoint
```
POST /v1/puppy-expert
```

### Request Format
```json
{
  "puppyId": "p_123",
  "question": "How much exercise does this puppy need?"
}
```

### Response Format
```json
{
  "answer": "Milo needs regular daily exercise...",
  "disclaimer": "AI-generated advice. Consult experts for professional guidance.",
  "requestId": "req_abc123"
}
```

### Error Response
```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Try again in 1 hour"
  }
}
```

---

## 5. Context Strategy

### Simple Version (Initial Implementation)
```
Prompt = System Instructions 
       + Puppy Profile (age, breed, description)
       + User Question
       + Small static reference guide (embedded in backend)
```

This is sufficient for early usage and easy to implement.

---

### Scalable Version: Retrieval Layer (Future Enhancement)

When the app grows, a **small retrieval layer** can ground answers in trusted documents:
- Maintain a curated knowledge base of vetted puppy care content
- Retrieve relevant snippets based on the user's question
- Inject those snippets into the prompt as context

**Benefits:**
- Reduces hallucinations (answers based on real documents)
- Makes answers auditable (know which source was used)
- Easier to update guidance without changing prompts

**Implementation:** Could use vector search (e.g., embeddings + similarity search) or simpler keyword-based retrieval depending on scale needs.

---

## 6. Safety, Validation, and Guardrails 🛡️

### Input Validation (Before LLM Call)
- **Length limits:** Maximum 500 characters per question
- **Prompt injection defense:** Reject obvious injection attempts ("ignore previous instructions")
- **Rate limiting:** 5 questions/hour for anonymous users, higher for authenticated users
- **PII detection:** Flag questions containing emails or phone numbers

### Medical Advice Refusal Policy
- **Medical keywords trigger refusal:** vomit, blood, sick, medication, injury, symptoms
- **Refusal response:** "I can't provide medical advice. Please consult a licensed veterinarian for health concerns."
- **Defense in depth:** Check both before LLM call (keyword filter) and after (response analysis)

### Output Safety
- **Maximum response length:** 150 words (prevents rambling)
- **Disclaimers:** All responses include "AI-generated advice" disclaimer
- **Health topics:** Extra disclaimer redirecting to veterinarian
- **Backend enforcement:** Safety rules applied on backend (can't be bypassed)

### Policy Examples
| Question Type | Allowed? | Response |
|--------------|----------|----------|
| Feeding guidance | ✅ Yes | Provide advice |
| Exercise needs | ✅ Yes | Provide advice |
| Medical symptoms | ❌ No | Redirect to vet |
| Medication advice | ❌ No | Redirect to vet |

---

## 7. Prompt Structure

### System Instructions (Conceptual)
```
You are a helpful puppy care assistant.

CAPABILITIES:
- Provide advice on feeding, training, exercise, basic care
- Answer questions about breed characteristics
- Offer age-appropriate guidance

STRICT RULES:
- NEVER diagnose medical conditions
- NEVER recommend medications
- If health question → refuse and redirect to vet
- Keep responses under 150 words
- Be friendly and concise
```

### User Message (Pseudocode)
```
Build prompt:
    System instructions
    +
    Puppy profile:
        - Name: {name}
        - Age: {age} months
        - Breed/description: {description}
    +
    [Optional retrieved context if using retrieval]
    +
    User question: {question}
```

---

## 8. LLM Call Flow (Pseudocode)

```
FUNCTION handle_puppy_expert(puppyId, question):
    
    1. VALIDATE input
       Check length, prompt injection patterns
       IF invalid → return error
    
    2. CHECK rate limit
       IF exceeded → return "Try again later"
    
    3. CHECK cache (optional optimization)
       IF question previously asked → return cached response
    
    4. LOAD puppy data
       puppy = database.get_puppy(puppyId)
    
    5. [OPTIONAL] RETRIEVE context
       IF using retrieval layer:
           docs = search_knowledge_base(question)
    
    6. BUILD prompt
       prompt = system_instructions + puppy + [docs] + question
    
    7. CALL LLM
       response = llm_api.call(prompt)
       WITH retry logic for transient failures
    
    8. SAFETY CHECK response
       IF contains medical advice:
           replace with "consult a vet"
       Add disclaimer
    
    9. CACHE result (for future identical questions)
    
    10. LOG metrics (tokens, latency, cost)
    
    11. RETURN to mobile app
```

---

## 9. Error Handling

### Retry Strategy (Pseudocode)
```
TRY calling LLM (with timeout):
    IF timeout or server error:
        Retry with backoff (1s, 2s)
        Maximum 2 retries
    
    IF rate limit from provider:
        Return "Service busy, try again"
    
    IF all retries fail:
        Return fallback message
        "I'm having trouble right now. Try again shortly."
```

### Graceful Degradation
If LLM is unavailable:
1. Return cached response if question matches previous
2. Show generic puppy care tips from static content
3. Offer "Contact us" option as fallback

---

## 10. Observability

### What to Monitor
- **Latency:** Track response times (aim for <2 seconds)
- **Error rate:** Failed requests and reasons
- **Refusal rate:** % of medical questions properly refused (health check for safety)
- **Cost:** Token usage and spend over time
- **User feedback:** Track thumbs up/down if implemented

### What to Log
```
For each request:
✓ Request ID (for debugging)
✓ Timestamp
✓ User ID (hashed)
✓ Puppy ID
✓ Question length (not content - privacy)
✓ Tokens used
✓ Latency
✓ Cached or not
✓ Flagged or not

✗ NEVER log full user questions or responses (privacy)
```

This gives visibility into system health without compromising user privacy.

---

## 11. Cost Considerations

At low usage, LLM costs are minimal (few dollars per month).

As usage grows, cost control becomes important:
- **Caching common questions** reduces redundant API calls significantly
- **Rate limiting** prevents abuse and runaway costs
- **Model selection** allows trading off between capability and cost
- **Prompt optimization** keeps token counts reasonable

The backend's central position makes it easy to add cost controls when needed.

---

## 12. High-Level Flow Diagram

### Complete Request Flow
```
┌─────────────┐
│ React App   │  asks: "How much exercise?"
└──────┬──────┘
       │ POST /v1/puppy-expert
       ↓
┌────────────────────────────────┐
│       Backend API              │
│                                │
│  1. Validate input             │
│     ├─ Length check            │
│     ├─ Prompt injection check  │
│     └─ Rate limit check        │
│                                │
│  2. Load puppy data            │
│     └─ From database           │
│                                │
│  3. [Optional] Retrieve docs   │
│     └─ If using retrieval      │
│                                │
│  4. Build prompt               │
│     └─ System + profile + Q    │
│                                │
│  5. Call LLM                   │
│     └─ With retry logic        │
│                                │
│  6. Safety check response      │
│     ├─ Medical keywords?       │
│     └─ Add disclaimer          │
│                                │
│  7. Cache & log                │
└────────┬───────────────────────┘
         │
         ↓
┌─────────────┐
│ Mobile App  │ Displays helpful answer
└─────────────┘
```

---

## 13. Testing Considerations

### Key Test Scenarios
**Safety tests (most critical):**
- Medical questions properly refused
- Prompt injection attempts blocked
- Appropriate disclaimers added

**Functional tests:**
- Valid questions get helpful responses
- Rate limiting enforces limits
- Caching works for repeated questions

**Performance:**
- Response times within acceptable range
- System handles expected load

Testing approach would balance coverage with implementation effort.

---