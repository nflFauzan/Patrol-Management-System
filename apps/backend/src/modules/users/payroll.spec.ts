/**
 * Payroll Calculation Unit Tests
 * Tests pure business-logic payroll formulas used for HRIS/Payroll module.
 * No DB / NestJS context needed — pure arithmetic.
 */

/** Minimal user payroll profile shape */
interface PayrollProfile {
  gajiPokok: number | null;
  tunjangan: number | null;
  lemburPerJam: number | null;
  potonganBpjs: number | null;
  potonganAlpa: number | null;
  potonganLupaAbsen: number | null;
  jamLembur?: number | null;
  hariKerja?: number | null;
}

/**
 * Replicates the payroll formula used in the backend:
 *   gajiBruto = gajiPokok + tunjangan + (jamLembur * lemburPerJam)
 *   gajiNetto = gajiBruto - (potonganBpjs + potonganAlpa + potonganLupaAbsen)
 *   gajiNetto  = Math.max(0, gajiNetto)
 */
function calculatePayroll(profile: PayrollProfile): {
  gajiBruto: number;
  gajiNetto: number;
} {
  const gajiPokok = Number(profile.gajiPokok ?? 0);
  const tunjangan = Number(profile.tunjangan ?? 0);
  const lemburPerJam = Number(profile.lemburPerJam ?? 0);
  const jamLembur = Number(profile.jamLembur ?? 0);
  const potonganBpjs = Number(profile.potonganBpjs ?? 0);
  const potonganAlpa = Number(profile.potonganAlpa ?? 0);
  const potonganLupaAbsen = Number(profile.potonganLupaAbsen ?? 0);
  const hariKerja = Number(profile.hariKerja ?? 0);

  // If personnel has 0 working days → no salary
  if (hariKerja === 0 && profile.hariKerja !== undefined && profile.hariKerja !== null) {
    return { gajiBruto: 0, gajiNetto: 0 };
  }

  const gajiBruto = gajiPokok + tunjangan + jamLembur * lemburPerJam;
  const totalPotongan = potonganBpjs + potonganAlpa + potonganLupaAbsen;
  const gajiNetto = Math.max(0, gajiBruto - totalPotongan);

  return { gajiBruto, gajiNetto };
}

describe('Payroll Calculation Formula (HRIS Payroll Engine)', () => {
  describe('TC-PAY-01: Gaji Bruto Calculation', () => {
    it('bruto = gajiPokok + tunjangan + (jamLembur × lemburPerJam)', () => {
      const result = calculatePayroll({
        gajiPokok: 4_500_000,
        tunjangan: 500_000,
        lemburPerJam: 30_000,
        jamLembur: 5,
        potonganBpjs: 0,
        potonganAlpa: 0,
        potonganLupaAbsen: 0,
      });

      // 4_500_000 + 500_000 + (5 × 30_000) = 5_150_000
      expect(result.gajiBruto).toBe(5_150_000);
    });

    it('bruto = gajiPokok + tunjangan when no overtime', () => {
      const result = calculatePayroll({
        gajiPokok: 3_000_000,
        tunjangan: 400_000,
        lemburPerJam: 25_000,
        jamLembur: 0,
        potonganBpjs: 0,
        potonganAlpa: 0,
        potonganLupaAbsen: 0,
      });

      expect(result.gajiBruto).toBe(3_400_000);
    });
  });

  describe('TC-PAY-02: Gaji Netto Calculation', () => {
    it('netto = bruto - (potonganBpjs + potonganAlpa + potonganLupaAbsen)', () => {
      const result = calculatePayroll({
        gajiPokok: 4_500_000,
        tunjangan: 500_000,
        lemburPerJam: 30_000,
        jamLembur: 5,
        potonganBpjs: 100_000,
        potonganAlpa: 150_000,
        potonganLupaAbsen: 50_000,
      });

      // bruto = 5_150_000
      // total potongan = 300_000
      // netto = 4_850_000
      expect(result.gajiNetto).toBe(4_850_000);
    });

    it('netto includes all three potongan types correctly', () => {
      const result = calculatePayroll({
        gajiPokok: 3_000_000,
        tunjangan: 0,
        lemburPerJam: 0,
        jamLembur: 0,
        potonganBpjs: 60_000,
        potonganAlpa: 200_000,
        potonganLupaAbsen: 50_000,
      });

      // bruto = 3_000_000; potongan total = 310_000; netto = 2_690_000
      expect(result.gajiNetto).toBe(2_690_000);
    });
  });

  describe('TC-PAY-03: Gaji Tidak Boleh Negatif', () => {
    it('gaji netto minimum = 0 (Math.max guard) when deductions exceed bruto', () => {
      const result = calculatePayroll({
        gajiPokok: 500_000,
        tunjangan: 0,
        lemburPerJam: 0,
        jamLembur: 0,
        potonganBpjs: 100_000,
        potonganAlpa: 300_000,
        potonganLupaAbsen: 200_000,
      });

      // bruto = 500_000; deductions = 600_000 → netto would be -100_000 → clamped to 0
      expect(result.gajiNetto).toBe(0);
    });
  });

  describe('TC-PAY-04: Personil 0 Hari Kerja', () => {
    it('personil dengan 0 hari kerja → gaji = 0', () => {
      const result = calculatePayroll({
        gajiPokok: 4_500_000,
        tunjangan: 500_000,
        lemburPerJam: 30_000,
        jamLembur: 0,
        potonganBpjs: 100_000,
        potonganAlpa: 0,
        potonganLupaAbsen: 0,
        hariKerja: 0,
      });

      expect(result.gajiBruto).toBe(0);
      expect(result.gajiNetto).toBe(0);
    });
  });

  describe('TC-PAY-05: Semua Field Null → Pakai Default 0 (Tidak NaN)', () => {
    it('all null fields → gajiBruto = 0, gajiNetto = 0, NOT NaN', () => {
      const result = calculatePayroll({
        gajiPokok: null,
        tunjangan: null,
        lemburPerJam: null,
        jamLembur: null,
        potonganBpjs: null,
        potonganAlpa: null,
        potonganLupaAbsen: null,
      });

      expect(isNaN(result.gajiBruto)).toBe(false);
      expect(isNaN(result.gajiNetto)).toBe(false);
      expect(result.gajiBruto).toBe(0);
      expect(result.gajiNetto).toBe(0);
    });

    it('undefined/null lemburPerJam with hours → no NaN', () => {
      const result = calculatePayroll({
        gajiPokok: 3_000_000,
        tunjangan: null,
        lemburPerJam: null,
        jamLembur: 10,   // hours exist but rate is null → 0
        potonganBpjs: null,
        potonganAlpa: null,
        potonganLupaAbsen: null,
      });

      expect(isNaN(result.gajiBruto)).toBe(false);
      expect(result.gajiBruto).toBe(3_000_000); // 3M + 0 + (10 × 0)
    });
  });
});
