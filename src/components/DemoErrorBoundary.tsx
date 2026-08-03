import { Component, ErrorInfo, ReactNode } from "react";
import { Btn } from "./ui";

interface Props {
  children: ReactNode;
  title?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class DemoErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Demo Error Caught:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="border-4 border-ember bg-[#ffe6da] p-5 shadow-[5px_5px_0_#b23a48]">
          <div className="font-mono text-sm font-bold uppercase tracking-wider text-ember">
            {this.props.title ?? "Demo Error"}
          </div>
          <p className="mt-2 text-[15px] leading-relaxed text-ink">
            An error occurred inside this interactive figure:
          </p>
          <pre className="mt-2 overflow-x-auto border-2 border-ink/30 bg-white/80 p-3 font-mono text-[13px] text-ember">
            {this.state.error?.message ?? "Unknown error"}
          </pre>
          <div className="mt-4">
            <Btn onClick={this.handleReset}>Reset Demo</Btn>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
