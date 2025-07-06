// En src/main.jsx
import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { ClerkProvider, SignIn, SignUp, SignedIn, UserButton, useAuth, useUser } from '@clerk/clerk-react';
import { BrowserRouter, Route, Routes, useNavigate, Link } from 'react-router-dom';
import PatientPortal from './PatientPortal.jsx';
import { Outlet } from 'react-router-dom';
import { auth } from './firebase'; // Importa la instancia de auth
import { signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key")
}

const FirebaseSync = ({ children }) => {
  const { user } = useUser();
  const [isFirebaseReady, setIsFirebaseReady] = useState(false);

  useEffect(() => {
    const signInWithFirebase = async () => {
      if (user) {
        console.log("Paso 1: Usuario de Clerk detectado. Intentando crear token de Firebase.");
        try {
          const res = await fetch('/api/create-firebase-token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user.id }),
          });

          if (!res.ok) {
              console.error("Error del servidor al crear el token:", await res.text());
              return;
          }

          const data = await res.json();
          console.log("Paso 2: Token de Firebase recibido. Intentando iniciar sesión en Firebase.");

          await signInWithCustomToken(auth, data.firebaseToken);

          console.log("Paso 3: signInWithCustomToken ejecutado (no significa que ya esté listo).");

        } catch (error) {
          console.error('Error crítico durante el proceso de inicio de sesión en Firebase:', error);
        }
      }
    };
    signInWithFirebase();
  }, [user]);

  useEffect(() => {
    console.log("Adjuntando listener de estado de autenticación de Firebase...");
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        console.log("Paso 4: ¡Éxito! Listener de Firebase detectó un usuario. La aplicación está lista.");
        setIsFirebaseReady(true);
      } else {
        console.log("Listener de Firebase detectó que no hay usuario.");
        setIsFirebaseReady(false);
      }
    });
    return () => {
        console.log("Limpiando listener de Firebase.");
        unsubscribe();
    }
  }, []);

  if (!isFirebaseReady) {
    return <div className="min-h-screen flex items-center justify-center">Sincronizando con la base de datos...</div>;
  }

  return <>{children}</>;
};

const AppLayout = () => (
  <>
    <header className="absolute top-4 right-4"><UserButton /></header>
    <main><Outlet /></main>
  </>
);

function ClerkProviderWithRoutes() {
  const navigate = useNavigate();
  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} navigate={(to) => navigate(to)} afterSignOutUrl="/">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/sign-in/*" element={<SignIn routing="path" path="/sign-in" />} />
        <Route path="/sign-up/*" element={<SignUp routing="path" path="/sign-up" />} />
        <Route element={
            <SignedIn>
              <FirebaseSync>
                <AppLayout />
              </FirebaseSync>
            </SignedIn>
        }>
            <Route path="/dashboard" element={<App />} />
            <Route path="/portal" element={<PatientPortal />} />
        </Route>
      </Routes>
    </ClerkProvider>
  )
}

function LandingPage() {
  return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center text-center p-4">
          <h1 className="text-5xl font-bold text-slate-800">Bienvenido a tu Asistente de Salud</h1>
          <p className="text-xl text-slate-600 mt-4 max-w-2xl">Calcula tu riesgo, obtén recomendaciones y sigue tu progreso.</p>
          <div className="mt-8 flex gap-4">
              <Link to="/dashboard" className="bg-indigo-600 text-white font-bold text-lg py-3 px-6 rounded-lg shadow-md hover:bg-indigo-700 transition">Iniciar Sesión</Link>
              <Link to="/sign-up" className="bg-slate-600 text-white font-bold text-lg py-3 px-6 rounded-lg shadow-md hover:bg-slate-700 transition">Registrarse</Link>
          </div>
      </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ClerkProviderWithRoutes />
    </BrowserRouter>
  </React.StrictMode>,
)