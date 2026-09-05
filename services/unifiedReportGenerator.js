/**
 * Générateur du RAPPORT UNIFIÉ DES SERVICES (.docx)
 * ---------------------------------------------------
 * Génère un document Word (.docx) sous forme de Buffer
 * à partir d'un objet de données agrégées pour une date donnée.
 */

import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  WidthType,
  ShadingType,
  Footer,
  PageOrientation,
  VerticalAlign,
  PageNumber,
} from 'docx';

// ---------- Palette (reprise du rapport existant) ----------
const COLOR_TITLE = '1F3864';
const COLOR_SECTION = '2E74B5';
const COLOR_SUBLABEL = '1B5583';
const COLOR_TABLE_HEADER_FILL = '2F5496';
const COLOR_TOTAL_FILL = 'D9E2F3';
const COLOR_BAND_FILL = 'F7F9FA';
const FONT = 'Calibri';

// ---------- Helpers de style ----------

function sectionTitle(numeral, text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 300, after: 200 },
    border: {
      bottom: { color: COLOR_SECTION, space: 4, style: BorderStyle.SINGLE, size: 6 },
    },
    children: [
      new TextRun({ text: `${numeral}.  ${text}`, color: COLOR_SECTION, bold: false, size: 30, font: FONT }),
    ],
  });
}

function subLabel(text) {
  return new Paragraph({
    spacing: { before: 200, after: 60 },
    children: [new TextRun({ text, bold: true, color: COLOR_SUBLABEL, size: 22, font: FONT })],
  });
}

function bodyText(text, opts = {}) {
  return new Paragraph({
    spacing: { after: 120 },
    children: [new TextRun({ text, font: FONT, size: 21, ...opts })],
  });
}

function multilineBody(text) {
  const lines = (text || '').split('\n');
  const runs = [];
  lines.forEach((line, i) => {
    const boldMatch = line.match(/^([^:]+:)(.*)$/);
    if (boldMatch) {
      runs.push(new TextRun({ text: boldMatch[1], bold: true, font: FONT, size: 20 }));
      runs.push(new TextRun({ text: boldMatch[2], font: FONT, size: 20 }));
    } else {
      runs.push(new TextRun({ text: line, font: FONT, size: 20 }));
    }
    if (i < lines.length - 1) runs.push(new TextRun({ text: '', break: 1 }));
  });
  return new Paragraph({ spacing: { after: 60 }, children: runs });
}

function headerCell(text, widthDXA) {
  return new TableCell({
    width: { size: widthDXA, type: WidthType.DXA },
    shading: { type: ShadingType.CLEAR, fill: COLOR_TABLE_HEADER_FILL, color: 'auto' },
    verticalAlign: VerticalAlign.CENTER,
    margins: { top: 80, bottom: 80, left: 80, right: 80 },
    children: [new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text, bold: true, color: 'FFFFFF', font: FONT, size: 19 })],
    })],
  });
}

function dataCell(content, widthDXA, opts = {}) {
  const paragraphs = Array.isArray(content) ? content : [
    new Paragraph({
      alignment: opts.center ? AlignmentType.CENTER : AlignmentType.LEFT,
      children: [new TextRun({ text: String(content ?? ''), font: FONT, size: 19, bold: !!opts.bold })],
    }),
  ];
  return new TableCell({
    width: { size: widthDXA, type: WidthType.DXA },
    shading: opts.fill ? { type: ShadingType.CLEAR, fill: opts.fill, color: 'auto' } : undefined,
    verticalAlign: VerticalAlign.CENTER,
    margins: { top: 60, bottom: 60, left: 80, right: 80 },
    children: paragraphs,
  });
}

// ---------- Construction du document ----------

function buildSupportClientSection(sc) {
  const children = [sectionTitle('I', sc.title || 'Support Client - Kinshasa')];
  if (!sc.hasData || !sc.agents || sc.agents.length === 0) {
    children.push(bodyText('Aucune donnée validée pour cette date.'));
    return children;
  }

  const totalsCols = [2500, 2500, 2500, 2900]; // somme = 10400 (portrait usable width)
  const totalsHeader = new TableRow({
    children: [
      headerCell('Demandes de Souscription', totalsCols[0]),
      headerCell('Questions Diverses', totalsCols[1]),
      headerCell('Mails traités', totalsCols[2]),
      headerCell('Dossiers en attente de régularisation', totalsCols[3]),
    ],
  });
  const totalsRow = new TableRow({
    children: [
      dataCell(sc.demandesSouscription ?? 0, totalsCols[0], { center: true }),
      dataCell(sc.questionsDiverses ?? 0, totalsCols[1], { center: true }),
      dataCell(sc.mailsTraites ?? 0, totalsCols[2], { center: true }),
      dataCell(sc.attenteRegularisation ?? 0, totalsCols[3], { center: true }),
    ],
  });

  const dossiersCols = [5200, 5200];
  const dossiersTable = new Table({
    width: { size: 10400, type: WidthType.DXA },
    columnWidths: dossiersCols,
    rows: [
      new TableRow({ children: [headerCell('Dossiers en cours', dossiersCols[0]), headerCell('Dossiers saisis', dossiersCols[1])] }),
      new TableRow({ children: [dataCell(sc.dossiersEnCours ?? 0, dossiersCols[0], { center: true }), dataCell(sc.dossiersSaisis ?? 0, dossiersCols[1], { center: true })] }),
    ],
  });

  const agentCols = [1400, 1300, 1300, 1300, 1300, 1300, 1300, 1200];
  const agentHeader = new TableRow({
    children: [
      headerCell('Agent', agentCols[0]),
      headerCell('Demandes Souscription', agentCols[1]),
      headerCell('Questions Diverses', agentCols[2]),
      headerCell('Mails Traités', agentCols[3]),
      headerCell('Attente Régularisation', agentCols[4]),
      headerCell('Dossiers Assignés', agentCols[5]),
      headerCell('Dossiers en Cours', agentCols[6]),
      headerCell('Dossiers Saisis / Traités', agentCols[7]),
    ],
  });
  const agentRows = (sc.agents || []).map((a, i) => new TableRow({
    children: [
      dataCell(a.nom, agentCols[0], { bold: true, fill: i % 2 ? COLOR_BAND_FILL : undefined }),
      dataCell(a.demandes ?? 0, agentCols[1], { center: true, fill: i % 2 ? COLOR_BAND_FILL : undefined }),
      dataCell(a.questions ?? 0, agentCols[2], { center: true, fill: i % 2 ? COLOR_BAND_FILL : undefined }),
      dataCell(a.mailsTraites ?? 0, agentCols[3], { center: true, fill: i % 2 ? COLOR_BAND_FILL : undefined }),
      dataCell(a.attente ?? 0, agentCols[4], { center: true, fill: i % 2 ? COLOR_BAND_FILL : undefined }),
      dataCell(a.assignes ?? 0, agentCols[5], { center: true, fill: i % 2 ? COLOR_BAND_FILL : undefined }),
      dataCell(a.enCours ?? 0, agentCols[6], { center: true, fill: i % 2 ? COLOR_BAND_FILL : undefined }),
      dataCell(a.saisis ?? 0, agentCols[7], { center: true, fill: i % 2 ? COLOR_BAND_FILL : undefined }),
    ],
  }));

  children.push(
    subLabel('1. Mails Reçus'),
    bodyText(`Nombre total de mails reçus : ${sc.mailsTotal ?? 0}`, { bold: true }),
    new Table({ width: { size: 10400, type: WidthType.DXA }, columnWidths: totalsCols, rows: [totalsHeader, totalsRow] }),
    subLabel('2. Dossiers Assignés'),
    bodyText(`Nombre total de dossiers assignés : ${sc.dossiersAssignesTotal ?? 0}`, { bold: true }),
    dossiersTable,
    subLabel('Détail des activités par Agent :'),
    new Table({ width: { size: 10400, type: WidthType.DXA }, columnWidths: agentCols, rows: [agentHeader, ...agentRows] }),
    subLabel('3. DÉFIS RENCONTRÉS'),
    bodyText(sc.defisRencontres || 'Aucun.', { bold: true }),
    subLabel('4. OBSERVATIONS'),
    bodyText(sc.observations || 'Aucune.'),
  );

  return children;
}

function buildIndividualSections(rapports, startNumeral) {
  const out = [];
  (rapports || []).forEach((r, idx) => {
    const numeral = toRoman(startNumeral + idx);
    out.push(sectionTitle(numeral, r.note ? `${r.titre} [${r.note}]` : r.titre));
    out.push(bodyText(r.contenu));
  });
  return out;
}

function buildControleurSection(ctrl, numeral) {
  const titleText = ctrl.title || 'Contrôleur — Kinshasa';
  if (!ctrl.hasData || !ctrl.agents || ctrl.agents.length === 0) {
    return {
      heading: sectionTitle(numeral, titleText),
      content: [bodyText('Aucune donnée validée pour cette date.')],
    };
  }

  const cols = [750, 1500, 950, 950, 900, 900, 950, 950, 850, 4800]; // somme ~13500 (landscape usable width)
  const header = new TableRow({
    children: [
      headerCell('Heure', cols[0]),
      headerCell('Nom du contrôleur', cols[1]),
      headerCell('Assignés', cols[2]),
      headerCell('Contrôlés', cols[3]),
      headerCell('En attente', cols[4]),
      headerCell('ETA antérieure', cols[5]),
      headerCell('Sans n° déclaration', cols[6]),
      headerCell('Sans pièces jointes', cols[7]),
      headerCell('Validés', cols[8]),
      headerCell('Remarques', cols[9]),
    ],
  });

  const totals = ctrl.agents.reduce((acc, a) => ({
    assignes: acc.assignes + (Number(a.assignes) || 0),
    controles: acc.controles + (Number(a.controles) || 0),
    enAttente: acc.enAttente + (Number(a.enAttente) || 0),
    etaAnterieure: acc.etaAnterieure + (Number(a.etaAnterieure) || 0),
    sansDeclaration: acc.sansDeclaration + (Number(a.sansDeclaration) || 0),
    sansPieces: acc.sansPieces + (Number(a.sansPieces) || 0),
    valides: acc.valides + (Number(a.valides) || 0),
  }), { assignes: 0, controles: 0, enAttente: 0, etaAnterieure: 0, sansDeclaration: 0, sansPieces: 0, valides: 0 });

  const rows = ctrl.agents.map((a) => new TableRow({
    children: [
      dataCell(a.heure || '--:--', cols[0], { center: true }),
      dataCell(a.nom, cols[1], { bold: true }),
      dataCell(a.assignes ?? 0, cols[2], { center: true }),
      dataCell(a.controles ?? 0, cols[3], { center: true }),
      dataCell(a.enAttente ?? 0, cols[4], { center: true }),
      dataCell(a.etaAnterieure ?? 0, cols[5], { center: true }),
      dataCell(a.sansDeclaration ?? 0, cols[6], { center: true }),
      dataCell(a.sansPieces ?? 0, cols[7], { center: true }),
      dataCell(a.valides ?? 0, cols[8], { center: true }),
      dataCell([multilineBody(a.remarque || '')], cols[9]),
    ],
  }));

  const totalRow = new TableRow({
    children: [
      dataCell('TOTAL', cols[0], { bold: true, fill: COLOR_TOTAL_FILL }),
      dataCell('', cols[1], { fill: COLOR_TOTAL_FILL }),
      dataCell(totals.assignes, cols[2], { center: true, bold: true, fill: COLOR_TOTAL_FILL }),
      dataCell(totals.controles, cols[3], { center: true, bold: true, fill: COLOR_TOTAL_FILL }),
      dataCell(totals.enAttente, cols[4], { center: true, bold: true, fill: COLOR_TOTAL_FILL }),
      dataCell(totals.etaAnterieure, cols[5], { center: true, bold: true, fill: COLOR_TOTAL_FILL }),
      dataCell(totals.sansDeclaration, cols[6], { center: true, bold: true, fill: COLOR_TOTAL_FILL }),
      dataCell(totals.sansPieces, cols[7], { center: true, bold: true, fill: COLOR_TOTAL_FILL }),
      dataCell(totals.valides, cols[8], { center: true, bold: true, fill: COLOR_TOTAL_FILL }),
      dataCell('', cols[9], { fill: COLOR_TOTAL_FILL }),
    ],
  });

  return {
    heading: sectionTitle(numeral, titleText),
    content: [new Table({ width: { size: 13500, type: WidthType.DXA }, columnWidths: cols, rows: [header, ...rows, totalRow] })],
  };
}

function buildOperateurSection(op, numeral) {
  const children = [sectionTitle(numeral, op.title || 'Opérateurs de Saisie - Kinshasa')];
  if (!op.hasData || !op.agents || op.agents.length === 0) {
    children.push(bodyText('Aucune donnée validée pour cette date.'));
    return children;
  }
  children.push(subLabel('Activité du jour'));
  children.push(bodyText(`Dossiers reçus : ${op.dossiersRecus ?? 0}  |  Traités : ${op.dossiersTraites ?? 0}  |  Restants : ${op.dossiersRestants ?? 0}`, { bold: true }));

  const cols = [3000, 2500, 2500, 2400];
  const header = new TableRow({
    children: [headerCell('Agent', cols[0]), headerCell('Dossiers reçus', cols[1]), headerCell('Dossiers traités', cols[2]), headerCell('Dossiers restants', cols[3])],
  });
  const rows = op.agents.map((a, i) => new TableRow({
    children: [
      dataCell(a.nom, cols[0], { bold: true, fill: i % 2 ? COLOR_BAND_FILL : undefined }),
      dataCell(a.recus ?? 0, cols[1], { center: true, fill: i % 2 ? COLOR_BAND_FILL : undefined }),
      dataCell(a.traites ?? 0, cols[2], { center: true, fill: i % 2 ? COLOR_BAND_FILL : undefined }),
      dataCell(a.restants ?? 0, cols[3], { center: true, fill: i % 2 ? COLOR_BAND_FILL : undefined }),
    ],
  }));
  children.push(new Table({ width: { size: 10400, type: WidthType.DXA }, columnWidths: cols, rows: [header, ...rows] }));
  if (op.observations) {
    children.push(subLabel('Observations'));
    children.push(bodyText(op.observations));
  }
  return children;
}

function toRoman(n) {
  const map = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
  return map[n - 1] || String(n);
}

/**
 * Génère le document Word (.docx) du rapport unifié.
 *
 * @param {object} reportData Données consolidées de la journée
 * @returns {Promise<Buffer>} Buffer du fichier .docx
 */
export async function generateUnifiedReport(reportData) {
  const d = reportData;

  const titlePage = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 60 },
      children: [new TextRun({ text: 'RAPPORT UNIFIÉ DES SERVICES', bold: true, color: COLOR_TITLE, size: 40, font: FONT })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 300 },
      children: [new TextRun({ text: d.dateLabel || '', italics: true, size: 22, font: FONT })],
    }),
  ];

  const scSection = buildSupportClientSection(d.supportClient || { hasData: false });
  let numeral = 2;
  const individualSections = buildIndividualSections(d.rapportsIndividuels || [], numeral);
  numeral += (d.rapportsIndividuels || []).length;

  const ctrlBuilt = buildControleurSection(d.controleur || { hasData: false }, toRoman(numeral));
  numeral += 1;

  const opSection = buildOperateurSection(d.operateurSaisie || { hasData: false }, toRoman(numeral));

  const doc = new Document({
    styles: {
      default: { document: { run: { font: FONT, size: 21 } } },
    },
    sections: [
      {
        properties: {
          page: { size: { width: 11906, height: 16838 }, margin: { top: 900, bottom: 900, left: 1000, right: 1000 } },
        },
        footers: {
          default: new Footer({
            children: [new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ children: [PageNumber.CURRENT], size: 18, color: '888888' })],
            })],
          }),
        },
        children: [...titlePage, ...scSection, ...individualSections],
      },
      {
        properties: {
          page: {
            size: { width: 11906, height: 16838, orientation: PageOrientation.LANDSCAPE },
            margin: { top: 700, bottom: 700, left: 700, right: 700 },
          },
        },
        children: [ctrlBuilt.heading, ...ctrlBuilt.content],
      },
      {
        properties: {
          page: { size: { width: 11906, height: 16838 }, margin: { top: 900, bottom: 900, left: 1000, right: 1000 } },
        },
        children: [...opSection],
      },
    ],
  });

  return Packer.toBuffer(doc);
}

export default generateUnifiedReport;
