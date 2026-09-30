"use client";

import { Component } from "react";

/** If WebGL is unavailable or a scene throws, the section keeps its copy and the page never crashes. */
export default class CanvasBoundary extends Component<{ children: React.ReactNode; fallback?: React.ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(err: unknown) {
    if (process.env.NODE_ENV !== "production") console.error("[3D scene]", err);
  }
  render() {
    return this.state.failed ? (this.props.fallback ?? null) : this.props.children;
  }
}
