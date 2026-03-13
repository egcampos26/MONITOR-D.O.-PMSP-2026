
export const normalizeString = (str: string): string => {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .toUpperCase()
    .replace(/\s+/g, ' ') // Transforma múltiplos espaços em um só
    .trim();
};

export const normalizeRf = (rf: string): string => {
  if (!rf) return '';
  return rf.replace(/\D/g, ''); // Mantém apenas números
};

export const getLevenshteinDistance = (a: string, b: string): number => {
  const tmp = [];
  let i, j, res;
  const alen = a.length;
  const blen = b.length;
  if (alen === 0) return blen;
  if (blen === 0) return alen;
  for (i = 0; i <= alen; i++) tmp[i] = [i];
  for (j = 0; j <= blen; j++) tmp[0][j] = j;
  for (i = 1; i <= alen; i++) {
    for (j = 1; j <= blen; j++) {
      res = a.charAt(i - 1) === b.charAt(j - 1) ? 0 : 1;
      tmp[i][j] = Math.min(tmp[i - 1][j] + 1, tmp[i][j - 1] + 1, tmp[i - 1][j - 1] + res);
    }
  }
  return tmp[alen][blen];
};

export const isNear = (text: string, term1: string, term2: string, maxDist: number = 100): boolean => {
  const t = normalizeString(text);
  const n1 = normalizeString(term1);
  const n2 = normalizeString(term2);
  
  if (!n1 || !n2) return false;
  
  const p1 = t.indexOf(n1);
  const p2 = t.indexOf(n2);
  
  if (p1 === -1 || p2 === -1) return false;
  return Math.abs(p1 - p2) <= maxDist;
};
