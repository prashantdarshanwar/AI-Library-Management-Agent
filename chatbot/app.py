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

# Models (NEW 🔥)
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
    keywords = ["book", "author", "title", "find", "search", "available", "location", "where"]
    return any(k in query.lower() for k in keywords)


# -----------------------------
# 5. OFFLINE ENGINE (CACHE BRAIN)
# -----------------------------
def offline_ai_response(query):

    q = query.lower()
    data = st.session_state.get("last_valid_results", [])

    if not data:
        return "📚 No cached data available. Please search books first."

    if "all" in q or "show" in q:
        return "\n".join([
            f"📘 {b['title']} | {b['author']} | Rack {b['location']}"
            for b in data[:10]
        ])

    if "location" in q or "where" in q:
        for b in data:
            if any(word in b.get("title","").lower() for word in q.split()):
                return f"📍 {b['title']} → Rack {b['location']}"

        return "\n".join([
            f"📍 {b['title']} → Rack {b['location']}"
            for b in data[:8]
        ])

    if "available" in q:
        available = [b for b in data if b.get("available")]
        return "\n".join([
            f"📦 {b['title']} → Rack {b['location']}"
            for b in available[:10]
        ])

    return "⚠️ Offline Mode Active. Try 'show books' or 'location'"


# -----------------------------
# 6. GROQ MODEL ROUTER (NEW 🔥)
# -----------------------------
def call_groq(model, user_query, context_override=None):

    system_prompt = "You are a helpful Library AI Assistant."

    full_query = user_query
    if context_override:
        full_query = f"{user_query}\n\nDATA:\n{context_override}"

    return client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": full_query}
        ],
        temperature=0.4,
    ).choices[0].message.content


def get_groq_chat_response(user_query, context_override=None):

    # ⛔ cooldown after rate limit
    if time.time() < st.session_state.groq_blocked_until:
        try:
            return call_groq(FALLBACK_MODEL, user_query, context_override)
        except:
            return offline_ai_response(user_query)

    if not client:
        return offline_ai_response(user_query)

    # 1️⃣ PRIMARY MODEL
    try:
        return call_groq(PRIMARY_MODEL, user_query, context_override)

    except Exception as e:

        err = str(e).lower()

        # 🚨 RATE LIMIT HANDLING
        if "429" in err or "rate limit" in err or "tokens per day" in err:

            st.session_state.groq_blocked_until = time.time() + 3600

            try:
                return call_groq(FALLBACK_MODEL, user_query, context_override)
            except:
                return offline_ai_response(user_query)

        # 🚨 ANY ERROR → fallback model
        try:
            return call_groq(FALLBACK_MODEL, user_query, context_override)
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
            if result:
                st.session_state.last_valid_results = result
                return result

        return st.session_state.get("last_valid_results")

    except:
        return st.session_state.get("last_valid_results")


# -----------------------------
# 8. TABLE
# -----------------------------
def render_table(data):
    df = pd.DataFrame(data)
    st.dataframe(df, use_container_width=True)


# -----------------------------
# 9. CHAT UI
# -----------------------------
for msg in st.session_state.messages:
    with st.chat_message(msg["role"]):
        st.markdown(msg["content"])

user_input = st.chat_input("Ask about books...")


# -----------------------------
# 10. MAIN LOGIC
# -----------------------------
if user_input:

    st.session_state.messages.append({"role": "user", "content": user_input})

    with st.chat_message("user"):
        st.markdown(user_input)

    with st.spinner("Processing..."):

        # SUMMARY
        if "summary" in user_input.lower() and st.session_state.search_results:
            reply = get_groq_chat_response(user_input, str(st.session_state.search_results))
            st.session_state.show_table = False

        # BOOK SEARCH
        elif is_book_query(user_input):

            backend_data = fetch_from_backend(user_input)

            if backend_data:

                st.session_state.search_results = backend_data

                reply = get_groq_chat_response(user_input, str(backend_data))

                st.session_state.show_table = len(backend_data) > 1

            else:
                reply = offline_ai_response(user_input)
                st.session_state.show_table = False

        # GENERAL AI
        else:
            reply = get_groq_chat_response(user_input)
            st.session_state.show_table = False

        st.session_state.messages.append({"role": "assistant", "content": reply})

        with st.chat_message("assistant"):
            st.markdown(reply)


# -----------------------------
# 11. TABLE OUTPUT
# -----------------------------
if st.session_state.show_table and st.session_state.search_results:
    render_table(st.session_state.search_results)
