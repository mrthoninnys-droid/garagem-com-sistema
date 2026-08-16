export interface PrinterConfig {
  paperWidth: '58mm' | '80mm' | 'A4';
  fontSize: 'small' | 'medium' | 'large';
  autoCut: boolean;
  copies: number;
  printerName?: string;
}

const STORAGE_PRINTER = 'garagem_printer_config';

export const DEFAULT_PRINTER_CONFIG: PrinterConfig = {
  paperWidth: '80mm',
  fontSize: 'medium',
  autoCut: true,
  copies: 1,
  printerName: 'Impressora Térmica Padrão',
};

export function getPrinterConfig(): PrinterConfig {
  if (typeof window === 'undefined') return DEFAULT_PRINTER_CONFIG;
  const saved = localStorage.getItem(STORAGE_PRINTER);
  if (!saved) return DEFAULT_PRINTER_CONFIG;
  try {
    return { ...DEFAULT_PRINTER_CONFIG, ...JSON.parse(saved) };
  } catch {
    return DEFAULT_PRINTER_CONFIG;
  }
}

export function savePrinterConfig(config: PrinterConfig) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_PRINTER, JSON.stringify(config));
  }
}