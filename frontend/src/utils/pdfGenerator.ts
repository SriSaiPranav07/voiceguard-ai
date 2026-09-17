import jsPDF from 'jspdf';
import type { AudioAnalysisResult } from '../services/api';

export function generateAnalysisPDF(data: AudioAnalysisResult) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header Banner
  doc.setFillColor(10, 13, 20); // Dark header
  doc.rect(0, 0, pageWidth, 40, 'F');

  doc.setTextColor(56, 189, 248); // Cyan
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('VOICEGUARD AI', 14, 20);

  doc.setTextColor(148, 163, 184);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('AUDIT & THREAT DETECTION ANALYSIS REPORT', 14, 28);
  doc.text(`CONFIDENTIAL | SOC INTELLIGENCE REPORT`, pageWidth - 14, 28, { align: 'right' });

  // Divider line
  doc.setDrawColor(56, 189, 248);
  doc.setLineWidth(1);
  doc.line(14, 42, pageWidth - 14, 42);

  let y = 52;

  // Metadata Table
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Analysis Overview & Metadata', 14, y);
  y += 8;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Analysis ID: ${data.analysis_id}`, 14, y);
  doc.text(`Timestamp: ${new Date().toISOString()}`, 110, y);
  y += 6;
  doc.text(`Filename: ${data.filename}`, 14, y);
  doc.text(`File Hash (SHA-256): ${data.file_hash}`, 110, y);
  y += 6;
  doc.text(`Duration: ${data.duration}s | Rate: ${data.sample_rate}Hz`, 14, y);
  doc.text(`Detected Language: ${data.detected_language} (${data.language_code.toUpperCase()})`, 110, y);
  y += 12;

  // Authenticity & Risk Scores Box
  const isHighRisk = data.risk_engine.overall_risk_score > 60;
  doc.setFillColor(isHighRisk ? 254 : 240, isHighRisk ? 242 : 253, isHighRisk ? 242 : 244);
  doc.rect(14, y, pageWidth - 28, 30, 'F');
  doc.setDrawColor(isHighRisk ? 239 : 16, isHighRisk ? 68 : 185, isHighRisk ? 68 : 129);
  doc.rect(14, y, pageWidth - 28, 30, 'S');

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(isHighRisk ? 185 : 4, isHighRisk ? 28 : 120, isHighRisk ? 28 : 87);
  doc.text(`CLASSIFICATION: ${data.authenticity.classification}`, 20, y + 10);
  doc.text(`OVERALL RISK SCORE: ${data.risk_engine.overall_risk_score} / 100 (${data.risk_engine.risk_level})`, 110, y + 10);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  doc.text(`Synthetic Probability: ${data.authenticity.synthetic_speech_probability}% | Human Probability: ${data.authenticity.human_speech_probability}%`, 20, y + 20);
  doc.text(`Confidence Interval: ${data.authenticity.confidence_interval}`, 110, y + 20);

  y += 40;

  // Primary Indicators & Explanation
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('Key Forensic Indicators', 14, y);
  y += 8;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  data.risk_engine.primary_indicators.forEach((indicator) => {
    doc.text(`• ${indicator}`, 18, y);
    y += 6;
  });

  y += 4;
  doc.setFont('helvetica', 'bold');
  doc.text('Security Recommendation:', 14, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.text(data.risk_engine.recommendation, 14, y, { maxWidth: pageWidth - 28 });
  y += 14;

  // Speech Transcript Box
  doc.setFont('helvetica', 'bold');
  doc.text('Speech Transcription Snippet', 14, y);
  y += 6;
  doc.setFillColor(248, 250, 252);
  doc.rect(14, y, pageWidth - 28, 22, 'F');
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(71, 85, 105);
  doc.text(`"${data.transcript}"`, 20, y + 12, { maxWidth: pageWidth - 40 });

  y += 32;

  // Footer Disclaimer
  doc.setDrawColor(226, 232, 240);
  doc.line(14, y, pageWidth - 14, y);
  y += 8;

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text(`Engine: ${data.model_metadata.engine_version} | VoiceGuard Security SOC Platform`, 14, y);
  doc.text(`DISCLAIMER: AI voice analysis outputs provide probabilistic threat scores for security guidance.`, 14, y + 5);

  doc.save(`VoiceGuard_Report_${data.analysis_id}.pdf`);
}
