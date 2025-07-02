// En src/main.jsx
import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { ClerkProvider, SignIn, SignUp, SignedIn, UserButton, useAuth, useUser } from '@clerk/clerk-react';
import { BrowserRouter, Route, Routes, useNavigate, Link } from 'react-router-dom';
import PatientPortal from './PatientPortal.jsx';
import { Outlet } from 'react-router-dom';
// ¡CAMBIO IMPORTANTE! Importamos nuestra instancia de auth
import { auth } from './firebase';
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
        console.log("Clerk user found. Attempting to create Firebase token.");
        try {
          const res = await fetch('/api/create-firebase-token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user.id }),
          });
          const data = await res.json();
          console.log("Firebase token received. Attempting to sign in.");
          // ¡CAMBIO IMPORTANTE! Usamos la instancia de auth importada
          await signInWithCustomToken(auth, data.firebaseToken);
          console.log("Successfully signed in to Firebase.");
        } catch (error) {
          console.error('Firebase sign-in error:', error);
        }
      }
    };
    signInWithFirebase();
  }, [user]);

  useEffect(() => {
    // ¡CAMBIO IMPORTANTE! Usamos la instancia de auth importada
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        console.log("Firebase auth state changed: User is signed in.");
        setIsFirebaseReady(true);
      } else {
        console.log("Firebase auth state changed: User is signed out.");
        setIsFirebaseReady(false);
      }
    });
    return () => unsubscribe();
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