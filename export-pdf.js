import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

async function generatePDF() {
  const reportPath = path.resolve('./playwright-report/index.html');
  let outputPath = path.resolve('./Laporan_Pengujian_NovaVault.pdf');

  if (!fs.existsSync(reportPath)) {
    console.error('❌ File playwright-report/index.html belum ada. Jalankan "npx playwright test" terlebih dahulu.');
    return;
  }

  console.log('📄 Mengonversi Laporan Playwright menjadi PDF...');
  
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
  } catch {
    browser = await chromium.launch({ channel: 'chrome', headless: true });
  }

  const page = await browser.newPage();
  await page.goto(`file://${reportPath}`, { waitUntil: 'networkidle' });

  // Tunggu elemen dashboard render sempurna
  await page.waitForTimeout(1000);

  try {
    // Simpan ke PDF format A4
    await page.pdf({
      path: outputPath,
      format: 'A4',
      printBackground: true,
      margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' }
    });
  } catch (err) {
    if (err.code === 'EBUSY') {
      // Jika file utama sedang dibuka/dikunci di editor, simpan ke nama alternatif
      outputPath = path.resolve('./Laporan_Pengujian_NovaVault_Updated.pdf');
      await page.pdf({
        path: outputPath,
        format: 'A4',
        printBackground: true,
        margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' }
      });
    } else {
      throw err;
    }
  }

  await browser.close();
  console.log(`🎉 Berhasil! File PDF laporan tersimpan di:\n👉 ${outputPath}`);
}

generatePDF();
