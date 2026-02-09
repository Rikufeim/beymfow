import React from "react";

const defaultErrorUI = (error: any) => (
  <div style={{
    padding: 16,
    whiteSpace: "pre-wrap",
    backgroundColor: "#000",
    color: "#fff",
    minHeight: "100vh",
    fontFamily: "monospace",
  }}>
    <h1 style={{ color: "#ff0000", marginBottom: 16 }}>RUNTIME ERROR:</h1>
    <pre style={{ color: "#fff", fontSize: "14px" }}>
      {String(error?.stack || error)}
    </pre>
  </div>
);

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { error: any }
> {
  state = { error: null as any };

  static getDerivedStateFromError(error: any) {
    return { error };
  }

  componentDidCatch(error: any, info: any) {
    console.error("ErrorBoundary caught:", error, info);
  }

  render() {
    if (this.state.error) {
      if (this.props.fallback !== undefined) return this.props.fallback;
      return defaultErrorUI(this.state.error);
    }
    return this.props.children;
  }
}


