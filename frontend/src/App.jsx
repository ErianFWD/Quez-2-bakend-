import { BrowserRouter } from 'react-router-dom';
import ChatEcoObra from './components/ChatEcoObra.jsx';
import AppRoutes from './routes/AppRoutes.jsx';
import { ToastProvider } from './components/Toast.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AppRoutes />
        <ChatEcoObra />
      </ToastProvider>
    </BrowserRouter>
  );
}
