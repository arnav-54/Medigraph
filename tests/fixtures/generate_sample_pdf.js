import fs from 'fs';
import path from 'path';

/**
 * Generates a valid synthetic PDF document containing clinical laboratory values.
 * Uses standard PDF 1.4 syntax with uncompressed text stream for deterministic testing.
 */
export function createSyntheticMedicalReportPDF(reportData = {}) {
  const patientName = reportData.patientName || 'Jane Doe';
  const dob = reportData.dob || '1985-04-12';
  const reportDate = reportData.reportDate || '2024-03-15';
  const provider = reportData.provider || 'METROPOLITAN HEALTH LABORATORY';

  const bodyContent = `
${provider}
CLINICAL LABORATORY REPORT - CONFIDENTIAL
Patient: ${patientName} | DOB: ${dob} | Collected: ${reportDate}

TEST NAME                RESULT    UNIT     REFERENCE RANGE    FLAG
-------------------------------------------------------------------
Hemoglobin              14.2      g/dL     12.0 - 16.0        NORMAL
Fasting Blood Glucose   118       mg/dL    70 - 99            HIGH
HbA1c                   5.9       %        4.0 - 5.6          HIGH
Serum Creatinine        0.95      mg/dL    0.60 - 1.20        NORMAL
Total Cholesterol       210       mg/dL    < 200              HIGH
HDL Cholesterol         55        mg/dL    > 40               NORMAL
LDL Cholesterol         132       mg/dL    < 100              HIGH

Notes: Fasting blood glucose and HbA1c slightly elevated. Recheck in 3 months.
Laboratory Director: Dr. S. Reynolds, MD (Synthetic Record)
`.trim();

  // Escape parentheses for PDF text stream
  const escapedText = bodyContent
    .split('\n')
    .map((line, idx) => `1 0 0 1 50 ${750 - idx * 16} Tm (${line.replace(/[()\\]/g, '\\$&')}) Tj`)
    .join('\n');

  const stream = `BT\n/F1 10 Tf\n${escapedText}\nET`;
  const streamLength = Buffer.byteLength(stream, 'utf-8');

  const pdf = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>
endobj
4 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
5 0 obj
<< /Length ${streamLength} >>
stream
${stream}
endstream
endobj
xref
0 6
0000000000 65535 f 
0000000010 00000 n 
0000000060 00000 n 
0000000117 00000 n 
0000000234 00000 n 
0000000307 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
${400 + streamLength}
%%EOF`;

  return Buffer.from(pdf, 'utf-8');
}

// If run directly, create sample file in tests/fixtures
if (process.argv[1] && process.argv[1].endsWith('generate_sample_pdf.js')) {
  const buf = createSyntheticMedicalReportPDF();
  const targetDir = path.resolve('tests/fixtures');
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  const targetPath = path.join(targetDir, 'sample_lab_report.pdf');
  fs.writeFileSync(targetPath, buf);
  console.log(`Created synthetic test fixture at ${targetPath} (${buf.length} bytes)`);
}

