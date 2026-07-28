/* ══════════════════════════════════════════
   CCR — SHARED CORE (Thread B / "Field Life")
   ══════════════════════════════════════════
   Extracted verbatim from CCR_v14_FIELD_LIFE_WIR.html — the shipped, tested
   engine — not rewritten. This is now the one place ELEM, CMPDS, findC,
   calcStats, and mvPattern live. CCR_v14_FIELD_LIFE_WIR.html loads this file
   as a classic <script> before its own inline script; anything else that
   needs the same real-chemistry math (e.g. CCRBuilder.jsx) should import it
   from here instead of keeping a second copy.

   Why this file exists: CCRBuilder.jsx used to carry its own hand-copied
   version of this same table, and it had quietly drifted from the shipped
   numbers — wrong conductivity units on several heavy elements, Xenon's
   electronegativity changed from 0.00 to 2.60, a couple of atomic radii off
   by tens of picometers. None of that was a deliberate design choice, it was
   duplication rotting. This module is the fix: one source, two consumers.

   Deliberately NOT folded in here: CCR_Octoverse.html (Thread C — 5-element
   KoPani, different Crown/Core/Root math, its own smaller ELEM table) and
   CCRFullSetArena.jsx (its 16-element/10×8 board matches Thread A's spec,
   not Thread B's). Both run genuinely different, already-documented
   rulesets. Merging their math into this module would be deciding the open
   Thread A/B/C fork silently, which the project's own handoff says not to
   do — so they still carry their own local data, on purpose.
   ══════════════════════════════════════════ */
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) {
    module.exports = api;
  }
  if (typeof root !== 'undefined') {
    for (var k in api) root[k] = api[k];
  }
})(
  typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : this),
  function () {
    'use strict';

    // ══════════════════════════════════════════
    // REAL ATOMIC DATA
    // ══════════════════════════════════════════
    const ELEM={
      Li:{Z:3, M:6.941,  EN:0.98,IE:5.39, d:0.534,  r:167,cond:7.05,melt:453, cp:3.58,hd:0.6, phase:'solid',  type:'alkali'},
      C: {Z:6, M:12.011, EN:2.55,IE:11.26,d:2.267,  r:77, cond:2.00,melt:3823,cp:0.71,hd:10.0,phase:'solid',  type:'crystal'},
      O: {Z:8, M:15.999, EN:3.44,IE:13.62,d:0.00143,r:73, cond:-8.0,melt:54,  cp:0.92,hd:0.5, phase:'gas',    type:'gas'},
      Si:{Z:14,M:28.085, EN:1.90,IE:8.15, d:2.329,  r:111,cond:-3.0,melt:1687,cp:0.71,hd:6.5, phase:'solid',  type:'crystal'},
      N: {Z:7, M:14.007, EN:3.04,IE:14.53,d:0.00125,r:75, cond:-8.0,melt:63,  cp:1.04,hd:0.5, phase:'gas',    type:'gas'},
      F: {Z:9, M:18.998, EN:3.98,IE:17.42,d:0.00170,r:64, cond:-8.0,melt:53,  cp:0.82,hd:0.5, phase:'gas',    type:'gas'},
      Na:{Z:11,M:22.990, EN:0.93,IE:5.14, d:0.968,  r:186,cond:7.32,melt:371, cp:1.23,hd:0.5, phase:'solid',  type:'alkali'},
      Mg:{Z:12,M:24.305, EN:1.31,IE:7.65, d:1.738,  r:160,cond:7.01,melt:923, cp:1.02,hd:2.5, phase:'solid',  type:'metal'},
      P: {Z:15,M:30.974, EN:2.19,IE:10.49,d:1.823,  r:106,cond:-8.0,melt:317, cp:0.77,hd:3.0, phase:'solid',  type:'crystal'},
      Cl:{Z:17,M:35.45,  EN:3.16,IE:12.97,d:0.00321,r:99, cond:-8.0,melt:172, cp:0.48,hd:0.5, phase:'gas',    type:'gas'},
      Ca:{Z:20,M:40.078, EN:1.00,IE:6.11, d:1.550,  r:194,cond:7.46,melt:1115,cp:0.63,hd:1.5, phase:'solid',  type:'metal'},
      Ti:{Z:22,M:47.867, EN:1.54,IE:6.83, d:4.507,  r:176,cond:6.38,melt:1941,cp:0.52,hd:6.0, phase:'solid',  type:'heavy'},
      Cr:{Z:24,M:51.996, EN:1.66,IE:6.77, d:7.190,  r:166,cond:7.74,melt:2180,cp:0.45,hd:8.5, phase:'solid',  type:'heavy'},
      Fe:{Z:26,M:55.845, EN:1.83,IE:7.90, d:7.874,  r:126,cond:7.00,melt:1811,cp:0.45,hd:4.5, phase:'solid',  type:'heavy'},
      Cu:{Z:29,M:63.546, EN:1.90,IE:7.73, d:8.960,  r:128,cond:7.78,melt:1358,cp:0.39,hd:3.0, phase:'solid',  type:'heavy'},
      Mo:{Z:42,M:95.96,  EN:2.16,IE:7.09, d:10.28,  r:190,cond:6.90,melt:2896,cp:0.25,hd:5.5, phase:'solid',  type:'heavy'},
      Ag:{Z:47,M:107.87, EN:1.93,IE:7.58, d:10.49,  r:165,cond:7.80,melt:1235,cp:0.24,hd:2.5, phase:'solid',  type:'heavy'},
      Xe:{Z:54,M:131.29, EN:0.00,IE:12.13,d:0.00589,r:216,cond:-8.0,melt:161, cp:0.16,hd:0.0, phase:'gas',    type:'noble'},
      W: {Z:74,M:183.84, EN:2.36,IE:7.86, d:19.25,  r:193,cond:7.28,melt:3695,cp:0.13,hd:7.5, phase:'solid',  type:'heavy'},
      Os:{Z:76,M:190.23, EN:2.20,IE:8.73, d:22.59,  r:185,cond:6.97,melt:3306,cp:0.13,hd:7.0, phase:'solid',  type:'heavy'},
      Ir:{Z:77,M:192.22, EN:2.20,IE:8.97, d:22.56,  r:180,cond:7.03,melt:2719,cp:0.13,hd:6.5, phase:'solid',  type:'heavy'},
      Pt:{Z:78,M:195.08, EN:2.28,IE:8.96, d:21.45,  r:177,cond:6.97,melt:2041,cp:0.13,hd:4.5, phase:'solid',  type:'heavy'},
      Au:{Z:79,M:196.97, EN:2.54,IE:9.23, d:19.30,  r:174,cond:7.65,melt:1337,cp:0.13,hd:2.5, phase:'solid',  type:'heavy'},
      U: {Z:92,M:238.03, EN:1.38,IE:6.19, d:19.10,  r:196,cond:6.54,melt:1405,cp:0.12,hd:6.0, phase:'solid',  type:'actinide'},
    };

    // ══════════════════════════════════════════
    // STAT ENGINE (real atomic data)
    // ══════════════════════════════════════════
    const MX={EN:3.98,IE:17.42,d:40.7,r:298,cond:7.80,condMin:-8.0,melt:3695,cp:14.30,hd:10.0};
    const DEF_REF=950,STR_REF=800;

    function eStat(sym){
      const e=ELEM[sym];if(!e)return{AFF:0,DEF:0,MAS:0,REA:0,SIG:0,THR:0,CAP:0,STR:0};
      const M=60; // normalized reference mass: chemistry matters without heavy-element stat runaway
      return{
        AFF:+(e.EN/MX.EN*M*10).toFixed(1),DEF:+(e.IE/MX.IE*M*10).toFixed(1),
        MAS:+(e.d/MX.d*M*10).toFixed(1),REA:+(e.r/MX.r*M*10).toFixed(1),
        SIG:+((e.cond-MX.condMin)/(MX.cond-MX.condMin)*M*10).toFixed(1),
        THR:+(e.melt/MX.melt*M*10).toFixed(1),CAP:+(e.cp/MX.cp*M*10).toFixed(1),
        STR:+(e.hd/MX.hd*M*10).toFixed(1),
      };
    }

    function calcStats(cr,co,ro){
      const tot={AFF:0,DEF:0,MAS:0,REA:0,SIG:0,THR:0,CAP:0,STR:0};
      [cr,co,ro].forEach(s=>{const e=eStat(s);for(const k in tot)tot[k]+=e[k];});
      const HP=Math.round(250+(tot.DEF/DEF_REF)*250+(tot.STR/STR_REF)*200);
      const SP=+(5.0+tot.CAP/200).toFixed(2);
      const PRI=+(tot.SIG/500).toFixed(2);
      const STB=+((tot.STR+tot.THR*0.4)/400).toFixed(3);
      const RAW=+(tot.AFF*(1+STB/50)/400).toFixed(3);
      const HEAT=+((tot.THR/(MX.melt*3))*5.0).toFixed(1);
      const OVR=+(Object.values(tot).reduce((a,b)=>a+b,0)/55).toFixed(1);
      const crEl=ELEM[cr];
      const BLAST=crEl?Math.max(2,Math.min(6,1+Math.floor(crEl.r/70))):2;
      const roEl=ELEM[ro];
      const GRP=roEl?Math.max(1,Math.min(2,Math.ceil(roEl.r/150))):1;
      const rawMP=(tot.SIG-tot.MAS*0.4)/600;
      const MP=Math.max(2,Math.min(3,Math.round(Math.max(0.5,rawMP)*2.5)));
      const crCond=crEl?crEl.cond:0;
      const PRED=crCond<=0?0:Math.round((crCond-MX.condMin)/(MX.cond-MX.condMin)*100);
      return{HP,SP,PRI,STB,RAW,HEAT,OVR,BLAST,GRP,MP,PRED,tot};
    }

    function mvPattern(ro){
      if(['Xe','Ar','Kr','Ne','He'].includes(ro))return'queen';
      if(['Li','Na','K','Rb'].includes(ro))return'knight';
      if(['C','Si','B','Cr','W'].includes(ro))return'bishop';
      if(['Fe','Co','Ni','Cu','Ag','Au','Os','Ir','Pt','Mo','Ti'].includes(ro))return'rook';
      return'king';
    }

    function mvCells(col,row,tiles,pat){
      const cells=[];
      const add=(c,r)=>{if(c>=1&&c<=10&&r>=1&&r<=10)cells.push([c,r]);};
      if(pat==='queen'){for(let dc=-tiles;dc<=tiles;dc++)for(let dr=-tiles;dr<=tiles;dr++){if(!dc&&!dr)continue;if(Math.abs(dc)+Math.abs(dr)>tiles)continue;add(col+dc,row+dr);}}
      else if(pat==='rook'){for(let d=1;d<=tiles;d++){add(col+d,row);add(col-d,row);add(col,row+d);add(col,row-d);}}
      else if(pat==='bishop'){for(let d=1;d<=tiles;d++){add(col+d,row+d);add(col-d,row+d);add(col+d,row-d);add(col-d,row-d);}add(col+1,row);add(col-1,row);add(col,row+1);add(col,row-1);}
      else if(pat==='knight'){[[-2,-1],[-2,1],[2,-1],[2,1],[-1,-2],[-1,2],[1,-2],[1,2]].forEach(([dc,dr])=>add(col+dc,row+dr));add(col+1,row);add(col-1,row);add(col,row+1);add(col,row-1);}
      else{for(let dc=-tiles;dc<=tiles;dc++)for(let dr=-tiles;dr<=tiles;dr++){if(!dc&&!dr)continue;if(Math.abs(dc)+Math.abs(dr)>tiles)continue;add(col+dc,row+dr);}}
      return cells;
    }

    // ══════════════════════════════════════════
    // COMPOUNDS
    // ══════════════════════════════════════════
    const CMPDS=[
      {a:'Na',b:'Cl',name:'NaCl', bond:'IONIC', kJ:-411, mult:2.0,chain:true, fx:'Chain ×3 to adjacent'},
      {a:'F', b:'W', name:'WF₆',  bond:'POLAR', kJ:-1747,mult:3.0,toxic:true, fx:'F dissolves W — max damage'},
      {a:'Ca',b:'P', name:'Ca₃P₂',bond:'POLAR', kJ:-504, mult:1.8,struct:true,fx:'Bone minerals form'},
      {a:'Fe',b:'O', name:'Fe₂O₃',bond:'POLAR', kJ:-824, mult:2.2,           fx:'Rust — terrain oxidizes'},
      {a:'U', b:'C', name:'UC',   bond:'POLAR', kJ:-98,  mult:1.4,burn:true,  fx:'Nuclear fuel sustained'},
      {a:'Na',b:'F', name:'NaF',  bond:'IONIC', kJ:-574, mult:2.5,chain:true, fx:'Strongest ionic — chain'},
      {a:'Si',b:'O', name:'SiO₂', bond:'POLAR', kJ:-911, mult:2.5,           fx:'Quartz — insulated field'},
      {a:'Mg',b:'O', name:'MgO',  bond:'IONIC', kJ:-601, mult:2.0,heal:true,  fx:'Magnesia — healing chemistry'},
      {a:'Li',b:'F', name:'LiF',  bond:'IONIC', kJ:-617, mult:2.1,chain:true, fx:'Lithium fluoride fast chain'},
      {a:'Cu',b:'Si',name:'Cu₃Si',bond:'NONCOV',kJ:-13,  mult:1.1,eff:true,   fx:'Semiconductor efficiency'},
      {a:'Ir',b:'O', name:'IrO₂', bond:'POLAR', kJ:-274, mult:1.7,           fx:'Iridium oxide armor'},
      {a:'Na',b:'O', name:'Na₂O', bond:'IONIC', kJ:-416, mult:1.9,chain:true, fx:'Sodium oxide — spreads ionic'},
      {a:'Fe',b:'C', name:'Fe₃C', bond:'POLAR', kJ:-25,  mult:1.2,           fx:'Cementite — hardens terrain'},
    ];
    function findC(a,b){for(const c of CMPDS)if((c.a===a&&c.b===b)||(c.a===b&&c.b===a))return c;return null;}
    function bestRxn(pa,pb){
      const ea=[pa.crown,pa.core,pa.root],eb=[pb.crown,pb.core,pb.root];
      let best=null;for(const a of ea)for(const b of eb){const c=findC(a,b);if(c&&(!best||Math.abs(c.kJ)>Math.abs(best.kJ)))best=c;}
      return best;
    }
    function terrElems(col){return col<=4?['Fe','Si','O']:col<=6?['Fe','Si','O','C']:col<=8?['Si','O','C']:['Si','O','C'];}
    function bestTerrRxn(build,col){
      const pe=[build.crown,build.core,build.root],te=terrElems(col);
      let best=null;for(const p of pe)for(const t of te){const c=findC(p,t);if(c&&(!best||Math.abs(c.kJ)>Math.abs(best.kJ)))best=c;}
      return best;
    }
    function rxnHarm(b,rxn){return rxn&&rxn.toxic&&[b.crown,b.core,b.root].includes('W')&&[b.crown,b.core,b.root].some(e=>e==='F');}
    function rxnHeal(b,rxn){return rxn&&(rxn.heal||(rxn.eff&&(b.id==='jolt'||b.id==='nova')));}

    return {
      ELEM, MX, DEF_REF, STR_REF,
      eStat, calcStats, mvPattern, mvCells,
      CMPDS, findC, bestRxn, terrElems, bestTerrRxn, rxnHarm, rxnHeal,
    };
  }
);
