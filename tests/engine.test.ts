import test from 'node:test';
import assert from 'node:assert/strict';
import { applyMove, generateLevel, getMove, isSolved, levelColors, solve } from '../src/engine.ts';

test('pour rules enforce matching colors, capacity, and contiguous runs',()=>{
  const b=[[0,1,1],[1,1,1],[],[2,2,2,2]];
  assert.deepEqual(getMove(b,0,1),{from:0,to:1,color:1,amount:1});
  assert.deepEqual(applyMove(b,getMove(b,0,1)!),[[0,1],[1,1,1,1],[],[2,2,2,2]]);
  assert.equal(getMove(b,0,3),null);assert.equal(getMove(b,0,0),null);assert.equal(getMove(b,2,0),null);
  assert.equal(getMove([[0],[1]],0,1),null);
  assert.equal(getMove(b,0,2)?.amount,2);
  assert.deepEqual(b,[[0,1,1],[1,1,1],[],[2,2,2,2]],'moves do not mutate input');
});
test('a win requires full single-color bottles',()=>{
  assert.equal(isSolved([[0,0,0,0],[1,1,1,1],[]]),true);
  assert.equal(isSolved([[0,0],[0,0],[]]),false);
  assert.equal(isSolved([[0,1,0,1],[]]),false);
});
test('2,500 Classic levels have legal, replayable solutions and conserve colors',()=>{
  for(let n=1;n<=2500;n++){
    const puzzle=generateLevel(n);let board=puzzle.board;
    assert.equal(isSolved(board),false,`level ${n} must start unsolved`);
    const counts=new Map<number,number>();board.flat().forEach(c=>counts.set(c,(counts.get(c)||0)+1));
    assert.equal(counts.size,puzzle.colors);assert.ok([...counts.values()].every(n=>n===4));
    assert.ok(board.some(t=>t.length===0));
    for(const move of puzzle.solution){assert.deepEqual(getMove(board,move.from,move.to),move,`level ${n}: invalid solution move`);board=applyMove(board,move);}
    assert.equal(isSolved(board),true,`level ${n} solution must finish`);
  }
});
test('daily puzzles are deterministic by date and Zen adds room',()=>{
  assert.deepEqual(generateLevel(1,'daily','2026-10-08'),generateLevel(999,'daily','2026-10-08'));
  assert.notDeepEqual(generateLevel(1,'daily','2026-10-08').board,generateLevel(1,'daily','2026-10-09').board);
  for(const mode of ['zen','daily'] as const)for(let n=1;n<=30;n++){
    const p=generateLevel(n,mode,`2026-10-${String(n).padStart(2,'0')}`);let b=p.board;
    for(const m of p.solution){assert.deepEqual(getMove(b,m.from,m.to),m);b=applyMove(b,m);}assert.ok(isSolved(b));
  }
  assert.equal(generateLevel(1,'zen').board.length,levelColors(1,'zen')+3);
});
test('hint solver gives playable solutions for opening levels',()=>{
  for(let n=1;n<=20;n++){
    let b=generateLevel(n).board;const solution=solve(b);assert.ok(solution,`level ${n} hint must be available`);
    for(const m of solution){assert.deepEqual(getMove(b,m.from,m.to),m);b=applyMove(b,m);}assert.ok(isSolved(b));
  }
});
