import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ChatProvider } from './context/ChatContext.jsx';

const LoginPage = lazy(() => import('./pages/LoginPage.jsx'));
const ChatPage = lazy(() => import('./pages/ChatPage.jsx'));

function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-base">
      <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function App() {
  return (
    <ChatProvider>
      <BrowserRouter>
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ChatProvider>
  );
}
