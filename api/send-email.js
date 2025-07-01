import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  try {
    // Recibe el HTML ya renderizado desde el frontend
    const { to, subject, html } = req.body;

    const { data, error } = await resend.emails.send({
      from: 'Calculadora RCV <onboarding@resend.dev>',
      to: [to],
      subject: subject,
      html: html, // Pasa el HTML directamente a Resend
    });

    if (error) {
      console.error({ error });
      return res.status(400).json(error);
    }

    return res.status(200).json({ message: 'Correo enviado!' });
  } catch (error) {
    console.error({ error });
    return res.status(500).json({ error: 'Error Interno' });
  }
};