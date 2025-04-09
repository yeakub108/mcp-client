/* eslint-disable @typescript-eslint/no-unused-vars */
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

  let processed = text;

  // First, we need to handle the case where text is already inside <p> tags
  // We'll extract and process each paragraph separately
  const hasPTags = processed.includes("<p>");

  if (hasPTags) {
    // Extract content between <p> and </p> tags to avoid processing HTML
    const pTagRegex = /<p>([\s\S]*?)<\/p>/g;
    processed = processed.replace(
      pTagRegex,
      (match: string, content: string) => {
        return `<p>${processMarkdownContent(content)}</p>`;
      }
    );
  } else {
    // If there are no <p> tags, process the entire text
    processed = processMarkdownContent(processed);
  }

  return processed;
}

// Helper function to process markdown content
function processMarkdownContent(content: string): string {
  let processedContent = content;

  // Handle headings - capture heading level (number of #) and the heading text
  processedContent = processedContent.replace(
    /^(#{1,6})\s+(.+)$/gm,
    (match, hashes, text) => {
      const level = hashes.length;
      return `<h${level} style="font-weight: bold; margin-top: 1em; margin-bottom: 0.5em;">${text}</h${level}>`;
    }
  );

  // Convert **text** to <strong>text</strong> (bold)
  processedContent = processedContent.replace(
    /\*\*([^*]+)\*\*/g,
    "<strong>$1</strong>"
  );

  // Convert *text* to <em>text</em> (italic)
  processedContent = processedContent.replace(/\*([^*]+)\*/g, "<em>$1</em>");

  // Create an array of lines to properly handle lists
  const lines = processedContent.split("\n");
  let inList = false;
  let listType = "";
  // Removed unused listContent array
  const result = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check if line is a list item
    const bulletMatch = line.match(/^\s*-\s+(.+)$/);
    const numberedMatch = line.match(/^\s*(\d+)\.\s+(.+)$/);

    if (bulletMatch) {
      // Bullet list item
      if (!inList || listType !== "ul") {
        // Start a new list if we're not in one or switching types
        if (inList) {
          // Close previous list
          result.push(`</${listType}>`);
        }
        inList = true;
        listType = "ul";
        result.push('<ul style="margin-left: 1.5em; list-style-type: disc;">');
      }
      result.push(`<li>${bulletMatch[1]}</li>`);
    } else if (numberedMatch) {
      // Numbered list item
      if (!inList || listType !== "ol") {
        // Start a new list if we're not in one or switching types
        if (inList) {
          // Close previous list
          result.push(`</${listType}>`);
        }
        inList = true;
        listType = "ol";
        result.push('<ol style="margin-left: 1.5em;">');
      }
      result.push(`<li>${numberedMatch[2]}</li>`);
    } else {
      // Not a list item
      if (inList) {
        // Close the list if we were in one
        result.push(`</${listType}>`);
        inList = false;
      }

      // If line is not empty, wrap in paragraph tags if it's not already a heading
      if (line.trim() && !line.match(/^<h[1-6]/)) {
        result.push(`<div style="margin-bottom: 0.75em;">${line}</div>`);
      } else if (line.trim()) {
        result.push(line); // Just push headings as-is
      } else {
        result.push("<br>"); // Empty lines become breaks
      }
    }
  }

  // Close any open list
  if (inList) {
    result.push(`</${listType}>`);
  }

  return result.join("\n");
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
    } catch {
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
      {/* <input
        style={{
          padding: 8,
          marginRight: 10,
          backgroundColor: "#e0e0e0",
          borderRadius: "8px",
        }}
        value={repo}
        onChange={(e) => setRepo(e.target.value)}
        placeholder="Repo"
      /> */}
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
