import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  try {
    const { to, subject, body } = req.body;
    const { data, error } = await resend.emails.send({
      from: 'Calculadora RCV <onboarding@resend.dev>', // Resend usa este email para pruebas
      to: [to],
      subject: subject,
      html: body,
    });
    if (error) return res.status(400).json(error);
    return res.status(200).json({ message: 'Correo enviado!' });
  } catch (error) {
    return res.status(500).json({ error: 'Error Interno' });
  }
};