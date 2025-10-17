export function generateFiveDigitCode(): string {
  const cryptoObj = globalThis.crypto as Crypto | undefined;

  if (cryptoObj?.getRandomValues) {
    const buf = new Uint32Array(1);
    cryptoObj.getRandomValues(buf);
    return String(buf[0] % 100_000).padStart(5, "0");
  }

  // Fallback for non-browser tests
  return String(Math.floor(Math.random() * 100_000)).padStart(5, "0");
}
