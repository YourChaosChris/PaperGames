// Pure rules for Klappenkasten.
const KlappenkastenCore = (() => {
  const initial=(size=9)=>({size,open:Array.from({length:size},(_,i)=>i+1),dice:[],over:false,score:null});
  const roll=(s,rng=Math.random)=>s.over?s:{...s,dice:[1+Math.floor(rng()*6),1+Math.floor(rng()*6)]};
  const choices=(s)=>{const total=s.dice.reduce((a,b)=>a+b,0),out=[];function walk(i,left,p){if(left===0){if(p.length)out.push(p);return}for(let j=i;j<s.open.length;j++)if(s.open[j]<=left)walk(j+1,left-s.open[j],[...p,s.open[j]])}walk(0,total,[]);return out};
  const close=(s,nums)=>{if(s.over||!Array.isArray(nums)||!choices(s).some(x=>x.length===nums.length&&x.every(n=>nums.includes(n))))return s;const open=s.open.filter(n=>!nums.includes(n));return {...s,open,over:!open.length,score:open.length?null:0}};
  const finish=(s)=>s.over||choices(s).length?s:{...s,over:true,score:s.open.reduce((a,b)=>a+b,0)};
  const chooseAi=(s)=>choices(s).sort((a,b)=>b.reduce((x,y)=>x+y,0)-a.reduce((x,y)=>x+y,0))[0]||null;
  return {initial,roll,choices,close,finish,chooseAi};
})();
if(typeof module!=="undefined")module.exports=KlappenkastenCore;
