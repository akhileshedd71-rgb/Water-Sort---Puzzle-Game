import { solve } from './engine';
self.onmessage = e => { self.postMessage({ id: e.data.id, solution: solve(e.data.board) }); };
