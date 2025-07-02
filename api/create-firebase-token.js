import admin from 'firebase-admin';

// Inicializa el SDK de Admin si no está ya inicializado
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
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

    // Crea un token personalizado de Firebase para el ID de usuario de Clerk
    const firebaseToken = await admin.auth().createCustomToken(userId);
    res.status(200).json({ firebaseToken });
  } catch (error) {
    console.error('Error creating Firebase token:', error);
    res.status(500).json({ error: 'Failed to create Firebase token' });
  }
};