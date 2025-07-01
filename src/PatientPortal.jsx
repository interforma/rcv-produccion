import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { db } from './firebase';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';

export default function PatientPortal() {
    const { user } = useUser();
    const [calculations, setCalculations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            const fetchCalculations = async () => {
                const q = query(
                    collection(db, "users", user.id, "calculations"),
                    orderBy("createdAt", "desc") // Ordena por fecha, el más nuevo primero
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

    if (loading) {
        return <div className="text-center p-10">Cargando historial...</div>;
    }

    return (
        <div className="p-4 sm:p-6 md:p-8 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-slate-800 mb-6">Mi Historial de Riesgo</h1>
            {calculations.length === 0 ? (
                <p>Aún no tienes cálculos guardados.</p>
            ) : (
                <div className="space-y-4">
                    {calculations.map(calc => (
                        <div key={calc.id} className="bg-white p-4 rounded-lg shadow">
                            <p><strong>Fecha:</strong> {new Date(calc.createdAt?.toDate()).toLocaleDateString()}</p>
                            <p><strong>Riesgo Calculado:</strong> {calc.risk}% - ({calc.classification.level})</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}