// Pure rules for Steckwuerfeln.
const SteckwuerfelnCore=(()=>{
 const initial=(joker="reroll")=>({joker,open:Array.from({length:11},(_,i)=>i+2),dice:[],over:false,score:null});
 const roll=(s,rng=Math.random)=>s.over?s:{...s,dice:[1+Math.floor(rng()*6),1+Math.floor(rng()*6)]};
 const choices=s=>{if(s.dice.length!==2)return[];const [a,b]=s.dice, sum=a+b, c=[];if(s.open.includes(sum))c.push([sum]);if(a!==b&&s.open.includes(a)&&s.open.includes(b))c.push([a,b]);return c};
 const play=(s,fields)=>{if(s.over||!choices(s).some(c=>c.length===fields.length&&c.every(n=>fields.includes(n))))return s;let open=s.open.filter(n=>!fields.includes(n));if(s.dice.includes(6)&&s.dice.includes(6)&&s.joker==="reroll")return {...s,open,dice:[]};return {...s,open,dice:[],over:open.length===0,score:open.length===0?0:null}};
 const finish=s=>s.over||choices(s).length?s:{...s,over:true,score:s.open.reduce((a,b)=>a+b,0)};
 const chooseAi=s=>choices(s).sort((a,b)=>b.reduce((x,y)=>x+y,0)-a.reduce((x,y)=>x+y,0))[0]||null;
 return{initial,roll,choices,play,finish,chooseAi};})(); if(typeof module!=="undefined")module.exports=SteckwuerfelnCore;
