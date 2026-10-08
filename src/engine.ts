export const CAPACITY = 4;
export type Board = number[][];
export type Mode = 'classic' | 'zen' | 'daily';
export type Move = { from: number; to: number; amount: number; color: number };
export const copyBoard = (b: Board): Board => b.map(t => [...t]);
export const completeTube = (t: number[]) => t.length === CAPACITY && t.every(c => c === t[0]);
export const isSolved = (b: Board) => b.every(t => !t.length || completeTube(t));
export function topRun(t: number[]) { let n = 0; for (let i = t.length - 1; i >= 0 && t[i] === t[t.length - 1]; i--) n++; return n; }
export function getMove(b: Board, from: number, to: number): Move | null {
  if (from === to || !b[from]?.length || !b[to] || b[to].length >= CAPACITY) return null;
  const color = b[from][b[from].length - 1];
  if (b[to].length && b[to][b[to].length - 1] !== color) return null;
  return { from, to, color, amount: Math.min(topRun(b[from]), CAPACITY - b[to].length) };
}
export function applyMove(b: Board, move: Move): Board { const next = copyBoard(b); next[move.from].splice(-move.amount); next[move.to].push(...Array(move.amount).fill(move.color)); return next; }
export function moves(b: Board): Move[] { return b.flatMap((_, from) => b.flatMap((_, to) => { const m = getMove(b, from, to); return m ? [m] : []; })); }
export function seededRandom(seed: number) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
export function dailyKey(d = new Date()) { return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; }
export function hash(s: string) { return [...s].reduce((a, c) => Math.imul(a ^ c.charCodeAt(0), 16777619), 2166136261) >>> 0; }
const canonical = (b: Board) => b.map(t => t.join(',')).sort().join('|');
export function levelColors(level: number, mode: Mode) { return mode === 'zen' ? Math.min(5, 3 + Math.floor((level - 1) / 15)) : mode === 'daily' ? 6 : Math.min(10, 4 + Math.floor(Math.log2(1 + (level - 1) / 8))); }
export function generateLevel(level: number, mode: Mode = 'classic', date = dailyKey()): { board: Board; solution: Move[]; colors: number } {
  const colors = levelColors(level, mode), random = seededRandom(hash(`${mode}-${mode === 'daily' ? date : level}-v1`));
  // Reverse only moves that the standard maximal-pour rule can undo. Every
  // generated puzzle therefore carries a constructive proof of solvability.
  let board: Board = Array.from({ length: colors }, (_, c) => Array(CAPACITY).fill(c)); board.push([]);
  const reverse: Move[] = []; const seen = new Set<string>(); let best = copyBoard(board), bestPath: Move[] = [], bestScore = -Infinity;
  for (let step = 0; step < 180 + colors * 45; step++) {
    const options: { board: Board; undo: Move; weight: number }[] = [];
    for (let from = 0; from < board.length; from++) for (let to = 0; to < board.length; to++) {
      if (from === to || !board[from].length || board[to].length === CAPACITY) continue;
      const run = topRun(board[from]);
      for (let amount = 1; amount <= Math.min(run, CAPACITY - board[to].length); amount++) {
        if (amount === run && run !== board[from].length) continue;
        const color = board[from].at(-1)!;
        const next = copyBoard(board); next[from].splice(-amount); next[to].push(...Array(amount).fill(color));
        const undo = getMove(next, to, from);
        if (!undo || undo.amount !== amount || seen.has(canonical(next))) continue;
        options.push({ board: next, undo, weight: random() + (next[to].length === 4 ? .2 : 0) });
      }
    }
    if (!options.length) break;
    options.sort((a, b) => b.weight - a.weight); const picked = options[0];
    board = picked.board; reverse.push(picked.undo); seen.add(canonical(board));
    const transitions = board.reduce((s, t) => s + t.filter((c, i) => i > 0 && c !== t[i - 1]).length, 0);
    const target = mode === 'zen' ? colors + 1 : mode === 'daily' ? colors * 2 : Math.min(colors * 3, colors + 2 + Math.floor(level / 3));
    const score = -Math.abs(transitions - target) * 10 + board.filter(t => !t.length).length * 3 - reverse.length * .002;
    if (transitions > 1 && score > bestScore) { best = copyBoard(board); bestPath = [...reverse].reverse(); bestScore = score; }
  }
  // One untouched helper ensures room to explore. Zen gets another.
  best.push([]); if (mode === 'zen') best.push([]);
  return { board: best, solution: bestPath, colors };
}
export function solve(board: Board, nodeLimit = 160000): Move[] | null {
  const visited = new Set<string>(); let nodes = 0;
  function search(b: Board, path: Move[]): Move[] | null {
    if (isSolved(b)) return path;
    if (++nodes > nodeLimit || path.length > 150) return null;
    const key = canonical(b); if (visited.has(key)) return null; visited.add(key);
    const options = moves(b).filter(m => !completeTube(b[m.from]) && !(b[m.to].length === 0 && topRun(b[m.from]) === b[m.from].length));
    options.sort((a, c) => priority(c) - priority(a));
    function priority(m: Move) { return (b[m.to].length ? 10 : 0) + (b[m.to].length + m.amount === 4 ? 8 : 0) + (b[m.from].length === m.amount ? 3 : 0); }
    const targets = new Set<string>();
    for (const m of options) { const next = applyMove(b, m); const k = canonical(next); if (targets.has(k)) continue; targets.add(k); const result = search(next, [...path, m]); if (result) return result; if (nodes > nodeLimit) break; }
    return null;
  }
  return search(board, []);
}
