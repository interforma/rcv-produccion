// En api/send-email.js
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

function buildEmailHtml(resultData) {
  const { nombre, risk, classification, points, recommendations, geminiPlan } = resultData;
  const recommendationsHtml = recommendations.map(rec => `<li>${rec}</li>`).join('');
  const geminiPlanHtml = geminiPlan ? `<hr><h3>✨ Plan de Acción con IA</h3><p>${geminiPlan.replace(/\n/g, '<br>')}</p>` : '';
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h1 style="color: #333;">Reporte de Salud Cardiovascular</h1>
      <p>Hola ${nombre || 'Paciente'},</p>
      <p>Aquí tienes un resumen de tu evaluación de riesgo cardiovascular.</p>
      <hr>
      <h2 style="color: #333;">Tu Resultado</h2>
      <p style="font-size: 18px;">
        <strong>Riesgo a 10 años:</strong> 
        <span style="font-size: 24px; font-weight: bold; color: #d9534f;">${risk}%</span>
      </p>
      <p><strong>Clasificación:</strong> ${classification.level}</p>
      <p><strong>Puntos de Riesgo:</strong> ${points}</p>
      <hr>
      <h3 style="color: #333;">Recomendaciones Generales</h3>
      <ul>${recommendationsHtml}</ul>
      ${geminiPlanHtml}
      <hr>
      <p style="font-size: 12px; color: #777;">
        Recuerda: Esta herramienta es educativa y no reemplaza una consulta médica profesional.
      </p>
    </div>
  `;
}

export default async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  try {
    const { to, subject, resultData } = req.body;
    const emailHtml = buildEmailHtml(resultData);

    const { data, error } = await resend.emails.send({
      from: 'Calculadora RCV <onboarding@resend.dev>',
      to: [to],
      subject: subject,
      html: emailHtml,
    });

    // ¡MANEJO DE ERRORES MEJORADO!
    if (error) {
      // Imprime el error completo en los logs de Vercel para que podamos verlo.
      console.error("Error desde la API de Resend:", error);
      // Devuelve un error claro al frontend.
      return res.status(400).json({ message: "Error al enviar desde Resend", details: error });
    }

    return res.status(200).json({ message: 'Correo enviado!' });
  } catch (error) {
    console.error("Error en la función del servidor:", error);
    return res.status(500).json({ message: 'Error Interno del Servidor', details: error.message });
  }
};