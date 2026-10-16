const B = require('../bingo-core');
const assert = require('assert');
for (let run = 0; run < 1000; run++) {
  const s = B.createDeck(run % 2 ? 'numbers' : 'pictures', run % 3 ? 3 : 5);
  const pool = new Set(s.board.filter((x) => x !== null));
  if (s.kind === 'numbers' && s.size === 5) { for (let c=0;c<5;c++) for (let r=0;r<5;r++) { const v=s.board[r*5+c]; if(v!==null) assert(v>c*15 && v<=(c+1)*15); } }
  assert.equal(pool.size, s.board.filter((x) => x !== null).length);
  const seen = new Set(); let value;
  while ((value = B.draw(s)) !== null) { assert(!seen.has(value)); seen.add(value); }
  assert.equal(seen.size, s.kind === 'pictures' ? 24 : 75);
  const sample = { size: 3, board: [1,2,3,4,5,6,7,8,9], marked: [true,true,true,false,false,false,false,false,false], drawn: [1,2,3] };
  assert(B.hasPattern(sample, sample.marked, 'line'));
  assert(!B.hasPattern(sample, sample.marked, 'full'));
  const diag = { size:3, board:[1,2,3,4,5,6,7,8,9], marked:[true,false,false,false,true,false,false,false,true], drawn:[1,5,9] };
  assert(B.hasPattern(diag,diag.marked,'line')); assert(B.check(diag,'line').valid);
  assert(!B.check({...diag,drawn:[1,5]},'line').valid);
  const full={size:3,board:[1,2,3,4,5,6,7,8,9],marked:Array(9).fill(true),drawn:[1,2,3,4,5,6,7,8,9]}; assert(B.check(full,'full').valid);
}
console.log('Bingo core: 1000 randomized decks and draw sequences passed.');
