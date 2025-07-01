import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { ClerkProvider, SignIn, SignUp, SignedIn, UserButton } from '@clerk/clerk-react';
import { BrowserRouter, Route, Routes, useNavigate, Link } from 'react-router-dom';
import PatientPortal from './PatientPortal.jsx';
import { Outlet } from 'react-router-dom';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key")
}

// Componente Layout para las páginas protegidas
const AppLayout = () => {
  return (
    <>
      <header className="absolute top-4 right-4">
        <UserButton />
      </header>
      <main>
        <Outlet /> {/* Aquí se renderizará App o PatientPortal */}
      </main>
    </>
  );
};

function ClerkProviderWithRoutes() {
  const navigate = useNavigate();
  return (
    <ClerkProvider
      publishableKey={PUBLISHABLE_KEY}
      navigate={(to) => navigate(to)}
      afterSignOutUrl="/"
    >
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/sign-in/*" element={<SignIn routing="path" path="/sign-in" />} />
        <Route path="/sign-up/*" element={<SignUp routing="path" path="/sign-up" />} />

        {/* Rutas Protegidas que usan el nuevo Layout */}
        <Route element={
            <SignedIn>
                <AppLayout />
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
            <h1 className="text-5xl font-bold text-slate-800">Bienvenido a tu Asistente de Salud Cardiovascular</h1>
            <p className="text-xl text-slate-600 mt-4 max-w-2xl">Calcula tu riesgo, obtén recomendaciones y sigue tu progreso.</p>
            <div className="mt-8 flex gap-4">
                <Link to="/dashboard" className="bg-indigo-600 text-white font-bold text-lg py-3 px-6 rounded-lg shadow-md hover:bg-indigo-700 transition">
                    Iniciar Sesión
                </Link>
                <Link to="/sign-up" className="bg-slate-600 text-white font-bold text-lg py-3 px-6 rounded-lg shadow-md hover:bg-slate-700 transition">
                    Registrarse
                </Link>
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