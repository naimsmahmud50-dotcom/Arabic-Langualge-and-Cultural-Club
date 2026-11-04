import { chromium } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generatePresentationPDF() {
  const htmlPath = path.resolve(__dirname, '../docs/presentation.html');
  const targetDir = '/home/mahmud-hasan/Downloads';
  const targetPdf = path.join(targetDir, 'Arabic_Club_Project_Presentation.pdf');

  if (!fs.existsSync(htmlPath)) {
    console.error(`Error: HTML presentation file not found at ${htmlPath}`);
    process.exit(1);
  }

  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  console.log(`Loading presentation from: file://${htmlPath}`);
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 }
  });

  // Navigate to local file
  await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle' });

  // Generate crisp presentation PDF in 16:9 / Landscape format
  console.log(`Generating presentation PDF to: ${targetPdf}...`);
  await page.pdf({
    path: targetPdf,
    printBackground: true,
    format: 'A4',
    landscape: true,
    margin: {
      top: '0mm',
      right: '0mm',
      bottom: '0mm',
      left: '0mm'
    },
    preferCSSPageSize: true
  });

  await browser.close();

  const stats = fs.statSync(targetPdf);
  console.log(`SUCCESS! Presentation PDF created successfully!`);
  console.log(`File: ${targetPdf}`);
  console.log(`Size: ${(stats.size / 1024).toFixed(1)} KB`);
}

generatePresentationPDF().catch((err) => {
  console.error('Failed to generate PDF:', err);
  process.exit(1);
});
