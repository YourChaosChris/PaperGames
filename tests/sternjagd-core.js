const assert=require('assert');const C=require('../sternjagd-core.js');
let s=C.initial(2);assert.deepStrictEqual(C.adjacent(0),[4,7]);assert.strictEqual(C.move(s,2),s);for(const d of C.adjacent(0))assert.notStrictEqual(C.move(s,d),s);console.log('Sternjagd core: pass (graph, legal and illegal moves)');
