// En emails/ReporteRiesgoEmail.jsx
import React from 'react';
import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Heading,
  Preview,
  Section,
  Text,
} from '@react-email/components';

export const ReporteRiesgoEmail = ({
  nombre = 'Paciente',
  risk = 'N/A',
  classification = { level: 'No calculado', color: '#555' },
  points = 'N/A',
  recommendations = [],
  geminiPlan = '',
}) => {
    const getRiskColor = (level) => {
        if (level.includes('Bajo')) return '#28a745';
        if (level.includes('Moderado')) return '#ffc107';
        if (level.includes('Alto')) return '#fd7e14';
        if (level.includes('Muy Alto')) return '#dc3545';
        return '#6c757d';
    };

    const riskColor = getRiskColor(classification.level);

    return (
        <Html>
            <Head />
            <Preview>Tu reporte de riesgo cardiovascular está listo.</Preview>
            <Body style={main}>
                <Container style={container}>
                    <Heading style={heading}>Reporte de Salud Cardiovascular</Heading>
                    <Text style={paragraph}>Hola {nombre},</Text>
                    <Text style={paragraph}>
                        Aquí tienes un resumen de tu evaluación de riesgo cardiovascular. Usa esta información como punto de partida para conversar con tu médico.
                    </Text>
                    <Section style={resultsSection}>
                        <Text style={resultsHeader}>Tu Resultado</Text>
                        <Text style={{ ...riskText, color: riskColor }}>
                            {risk}%
                        </Text>
                        <Text style={{ ...riskLevelText, backgroundColor: riskColor }}>
                            {classification.level}
                        </Text>
                        <Text style={pointsText}>Puntos de Riesgo de Framingham: {points}</Text>
                    </Section>
                    <Hr style={hr} />
                    <Heading as="h2" style={subheading}>Recomendaciones Generales</Heading>
                    <ul style={list}>
                        {recommendations.map((rec, index) => (
                            <li key={index} dangerouslySetInnerHTML={{ __html: rec }} />
                        ))}
                    </ul>
                    {geminiPlan && (
                        <>
                            <Hr style={hr} />
                            <Heading as="h2" style={subheading}>✨ Plan de Acción con IA</Heading>
                            <Text style={paragraph}>{geminiPlan.replace(/\n/g, '<br />')}</Text>
                        </>
                    )}
                    <Hr style={hr} />
                    <Text style={footer}>
                        Recuerda: Esta herramienta es educativa y no reemplaza una consulta médica profesional.
                    </Text>
                </Container>
            </Body>
        </Html>
    );
};

// --- Estilos para el correo ---
const main = { backgroundColor: '#f6f9fc', fontFamily: 'Arial, sans-serif' };
const container = { backgroundColor: '#ffffff', margin: '0 auto', padding: '20px 0 48px', marginBottom: '64px', border: '1px solid #f0f0f0', borderRadius: '4px' };
const heading = { fontSize: '28px', fontWeight: 'bold', textAlign: 'center', color: '#484848' };
const subheading = { fontSize: '20px', fontWeight: 'bold', color: '#484848', margin: '20px 0' };
const paragraph = { fontSize: '16px', lineHeight: '26px', color: '#484848', padding: '0 20px' };
const resultsSection = { padding: '20px', textAlign: 'center' };
const resultsHeader = { fontSize: '16px', color: '#555' };
const riskText = { fontSize: '64px', fontWeight: 'bold', margin: '10px 0' };
const riskLevelText = { fontSize: '18px', fontWeight: 'bold', color: 'white', padding: '8px 16px', borderRadius: '9999px', display: 'inline-block' };
const pointsText = { fontSize: '14px', color: '#888', marginTop: '16px' };
const hr = { borderColor: '#f0f0f0', margin: '20px 0' };
const list = { padding: '0 40px' };
const footer = { color: '#888888', fontSize: '12px', lineHeight: '24px', padding: '0 20px' };
