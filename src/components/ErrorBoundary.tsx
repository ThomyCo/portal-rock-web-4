import { Component, type ErrorInfo, type ReactNode } from "react";
export class ErrorBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Portal Rock UI error", error, info.componentStack);
  }
  render() {
    return this.state.failed ? (
      <main className="page">
        <p className="eyebrow">ERROR DE ESCENA</p>
        <h1>Algo dejó de sonar.</h1>
        <p>La página encontró un problema inesperado.</p>
        <button
          className="button button-primary"
          onClick={() => location.reload()}
        >
          Volver a intentar
        </button>
      </main>
    ) : (
      this.props.children
    );
  }
}
