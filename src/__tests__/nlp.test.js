import { parseQuickInput, nextOccurrence } from '../nlp';

// Miércoles 7 de octubre de 2026, 14:00
const now = new Date(2026, 9, 7, 14, 0, 0);
const hm = (d) => `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;

describe('parseQuickInput', () => {
  it('mañana a las 3pm', () => {
    const r = parseQuickInput('llamar al banco mañana a las 3pm', now);
    expect(r.title).toBe('Llamar al banco');
    expect(r.due.getDate()).toBe(8);
    expect(hm(r.due)).toBe('15:00');
  });

  it('hora ambigua ya pasada toma la noche', () => {
    const r = parseQuickInput('pasear al perro hoy a las 7', now);
    expect(hm(r.due)).toBe('19:00');
  });

  it('repetición diaria', () => {
    const r = parseQuickInput('tomar agua cada día a las 8am', now);
    expect(r.repeat).toBe('daily');
    expect(hm(r.due)).toBe('8:00');
  });

  it('prioridad alta', () => {
    expect(parseQuickInput('entregar informe pasado mañana urgente', now).priority).toBe('high');
  });

  it('sin fecha no inventa una', () => {
    const r = parseQuickInput('comprar pan', now);
    expect(r.due).toBeNull();
    expect(r.title).toBe('Comprar pan');
  });

  it('en 2 horas', () => {
    const r = parseQuickInput('sacar la basura en 2 horas', now);
    expect(hm(r.due)).toBe('16:00');
  });
});

describe('nextOccurrence', () => {
  it('avanza al siguiente día futuro', () => {
    const n = nextOccurrence(new Date(2026, 9, 1, 8, 0).toISOString(), 'daily', now);
    expect(n.getDate()).toBe(8);
    expect(n.getHours()).toBe(8);
  });
});
