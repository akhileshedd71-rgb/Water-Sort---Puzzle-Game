import { CAPACITY, type Board, type Mode } from './engine';
export type Theme = 'iris' | 'ocean' | 'sunset' | 'midnight';
export type Progress = { classic: number; zen: number; wins: number; gems: number; dailyWins: string[]; unlocked: Theme[]; theme: Theme; sound: boolean; labels: boolean; motion: boolean; tube: 'round' | 'square'; saved: Partial<Record<Mode, { level: number; date: string; board: Board; initial: Board; history: Board[]; moveCount: number; extra: boolean }>> };
export const defaults = (): Progress => ({ classic: 1, zen: 1, wins: 0, gems: 0, dailyWins: [], unlocked: ['iris'], theme: 'iris', sound: true, labels: false, motion: true, tube: 'round', saved: {} });
const validBoard = (b: unknown): b is Board => Array.isArray(b) && b.length >= 3 && b.length <= 15 && b.every(t => Array.isArray(t) && t.length <= CAPACITY && t.every(c => Number.isInteger(c) && c >= 0 && c < 10));
export function readProgress(): Progress {
  try {
    const raw = JSON.parse(localStorage.getItem('hue-progress-v1') || 'null'); if (!raw || typeof raw !== 'object') return defaults();
    const p = defaults();
    for (const key of ['classic', 'zen', 'wins', 'gems'] as const) if (Number.isSafeInteger(raw[key]) && raw[key] >= (key === 'classic' || key === 'zen' ? 1 : 0)) p[key] = raw[key];
    p.unlocked = ['iris', ...(['ocean','sunset','midnight'] as Theme[]).filter(t => raw.unlocked?.includes(t))];
    if (p.unlocked.includes(raw.theme)) p.theme = raw.theme;
    for (const key of ['sound','labels','motion'] as const) if (typeof raw[key] === 'boolean') p[key] = raw[key];
    if (raw.tube === 'square') p.tube = 'square';
    p.dailyWins = Array.isArray(raw.dailyWins) ? raw.dailyWins.filter((x: unknown) => typeof x === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(x)).slice(-366) : [];
    for (const mode of ['classic','zen','daily'] as Mode[]) { const s = raw.saved?.[mode]; if (s && Number.isSafeInteger(s.level) && s.level > 0 && typeof s.date === 'string' && validBoard(s.board) && validBoard(s.initial) && Array.isArray(s.history) && s.history.every(validBoard) && Number.isSafeInteger(s.moveCount) && s.moveCount >= 0) p.saved[mode] = s; }
    return p;
  } catch { return defaults(); }
}
export function writeProgress(p: Progress) { try { localStorage.setItem('hue-progress-v1', JSON.stringify(p)); return true; } catch { return false; } }
