// En src/PatientPortal.jsx
import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { db } from './firebase';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { Link } from 'react-router-dom';

// Icono para el botón de expandir/colapsar
const ChevronDownIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
  </svg>
);

export default function PatientPortal() {
    const { user } = useUser();
    const [calculations, setCalculations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState(null); // Estado para controlar qué tarjeta está expandida

    useEffect(() => {
        if (user) {
            const fetchCalculations = async () => {
                const q = query(
                    collection(db, "users", user.id, "calculations"),
                    orderBy("createdAt", "desc")
                );
                const querySnapshot = await getDocs(q);
                const userCalculations = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setCalculations(userCalculations);
                setLoading(false);
            };
            fetchCalculations();
        }
    }, [user]);

    const toggleExpand = (id) => {
        setExpandedId(expandedId === id ? null : id);
    };

    if (loading) {
        return <div className="text-center p-10">Cargando historial...</div>;
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="p-4 sm:p-6 md:p-8 max-w-4xl mx-auto">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
                    <h1 className="text-3xl font-bold text-slate-800 mb-4 sm:mb-0">Mi Historial de Riesgo</h1>
                    <Link to="/dashboard" className="bg-indigo-600 text-white font-semibold py-2 px-5 rounded-lg shadow-sm hover:bg-indigo-700 transition-colors">
                        + Nuevo Cálculo
                    </Link>
                </div>
                {calculations.length === 0 ? (
                    <div className="text-center bg-white p-10 rounded-lg shadow">
                        <p className="text-slate-600">Aún no tienes cálculos guardados. ¡Realiza tu primer cálculo para ver tu historial!</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {calculations.map(calc => (
                            <div key={calc.id} className="bg-white p-5 rounded-xl shadow-md transition-all">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                                    <div>
                                        <p className="font-bold text-slate-700">{calc.nombre || 'Cálculo'}</p>
                                        <p className="text-sm text-slate-500">
                                            {new Date(calc.createdAt?.toDate()).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <p className={`text-4xl font-bold ${calc.classification.color}`}>{calc.risk}%</p>
                                        <span className={`px-3 py-1 text-sm font-semibold rounded-full ${calc.classification.bgColor} ${calc.classification.color}`}>
                                            {calc.classification.level}
                                        </span>
                                    </div>
                                    <div className="flex justify-end">
                                        <button onClick={() => toggleExpand(calc.id)} className="flex items-center gap-1 text-indigo-600 font-semibold">
                                            Ver Detalles <ChevronDownIcon />
                                        </button>
                                    </div>
                                </div>
                                {expandedId === calc.id && (
                                    <div className="mt-4 pt-4 border-t border-slate-200">
                                        <h4 className="font-bold text-slate-600 mb-2">Recomendaciones de este cálculo:</h4>
                                        <ul className="list-disc list-inside text-slate-600 space-y-1">
                                            {calc.recommendations.map((rec, index) => (
                                                <li key={index} dangerouslySetInnerHTML={{ __html: rec }} />
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}