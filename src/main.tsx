import React, { Component, ErrorInfo, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    if (
      event.message?.includes("Failed to read a named property '$$typeof' from 'Window'") ||
      event.message?.includes('cross-origin frame')
    ) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  });
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    if (
      error.message?.includes("Failed to read a named property '$$typeof' from 'Window'") ||
      error.message?.includes('cross-origin frame')
    ) {
      return { hasError: false, error: null };
    }
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    if (
      error.message?.includes("Failed to read a named property '$$typeof' from 'Window'") ||
      error.message?.includes('cross-origin frame')
    ) {
      return;
    }
    console.error('Uncaught Error Boundary:', error, errorInfo);
  }

  private handleReset = () => {
    localStorage.removeItem('dronecleanpro_site_images');
    localStorage.removeItem('dronecleanpro_inquiries');
    sessionStorage.removeItem('dronecleanpro_admin_auth');
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-6">
          <div className="bg-slate-800 border border-slate-700 rounded-3xl p-8 max-w-md w-full text-center space-y-6 shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto text-2xl font-black">
              !
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-black tracking-tight text-white">화면을 불러오는 중 오류가 발생했습니다</h1>
              <p className="text-xs text-slate-300 leading-relaxed">
                시스템 일시적 오류 또는 저장된 이전 데이터와의 충돌로 화면 표시가 중단되었습니다. 아래 버튼을 눌러 초기화 및 재시도를 진행해 주세요.
              </p>
            </div>
            {this.state.error && (
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-left overflow-x-auto max-h-32 text-[11px] font-mono text-rose-300">
                {this.state.error.message || String(this.state.error)}
              </div>
            )}
            <div className="flex flex-col gap-2.5 pt-2">
              <button
                onClick={() => window.location.reload()}
                className="w-full py-3.5 rounded-xl bg-[#1d61e8] hover:bg-[#1550c6] text-white font-extrabold text-xs shadow-lg transition-all"
              >
                페이지 다시 불러오기
              </button>
              <button
                onClick={this.handleReset}
                className="w-full py-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold text-xs transition-all"
              >
                저장 데이터 초기화 후 재접속
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
);
