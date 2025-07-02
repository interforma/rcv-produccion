import admin from 'firebase-admin';

// Valida que todas las variables de entorno necesarias existan
if (
  !process.env.FIREBASE_PROJECT_ID ||
  !process.env.FIREBASE_PRIVATE_KEY ||
  !process.env.FIREBASE_CLIENT_EMAIL
) {
  throw new Error('Firebase environment variables not set.');
}

// Inicializa el SDK de Admin si no está ya inicializado
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      // Reemplaza los caracteres de escape \\n por saltos de línea reales
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    }),
  });
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
    console.error('Error creating Firebase token:', error);
    res.status(500).json({ error: 'Failed to create Firebase token' });
  }
};