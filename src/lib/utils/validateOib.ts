// src/lib/utils/validateOib.ts

export function validateOib(oib: string): boolean {
  if (!/^\d{11}$/.test(oib)) return false;

  let d = 10;
  for (let i = 0; i < 10; i++) {
    d = d + parseInt(oib[i]);
    d = d % 10;
    if (d === 0) d = 10;
    d = (d * 2) % 11;
  }

  const kontrolni = 11 - d === 10 ? 0 : 11 - d;
  return kontrolni === parseInt(oib[10]);
}
