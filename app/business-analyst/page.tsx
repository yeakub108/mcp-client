"use client";

import { useState, useEffect } from "react";

// CSS styles to make the output match the login_page_Business_Analysis.txt format
const businessAnalysisStyles = `
  .business-analysis {
    font-family: system-ui, -apple-system, sans-serif;
    color: #333;
    font-size: 16px;
  }
  
  .business-analysis h1 {
    font-size: 2rem;
    font-weight: bold;
    margin-bottom: 1rem;
    color: #333;
  }
  
  .business-analysis p {
    line-height: 1.6;
    white-space: pre-wrap;
    margin-bottom: 0.75rem;
    font-size: 16px;
  }
  
  /* Style markdown elements inside paragraphs */
  .business-analysis strong, .business-analysis b {
    font-weight: bold;
    color: #222;
  }

  /* Style for headings in markdown represented as plain text */
  .business-analysis p {
    line-height: 1.6;
  }

  /* Make heading text inside paragraphs appear as headings */
  .business-analysis p:first-of-type {
    font-size: 1.4rem;
    font-weight: 500;
    margin-bottom: 1.5rem;
  }

  /* Indentation for nested lists */
  .business-analysis ul, 
  .business-analysis ol {
    margin-left: 1.5rem;
    padding-left: 0.5rem;
    list-style-position: outside;
  }
  
  .business-analysis li {
    margin-bottom: 0.5rem;
    position: relative;
  }

  /* Indentation levels */
  .business-analysis li li {
    margin-left: 1rem;
  }

  /* Add space between different sections */
  .business-analysis p + p {
    margin-top: 1.2rem;
  }

  /* Handle spacing like in the text file */
  .business-analysis br {
    display: block;
    margin-bottom: 0.5rem;
  }
`;

// Function to parse markdown and convert to HTML
function parseMarkdown(text: string): string {
  if (!text) return "";

  // Process the content within <p> tags to convert markdown to HTML
  let processed = text;

  // Extract content between <p> and </p> tags to avoid processing HTML
  const pTagRegex = /<p>([\s\S]*?)<\/p>/g;
  processed = processed.replace(pTagRegex, (match: string, content: string) => {
    // Convert markdown within the paragraph content
    let processedContent = content;

    // Convert ### headers to <h3>
    processedContent = processedContent.replace(
      /### ([^\n]+)/g,
      '<h3 style="font-size: 1.4rem;">$1</h3>'
    );

    // Convert #### headers to <h4>
    processedContent = processedContent.replace(
      /#### ([^\n]+)/g,
      '<h4 style="font-size: 1.25rem;">$1</h4>'
    );

    // Convert **text** to <strong>text</strong>
    processedContent = processedContent.replace(
      /\*\*([^*]+)\*\*/g,
      '<strong style="font-size: 16px;">$1</strong>'
    );

    // Handle lists (basic implementation)
    // Convert - item to <li>item</li>
    processedContent = processedContent.replace(
      /^- (.+)$/gm,
      '<li style="font-size: 16px;">$1</li>'
    );

    // Convert indented list items
    processedContent = processedContent.replace(
      /^  - (.+)$/gm,
      '<li style="margin-left: 20px; font-size: 16px;">$1</li>'
    );

    // Convert numbered list items
    processedContent = processedContent.replace(
      /^    (\d+)\. (.+)$/gm,
      '<li style="margin-left: 40px; font-size: 16px;">$2</li>'
    );

    // Wrap list items in <ul> tags for proper list rendering
    if (processedContent.includes("<li>")) {
      processedContent = "<ul>" + processedContent + "</ul>";
      // Clean up potential multiple adjacent ul tags
      processedContent = processedContent.replace(/<\/ul>\s*<ul>/g, "");
    }

    return `<div class="markdown-content">${processedContent}</div>`;
  });

  return processed;
}

export default function DemoPage() {
  const [feature, setFeature] = useState("");
  const [repo, setRepo] = useState("");
  const [result, setResult] = useState("");
  const [parsedResult, setParsedResult] = useState("");
  const [loading, setLoading] = useState(false);

  // Parse markdown whenever result changes
  useEffect(() => {
    if (result) {
      setParsedResult(parseMarkdown(result));
    }
  }, [result]);

  const runAgent = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/run-ba", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feature, repo }),
      });

      // Get the response as text instead of JSON
      const textData = await res.text();
      setResult(textData);
    } catch (err) {
      setResult("Error running agent");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 32 }}>
      <h1>Run BA Agent</h1>
      <input
        style={{
          padding: 8,
          marginRight: 10,
          backgroundColor: "#e0e0e0",
          borderRadius: "8px",
        }}
        value={feature}
        onChange={(e) => setFeature(e.target.value)}
        placeholder="Feature"
      />
      <input
        style={{
          padding: 8,
          marginRight: 10,
          backgroundColor: "#e0e0e0",
          borderRadius: "8px",
        }}
        value={repo}
        onChange={(e) => setRepo(e.target.value)}
        placeholder="Repo"
      />
      <button
        onClick={runAgent}
        disabled={loading}
        style={{
          padding: 10,
          backgroundColor: "#4CAF50",
          color: "white",
          border: "none",
          cursor: loading ? "not-allowed" : "pointer",
          borderRadius: "8px",
        }}
      >
        {loading ? "🤖 Generating response..." : "Run Agent"}
      </button>

      {/* Add style tag to inject our CSS */}
      <style dangerouslySetInnerHTML={{ __html: businessAnalysisStyles }} />

      {/* Use the business-analysis class to apply our styles */}
      <div
        className="business-analysis"
        style={{
          marginTop: 20,
          background: "#f4f4f4",
          padding: 20,
          borderRadius: "8px",
          boxShadow: "0 2px 5px rgba(0,0,0,0.15)",
          fontSize: "16px",
        }}
        dangerouslySetInnerHTML={{ __html: parsedResult || result }}
      />
    </div>
  );
}
