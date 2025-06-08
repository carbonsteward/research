import streamlit as st

# Set page config
st.set_page_config(
    page_title="JarvisGPT",
    page_icon="🤖",
    layout="wide",
    initial_sidebar_state="expanded",
)


def main():
    st.title("JarvisGPT")
    title = "### Local Self-Hosted MetaGPT + " "UI + " "Azure OpenAI System"
    st.markdown(title)
    st.sidebar.success("Select a page above.")

    st.write("Welcome to JarvisGPT! This is the main application interface.")
    st.write("To get started, use the sidebar to navigate to different sections.")

    st.info("🚀 Application is running in development mode.")


if __name__ == "__main__":
    main()
