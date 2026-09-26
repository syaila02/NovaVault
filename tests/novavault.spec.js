import { test, expect } from '@playwright/test';

test.describe('NovaVault Cryptographic Test Suite', () => {

  test.beforeEach(async ({ page }) => {
    // Membuka aplikasi secara otomatis
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('TC-01: Validasi Password Minimum (< 6 Karakter)', async ({ page }) => {
    // 1. Masukkan password lemah di bawah 6 karakter
    await page.fill('input[placeholder="Masukkan kata sandi rahasia..."]', '12345');

    // 2. Masukkan plaintext
    await page.fill('textarea', 'Percobaan password tidak memenuhi syarat');

    // 3. Klik tombol proses enkripsi
    await page.locator('form > button.w-full').click();

    // 4. Verifikasi munculnya pesan error validasi password
    const errorAlert = page.locator('text=Password minimal 6 karakter.');
    await expect(errorAlert).toBeVisible();
  });

  test('TC-02: Enkripsi Teks Normal (AES-256-GCM + PBKDF2)', async ({ page }) => {
    // 1. Masukkan password valid >= 6 karakter
    await page.fill('input[placeholder="Masukkan kata sandi rahasia..."]', 'KunciRahasia123!');

    // 2. Masukkan plaintext rahasia
    const secretText = 'Pesan Rahasia Proyek Keamanan Informasi NovaVault 2026';
    await page.fill('textarea', secretText);

    // 3. Jalankan proses enkripsi
    await page.locator('form > button.w-full').click();

    // 4. Tunggu hasil enkripsi JSON muncul
    const outputCode = page.locator('code');
    await expect(outputCode).toBeVisible();

    const outputText = await outputCode.innerText();
    const parsedData = JSON.parse(outputText);

    // 5. Verifikasi atribut paket kriptografi
    expect(parsedData.algorithm).toBe('AES-256-GCM');
    expect(parsedData.kdf).toBe('PBKDF2-SHA256');
    expect(parsedData.iterations).toBe(600000);
    expect(parsedData.salt).toBeTruthy();
    expect(parsedData.iv).toBeTruthy();
    expect(parsedData.ciphertext).toBeTruthy();

    // Simpan screenshot bukti TC-02 otomatis
    await page.screenshot({ path: 'bukti_pengujian/bukti_TC02_enkripsi_sukses.png', fullPage: true });
  });

  test('TC-03: Dekripsi Teks dengan Password Benar', async ({ page }) => {
    const password = 'KunciRahasia123!';
    const secretMessage = 'Data sensitif keamanan informasi berhasil dipulihkan.';

    // 1. Enkripsi pesan terlebih dahulu
    await page.fill('input[placeholder="Masukkan kata sandi rahasia..."]', password);
    await page.fill('textarea', secretMessage);
    await page.locator('form > button.w-full').click();

    const outputCode = page.locator('code');
    await expect(outputCode).toBeVisible();
    const ciphertextPackage = await outputCode.innerText();

    // 2. Pindah ke tab Dekripsi Cipherteks
    await page.locator('header button:has-text("Dekripsi Cipherteks")').click();
    await page.waitForTimeout(400);

    // 3. Masukkan password yang sama dan ciphertext yang dihasilkan
    await page.fill('input[placeholder="Masukkan kata sandi rahasia..."]', password);
    await page.fill('textarea', ciphertextPackage);

    // 4. Klik tombol proses dekripsi
    await page.locator('form > button.w-full').click();

    // 5. Verifikasi bahwa plaintext asli kembali utuh
    await expect(outputCode).toHaveText(secretMessage);
  });

  test('TC-04: Dekripsi Teks dengan Password Salah (Uji Integritas)', async ({ page }) => {
    const correctPassword = 'KunciRahasia123!';
    const wrongPassword = 'PasswordSalahTotal999!';

    // 1. Enkripsi pesan
    await page.fill('input[placeholder="Masukkan kata sandi rahasia..."]', correctPassword);
    await page.fill('textarea', 'Pesan rahasia untuk uji kegagalan password');
    await page.locator('form > button.w-full').click();

    const outputCode = page.locator('code');
    await expect(outputCode).toBeVisible();
    const ciphertextPackage = await outputCode.innerText();

    // 2. Beralih ke tab Dekripsi
    await page.locator('header button:has-text("Dekripsi Cipherteks")').click();
    await page.waitForTimeout(400);

    // 3. Masukkan password SALAH
    await page.fill('input[placeholder="Masukkan kata sandi rahasia..."]', wrongPassword);
    await page.fill('textarea', ciphertextPackage);

    // 4. Klik tombol proses dekripsi
    await page.locator('form > button.w-full').click();

    // 5. Verifikasi sistem menolak dekripsi dan menampilkan pesan kesalahan integritas
    const errorAlert = page.locator('text=Dekripsi gagal. Password salah atau data telah diubah.');
    await expect(errorAlert).toBeVisible();

    // Simpan screenshot bukti TC-04 otomatis
    await page.screenshot({ path: 'bukti_pengujian/bukti_TC04_dekripsi_password_salah.png', fullPage: true });
  });

  test('TC-05: Visualisasi Enkripsi Citra (Mode ECB vs Mode Aman GCM)', async ({ page }) => {
    // 1. Pindah ke tab "Visualizer Citra (ECB vs GCM)"
    await page.locator('header button:has-text("Visualizer Citra")').click();
    await page.waitForTimeout(500);

    // 2. Verifikasi tombol preset Tux Penguin tersedia dan aktifkan
    const tuxBtn = page.locator('button:has-text("Sampel Tux Penguin")');
    await expect(tuxBtn).toBeVisible();
    await tuxBtn.click();

    // 3. Jalankan tombol proses enkripsi citra
    const runBtn = page.locator('button:has-text("JALANKAN ENKRIPSI CITRA")');
    await expect(runBtn).toBeVisible();
    await runBtn.click();

    // 4. Tunggu proses selesai
    await page.waitForTimeout(1000);

    // 5. Simpan screenshot bukti pengujian visual citra ECB vs GCM
    await page.screenshot({ path: 'bukti_pengujian/bukti_TC05_visualizer_citra_ecb_vs_gcm.png', fullPage: true });
  });

});
