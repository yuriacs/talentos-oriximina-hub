import jsPDF from 'jspdf';

interface ProfilePDFData {
  fullName: string;
  area?: string | null;
  city?: string | null;
  email?: string | null;
  whatsapp?: string | null;
  linkedinUrl?: string | null;
  githubUrl?: string | null;
  portfolioUrl?: string | null;
  bio?: string | null;
  professionalObjective?: string | null;
  skills: { name: string; level: string; category: string }[];
  softSkills: { name: string; rating: number }[];
  languages: { name: string; level: string }[];
  experiences: { place: string; type: string; start_date: string; end_date?: string | null; current: boolean; description?: string | null }[];
  education: { institution: string; course: string; level: string; year: number; current: boolean }[];
  certifications: { course: string; institution: string; completed_at: string; hours: number }[];
}

const COLORS = {
  primary: [30, 64, 124] as [number, number, number],
  dark: [33, 33, 33] as [number, number, number],
  medium: [100, 100, 100] as [number, number, number],
  light: [160, 160, 160] as [number, number, number],
  accent: [45, 100, 160] as [number, number, number],
  line: [210, 210, 210] as [number, number, number],
  bg: [245, 247, 250] as [number, number, number],
};

const PAGE_W = 210;
const PAGE_H = 297;
const ML = 20;
const MR = 20;
const CONTENT_W = PAGE_W - ML - MR;

function checkPage(doc: jsPDF, y: number, needed: number = 20): number {
  if (y + needed > PAGE_H - 20) {
    doc.addPage();
    return 25;
  }
  return y;
}

function drawSectionTitle(doc: jsPDF, title: string, y: number): number {
  y = checkPage(doc, y, 16);
  doc.setDrawColor(...COLORS.primary);
  doc.setLineWidth(0.6);
  doc.line(ML, y, ML + CONTENT_W, y);
  y += 6;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.primary);
  doc.text(title.toUpperCase(), ML, y);
  y += 6;
  return y;
}

function wrapText(doc: jsPDF, text: string, maxWidth: number): string[] {
  return doc.splitTextToSize(text, maxWidth);
}

export function generateProfilePDF(data: ProfilePDFData) {
  const doc = new jsPDF('p', 'mm', 'a4');

  // ── Header block ──
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, PAGE_W, 44, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(255, 255, 255);
  doc.text(data.fullName, ML, 20);

  if (data.area) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(200, 215, 240);
    doc.text(data.area, ML, 28);
  }

  const contactParts: string[] = [];
  if (data.city) contactParts.push(data.city);
  if (data.email) contactParts.push(data.email);
  if (data.whatsapp) contactParts.push(data.whatsapp);
  if (contactParts.length) {
    doc.setFontSize(9);
    doc.setTextColor(180, 200, 230);
    doc.text(contactParts.join('  •  '), ML, 36);
  }

  let linkLine: string[] = [];
  if (data.linkedinUrl) linkLine.push(`LinkedIn: ${data.linkedinUrl}`);
  if (data.githubUrl) linkLine.push(`GitHub: ${data.githubUrl}`);
  if (data.portfolioUrl) linkLine.push(`Portfólio: ${data.portfolioUrl}`);
  if (linkLine.length) {
    doc.setFontSize(8);
    doc.setTextColor(180, 200, 230);
    doc.text(linkLine.join('  |  '), ML, 42);
  }

  let y = 54;

  // ── Resumo ──
  if (data.bio?.trim() || data.professionalObjective?.trim()) {
    y = drawSectionTitle(doc, 'Resumo Profissional', y);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(...COLORS.dark);
    const txt = [data.professionalObjective, data.bio].filter(Boolean).join('\n\n');
    const lines = wrapText(doc, txt, CONTENT_W);
    for (const line of lines) {
      y = checkPage(doc, y, 5);
      doc.text(line, ML, y);
      y += 4.5;
    }
    y += 3;
  }

  // ── Competências ──
  if (data.skills.length) {
    y = drawSectionTitle(doc, 'Competências', y);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.dark);

    let xOff = ML;
    const chipH = 6;
    const chipPad = 3;
    const chipGap = 3;
    const rowGap = 2;
    y = checkPage(doc, y, chipH + rowGap);

    for (const sk of data.skills) {
      const label = `${sk.name} (${sk.level})`;
      const tw = doc.getTextWidth(label) + chipPad * 2;
      if (xOff + tw > ML + CONTENT_W) {
        xOff = ML;
        y += chipH + rowGap;
        y = checkPage(doc, y, chipH + rowGap);
      }
      doc.setFillColor(...COLORS.bg);
      doc.roundedRect(xOff, y - 4, tw, chipH, 1.5, 1.5, 'F');
      doc.text(label, xOff + chipPad, y);
      xOff += tw + chipGap;
    }
    y += chipH + 4;
  }

  // ── Soft Skills ──
  if (data.softSkills.length) {
    y = drawSectionTitle(doc, 'Soft Skills', y);
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.dark);
    for (const ss of data.softSkills) {
      y = checkPage(doc, y, 6);
      doc.setFont('helvetica', 'normal');
      doc.text(`${ss.name}`, ML, y);
      const barX = ML + 50;
      const barW = 40;
      doc.setFillColor(...COLORS.line);
      doc.roundedRect(barX, y - 3, barW, 3.5, 1, 1, 'F');
      doc.setFillColor(...COLORS.accent);
      doc.roundedRect(barX, y - 3, barW * (ss.rating / 5), 3.5, 1, 1, 'F');
      doc.setTextColor(...COLORS.medium);
      doc.text(`${ss.rating}/5`, barX + barW + 3, y);
      doc.setTextColor(...COLORS.dark);
      y += 6;
    }
    y += 3;
  }

  // ── Idiomas ──
  if (data.languages.length) {
    y = drawSectionTitle(doc, 'Idiomas', y);
    doc.setFontSize(9);
    for (const lang of data.languages) {
      y = checkPage(doc, y, 5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...COLORS.dark);
      doc.text(lang.name, ML, y);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...COLORS.medium);
      doc.text(` — ${lang.level}`, ML + doc.getTextWidth(lang.name), y);
      y += 5;
    }
    y += 3;
  }

  // ── Experiência ──
  if (data.experiences.length) {
    y = drawSectionTitle(doc, 'Experiência Profissional', y);
    for (const exp of data.experiences) {
      y = checkPage(doc, y, 18);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(...COLORS.dark);
      doc.text(exp.type, ML, y);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(...COLORS.accent);
      doc.text(exp.place, ML, y + 5);

      const period = `${exp.start_date}${exp.current ? ' — Presente' : exp.end_date ? ` — ${exp.end_date}` : ''}`;
      doc.setTextColor(...COLORS.light);
      doc.text(period, ML + CONTENT_W, y + 5, { align: 'right' });

      y += 10;
      if (exp.description?.trim()) {
        doc.setTextColor(...COLORS.dark);
        const descLines = wrapText(doc, exp.description, CONTENT_W - 4);
        for (const line of descLines) {
          y = checkPage(doc, y, 5);
          doc.text(line, ML + 2, y);
          y += 4.2;
        }
      }
      y += 4;
    }
  }

  // ── Formação ──
  if (data.education.length) {
    y = drawSectionTitle(doc, 'Formação Acadêmica', y);
    for (const edu of data.education) {
      y = checkPage(doc, y, 14);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(...COLORS.dark);
      doc.text(`${edu.level} — ${edu.course}`, ML, y);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(...COLORS.accent);
      doc.text(edu.institution, ML, y + 5);

      doc.setTextColor(...COLORS.light);
      doc.text(edu.current ? `${edu.year} — Cursando` : `${edu.year}`, ML + CONTENT_W, y + 5, { align: 'right' });

      y += 12;
    }
  }

  // ── Certificações ──
  if (data.certifications.length) {
    y = drawSectionTitle(doc, 'Certificações', y);
    for (const cert of data.certifications) {
      y = checkPage(doc, y, 10);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(...COLORS.dark);
      doc.text(cert.course, ML, y);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(...COLORS.medium);
      doc.text(`${cert.institution} • ${cert.hours}h • ${cert.completed_at}`, ML, y + 4.5);
      y += 10;
    }
  }

  // ── Footer ──
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(...COLORS.light);
    doc.text(`Banco de Talentos — Oriximiná`, ML, PAGE_H - 10);
    doc.text(`${i}/${pages}`, PAGE_W - MR, PAGE_H - 10, { align: 'right' });
  }

  doc.save('profile.pdf');
}
