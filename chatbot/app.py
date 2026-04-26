import streamlit as st
import requests
import os
import pandas as pd
import time
from groq import Groq

# --- 1. SAFE CONFIGURATION ---
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


# --- 2. FALLBACK STATE ---
if "search_results" not in st.session_state:
    st.session_state.search_results = None

if "last_valid_results" not in st.session_state:
    st.session_state.last_valid_results = None

if "groq_blocked_until" not in st.session_state:
    st.session_state.groq_blocked_until = 0

if "messages" not in st.session_state:
    st.session_state.messages = [{
        "role": "assistant",
        "content": "📚 Hello! I am your Library AI Assistant."
    }]

if "show_table" not in st.session_state:
    st.session_state.show_table = False


# --- 3. UI ---
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
<p>Smart Academic & Book Discovery System</p>
</div>
""", unsafe_allow_html=True)


# --- 4. HELPERS ---
def is_book_query(query):
    keywords = ["book", "author", "title", "find", "search", "available", "location", "where"]
    return any(k in query.lower() for k in keywords)


# --- 5. OFFLINE FALLBACK ENGINE ---
def offline_ai_response(query, context=None):

    q = query.lower()

    if any(x in q for x in ["java", "python", "ai", "ml", "book"]):
        return (
            "📚 Library Offline Mode\n\n"
            "I cannot access AI right now, but you can still:\n"
            "- Search books\n"
            "- Check categories\n"
            "- View available records"
        )

    if "location" in q:
        return "📍 Books are stored in categorized racks (A1–E9)."

    if "available" in q:
        return "📦 Some books are available in the system, but live AI is offline."

    return "⚠️ AI is temporarily unavailable. Please try again later."


# --- 6. GROQ LLM (WITH 429 HANDLING) ---
def get_groq_chat_response(user_query, context_override=None):

    # ⛔ HARD BLOCK IF QUOTA EXCEEDED
    if time.time() < st.session_state.groq_blocked_until:
        return offline_ai_response(user_query, context_override)

    if not client:
        return offline_ai_response(user_query, context_override)

    system_prompt = (
        "You are a Senior University Librarian. Answer clearly and helpfully."
    )

    full_query = user_query
    if context_override:
        full_query = f"User Query: {user_query}\n\nData:\n{context_override}"

    try:
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": full_query}
            ],
            temperature=0.4,
        )

        return response.choices[0].message.content

    except Exception as e:

        err = str(e).lower()

        # 🚨 HANDLE RATE LIMIT (429)
        if "429" in err or "tokens per day" in err or "rate limit" in err:

            st.session_state.groq_blocked_until = time.time() + 3600

            return offline_ai_response(user_query, context_override)

        return offline_ai_response(user_query, context_override)


# --- 7. BACKEND (CACHE SAFE) ---
def fetch_from_backend(query):

    try:
        response = requests.get(
            BACKEND_URL,
            params={"message": query},
            timeout=6
        )

        if response.status_code != 200:
            return None

        data = response.json()

        if isinstance(data, list) and len(data) > 0:
            st.session_state.last_valid_results = data
            return data

        if isinstance(data, dict):
            result = data.get("data") or data.get("books")
            if result:
                st.session_state.last_valid_results = result
                return result

        return None

    except:
        return st.session_state.last_valid_results


# --- 8. TABLE UI ---
def render_table(data):
    df = pd.DataFrame(data)
    st.markdown("### 📚 Search Results")
    st.dataframe(df, use_container_width=True)

    csv = df.to_csv(index=False).encode("utf-8")
    st.download_button("📥 Download CSV", csv, "books.csv")


# --- 9. CHAT UI ---
for msg in st.session_state.messages:
    with st.chat_message(msg["role"]):
        st.markdown(msg["content"])

user_input = st.chat_input("Search books or ask anything...")


# --- 10. MAIN LOGIC ---
if user_input:

    st.session_state.messages.append({"role": "user", "content": user_input})

    with st.chat_message("user"):
        st.markdown(user_input)

    with st.spinner("Processing..."):

        # CASE 1: SUMMARY
        if "summary" in user_input.lower() and st.session_state.search_results:
            reply = get_groq_chat_response(
                user_input,
                context_override=str(st.session_state.search_results)
            )
            st.session_state.show_table = False

        # CASE 2: BOOK SEARCH
        elif is_book_query(user_input):

            backend_data = fetch_from_backend(user_input)

            if backend_data and len(backend_data) > 0:

                st.session_state.search_results = backend_data

                reply = get_groq_chat_response(
                    user_input,
                    context_override=str(backend_data)
                )

                st.session_state.show_table = len(backend_data) > 1

            else:
                reply = offline_ai_response(user_input)
                st.session_state.show_table = False

        # CASE 3: GENERAL AI
        else:
            reply = get_groq_chat_response(user_input)
            st.session_state.show_table = False

        st.session_state.messages.append({"role": "assistant", "content": reply})

        with st.chat_message("assistant"):
            st.markdown(reply)


# --- 11. TABLE DISPLAY ---
if st.session_state.show_table and st.session_state.search_results:
    render_table(st.session_state.search_results)
