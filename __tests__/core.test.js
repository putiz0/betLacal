jest.mock('playwright', () => ({
  chromium: { launch: jest.fn() },
}));

describe('Scraper - decimalOdd', () => {
  const mod = require('../scrape-placar');

  test('decimalOdd deve retornar numero valido', () => {
    const odd = mod.decimalOdd(12345);
    expect(odd).toBeGreaterThanOrEqual(1.01);
    expect(odd).toBeLessThanOrEqual(10);
  });

  test('decimalOdd deve ser deterministico', () => {
    const odd1 = mod.decimalOdd(42);
    const odd2 = mod.decimalOdd(42);
    expect(odd1).toBe(odd2);
  });

  test('decimalOdd com seed diferente deve gerar odds diferentes', () => {
    const odd1 = mod.decimalOdd(1);
    const odd2 = mod.decimalOdd(2);
    expect(odd1).not.toBe(odd2);
  });
});

describe('Scraper - reduceOdd', () => {
  const mod = require('../scrape-placar');

  test('reduceOdd deve reduzir odd em 20%', () => {
    const odd = mod.reduceOdd(2.00);
    expect(odd).toBe(1.60);
  });

  test('reduceOdd nao deve ir abaixo do minimo', () => {
    const odd = mod.reduceOdd(1.00);
    expect(odd).toBeGreaterThanOrEqual(1.01);
  });

  test('reduceOdd com odd 1.26 deve resultar em 1.01', () => {
    const odd = mod.reduceOdd(1.26);
    expect(odd).toBe(1.01);
  });
});

describe('Scraper - makeSeed', () => {
  const mod = require('../scrape-placar');

  test('makeSeed deve gerar seed positivo', () => {
    const seed = mod.makeSeed('Flamengo', 'Palmeiras');
    expect(seed).toBeGreaterThan(0);
  });

  test('makeSeed deve ser deterministico', () => {
    const seed1 = mod.makeSeed('Time A', 'Time B');
    const seed2 = mod.makeSeed('Time A', 'Time B');
    expect(seed1).toBe(seed2);
  });

  test('makeSeed com ordem invertida deve dar seed diferente', () => {
    const seed1 = mod.makeSeed('Time A', 'Time B');
    const seed2 = mod.makeSeed('Time B', 'Time A');
    expect(seed1).not.toBe(seed2);
  });
});

describe('Scraper - stripYouthSuffix', () => {
  const mod = require('../scrape-placar');

  test('stripYouthSuffix remove Sub-20', () => {
    expect(mod.stripYouthSuffix('Flamengo Sub-20')).toBe('Flamengo');
  });

  test('stripYouthSuffix remove Sub-17', () => {
    expect(mod.stripYouthSuffix('Palmeiras Sub-17')).toBe('Palmeiras');
  });

  test('stripYouthSuffix remove Under-20', () => {
    expect(mod.stripYouthSuffix('Santos Under-20')).toBe('Santos');
  });

  test('stripYouthSuffix remove sigla de estado', () => {
    expect(mod.stripYouthSuffix('Flamengo RJ')).toBe('Flamengo');
    expect(mod.stripYouthSuffix('Corinthians SP')).toBe('Corinthians');
  });

  test('stripYouthSuffix nao altera nome normal', () => {
    expect(mod.stripYouthSuffix('Flamengo')).toBe('Flamengo');
    expect(mod.stripYouthSuffix('Real Madrid')).toBe('Real Madrid');
  });
});
