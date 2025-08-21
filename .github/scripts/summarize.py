# .github/scripts/summarize.py

import os
import json
import google.generativeai as genai
import requests

# --- Configuration ---
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
GITHUB_TOKEN = os.getenv('GITHUB_TOKEN')
REPO_NAME = os.getenv('REPO_NAME')
PR_NUMBER = os.getenv('PR_NUMBER')
SEMgrep_RESULTS_FILE = 'semgrep_results.json'

# --- 1. Configure the Gemini API ---
genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-1.5-flash')

# --- 2. Read Semgrep results ---
try:
    with open(SEMgrep_RESULTS_FILE, 'r') as f:
        scan_data = json.load(f)
    findings = scan_data.get('results', [])
except (FileNotFoundError, json.JSONDecodeError):
    findings = []

# --- 3. Prepare the Prompt and Call Gemini ---
def generate_summary(findings):
    if not findings:
        return "✅ **Semgrep Scan Complete**\n\nNo new findings were detected. Great job!"

    # Simplify findings to send only essential data to the LLM
    simplified_findings = [
        {
            "path": result["path"],
            "start_line": result["start"]["line"],
            "message": result["extra"]["message"],
            "severity": result["extra"]["severity"]
        }
        for result in findings
    ]
    
    prompt = f"""
    Act as an expert application security reviewer. You are analyzing the results of a Semgrep scan for a pull request.
    Your task is to provide a concise, high-level summary for the developer.

    **Instructions:**
    1.  Start with a clear, brief overview of the findings (e.g., "The scan found X issues, with Y being high severity.").
    2.  Group the findings by severity (ERROR, WARNING, INFO).
    3.  For each finding, mention the rule message and the file path/line number.
    4.  Use Markdown for formatting (bolding, bullet points).
    5.  Keep the tone constructive and helpful. Do not lecture.
    6.  If there are no findings, state that clearly.

    **Here are the Semgrep findings in JSON format:**
    {json.dumps(simplified_findings, indent=2)}

    Please generate the summary now.
    """
    
    try:
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        return f"Could not generate summary. Error: {e}"

# --- 4. Post the Summary to the PR ---
def post_github_comment(summary):
    api_url = f"https://api.github.com/repos/{REPO_NAME}/issues/{PR_NUMBER}/comments"
    headers = {
        "Authorization": f"token {GITHUB_TOKEN}",
        "Accept": "application/vnd.github.v3+json"
    }
    payload = {"body": summary}
    
    response = requests.post(api_url, headers=headers, json=payload)
    if response.status_code == 201:
        print("Successfully posted comment to PR.")
    else:
        print(f"Failed to post comment. Status: {response.status_code}, Response: {response.text}")

# --- Main Execution ---
if __name__ == "__main__":
    summary_text = generate_summary(findings)
    post_github_comment(summary_text)
