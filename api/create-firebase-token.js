import admin from 'firebase-admin';

// Valida que todas las variables de entorno necesarias existan
if (
  !process.env.FIREBASE_PROJECT_ID ||
  !process.env.FIREBASE_PRIVATE_KEY ||
  !process.env.FIREBASE_CLIENT_EMAIL
) {
  // Este error se verá en los logs de Vercel si las claves no están configuradas
  console.error('Error Crítico: Las variables de entorno de Firebase no están configuradas en Vercel.');
}

// Inicializa el SDK de Admin si no está ya inicializado
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      }),
    });
  } catch (error) {
    console.error('Error al inicializar Firebase Admin SDK:', error);
  }
}

export default async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const firebaseToken = await admin.auth().createCustomToken(userId);
    res.status(200).json({ firebaseToken });
  } catch (error) {
    console.error('Error al crear el token de Firebase:', error);
    res.status(500).json({ error: 'No se pudo crear el token de Firebase.' });
  }
};