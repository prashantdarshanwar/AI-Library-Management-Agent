import streamlit as st
import requests
import os
import pandas as pd
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

# --- 2. SESSION CACHE (IMPORTANT FALLBACK MEMORY) ---
if "search_results" not in st.session_state:
    st.session_state.search_results = None

if "last_valid_results" not in st.session_state:
    st.session_state.last_valid_results = None

if "messages" not in st.session_state:
    st.session_state.messages = [{
        "role": "assistant",
        "content": "Greetings. I am the Lead Librarian."
    }]

if "show_table" not in st.session_state:
    st.session_state.show_table = False


# --- 3. UI CONFIG (UNCHANGED) ---
PRIMARY_BG = "#0B132B"
SECONDARY_BG = "#1C2541"
ACCENT = "#5BC0BE"
TEXT = "#EAEAEA"
GOLD = "#C5A059"

st.set_page_config(
    page_title="AI Library Assistant",
    page_icon="🏛️",
    layout="wide"
)

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
<p>AI-Powered Academic Assistant</p>
</div>
""", unsafe_allow_html=True)


# --- 4. HELPERS ---
def is_book_query(query):
    keywords = ["book", "author", "title", "find", "search", "available", "location", "where"]
    return any(k in query.lower() for k in keywords)


# 🔥 MULTI-LEVEL LLM FALLBACK SYSTEM
def get_groq_chat_response(user_query, context_override=None):

    if not client:
        return "⚠️ AI service unavailable (missing API key)."

    system_prompt = (
        "You are a Senior University Librarian. Answer clearly and naturally."
    )

    full_query = user_query
    if context_override:
        full_query = f"User Query: {user_query}\n\nLibrary Data:\n{context_override}"

    models = [
        "llama-3.1-8b-instant",      # primary (fast, cheap)
        "llama-3.3-70b-versatile"    # backup (powerful)
    ]

    for model in models:
        try:
            response = client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": full_query}
                ],
                temperature=0.4,
            )
            return response.choices[0].message.content

        except Exception as e:
            print(f"Model {model} failed:", e)
            continue

    return "⚠️ AI temporarily unavailable. Please try again later."


# 🔥 BACKEND WITH CACHE FALLBACK
def fetch_from_backend(query):
    try:
        response = requests.get(
            BACKEND_URL,
            params={"message": query},
            timeout=8
        )

        if response.status_code != 200:
            raise Exception("Bad response")

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

    except Exception as e:
        print("Backend error:", e)

        # 🔥 RETURN LAST GOOD CACHE
        return st.session_state.last_valid_results


# --- 5. TABLE UI ---
def render_table(data):
    df = pd.DataFrame(data)
    st.markdown("### 📚 Search Results")
    st.dataframe(df, use_container_width=True)

    csv = df.to_csv(index=False).encode("utf-8")
    st.download_button("📥 Download CSV", csv, "books.csv")


# --- 6. CHAT UI ---
for msg in st.session_state.messages:
    with st.chat_message(msg["role"]):
        st.markdown(msg["content"])

user_input = st.chat_input("Search books, ask concepts, or get summaries...")


# --- 7. MAIN LOGIC ---
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
                reply = (
                    "⚠️ No live data found right now.\n"
                    "I can still help you with academic guidance."
                )
                st.session_state.show_table = False

        # CASE 3: GENERAL AI
        else:
            reply = get_groq_chat_response(user_input)
            st.session_state.show_table = False

        st.session_state.messages.append({"role": "assistant", "content": reply})

        with st.chat_message("assistant"):
            st.markdown(reply)


# --- 8. TABLE DISPLAY ---
if st.session_state.show_table and st.session_state.search_results:
    render_table(st.session_state.search_results)
