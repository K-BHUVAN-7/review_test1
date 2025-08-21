import json
import os
import requests

# 1. Load Semgrep results
with open("results.json") as f:
    results = json.load(f)

# 2. Format findings
issues = []
for r in results.get("results", []):
    file = r["path"]
    line = r["start"]["line"]
    message = r["extra"]["message"]
    severity = r["extra"].get("severity", "info")
    issues.append(f"- [{severity.upper()}] {file}:{line} → {message}")

issues_text = "\n".join(issues) if issues else "✅ No issues found by Semgrep."

# 3. Call Gemini API
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={GEMINI_API_KEY}"

prompt = f"""You are a code reviewer. Explain these Semgrep findings and suggest fixes:\n{issues_text}"""

response = requests.post(
    GEMINI_URL,
    headers={"Content-Type": "application/json"},
    json={
        "contents": [
            {
                "parts": [
                    {"text": prompt}
                ]
            }
        ]
    }
)

summary = response.json()["candidates"][0]["content"]["parts"][0]["text"]

# 4. Post to GitHub PR as comment
pr_number = os.getenv("PR_NUMBER")
repo = os.getenv("GITHUB_REPOSITORY")
token = os.getenv("GITHUB_TOKEN")

url = f"https://api.github.com/repos/{repo}/issues/{pr_number}/comments"
headers = {"Authorization": f"token {token}"}
requests.post(url, json={"body": f"### 🤖 Semgrep + Gemini PR Bot\n\n{summary}"}, headers=headers)
