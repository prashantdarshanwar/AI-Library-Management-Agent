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
# 2. SESSION STATE
# -----------------------------
if "search_results" not in st.session_state:
    st.session_state.search_results = None

if "last_valid_results" not in st.session_state:
    st.session_state.last_valid_results = None

if "groq_blocked_until" not in st.session_state:
    st.session_state.groq_blocked_until = 0

if "messages" not in st.session_state:
    st.session_state.messages = [
        {"role": "assistant", "content": "📚 Library AI Assistant Ready"}
    ]

if "show_table" not in st.session_state:
    st.session_state.show_table = False


# -----------------------------
# 3. UI (UNCHANGED)
# -----------------------------
PRIMARY_BG = "#0B132B"
SECONDARY_BG = "#1C2541"
ACCENT = "#5BC0BE"
TEXT = "#EAEAEA"
GOLD = "#C5A059"

st.set_page_config(page_title="AI Library Assistant", page_icon="🏛️", layout="wide")

st.markdown(f"""
<style>
.stApp {{
    background: linear-gradient(135deg, {PRIMARY_BG}, #000000);
    color: {TEXT};
    font-family: 'Segoe UI';
}}

.header-box {{
    background: linear-gradient(135deg, {SECONDARY_BG}, #16213E);
    padding: 2rem;
    border-radius: 16px;
    border: 1px solid {ACCENT};
    text-align: center;
    margin-bottom: 2rem;
}}

.header-title {{
    font-size: 2.5rem;
    font-weight: bold;
    color: {GOLD};
}}

[data-testid="stChatMessage"]:has(div[aria-label="assistant"]) {{
    background-color: {SECONDARY_BG};
    border-left: 4px solid {ACCENT};
}}

[data-testid="stChatMessage"]:has(div[aria-label="user"]) {{
    background-color: #111827;
    border-right: 4px solid {GOLD};
}}
</style>
""", unsafe_allow_html=True)

st.markdown("""
<div class="header-box">
<h1 class="header-title">🏛️ AI Library Assistant</h1>
<p>Smart Academic Book Intelligence System</p>
</div>
""", unsafe_allow_html=True)


# -----------------------------
# 4. HELPERS
# -----------------------------
def is_book_query(query):
    return True  # allow all queries to go through smart search


# -----------------------------
# 5. SMART OFFLINE ENGINE (FIXED)
# -----------------------------
def offline_ai_response(query):

    q = query.lower().strip()
    data = st.session_state.get("last_valid_results", [])

    if not data:
        return "📚 No cached data available. Please search books first."

    # -----------------------------
    # SMART RELEVANCE SCORING
    # -----------------------------
    def score(book):
        text = f"{book.get('title','')} {book.get('author','')} {book.get('category','')}".lower()
        score = 0

        for word in q.split():
            if word in book.get("title","").lower():
                score += 5
            elif word in book.get("category","").lower():
                score += 4
            elif word in book.get("author","").lower():
                score += 3
            elif word in text:
                score += 1

        return score

    ranked = sorted(data, key=score, reverse=True)
    filtered = [b for b in ranked if score(b) > 0]

    if not filtered:
        return "❌ No matching books found. Try different keywords."

    # -----------------------------
    # LOCATION QUERY
    # -----------------------------
    if "location" in q or "where" in q:
        return "\n".join([
            f"📍 {b['title']} → Rack {b['location']}"
            for b in filtered[:5]
        ])

    # -----------------------------
    # AVAILABLE
    # -----------------------------
    if "available" in q:
        available = [b for b in filtered if b.get("available")]
        return "\n".join([
            f"📦 {b['title']} → Rack {b['location']}"
            for b in available[:5]
        ]) or "No available books found"

    # -----------------------------
    # DEFAULT RESPONSE
    # -----------------------------
    return "\n\n".join([
        f"📘 {b['title']}\n"
        f"👨‍🏫 {b['author']}\n"
        f"📍 Rack {b['location']}\n"
        f"📦 {'Available' if b['available'] else 'Not Available'}"
        for b in filtered[:5]
    ])


# -----------------------------
# 6. GROQ AI (SAFE FALLBACK)
# -----------------------------
def call_groq(model, user_query, context=None):

    system_prompt = "You are a helpful Library AI Assistant."

    full_query = user_query
    if context:
        full_query = f"{user_query}\n\nDATA:\n{context}"

    return client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": full_query}
        ],
        temperature=0.4,
    ).choices[0].message.content


def get_groq_chat_response(user_query, context=None):

    if time.time() < st.session_state.groq_blocked_until:
        try:
            return call_groq(FALLBACK_MODEL, user_query, context)
        except:
            return offline_ai_response(user_query)

    if not client:
        return offline_ai_response(user_query)

    try:
        return call_groq(PRIMARY_MODEL, user_query, context)

    except Exception as e:

        err = str(e).lower()

        if "429" in err or "rate limit" in err or "tokens per day" in err:
            st.session_state.groq_blocked_until = time.time() + 3600
            try:
                return call_groq(FALLBACK_MODEL, user_query, context)
            except:
                return offline_ai_response(user_query)

        try:
            return call_groq(FALLBACK_MODEL, user_query, context)
        except:
            return offline_ai_response(user_query)


# -----------------------------
# 7. BACKEND
# -----------------------------
def fetch_from_backend(query):

    try:
        r = requests.get(BACKEND_URL, params={"message": query}, timeout=6)

        if r.status_code != 200:
            return st.session_state.get("last_valid_results")

        data = r.json()

        if isinstance(data, list):
            st.session_state.last_valid_results = data
            return data

        if isinstance(data, dict):
            result = data.get("data") or data.get("books")
            if isinstance(result, list):
                st.session_state.last_valid_results = result
                return result

        return st.session_state.get("last_valid_results")

    except:
        return st.session_state.get("last_valid_results")


# -----------------------------
# 8. TABLE
# -----------------------------
def render_table(data):
    st.dataframe(pd.DataFrame(data), use_container_width=True)


# -----------------------------
# 9. CHAT UI
# -----------------------------
for msg in st.session_state.messages:
    with st.chat_message(msg["role"]):
        st.markdown(msg["content"])

user_input = st.chat_input("Ask anything about books...")


# -----------------------------
# 10. MAIN LOGIC
# -----------------------------
if user_input:

    st.session_state.messages.append({"role": "user", "content": user_input})

    with st.chat_message("user"):
        st.markdown(user_input)

    with st.spinner("Processing..."):

        backend_data = fetch_from_backend(user_input)

        if backend_data:
            st.session_state.search_results = backend_data
            reply = get_groq_chat_response(user_input, str(backend_data))
            st.session_state.show_table = len(backend_data) > 1
        else:
            reply = offline_ai_response(user_input)
            st.session_state.show_table = False

        st.session_state.messages.append({"role": "assistant", "content": reply})

        with st.chat_message("assistant"):
            st.markdown(reply)


# -----------------------------
# 11. TABLE OUTPUT
# -----------------------------
if st.session_state.show_table and st.session_state.search_results:
    render_table(st.session_state.search_results)
