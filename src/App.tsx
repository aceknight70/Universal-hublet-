import { BrowserRouter } from 'react-router-dom';
import { AppRouter } from './pages/StoreRouter';
import { AuthProvider } from './hooks/useAuth';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </BrowserRouter>
  );
}
