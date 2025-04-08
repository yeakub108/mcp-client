"use client";

import { useState } from "react";

export default function DemoPage() {
  const [feature, setFeature] = useState("");
  const [repo, setRepo] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const runAgent = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/run-ba", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feature, repo }),
      });
      const data = await res.json();
      setResult(JSON.stringify(data, null, 2));
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

      <pre style={{ marginTop: 20, background: "#f4f4f4", padding: 16 }}>
        {result}
      </pre>
    </div>
  );
}
