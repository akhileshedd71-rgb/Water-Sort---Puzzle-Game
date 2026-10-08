import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { solve, getMove } from '../src/engine.ts';
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
const context=await browser.newContext({viewport:{width:1440,height:1024}});
const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
const base=process.env.TEST_URL||'http://127.0.0.1:4173';
const bottle=i=>page.getByTestId(`bottle-${i}`);
const state=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('hue-progress-v1')));
const current=async mode=>(await state()).saved[mode];
async function settings(){await page.getByRole('button',{name:'Settings',exact:true}).click();}
async function close(){await page.getByRole('button',{name:'Close dialog'}).click();}
async function complete(mode){const b=(await current(mode)).board;const path=solve(b);assert.ok(path,'puzzle must be solvable');for(const m of path){await bottle(m.from).click();await bottle(m.to).click();}await page.getByRole('dialog',{name:'Level complete'}).waitFor();}
try{
  await page.goto(base);await bottle(0).waitFor();await page.evaluate(()=>document.fonts.ready);
  await page.screenshot({path:'artifacts/desktop.png',fullPage:true});
  const initial=await current('classic');assert.equal(initial.board.length,6);
  await bottle(0).click();await bottle(4).click();await page.waitForFunction(()=>JSON.parse(localStorage.getItem('hue-progress-v1')).saved.classic.moveCount===1);
  assert.equal((await current('classic')).board[4].length,1,'animated pour transfers water');
  await page.getByRole('button',{name:'Undo last move'}).click();assert.deepEqual((await current('classic')).board,initial.board);
  await bottle(0).click();await bottle(1).click();assert.equal((await current('classic')).moveCount,0,'invalid pours do not mutate state');await bottle(1).click();
  await settings();await page.getByRole('switch',{name:'Ambient motion'}).click();await page.getByRole('switch',{name:'Gentle sounds'}).click();await page.getByRole('switch',{name:'Color labels'}).click();await close();assert.ok(await page.locator('.tube-svg text').count());
  await page.getByRole('button',{name:'Get a hint'}).click();await page.locator('.hint-arrow').waitFor();
  const target=await page.locator('.bottle').evaluateAll(els=>els.findIndex(e=>e.querySelector('.hint-arrow')));await bottle(target).click();assert.equal((await current('classic')).moveCount,1);
  await page.getByRole('button',{name:'Add extra bottle'}).click();assert.equal(await page.locator('.bottle').count(),7);
  await page.getByRole('button',{name:'Undo last move'}).click();assert.equal(await page.locator('.bottle').count(),7,'undo preserves extra helper');
  await page.getByRole('button',{name:'Restart level'}).click();assert.equal(await page.locator('.bottle').count(),6);
  await complete('classic');assert.equal((await state()).classic,2);assert.equal((await state()).gems,20);
  await page.getByRole('button',{name:'A little more flow'}).click();assert.equal((await current('classic')).level,2);
  let b=(await current('classic')).board;let m;for(let i=0;i<b.length&&!m;i++)for(let j=0;j<b.length&&!m;j++)m=getMove(b,i,j);await bottle(m.from).click();await bottle(m.to).click();const saved=await current('classic');
  await page.reload();await bottle(0).waitFor();assert.deepEqual((await current('classic')).board,saved.board,'reload restores active puzzle');
  await page.getByRole('tab',{name:'Daily flow'}).click();await complete('daily');assert.equal((await state()).gems,55);assert.equal((await state()).dailyWins.length,1);await page.getByRole('button',{name:'Back to Classic'}).click();assert.deepEqual((await current('classic')).board,saved.board,'mode switches preserve puzzle');
  await page.getByRole('tab',{name:'Zen garden'}).click();await complete('zen');assert.equal((await state()).gems,75);await page.getByRole('button',{name:'A little more flow'}).click();
  await page.getByRole('navigation',{name:'Main navigation',exact:true}).getByRole('button',{name:'The studio'}).click();await page.getByRole('button',{name:'Ocean air, 60 gems'}).click();assert.equal((await state()).gems,15);assert.equal((await state()).theme,'ocean');
  await page.getByRole('button',{name:'Golden hour, 100 gems'}).click();assert.equal((await state()).theme,'ocean','locked theme cannot overspend');
  await page.getByRole('button',{name:'Square',exact:true}).click();assert.equal((await state()).tube,'square');
  await page.getByRole('navigation',{name:'Main navigation',exact:true}).getByRole('button',{name:'Your journey'}).click();assert.equal(await page.getByRole('button',{name:'Level 3, locked',exact:true}).isDisabled(),true);
  await page.getByRole('button',{name:'Level 1',exact:true}).click();await complete('classic');assert.equal((await state()).gems,15,'replayed levels do not reward twice');await close();await page.getByRole('button',{name:'Beautifully sorted. Continue'}).click();await page.getByRole('button',{name:'A little more flow'}).click();
  console.log('PASS: pouring, invalid moves, undo, hints, extra bottle, restart, wins, rewards, persistence, three modes, unlocks, replay protection');
  await page.evaluate(()=>{localStorage.clear();});await page.reload();await bottle(0).waitFor();
  await page.setViewportSize({width:390,height:844});await page.evaluate(()=>document.fonts.ready);await page.screenshot({path:'artifacts/mobile.png',fullPage:true});
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'mobile has no horizontal overflow');
  const toolsBox=await page.locator('.game-tools').boundingBox(),navBox=await page.locator('.mobile-nav').boundingBox();assert.ok(toolsBox.y+toolsBox.height<=navBox.y,`tools should fit above mobile nav: ${toolsBox.y+toolsBox.height} <= ${navBox.y}`);
  await page.getByRole('button',{name:'How to play'}).click();await page.keyboard.press('Escape');assert.equal(await page.getByRole('dialog').count(),0);
  await page.setViewportSize({width:320,height:740});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'small phones do not overflow');
  await page.setViewportSize({width:844,height:390});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'landscape does not overflow');
  await page.setViewportSize({width:390,height:844});
  await page.evaluate(async()=>{await navigator.serviceWorker.ready;});await page.reload();await bottle(0).waitFor();await page.waitForFunction(()=>!!navigator.serviceWorker.controller);await context.setOffline(true);await page.reload();await bottle(0).waitFor();await bottle(0).click();await bottle(4).click();await page.waitForFunction(()=>JSON.parse(localStorage.getItem('hue-progress-v1')).saved.classic.moveCount===1);await context.setOffline(false);
  console.log('PASS: phone and landscape layouts, modal dismissal, offline reload and gameplay');
  assert.deepEqual(errors,[],'no browser errors');console.log('PASS: no browser errors');
}finally{await browser.close();}
