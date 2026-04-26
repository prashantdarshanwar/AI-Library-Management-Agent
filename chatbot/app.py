import streamlit as st
import requests
import os
import pandas as pd
import time
from groq import Groq

# -----------------------------
# 1. CONFIG
# -----------------------------
DEFAULT_URL = "https://ai-library-management-mysql.up.railway.app/api/books"

BACKEND_URL = (
    st.secrets.get("SPRING_BACKEND_URL", None)
    or os.getenv("SPRING_BACKEND_URL")
    or DEFAULT_URL
)

GROQ_API_KEY = (
    st.secrets.get("GROQ_API_KEY", None)
    or os.getenv("GROQ_API_KEY")
)

client = Groq(api_key=GROQ_API_KEY) if GROQ_API_KEY else None

PRIMARY_MODEL = "llama-3.3-70b-versatile"
FALLBACK_MODEL = "llama-3.1-8b-instant"

# -----------------------------
# 2. SESSION STATE (CHATGPT MEMORY)
# -----------------------------
if "messages" not in st.session_state:
    st.session_state.messages = [
        {"role": "assistant", "content": "📚 Hello! I am your Library AI Assistant. Ask me anything."}
    ]

if "last_valid_results" not in st.session_state:
    st.session_state.last_valid_results = None

if "search_results" not in st.session_state:
    st.session_state.search_results = None

if "groq_blocked_until" not in st.session_state:
    st.session_state.groq_blocked_until = 0

# -----------------------------
# 3. CHATGPT-STYLE INTENT ENGINE
# -----------------------------
def detect_intent(q):
    q = q.lower()

    if any(x in q for x in ["summary", "explain", "what is"]):
        return "explain"

    if any(x in q for x in ["where", "location", "rack"]):
        return "location"

    if any(x in q for x in ["available", "stock"]):
        return "availability"

    if any(x in q for x in ["book", "java", "ml", "python", "ai"]):
        return "search"

    return "general"


def extract_keywords(query):
    stop = {"show","me","book","books","find","search","give","on","about","the","a","an"}
    return [w for w in query.lower().split() if w not in stop]


def score(book, keywords):
    text = (book.get("title","") + " " + book.get("author","") + " " + book.get("category","")).lower()
    return sum(1 for k in keywords if k in text)


# -----------------------------
# 4. SMART BACKEND SEARCH (NO RANDOM RESULTS)
# -----------------------------
def fetch_from_backend(query):
    try:
        r = requests.get(BACKEND_URL, params={"message": query}, timeout=6)
        data = r.json()

        if isinstance(data, list):
            st.session_state.last_valid_results = data
            return data

        if isinstance(data, dict):
            result = data.get("data") or data.get("books")
            if result:
                st.session_state.last_valid_results = result
                return result

        return st.session_state.last_valid_results

    except:
        return st.session_state.last_valid_results


def smart_filter(data, query):
    keywords = extract_keywords(query)

    ranked = sorted(
        [b for b in data if score(b, keywords) > 0],
        key=lambda x: score(x, keywords),
        reverse=True
    )

    return ranked


# -----------------------------
# 5. OFFLINE BRAIN (CHATGPT STYLE)
# -----------------------------
def offline_ai(query):

    data = st.session_state.last_valid_results
    if not data:
        return "📚 I don't have cached data. Please search books first."

    intent = detect_intent(query)
    filtered = smart_filter(data, query)

    if not filtered:
        return "⚠️ No relevant results found."

    if intent == "location":
        return "\n".join([f"📍 {b['title']} → Rack {b['location']}" for b in filtered[:5]])

    if intent == "availability":
        return "\n".join([f"📦 {b['title']} → {'Available' if b['available'] else 'Not Available'}" for b in filtered[:5]])

    return "\n".join([f"📘 {b['title']} | {b['author']} | Rack {b['location']}" for b in filtered[:8]])


# -----------------------------
# 6. GROQ CHATGPT ROUTER
# -----------------------------
def call_groq(model, query, context=None):

    system = """
You are a smart AI Library Assistant like ChatGPT.
- Be concise
- Be accurate
- Use provided data if available
- Do NOT hallucinate books
"""

    full = query
    if context:
        full = f"{query}\n\nLIBRARY DATA:\n{context}"

    return client.chat.completions.create(
        model=model,
        messages=[
            {"role":"system","content":system},
            {"role":"user","content":full}
        ],
        temperature=0.4,
    ).choices[0].message.content


def chatgpt_engine(query, context=None):

    if time.time() < st.session_state.groq_blocked_until:
        return offline_ai(query)

    if not client:
        return offline_ai(query)

    intent = detect_intent(query)

    try:
        data = call_groq(PRIMARY_MODEL, query, context)

        # If search → attach structured results
        if intent == "search" and st.session_state.last_valid_results:
            return data

        return data

    except:
        try:
            return call_groq(FALLBACK_MODEL, query, context)
        except:
            return offline_ai(query)


# -----------------------------
# 7. UI
# -----------------------------
for msg in st.session_state.messages:
    with st.chat_message(msg["role"]):
        st.markdown(msg["content"])

user_input = st.chat_input("Ask me anything about books...")


# -----------------------------
# 8. MAIN CHATGPT FLOW
# -----------------------------
if user_input:

    st.session_state.messages.append({"role":"user","content":user_input})

    with st.chat_message("user"):
        st.markdown(user_input)

    with st.spinner("Thinking..."):

        intent = detect_intent(user_input)

        # SEARCH FLOW
        if intent == "search":

            data = fetch_from_backend(user_input)

            if data:
                st.session_state.search_results = data
                filtered = smart_filter(data, user_input)

                reply = chatgpt_engine(user_input, str(filtered))
            else:
                reply = offline_ai(user_input)

        # OTHER FLOWS
        else:
            reply = chatgpt_engine(user_input)

        st.session_state.messages.append({"role":"assistant","content":reply})

        with st.chat_message("assistant"):
            st.markdown(reply)


# -----------------------------
# 9. TABLE (OPTIONAL LIKE CHATGPT TOOL VIEW)
# -----------------------------
if st.session_state.search_results:
    st.dataframe(pd.DataFrame(st.session_state.search_results), use_container_width=True)
