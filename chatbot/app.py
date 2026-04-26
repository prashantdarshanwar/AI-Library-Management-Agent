import streamlit as st
import requests
import os
import pandas as pd
from groq import Groq

# --- 1. SAFE CONFIGURATION ---
DEFAULT_URL = "https://ai-library-management-mysql.up.railway.app/api/books"

try:
    GROQ_API_KEY = st.secrets["GROQ_API_KEY"]
    BACKEND_URL = st.secrets.get("SPRING_BACKEND_URL", DEFAULT_URL)
except Exception:
    GROQ_API_KEY = os.getenv("GROQ_API_KEY")
    BACKEND_URL = os.getenv("SPRING_BACKEND_URL", DEFAULT_URL)

client = Groq(api_key=GROQ_API_KEY) if GROQ_API_KEY else None

# --- 2. UI CONFIG ---
PRIMARY_BG = "#0B132B"
SECONDARY_BG = "#1C2541"
ACCENT = "#5BC0BE"
TEXT = "#EAEAEA"
GOLD = "#C5A059"

st.set_page_config(
    page_title="AI Library Assitant",
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
<h1 class="header-title">🏛️ AI Library Assitant</h1>
<p>AI-Powered Academic Assistant</p>
</div>
""", unsafe_allow_html=True)

# --- 3. SESSION STATE ---
if "messages" not in st.session_state:
    st.session_state.messages = [{
        "role": "assistant",
        "content": "Greetings. I am the Lead Librarian. How can I assist your research today?"
    }]

if "search_results" not in st.session_state:
    st.session_state.search_results = None

if "show_table" not in st.session_state:
    st.session_state.show_table = False

# --- 4. HELPERS ---

def is_book_query(query):
    keywords = ["book", "author", "title", "find", "search", "available", "location", "where"]
    return any(k in query.lower() for k in keywords)


def get_groq_chat_response(user_query, context_override=None):
    if not client:
        return "AI service unavailable."

    try:
        chat_history = st.session_state.messages[-10:]

        system_prompt = (
            "You are a Senior University Librarian with access to real-time database records.\n\n"
            "Rules:\n"
            "- If book data is provided, analyze it and answer naturally\n"
            "- If asked availability → say available or not\n"
            "- If asked location → give exact location\n"
            "- If multiple books → summarize\n"
            "- Speak like you checked the system\n"
        )

        full_query = user_query
        if context_override:
            full_query = f"""
User Question: {user_query}

Library Records:
{context_override}
"""

        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": system_prompt},
                *chat_history,
                {"role": "user", "content": full_query}
            ],
            temperature=0.4,
        )

        return completion.choices[0].message.content

    except Exception as e:
        return f"Error: {str(e)}"


# 🚀 FIXED BACKEND (ROBUST PARSER)
def fetch_from_backend(query):
    try:
        url = f"{BACKEND_URL}/chat"

        response = requests.get(
            url,
            params={"message": query},
            timeout=10
        )

        if response.status_code != 200:
            return None

        # SAFE JSON PARSE
        try:
            data = response.json()
        except:
            return None

        # CASE 1: direct list
        if isinstance(data, list):
            return data

        # CASE 2: wrapped responses
        if isinstance(data, dict):
            if "data" in data:
                return data["data"]
            if "books" in data:
                return data["books"]

        return None

    except Exception as e:
        print("Backend error:", e)
        return None


def render_table(data):
    df = pd.DataFrame(data)
    st.markdown("### 📚 Search Results")
    st.dataframe(df, use_container_width=True)

    csv = df.to_csv(index=False).encode('utf-8')
    st.download_button("📥 Download CSV", csv, "books.csv")


# --- 5. CHAT UI ---
for msg in st.session_state.messages:
    with st.chat_message(msg["role"]):
        st.markdown(msg["content"])

user_input = st.chat_input("Search books, ask concepts, or get summaries...")

# --- 6. MAIN LOGIC ---
if user_input:
    st.session_state.messages.append({"role": "user", "content": user_input})

    with st.chat_message("user"):
        st.markdown(user_input)

    with st.spinner("Processing..."):

        # CASE 1: SUMMARY
        if "summary" in user_input.lower() and st.session_state.search_results:
            context = str(st.session_state.search_results)
            reply = get_groq_chat_response(user_input, context)
            st.session_state.show_table = False

        # CASE 2: BOOK SEARCH
        elif is_book_query(user_input):

            backend_data = fetch_from_backend(user_input)

            # 🔥 FINAL SAFE CHECK
            if backend_data is not None and len(backend_data) > 0:

                st.session_state.search_results = backend_data

                reply = get_groq_chat_response(
                    user_input,
                    context_override=str(backend_data)
                )

                st.session_state.show_table = len(backend_data) > 1

            else:
                reply = "No books found."
                st.session_state.show_table = False

        # CASE 3: GENERAL AI
        else:
            reply = get_groq_chat_response(user_input)
            st.session_state.show_table = False

        st.session_state.messages.append({"role": "assistant", "content": reply})

        with st.chat_message("assistant"):
            st.markdown(reply)

# --- 7. TABLE ---
if st.session_state.show_table and st.session_state.search_results:
    render_table(st.session_state.search_results)
