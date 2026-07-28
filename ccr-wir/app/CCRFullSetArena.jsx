import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';

/* ============================== STATIC RULES DATA ============================== */
const ELEMENTS = {
  Li:{type:'alkali',en:0.98,name:'Lithium'}, Na:{type:'alkali',en:0.93,name:'Sodium'},
  Fe:{type:'metal',en:1.83,name:'Iron'}, Cu:{type:'metal',en:1.90,name:'Copper'},
  Au:{type:'metal',en:2.54,name:'Gold'}, Mg:{type:'metal',en:1.31,name:'Magnesium'},
  C:{type:'crystal',en:2.55,name:'Carbon'}, Si:{type:'crystal',en:1.90,name:'Silicon'},
  N:{type:'gas',en:3.04,name:'Nitrogen'}, F:{type:'gas',en:3.98,name:'Fluorine'}, Cl:{type:'gas',en:3.16,name:'Chlorine'},
  Xe:{type:'noble',en:0.00,name:'Xenon'},
  W:{type:'heavy',en:2.36,name:'Tungsten'}, Ir:{type:'heavy',en:2.20,name:'Iridium'},
  Os:{type:'heavy',en:2.20,name:'Osmium'}, Pt:{type:'heavy',en:2.28,name:'Platinum'},
};
const ROOT_MOVE = {Li:'knight',Na:'knight',C:'bishop',Si:'bishop',Fe:'rook',Cu:'rook',Os:'rook',Ir:'rook',Pt:'rook',Au:'rook',W:'rook',Xe:'queen'};
const rootMovement = (sym) => ROOT_MOVE[sym] || 'king';
const TYPE_INTEL = {metal:'Deep Scan',alkali:'Surface Scan',crystal:'Lattice Scan',gas:'Trace Scan',heavy:'Mass Scan',noble:'Blind'};
const BEATS = {gas:'crystal', crystal:'metal', metal:'alkali', alkali:'noble', noble:'gas'};
function typeMult(atkType, defType){
  if(atkType==='heavy' || defType==='heavy') return 1.0;
  if(BEATS[atkType]===defType) return 1.5;
  if(BEATS[defType]===atkType) return 0.5;
  return 1.0;
}
const COMPOUNDS = [
  {pair:['W','F'], name:'WF\u2086', mult:2.8},
  {pair:['Na','F'], name:'NaF', mult:2.3},
  {pair:['Na','Cl'], name:'NaCl', mult:2.0},
  {pair:['Li','F'], name:'LiF', mult:2.0},
];
function findCompound(atkEls, defEls){
  for(const c of COMPOUNDS){
    const [a,b] = c.pair;
    if((atkEls.includes(a) && defEls.includes(b)) || (atkEls.includes(b) && defEls.includes(a))) return c;
  }
  return null;
}
function bondMult(coreA, coreB){
  const a = ELEMENTS[coreA], b = ELEMENTS[coreB];
  if(a.type==='noble' || b.type==='noble') return {mult:1.0, kind:'Phase-Through'};
  const dEN = Math.abs(a.en - b.en);
  if(a.type==='metal' && b.type==='metal') return {mult:1.1, kind:'Metallic'};
  if(dEN > 1.7) return {mult:1.5, kind:'Ionic'};
  if(dEN >= 0.4) return {mult:1.2, kind:'Polar Covalent'};
  return {mult:1.0, kind:'Covalent'};
}
function resolveTriangle(atk, def){
  if(atk===def) return 'TIE';
  const beats = {Crown:'Core', Core:'Root', Root:'Crown'};
  return beats[atk]===def ? 'ATK_WIN' : 'DEF_WIN';
}
function computeDamage({pwr, engagement, triangleResult, bond, tMult, compound}){
  let triScalar;
  if(engagement==='BACK') triScalar = 1.0;
  else if(engagement==='SIDE') triScalar = 1.0;
  else { triScalar = triangleResult==='TIE' ? 0.6 : (triangleResult==='ATK_WIN' ? 1.0 : 0.3); }
  let dmg = pwr * triScalar * bond.mult * tMult;
  if(compound) dmg *= compound.mult;
  return Math.max(1, Math.round(dmg));
}

/* ============================== BOARD ============================== */
const COLS = ['A','B','C','D','E','F','G','H','I','J'];
const COL_ELEMENT = {A:'Na',B:'Fe',C:'Si',D:'C',E:'Os',F:'Cu',G:'W',H:'N',I:'Au',J:'Li'};
const colIdx = (c) => COLS.indexOf(c);
const key = (c,r) => c+r;
const inBounds = (ci,r) => ci>=0 && ci<10 && r>=1 && r<=8;

const STRUCTURES = [
  {col:'C',row:3,type:'salt',icon:'\uD83E\uDDF1'}, {col:'H',row:5,type:'salt',icon:'\uD83E\uDDF1'},
  {col:'E',row:3,type:'spire',icon:'\uD83D\uDC8E'}, {col:'F',row:6,type:'spire',icon:'\uD83D\uDC8E'},
  {col:'B',row:6,type:'ore',icon:'\u26CF\uFE0F'}, {col:'I',row:3,type:'ore',icon:'\u26CF\uFE0F'},
  {col:'E',row:4,type:'gas',icon:'\uD83D\uDCA8'},
];

/* ============================== ROSTER ============================== */
const ROSTER = [{"id":"moto","n":"MOTO","g":"prebuilt","crown":"Na","core":"F","root":"Fe","mov":4,"pwr":7,"hp":9},{"id":"maji","n":"MAJI","g":"prebuilt","crown":"Si","core":"N","root":"Li","mov":7,"pwr":4,"hp":9},{"id":"nova","n":"NOVA","g":"prebuilt","crown":"Au","core":"Os","root":"Pt","mov":5,"pwr":5,"hp":10},{"id":"void","n":"VOID","g":"prebuilt","crown":"Xe","core":"Ir","root":"W","mov":4,"pwr":5,"hp":11},{"id":1,"n":"Amu","g":"amu","crown":"Na","core":"C","root":"Fe","mov":4,"pwr":5,"hp":11,"a":7.8},{"id":2,"n":"Serius B'Amu","g":"amu","crown":"Cu","core":"N","root":"Li","mov":7,"pwr":6,"hp":7,"a":10.79},{"id":3,"n":"Aura Void Amu","g":"amu","crown":"Xe","core":"F","root":"W","mov":4,"pwr":9,"hp":7,"a":11.32},{"id":4,"n":"Temperature Rex","g":"amu","crown":"Fe","core":"Mg","root":"Os","mov":5,"pwr":8,"hp":7,"a":9.6},{"id":5,"n":"Galaxy Rabbit","g":"amu","crown":"Cu","core":"N","root":"Li","mov":8,"pwr":6,"hp":6,"a":9.3},{"id":6,"n":"Flux Fly","g":"amu","crown":"Si","core":"C","root":"N","mov":6,"pwr":6,"hp":8,"a":9.74},{"id":7,"n":"DNA Burglar","g":"amu","crown":"C","core":"N","root":"Cu","mov":5,"pwr":6,"hp":9,"a":9.5},{"id":8,"n":"Timetracker","g":"amu","crown":"Si","core":"Au","root":"W","mov":4,"pwr":7,"hp":9,"a":9.8},{"id":9,"n":"Disco Display","g":"amu","crown":"Au","core":"Cl","root":"Li","mov":5,"pwr":5,"hp":10,"a":9.0},{"id":10,"n":"Resonant Roar","g":"amu","crown":"Cu","core":"F","root":"Fe","mov":4,"pwr":7,"hp":9,"a":9.7},{"id":11,"n":"Auto Matrix","g":"amu","crown":"Fe","core":"W","root":"Ir","mov":5,"pwr":8,"hp":7,"a":9.9},{"id":12,"n":"Jaku","g":"amu","crown":"Fe","core":"Ir","root":"Os","mov":5,"pwr":8,"hp":7,"a":10.2},{"id":13,"n":"Convergence Jaku","g":"amu","crown":"Xe","core":"Ir","root":"Os","mov":4,"pwr":9,"hp":7,"a":11.47},{"id":14,"n":"JaMu Ghawonder","g":"amu","crown":"Au","core":"Xe","root":"W","mov":5,"pwr":8,"hp":7,"a":11.18},{"id":15,"n":"Quantum Man","g":"amu","crown":"Cu","core":"N","root":"Li","mov":5,"pwr":8,"hp":7,"a":10.34},{"id":16,"n":"Astro King","g":"amu","crown":"Au","core":"Ir","root":"Os","mov":4,"pwr":9,"hp":7,"a":10.28},{"id":17,"n":"Quantum Dragon","g":"amu","crown":"Xe","core":"F","root":"W","mov":4,"pwr":9,"hp":7,"a":11.04},{"id":18,"n":"Khepraxis","g":"amu","crown":"Si","core":"Xe","root":"Pt","mov":5,"pwr":7,"hp":8,"a":10.48},{"id":19,"n":"Nemzo","g":"nem","crown":"Au","core":"Fe","root":"C","mov":4,"pwr":8,"hp":8,"a":10.86},{"id":20,"n":"Raikor","g":"nem","crown":"Au","core":"Cu","root":"Li","mov":7,"pwr":6,"hp":7,"a":10.25},{"id":21,"n":"Queen Sylara","g":"nem","crown":"Si","core":"N","root":"W","mov":4,"pwr":5,"hp":11,"a":10.55},{"id":22,"n":"Torgamane","g":"nem","crown":"Si","core":"Fe","root":"W","mov":3,"pwr":7,"hp":10,"a":9.7},{"id":23,"n":"Aeruli","g":"nem","crown":"N","core":"Cl","root":"Li","mov":8,"pwr":6,"hp":6,"a":10.5},{"id":24,"n":"Namiro","g":"nem","crown":"Mg","core":"Cl","root":"Na","mov":4,"pwr":4,"hp":12,"a":10.72},{"id":25,"n":"Noctyra","g":"nem","crown":"Si","core":"C","root":"Fe","mov":6,"pwr":6,"hp":8,"a":10.82},{"id":26,"n":"Sol'Kai","g":"nem","crown":"Si","core":"C","root":"Cu","mov":4,"pwr":4,"hp":12,"a":10.83},{"id":27,"n":"Verdan Roar","g":"nem","crown":"N","core":"C","root":"Mg","mov":3,"pwr":4,"hp":13,"a":10.71},{"id":28,"n":"Orixion","g":"nem","crown":"Au","core":"Os","root":"W","mov":5,"pwr":8,"hp":7,"a":11.32},{"id":29,"n":"Astraeon","g":"nem","crown":"Xe","core":"Fe","root":"Li","mov":5,"pwr":7,"hp":8,"a":11.44},{"id":30,"n":"Ro'Amun","g":"nem","crown":"Au","core":"C","root":"Fe","mov":5,"pwr":7,"hp":8,"a":11.58},{"id":31,"n":"Nemeroth","g":"nem","crown":"Xe","core":"Cl","root":"Ir","mov":4,"pwr":9,"hp":7,"a":11.33},{"id":32,"n":"Melanaris","g":"con","crown":"Si","core":"Xe","root":"Pt","mov":4,"pwr":9,"hp":7,"a":10.61},{"id":33,"n":"Nataraja Nimbus","g":"con","crown":"Mg","core":"N","root":"Li","mov":4,"pwr":4,"hp":12,"a":9.28},{"id":34,"n":"Luma Shipwright","g":"con","crown":"Si","core":"Cu","root":"Fe","mov":5,"pwr":5,"hp":10,"a":9.08},{"id":35,"n":"Wazi","g":"con","crown":"Si","core":"Cu","root":"Au","mov":6,"pwr":7,"hp":7,"a":9.42},{"id":36,"n":"Jinx","g":"con","crown":"Xe","core":"Cl","root":"Li","mov":6,"pwr":8,"hp":6,"a":9.36},{"id":37,"n":"Raleigh","g":"con","crown":"N","core":"Mg","root":"C","mov":4,"pwr":4,"hp":12,"a":8.93},{"id":38,"n":"Groovy Jaava","g":"con","crown":"Cu","core":"N","root":"Li","mov":5,"pwr":5,"hp":10,"a":8.87},{"id":39,"n":"Zeo","g":"con","crown":"Na","core":"N","root":"Li","mov":8,"pwr":6,"hp":6,"a":9.6},{"id":40,"n":"Georgia AI","g":"con","crown":"Cu","core":"Si","root":"W","mov":6,"pwr":7,"hp":7,"a":10.25},{"id":41,"n":"Morales","g":"con","crown":"Cl","core":"F","root":"Li","mov":6,"pwr":7,"hp":7,"a":9.94},{"id":42,"n":"Corain","g":"con","crown":"Cu","core":"Mg","root":"N","mov":5,"pwr":5,"hp":10,"a":10.17},{"id":43,"n":"Proto","g":"con","crown":"Si","core":"Cl","root":"Fe","mov":5,"pwr":6,"hp":9,"a":10.05},{"id":44,"n":"Zayo","g":"con","crown":"Na","core":"N","root":"Li","mov":8,"pwr":6,"hp":6,"a":9.54},{"id":45,"n":"Lumea","g":"con","crown":"Fe","core":"Cu","root":"Si","mov":6,"pwr":6,"hp":8,"a":10.04},{"id":46,"n":"Denni Denim","g":"den","crown":"Cu","core":"N","root":"C","mov":4,"pwr":5,"hp":11,"a":10.56},{"id":47,"n":"War Denni","g":"den","crown":"Cu","core":"F","root":"Fe","mov":4,"pwr":7,"hp":9,"a":9.21},{"id":48,"n":"Mama Shula","g":"den","crown":"Mg","core":"Na","root":"W","mov":4,"pwr":4,"hp":12,"a":8.82},{"id":49,"n":"Marcus Mercy","g":"den","crown":"Na","core":"Mg","root":"Pt","mov":4,"pwr":5,"hp":11,"a":8.75},{"id":50,"n":"Nalo","g":"den","crown":"Si","core":"C","root":"Li","mov":4,"pwr":4,"hp":12,"a":9.19},{"id":51,"n":"Jaylen","g":"den","crown":"Cu","core":"Si","root":"Fe","mov":6,"pwr":7,"hp":7,"a":9.12},{"id":52,"n":"Commander Mercer","g":"den","crown":"Au","core":"Cl","root":"W","mov":4,"pwr":6,"hp":10,"a":9.11},{"id":53,"n":"Oracle","g":"den","crown":"Xe","core":"F","root":"Ir","mov":5,"pwr":8,"hp":7,"a":9.63},{"id":54,"n":"Glerk","g":"ali","crown":"Fe","core":"Os","root":"W","mov":3,"pwr":6,"hp":11,"a":9.64},{"id":55,"n":"Zibra","g":"ali","crown":"Cu","core":"N","root":"Li","mov":3,"pwr":4,"hp":13,"a":9.16},{"id":56,"n":"Piv","g":"ali","crown":"Cu","core":"Si","root":"N","mov":6,"pwr":7,"hp":7,"a":9.04},{"id":57,"n":"Drib","g":"ali","crown":"Si","core":"C","root":"Li","mov":7,"pwr":7,"hp":6,"a":9.31},{"id":58,"n":"Lil Buzz","g":"ali","crown":"Xe","core":"Cl","root":"Li","mov":5,"pwr":6,"hp":9,"a":8.18},{"id":59,"n":"Grandma","g":"ali","crown":"Au","core":"F","root":"W","mov":3,"pwr":7,"hp":10,"a":9.38},{"id":60,"n":"Auntie","g":"ali","crown":"N","core":"Mg","root":"Li","mov":6,"pwr":4,"hp":10,"a":9.51},{"id":61,"n":"Dog-Wasp","g":"ali","crown":"Cl","core":"F","root":"Li","mov":5,"pwr":5,"hp":10,"a":8.31},{"id":62,"n":"Praying Mantis Cat","g":"ali","crown":"Xe","core":"C","root":"Fe","mov":5,"pwr":6,"hp":9,"a":8.58},{"id":63,"n":"Sir Sucksworth","g":"ali","crown":"Xe","core":"Cl","root":"Pt","mov":3,"pwr":4,"hp":13,"a":8.81},{"id":64,"n":"Tooki","g":"ali","crown":"Na","core":"F","root":"Li","mov":5,"pwr":5,"hp":10,"a":7.74},{"id":65,"n":"Buzzbots","g":"ali","crown":"Cu","core":"Fe","root":"Os","mov":5,"pwr":6,"hp":9,"a":8.76},{"id":66,"n":"The Crack","g":"ali","crown":"Xe","core":"Cl","root":"C","mov":6,"pwr":8,"hp":6,"a":9.29},{"id":67,"n":"Malik Vey","g":"cvk","crown":"Na","core":"C","root":"Fe","mov":4,"pwr":7,"hp":9,"a":10.11},{"id":68,"n":"Mama Solaris","g":"cvk","crown":"Mg","core":"Cl","root":"Fe","mov":4,"pwr":4,"hp":12,"a":9.66},{"id":69,"n":"Judge Nox","g":"cvk","crown":"Au","core":"Os","root":"W","mov":4,"pwr":6,"hp":10,"a":10.15},{"id":70,"n":"Bailiff Drumma","g":"cvk","crown":"Cu","core":"Os","root":"Fe","mov":3,"pwr":7,"hp":10,"a":9.93},{"id":71,"n":"Amina Reyes","g":"cvk","crown":"Na","core":"C","root":"Mg","mov":5,"pwr":5,"hp":10,"a":8.87},{"id":72,"n":"Nia Vey","g":"cvk","crown":"Si","core":"N","root":"Mg","mov":4,"pwr":4,"hp":12,"a":9.13},{"id":73,"n":"Dre Vey","g":"cvk","crown":"Xe","core":"Cl","root":"W","mov":5,"pwr":6,"hp":9,"a":8.87},{"id":74,"n":"Archon Valex","g":"cvk","crown":"Au","core":"F","root":"Ir","mov":5,"pwr":8,"hp":7,"a":10.68},{"id":75,"n":"Luma-Light","g":"sll","crown":"Xe","core":"F","root":"Li","mov":8,"pwr":6,"hp":6,"a":10.27},{"id":76,"n":"Grok","g":"sll","crown":"Cu","core":"N","root":"Fe","mov":4,"pwr":7,"hp":9,"a":10.15},{"id":77,"n":"Duet","g":"sll","crown":"Au","core":"F","root":"Cu","mov":5,"pwr":7,"hp":8,"a":11.36},{"id":78,"n":"Chora","g":"sll","crown":"Si","core":"Cu","root":"C","mov":4,"pwr":4,"hp":12,"a":10.23},{"id":79,"n":"Vexar","g":"sll","crown":"Si","core":"Cl","root":"W","mov":6,"pwr":8,"hp":6,"a":10.67},{"id":80,"n":"Oona","g":"sll","crown":"N","core":"Mg","root":"C","mov":4,"pwr":4,"hp":12,"a":10.68},{"id":81,"n":"Tempo","g":"sll","crown":"Cu","core":"N","root":"Li","mov":4,"pwr":7,"hp":9,"a":11.0},{"id":82,"n":"Null, the Quiet Walker","g":"sll","crown":"Xe","core":"F","root":"W","mov":4,"pwr":7,"hp":9,"a":11.05},{"id":83,"n":"Ko'Whayne","g":"afi","crown":"Cu","core":"C","root":"N","mov":4,"pwr":7,"hp":9,"a":10.11},{"id":84,"n":"Ko'Whayne's Younger Brother","g":"afi","crown":"Cl","core":"N","root":"Li","mov":4,"pwr":5,"hp":11,"a":9.69},{"id":85,"n":"Dogon Dragon Host","g":"dgn","crown":"Xe","core":"F","root":"C","mov":5,"pwr":8,"hp":7,"a":9.81},{"id":86,"n":"Dopa-Mine","g":"smw","crown":"Cu","core":"N","root":"Li","mov":7,"pwr":6,"hp":7,"a":9.46},{"id":87,"n":"Sero-Tone","g":"smw","crown":"Mg","core":"C","root":"W","mov":3,"pwr":4,"hp":13,"a":9.57},{"id":88,"n":"Corti-King","g":"smw","crown":"F","core":"Fe","root":"Ir","mov":3,"pwr":7,"hp":10,"a":9.87},{"id":89,"n":"Anxi-Glitch","g":"smw","crown":"Cl","core":"F","root":"Li","mov":8,"pwr":6,"hp":6,"a":9.99},{"id":90,"n":"Oxy-Bond","g":"smw","crown":"Na","core":"Mg","root":"C","mov":4,"pwr":4,"hp":12,"a":9.74},{"id":91,"n":"GABA-Lume","g":"smw","crown":"Xe","core":"Cl","root":"W","mov":3,"pwr":4,"hp":13,"a":9.9},{"id":92,"n":"Nora-Edge","g":"smw","crown":"F","core":"N","root":"Li","mov":7,"pwr":6,"hp":7,"a":10.42},{"id":93,"n":"Acetyl-Spark","g":"smw","crown":"Cu","core":"Si","root":"N","mov":6,"pwr":7,"hp":7,"a":10.29},{"id":94,"n":"Gluta-Matrix","g":"smw","crown":"Si","core":"F","root":"Fe","mov":6,"pwr":8,"hp":6,"a":10.65},{"id":95,"n":"Neuro-Edge","g":"smw","crown":"Cu","core":"C","root":"Li","mov":6,"pwr":7,"hp":7,"a":10.94},{"id":96,"n":"Depra-Shade","g":"smw","crown":"Xe","core":"Cl","root":"W","mov":5,"pwr":6,"hp":9,"a":9.29},{"id":97,"n":"Bread","g":"bbb","crown":"Na","core":"N","root":"Li","mov":5,"pwr":5,"hp":10,"a":8.89},{"id":98,"n":"Bred","g":"bbb","crown":"Si","core":"C","root":"W","mov":4,"pwr":6,"hp":10,"a":8.93},{"id":99,"n":"Bready","g":"bbb","crown":"Au","core":"Cl","root":"Li","mov":6,"pwr":6,"hp":8,"a":9.21},{"id":100,"n":"Joanna Escus","g":"bbb","crown":"Au","core":"Os","root":"Pt","mov":4,"pwr":6,"hp":10,"a":9.64},{"id":101,"n":"Neighborhood Malik","g":"bbb","crown":"Na","core":"F","root":"C","mov":5,"pwr":5,"hp":10,"a":8.77},{"id":102,"n":"Mr. Leon","g":"bbb","crown":"Au","core":"Fe","root":"W","mov":3,"pwr":4,"hp":13,"a":9.45},{"id":103,"n":"Keisha","g":"bbb","crown":"Cu","core":"N","root":"Li","mov":7,"pwr":6,"hp":7,"a":9.91},{"id":104,"n":"Zay","g":"bbb","crown":"Xe","core":"N","root":"C","mov":6,"pwr":6,"hp":8,"a":8.76},{"id":105,"n":"Toast","g":"bbb","crown":"Na","core":"Mg","root":"N","mov":4,"pwr":4,"hp":12,"a":9.15},{"id":106,"n":"Makaveli","g":"b90","crown":"Na","core":"F","root":"Fe","mov":4,"pwr":7,"hp":9,"a":10.2},{"id":107,"n":"Ogunwale","g":"b90","crown":"Cu","core":"Os","root":"W","mov":3,"pwr":4,"hp":13,"a":10.21},{"id":108,"n":"Aminata","g":"b90","crown":"Si","core":"Cu","root":"N","mov":4,"pwr":4,"hp":12,"a":10.42},{"id":109,"n":"Njalji","g":"b90","crown":"Au","core":"Cl","root":"Li","mov":8,"pwr":6,"hp":6,"a":9.85},{"id":110,"n":"Zahra","g":"b90","crown":"Xe","core":"N","root":"Li","mov":6,"pwr":8,"hp":6,"a":10.49},{"id":111,"n":"Shamira","g":"b90","crown":"Si","core":"C","root":"Li","mov":7,"pwr":5,"hp":8,"a":10.91},{"id":112,"n":"Nzinga","g":"b90","crown":"Cu","core":"N","root":"Li","mov":4,"pwr":5,"hp":11,"a":10.88},{"id":113,"n":"N'Doura","g":"b90","crown":"Au","core":"Mg","root":"Fe","mov":3,"pwr":4,"hp":13,"a":10.57},{"id":114,"n":"Naki Karu","g":"mna","crown":"Si","core":"Cl","root":"N","mov":5,"pwr":8,"hp":7,"a":10.58},{"id":115,"n":"The Question Spirit","g":"mna","crown":"Xe","core":"F","root":"Cl","mov":6,"pwr":8,"hp":6,"a":10.93},{"id":116,"n":"Dr. Veil","g":"mna","crown":"Au","core":"Mg","root":"W","mov":4,"pwr":6,"hp":10,"a":9.6},{"id":117,"n":"Lune","g":"mna","crown":"Cu","core":"N","root":"Li","mov":6,"pwr":6,"hp":8,"a":9.81},{"id":118,"n":"AMU Kani","g":"ohm","crown":"Si","core":"C","root":"Mg","mov":5,"pwr":5,"hp":10,"a":10.51},{"id":119,"n":"Kazi","g":"ohm","crown":"C","core":"Cl","root":"Li","mov":6,"pwr":6,"hp":8,"a":10.61},{"id":120,"n":"Lyra Voss","g":"ohm","crown":"Xe","core":"F","root":"W","mov":3,"pwr":7,"hp":10,"a":10.53},{"id":121,"n":"Dr. Threx Valuun","g":"ohm","crown":"Cu","core":"F","root":"Ir","mov":4,"pwr":6,"hp":10,"a":10.02},{"id":122,"n":"Elu Namar","g":"ohm","crown":"N","core":"C","root":"Mg","mov":4,"pwr":4,"hp":12,"a":10.19},{"id":123,"n":"Khemra Sol","g":"ohm","crown":"C","core":"Cl","root":"Li","mov":6,"pwr":7,"hp":7,"a":10.23}];
const GROUPS = {prebuilt:'Prebuilt',amu:'AMU / Octo-Matrix',nem:'Planet Nem',con:'Constellation Saga',den:'Denni Denim',
  ali:'Alien-Like',cvk:'Consumption',sll:'Sounds Like Light',afi:'Afro A-I',dgn:'Dogon Dragon',smw:'See My World',
  bbb:'Bread, Bred & Bready',b90:'Bring Back the 90s',mna:'May Naki Ask',ohm:'Oh No to Mars'};
const GROUP_EMOJI = {prebuilt:'\u2b50',amu:'\uD83C\uDF0C',nem:'\uD83E\uDD81',con:'\uD83D\uDE80',den:'\uD83E\uDEA1',ali:'\uD83D\uDC1D',
  cvk:'\uD83C\uDF7D\uFE0F',sll:'\uD83C\uDF08',afi:'\uD83C\uDF0D',dgn:'\uD83D\uDC09',smw:'\uD83E\uDDE0',bbb:'\uD83C\uDF5E',
  b90:'\uD83D\uDCFC',mna:'\uD83D\uDCE1',ohm:'\uD83E\uDDEC'};
const TYPE_COLOR = {alkali:'#E3706B',metal:'#D9A544',crystal:'#5FB88C',gas:'#5B9BD9',noble:'#B79CE0',heavy:'#9098A4'};

function findChar(id){ return ROSTER.find(r => r.id === id); }

function buildPiece(charId, team, col, row, facing, uidSeed){
  const c = findChar(charId);
  return {
    uid: team+'-'+uidSeed, charId, name:c.n, team, col, row, facing,
    crown:c.crown, core:c.core, root:c.root, moveType: rootMovement(c.root),
    mov:c.mov, pwr:c.pwr, hp:c.hp, maxHp:c.hp,
    dreamSeeds:2, downed:false, respawnIn:0, homeCol:col, homeRow:row,
  };
}

const DEFAULT_YOUR = [54,55,56,66,59]; // Glerk, Zibra, Piv, The Crack, Grandma
const DEFAULT_OPP  = [22,109,105,85,68]; // Torgamane, Njalji, Toast, Dogon Dragon Host, Mama Solaris

function makeDefaultMatch(){
  const yourCols = ['A','C','E','G','J'];
  const oppCols  = ['A','C','E','G','J'];
  const pieces = [];
  DEFAULT_YOUR.forEach((id,i)=> pieces.push(buildPiece(id,'you',yourCols[i],1,'N',i)));
  DEFAULT_OPP.forEach((id,i)=> pieces.push(buildPiece(id,'opp',oppCols[i],8,'S',i)));
  return pieces;
}

function draftOpponent(yourIds){
  const avgAA = yourIds.map(id=>findChar(id).a||9).reduce((a,b)=>a+b,0)/yourIds.length;
  const pool = ROSTER.filter(r => r.a && Math.abs(r.a-avgAA)<0.6 && !yourIds.includes(r.id) && r.g!=='prebuilt');
  const shuffled = [...pool].sort(()=>Math.random()-0.5);
  const picked = [];
  const usedMoves = new Set();
  for(const r of shuffled){
    if(picked.length>=5) break;
    const mt = rootMovement(r.root);
    if(!usedMoves.has(mt) || picked.length>=3){ picked.push(r.id); usedMoves.add(mt); }
  }
  while(picked.length<5 && shuffled.length){ const r=shuffled[picked.length]; if(r && !picked.includes(r.id)) picked.push(r.id); else break; }
  return picked.slice(0,5);
}

/* ============================== MOVEMENT / TARGETING ============================== */
function occupiedMap(pieces, structures){
  const m = new Map();
  pieces.filter(p=>!p.downed).forEach(p => m.set(key(p.col,p.row), {kind:'piece', piece:p}));
  structures.forEach(s => m.set(key(s.col,s.row), {kind:'structure'}));
  return m;
}
function computeReachable(piece, pieces, structures){
  const occ = occupiedMap(pieces, structures);
  const c0 = colIdx(piece.col), r0 = piece.row;
  const moves = [], attacks = [];
  const consider = (ci, r) => {
    if(!inBounds(ci,r)) return false;
    const k = COLS[ci]+r;
    const cell = occ.get(k);
    if(!cell){ moves.push(k); return true; }
    if(cell.kind==='piece' && cell.piece.team !== piece.team){ attacks.push(k); return false; }
    return false; // own piece or structure: blocked, can't land
  };
  if(piece.moveType==='knight'){
    [[1,2],[2,1],[-1,2],[-2,1],[1,-2],[2,-1],[-1,-2],[-2,-1]].forEach(([dc,dr])=>{
      const ci=c0+dc, r=r0+dr;
      if(!inBounds(ci,r)) return;
      const k = COLS[ci]+r; const cell = occ.get(k);
      if(!cell) moves.push(k);
      else if(cell.kind==='piece' && cell.piece.team!==piece.team) attacks.push(k);
    });
  } else if(piece.moveType==='rook' || piece.moveType==='bishop' || piece.moveType==='queen'){
    const dirs = [];
    if(piece.moveType!=='bishop') dirs.push([1,0],[-1,0],[0,1],[0,-1]);
    if(piece.moveType!=='rook') dirs.push([1,1],[1,-1],[-1,1],[-1,-1]);
    dirs.forEach(([dc,dr])=>{
      let ci=c0+dc, r=r0+dr;
      while(inBounds(ci,r)){
        const cont = consider(ci,r);
        if(!cont) break;
        ci+=dc; r+=dr;
      }
    });
    if(piece.moveType==='bishop'){
      [[1,0],[-1,0],[0,1],[0,-1]].forEach(([dc,dr])=>{
        const ci=c0+dc, r=r0+dr;
        if(!inBounds(ci,r)) return;
        const k = COLS[ci]+r; const cell = occ.get(k);
        if(!cell) moves.push(k);
        else if(cell.kind==='piece' && cell.piece.team!==piece.team) attacks.push(k);
      });
    }
  } else { // king
    [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]].forEach(([dc,dr])=>{
      for(let dist=1; dist<=2; dist++){
        const ci=c0+dc*dist, r=r0+dr*dist;
        if(!inBounds(ci,r)) break;
        const k = COLS[ci]+r; const cell = occ.get(k);
        if(!cell) { moves.push(k); continue; }
        if(cell.kind==='piece' && cell.piece.team!==piece.team) attacks.push(k);
        break;
      }
    });
  }
  return {moves:[...new Set(moves)], attacks:[...new Set(attacks)]};
}
function directionBetween(fromCol,fromRow,toCol,toRow){
  const dc = colIdx(toCol)-colIdx(fromCol), dr = toRow-fromRow;
  const sc = Math.sign(dc), sr = Math.sign(dr);
  if(sc===0 && sr===1) return 'N'; if(sc===0 && sr===-1) return 'S';
  if(sc===1 && sr===0) return 'E'; if(sc===-1 && sr===0) return 'W';
  return 'DIAG'; // NE/NW/SE/SW collapsed — resolved as flank below
}
const OPPOSITE = {N:'S',S:'N',E:'W',W:'E'};
function classifyEngagement(attackerFacing, defenderFacing, isFlank){
  if(isFlank) return 'SIDE'; // knight jumps & diagonal bishop hits are ruled as flanking attacks
  if(defenderFacing === OPPOSITE[attackerFacing]) return 'FRONT';
  if(defenderFacing === attackerFacing) return 'BACK';
  return 'SIDE';
}

/* ============================== AI ============================== */
function aiPickTriangle(){
  const opts = ['Crown','Core','Root'];
  return opts[Math.floor(Math.random()*3)];
}
function aiTakeTurn(pieces, structures, kopani){
  const mine = pieces.filter(p=>p.team==='opp' && !p.downed);
  if(mine.length===0) return null;
  // prefer a piece that has an attack available
  let best = null;
  for(const p of mine){
    const {attacks} = computeReachable(p, pieces, structures);
    if(attacks.length){ best = {piece:p, target:attacks[Math.floor(Math.random()*attacks.length)], type:'attack'}; break; }
  }
  if(!best){
    // move toward the nearest enemy, or toward kopani if closer
    const enemies = pieces.filter(p=>p.team==='you' && !p.downed);
    let bestMove = null, bestScore = -1;
    for(const p of mine){
      const {moves} = computeReachable(p, pieces, structures);
      if(!moves.length) continue;
      for(const m of moves){
        const mc = colIdx(m.slice(0,1)), mr = parseInt(m.slice(1));
        let score = 0;
        if(enemies.length){
          const nearest = enemies.reduce((a,b)=> {
            const da = Math.abs(colIdx(a.col)-mc)+Math.abs(a.row-mr);
            const db = Math.abs(colIdx(b.col)-mc)+Math.abs(b.row-mr);
            return db<da?b:a;
          });
          const dist = Math.abs(colIdx(nearest.col)-mc)+Math.abs(nearest.row-mr);
          score -= dist;
        }
        if(kopani && !kopani.taken){
          const kd = Math.abs(colIdx(kopani.col)-mc)+Math.abs(kopani.row-mr);
          score += (kd===0? 5 : -kd*0.3);
        }
        if(score>bestScore){ bestScore=score; bestMove={piece:p, target:m, type:'move'}; }
      }
    }
    best = bestMove;
  }
  return best;
}

/* ============================== UI HELPERS ============================== */
function HpBar({hp,maxHp,color}){
  const pct = Math.max(0, Math.min(100, (hp/maxHp)*100));
  return (
    <div style={{width:'100%',height:4,background:'rgba(255,255,255,0.15)',borderRadius:2,overflow:'hidden'}}>
      <div style={{width:pct+'%',height:'100%',background:color,transition:'width .3s'}}/>
    </div>
  );
}

function ElBadge({sym}){
  const t = ELEMENTS[sym].type;
  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-mono border"
      style={{borderColor:TYPE_COLOR[t]+'88', color:'#ECE7DA'}}>
      <span style={{width:6,height:6,borderRadius:9999,background:TYPE_COLOR[t],display:'inline-block'}}/>{sym}
    </span>
  );
}

/* ============================== MAIN COMPONENT ============================== */
export default function CCRFullSetArena(){
  const [screen, setScreen] = useState('start'); // start | draft | board
  const [draftPick, setDraftPick] = useState([]);
  const [draftSearch, setDraftSearch] = useState('');
  const [draftGroup, setDraftGroup] = useState('');

  const [pieces, setPieces] = useState([]);
  const [structures] = useState(STRUCTURES);
  const [turn, setTurn] = useState('you');
  const [stars, setStars] = useState({you:5, opp:5});
  const [kopani, setKopani] = useState({col:'D', row:5, respawnIn:0, taken:false});
  const [selectedUid, setSelectedUid] = useState(null);
  const [pendingFacing, setPendingFacing] = useState(null); // uid awaiting facing choice
  const [pendingTriangle, setPendingTriangle] = useState(null); // {attackerUid, defenderUid, engagement, flank}
  const [log, setLog] = useState([]);
  const [winner, setWinner] = useState(null);
  const logRef = useRef(null);

  useEffect(()=>{ if(logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight; }, [log]);

  const pushLog = useCallback((msg)=> setLog(l => [...l.slice(-60), msg]), []);

  function startMatch(yourIds, oppIds, label){
    const yourCols = ['A','C','E','G','J'], oppCols = ['A','C','E','G','J'];
    const ps = [];
    yourIds.forEach((id,i)=> ps.push(buildPiece(id,'you',yourCols[i],1,'N',i)));
    oppIds.forEach((id,i)=> ps.push(buildPiece(id,'opp',oppCols[i],8,'S',i)));
    setPieces(ps); setTurn('you'); setStars({you:5,opp:5});
    setKopani({col:'D',row:5,respawnIn:0,taken:false});
    setSelectedUid(null); setPendingFacing(null); setPendingTriangle(null); setWinner(null);
    setLog([label || 'Match begins.']);
    setScreen('board');
  }

  function startDefault(){ startMatch(DEFAULT_YOUR, DEFAULT_OPP, "Alien-Like Crew vs. Torgamane's Set \u2014 opening position."); }
  function confirmDraft(){
    if(draftPick.length!==5) return;
    const opp = draftOpponent(draftPick);
    startMatch(draftPick, opp, 'New draft: ' + draftPick.map(id=>findChar(id).n).join(', ') + '.');
  }

  const myPieces = pieces.filter(p=>p.team==='you');
  const oppPieces = pieces.filter(p=>p.team==='opp');

  function checkWin(list){
    const youAlive = list.some(p=>p.team==='you' && !(p.hp<=0 && p.dreamSeeds<=0 && p.downed===false) && !(p.eliminated));
    const oppAlive = list.some(p=>p.team==='opp' && !p.eliminated);
    const youEliminated = list.filter(p=>p.team==='you').every(p=>p.eliminated);
    const oppEliminated = list.filter(p=>p.team==='opp').every(p=>p.eliminated);
    if(oppEliminated) return 'you';
    if(youEliminated) return 'opp';
    return null;
  }

  function applyDamage(list, defenderUid, dmg, attackerTeam){
    return list.map(p => {
      if(p.uid!==defenderUid) return p;
      let hp = p.hp - dmg;
      if(hp>0) return {...p, hp};
      // HP depleted
      if(p.dreamSeeds>0){
        const newMax = Math.round(p.maxHp*1.10);
        return {...p, hp:Math.round(newMax*0.5), maxHp:newMax, dreamSeeds:p.dreamSeeds-1, downed:true, respawnIn:2};
      }
      return {...p, hp:0, eliminated:true, downed:true};
    });
  }

  function resolveCombat(attackerUid, defenderUid, engagement, flank, triangleChoice){
    setPieces(prev => {
      const attacker = prev.find(p=>p.uid===attackerUid);
      const defender = prev.find(p=>p.uid===defenderUid);
      if(!attacker || !defender) return prev;
      let triangleResult = null, atkPick = triangleChoice, defPick = null;
      if(engagement==='FRONT'){
        defPick = aiPickTriangle();
        triangleResult = resolveTriangle(atkPick, defPick);
      }
      const bond = bondMult(attacker.core, defender.core);
      const tMult = typeMult(ELEMENTS[attacker.core].type, ELEMENTS[defender.core].type);
      const compound = findCompound([attacker.crown,attacker.core,attacker.root],[defender.crown,defender.core,defender.root]);
      const dmg = computeDamage({pwr:attacker.pwr, engagement, triangleResult, bond, tMult, compound});

      let msg = `${attacker.name} attacks ${defender.name} \u2014 ${engagement}` + (engagement==='FRONT'? ` (${atkPick} vs ${defPick}, ${triangleResult==='TIE'?'tie':triangleResult==='ATK_WIN'?attacker.name+' wins the triangle':defender.name+' wins the triangle'})`:'') + `.`;
      msg += ` Bond: ${bond.kind} (\u00d7${bond.mult}). Type: \u00d7${tMult}.` + (compound? ` Compound! ${compound.name} \u00d7${compound.mult}.`:'');
      msg += ` \u2192 ${dmg} damage to ${defender.name}.`;

      let next = applyDamage(prev, defenderUid, dmg, attacker.team);
      let starsGain = {you:0, opp:0};
      starsGain[attacker.team] += 2;

      // defender counterattack on TIE or DEF_WIN (front fight only)
      if(engagement==='FRONT' && (triangleResult==='TIE' || triangleResult==='DEF_WIN') ){
        const defScalar = triangleResult==='TIE' ? 0.6 : 1.0;
        const backBond = bondMult(defender.core, attacker.core);
        const backT = typeMult(ELEMENTS[defender.core].type, ELEMENTS[attacker.core].type);
        const backDmg = Math.max(1, Math.round(defender.pwr*defScalar*backBond.mult*backT*(compound?compound.mult:1)));
        next = applyDamage(next, attackerUid, backDmg, defender.team);
        starsGain[defender.team] += 1;
        msg += ` ${defender.name} lands a return hit for ${backDmg}.`;
      }
      setStars(s => ({you: s.you+starsGain.you, opp: s.opp+starsGain.opp}));
      pushLog(msg);

      const eliminatedNow = next.find(p=>p.uid===defenderUid && p.eliminated && !prev.find(q=>q.uid===defenderUid).eliminated);
      if(eliminatedNow) pushLog(`${defender.name} is out of Dream Seeds \u2014 eliminated.`);
      else {
        const seeded = next.find(p=>p.uid===defenderUid);
        if(seeded && seeded.downed && seeded.hp>0) pushLog(`${defender.name} falls but a Dream Seed catches it \u2014 back in 2 turns at ${seeded.maxHp} max HP.`);
      }
      const w = checkWin(next);
      if(w) { setWinner(w); pushLog(w==='you' ? 'Your Set wins the match.' : "Opponent's Set wins the match."); }
      else if(stars.you+starsGain.you>=20){ setWinner('you'); pushLog('20\u2605 reached \u2014 your Set wins.'); }
      else if(stars.opp+starsGain.opp>=20){ setWinner('opp'); pushLog('20\u2605 reached \u2014 opponent wins.'); }
      return next;
    });
  }

  function handleCellClick(colName, row){
    if(winner) return;
    const k = colName+row;
    const target = pieces.find(p=>p.col===colName && p.row===row && !p.downed);

    if(pendingFacing){
      return; // waiting on facing buttons, ignore board clicks
    }
    if(pendingTriangle){
      return; // waiting on triangle buttons
    }

    if(turn!=='you') return;

    if(!selectedUid){
      if(target && target.team==='you'){ setSelectedUid(target.uid); }
      return;
    }
    const sel = pieces.find(p=>p.uid===selectedUid);
    if(!sel){ setSelectedUid(null); return; }
    if(target && target.team==='you'){ setSelectedUid(target.uid); return; }

    const {moves, attacks} = computeReachable(sel, pieces, structures);
    if(moves.includes(k)){
      setPieces(prev => prev.map(p => p.uid===sel.uid ? {...p, col:colName, row} : p));
      pushLog(`${sel.name} moves to ${k}.`);
      // kopani pickup
      if(kopani.col===colName && kopani.row===row && !kopani.taken){
        setPieces(prev => prev.map(p => p.uid===sel.uid ? {...p, hp:Math.min(p.maxHp, Math.round(p.hp + p.maxHp*0.18))} : p));
        setStars(s => ({...s, you: s.you+5}));
        pushLog(`${sel.name} collects the Kopani \u2014 +5\u2605, +18% HP restored.`);
        setKopani({col:null,row:null,taken:true,respawnIn:4});
      }
      setStars(s => ({...s, you: s.you+1}));
      setSelectedUid(null);
      setPendingFacing(sel.uid);
      return;
    }
    if(attacks.includes(k) && target && target.team==='opp'){
      const dir = directionBetween(sel.col, sel.row, colName, row);
      const flank = sel.moveType==='knight' || dir==='DIAG';
      const facingTowardTarget = dir==='DIAG' ? sel.facing : dir;
      setPieces(prev => prev.map(p => p.uid===sel.uid ? {...p, facing:facingTowardTarget} : p));
      const engagement = classifyEngagement(facingTowardTarget, target.facing, flank);
      setSelectedUid(null);
      if(engagement==='FRONT'){
        setPendingTriangle({attackerUid:sel.uid, defenderUid:target.uid, engagement, flank});
      } else {
        resolveCombat(sel.uid, target.uid, engagement, flank, engagement==='SIDE' ? 'Crown' : null);
        endYourTurn();
      }
      return;
    }
    setSelectedUid(null);
  }

  function chooseFacing(dir){
    setPieces(prev => prev.map(p => p.uid===pendingFacing ? {...p, facing:dir} : p));
    pushLog(`${pieces.find(p=>p.uid===pendingFacing)?.name} sets facing ${dir}.`);
    setPendingFacing(null);
    endYourTurn();
  }

  function chooseTriangle(pick){
    if(!pendingTriangle) return;
    resolveCombat(pendingTriangle.attackerUid, pendingTriangle.defenderUid, pendingTriangle.engagement, pendingTriangle.flank, pick);
    setPendingTriangle(null);
    endYourTurn();
  }

  function endYourTurn(){
    setTimeout(()=> setTurn('opp'), 250);
  }

  // AI turn effect
  useEffect(()=>{
    if(turn!=='opp' || winner) return;
    const t = setTimeout(()=>{
      const decision = aiTakeTurn(pieces, structures, kopani);
      if(!decision){ setTurn('you'); return; }
      const {piece, target, type} = decision;
      if(type==='move'){
        const colName = target.slice(0,1), row = parseInt(target.slice(1));
        setPieces(prev => prev.map(p => p.uid===piece.uid ? {...p, col:colName, row} : p));
        pushLog(`${piece.name} moves to ${target}.`);
        if(kopani.col===colName && kopani.row===row && !kopani.taken){
          setPieces(prev => prev.map(p => p.uid===piece.uid ? {...p, hp:Math.min(p.maxHp, Math.round(p.hp+p.maxHp*0.18))} : p));
          setStars(s=>({...s, opp:s.opp+5}));
          pushLog(`${piece.name} collects the Kopani \u2014 +5\u2605, +18% HP restored.`);
          setKopani({col:null,row:null,taken:true,respawnIn:4});
        }
        setStars(s=>({...s, opp:s.opp+1}));
        const dirs = ['N','S','E','W'];
        const enemies = pieces.filter(p=>p.team==='you' && !p.downed);
        let faceDir = 'S';
        if(enemies.length){
          const nearest = enemies[0];
          const d = directionBetween(colName,row,nearest.col,nearest.row);
          faceDir = d==='DIAG' ? 'S' : d;
        }
        setPieces(prev => prev.map(p => p.uid===piece.uid ? {...p, facing:faceDir} : p));
        setTimeout(()=> setTurn('you'), 300);
      } else {
        const colName = target.slice(0,1), row = parseInt(target.slice(1));
        const defender = pieces.find(p=>p.col===colName && p.row===row && p.team==='you');
        if(!defender){ setTurn('you'); return; }
        const dir = directionBetween(piece.col, piece.row, colName, row);
        const flank = piece.moveType==='knight' || dir==='DIAG';
        const facingTowardTarget = dir==='DIAG' ? piece.facing : dir;
        setPieces(prev => prev.map(p => p.uid===piece.uid ? {...p, facing:facingTowardTarget} : p));
        const engagement = classifyEngagement(facingTowardTarget, defender.facing, flank);
        const pick = aiPickTriangle();
        resolveCombat(piece.uid, defender.uid, engagement, flank, pick);
        setTimeout(()=> setTurn('you'), 300);
      }
    }, 700);
    return ()=> clearTimeout(t);
    // eslint-disable-next-line
  }, [turn]);

  // downed-piece respawn ticking (advance whenever the OWNER's turn starts)
  useEffect(()=>{
    setPieces(prev => prev.map(p => {
      if(!p.downed || p.eliminated) return p;
      if(p.team!==turn) return p;
      if(p.respawnIn>1) return {...p, respawnIn:p.respawnIn-1};
      return {...p, downed:false, respawnIn:0, col:p.homeCol, row:p.homeRow};
    }));
  }, [turn]);

  const filteredRoster = useMemo(()=>{
    return ROSTER.filter(r=>{
      if(draftGroup && r.g!==draftGroup) return false;
      if(draftSearch && !r.n.toLowerCase().includes(draftSearch.toLowerCase())) return false;
      return true;
    }).slice(0,300);
  }, [draftSearch, draftGroup]);

  /* ============================== SCREENS ============================== */
  if(screen==='start'){
    return (
      <div style={{background:'#0C0E12',color:'#ECE7DA',minHeight:480,fontFamily:'system-ui,sans-serif'}} className="p-6 rounded-xl">
        <div className="mb-1 text-xs font-mono tracking-widest uppercase text-stone-400">Crown \u00b7 Core \u00b7 Root</div>
        <h1 className="text-3xl font-bold mb-1">Full Set Arena</h1>
        <p className="text-stone-400 mb-6 text-sm">Draft five. Play it like chess. Fight it like CCR.</p>
        <div className="flex flex-col gap-3 max-w-md">
          <button onClick={startDefault} className="text-left p-4 rounded-lg border border-stone-700 hover:border-teal-500 transition">
            <div className="font-semibold">Continue: Alien-Like Crew vs. Torgamane's Set</div>
            <div className="text-xs text-stone-400 mt-1">Glerk \u00b7 Zibra \u00b7 Piv \u00b7 The Crack \u00b7 Grandma \u2014 pick up exactly where we left off.</div>
          </button>
          <button onClick={()=>setScreen('draft')} className="text-left p-4 rounded-lg border border-stone-700 hover:border-amber-500 transition">
            <div className="font-semibold">Draft a new Set</div>
            <div className="text-xs text-stone-400 mt-1">Pick 5 from all 123 WIR builds + the 4 CCR prebuilts.</div>
          </button>
        </div>
      </div>
    );
  }

  if(screen==='draft'){
    return (
      <div style={{background:'#0C0E12',color:'#ECE7DA',minHeight:480,fontFamily:'system-ui,sans-serif'}} className="p-5 rounded-xl">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-bold">Draft Your Set ({draftPick.length}/5)</h2>
          <button onClick={()=>setScreen('start')} className="text-xs text-stone-400 hover:text-stone-200">\u2190 back</button>
        </div>
        <div className="flex gap-2 mb-3">
          <input value={draftSearch} onChange={e=>setDraftSearch(e.target.value)} placeholder="Search name\u2026"
            className="flex-1 bg-stone-900 border border-stone-700 rounded px-3 py-2 text-sm font-mono" />
          <select value={draftGroup} onChange={e=>setDraftGroup(e.target.value)} className="bg-stone-900 border border-stone-700 rounded px-2 py-2 text-sm font-mono">
            <option value="">All</option>
            {Object.keys(GROUPS).map(g=> <option key={g} value={g}>{GROUP_EMOJI[g]} {GROUPS[g]}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-80 overflow-y-auto mb-4 pr-1">
          {filteredRoster.map(r=>{
            const picked = draftPick.includes(r.id);
            return (
              <button key={r.id}
                onClick={()=> setDraftPick(picked ? draftPick.filter(x=>x!==r.id) : (draftPick.length<5 ? [...draftPick, r.id] : draftPick))}
                className={"text-left p-2 rounded border text-xs " + (picked ? "border-teal-500 bg-teal-950" : "border-stone-700 hover:border-stone-500")}>
                <div className="font-semibold">{GROUP_EMOJI[r.g]} {r.n}</div>
                <div className="text-stone-400 font-mono mt-0.5">{r.crown}/{r.core}/{r.root} \u00b7 {rootMovement(r.root)}</div>
              </button>
            );
          })}
        </div>
        <button disabled={draftPick.length!==5} onClick={confirmDraft}
          className={"px-4 py-2 rounded font-semibold " + (draftPick.length===5 ? "bg-teal-600 hover:bg-teal-500" : "bg-stone-800 text-stone-500 cursor-not-allowed")}>
          Confirm Set & Start Match
        </button>
      </div>
    );
  }

  /* ============================== BOARD SCREEN ============================== */
  const sel = pieces.find(p=>p.uid===selectedUid);
  const reach = sel ? computeReachable(sel, pieces, structures) : {moves:[],attacks:[]};

  return (
    <div style={{background:'#0C0E12',color:'#ECE7DA',minHeight:600,fontFamily:'system-ui,sans-serif'}} className="p-4 rounded-xl">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="text-sm font-mono">
          <span className="text-teal-400">\u2605 You {stars.you}</span>
          <span className="mx-2 text-stone-600">|</span>
          <span className="text-rose-400">\u2605 Opp {stars.opp}</span>
        </div>
        <div className="text-xs font-mono px-2 py-1 rounded border border-stone-700">
          {winner ? (winner==='you' ? 'YOU WIN' : 'OPPONENT WINS') : (turn==='you' ? "Your move" : "Opponent's move\u2026")}
        </div>
        <button onClick={()=>setScreen('start')} className="text-xs text-stone-400 hover:text-stone-200">New match</button>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        <div style={{overflowX:'auto'}}>
          <div style={{display:'grid', gridTemplateColumns:'24px repeat(10, minmax(30px,38px))', gap:2, width:'fit-content'}}>
            <div />
            {COLS.map(c => <div key={c} className="text-[10px] text-center text-stone-500 font-mono">{c}</div>)}
            {[1,2,3,4,5,6,7,8].slice().reverse().map(row => (
              <React.Fragment key={row}>
                <div className="text-[10px] text-stone-500 font-mono flex items-center">{row}</div>
                {COLS.map(c => {
                  const p = pieces.find(pp=>pp.col===c && pp.row===row && !pp.downed);
                  const struct = structures.find(s=>s.col===c && s.row===row);
                  const isKo = kopani.col===c && kopani.row===row && !kopani.taken;
                  const k = c+row;
                  const isMoveTarget = reach.moves.includes(k);
                  const isAtkTarget = reach.attacks.includes(k);
                  const isSelected = sel && sel.col===c && sel.row===row;
                  return (
                    <div key={c} onClick={()=>handleCellClick(c,row)}
                      style={{
                        aspectRatio:'1', minWidth:30, minHeight:30,
                        background: isSelected ? 'rgba(79,168,160,0.35)' : isAtkTarget ? 'rgba(181,83,60,0.35)' : isMoveTarget ? 'rgba(95,184,140,0.25)' : '#15181D',
                        border:'1px solid #262B33', borderRadius:4, cursor: (isMoveTarget||isAtkTarget||p) ? 'pointer':'default',
                        display:'flex', alignItems:'center', justifyContent:'center', position:'relative'
                      }}>
                      {struct && !p && <span style={{fontSize:14}}>{struct.icon}</span>}
                      {isKo && !p && <span style={{fontSize:14}}>\uD83D\uDC19</span>}
                      {p && (
                        <div style={{textAlign:'center', width:'100%'}}>
                          <div style={{
                            width:22,height:22,borderRadius:9999,margin:'0 auto',
                            background: p.team==='you' ? '#4FA8A0' : '#B5533C',
                            display:'flex',alignItems:'center',justifyContent:'center',
                            fontSize:8,fontWeight:700,color:'#0C0E12',fontFamily:'monospace'
                          }}>{p.name.slice(0,2)}</div>
                          <div style={{fontSize:7,color:'#9CA0A8',marginTop:1}}>{p.facing}</div>
                          <div style={{padding:'0 2px'}}><HpBar hp={p.hp} maxHp={p.maxHp} color={p.team==='you'?'#4FA8A0':'#B5533C'} /></div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="flex-1 min-w-[240px]">
          {pendingFacing && (
            <div className="mb-3 p-3 rounded border border-amber-600 bg-amber-950">
              <div className="text-sm font-semibold mb-2">Set {pieces.find(p=>p.uid===pendingFacing)?.name}'s facing:</div>
              <div className="flex gap-2">
                {['N','E','S','W'].map(d => <button key={d} onClick={()=>chooseFacing(d)} className="px-3 py-1.5 rounded bg-stone-800 hover:bg-stone-700 text-sm font-mono">{d}</button>)}
              </div>
            </div>
          )}
          {pendingTriangle && (
            <div className="mb-3 p-3 rounded border border-rose-600 bg-rose-950">
              <div className="text-sm font-semibold mb-2">Front Fight \u2014 pick Crown / Core / Root:</div>
              <div className="flex gap-2">
                {['Crown','Core','Root'].map(t => <button key={t} onClick={()=>chooseTriangle(t)} className="px-3 py-1.5 rounded bg-stone-800 hover:bg-stone-700 text-sm">{t}</button>)}
              </div>
            </div>
          )}

          <div className="mb-3">
            <div className="text-xs uppercase tracking-wide text-stone-500 mb-1">Your Set</div>
            {myPieces.map(p => (
              <div key={p.uid} className="flex items-center gap-2 text-xs mb-1 font-mono">
                <span className="w-24 truncate">{p.eliminated? '\u2620 ':''}{p.name}</span>
                <ElBadge sym={p.crown}/><ElBadge sym={p.core}/><ElBadge sym={p.root}/>
                <span className="text-stone-400">HP {Math.max(0,p.hp)}/{p.maxHp}</span>
                {p.downed && !p.eliminated && <span className="text-amber-400">respawn {p.respawnIn}</span>}
              </div>
            ))}
          </div>
          <div className="mb-3">
            <div className="text-xs uppercase tracking-wide text-stone-500 mb-1">Opponent Set</div>
            {oppPieces.map(p => (
              <div key={p.uid} className="flex items-center gap-2 text-xs mb-1 font-mono">
                <span className="w-24 truncate">{p.eliminated? '\u2620 ':''}{p.name}</span>
                <span className="text-stone-400">HP {Math.max(0,p.hp)}/{p.maxHp}</span>
                {p.downed && !p.eliminated && <span className="text-amber-400">respawn {p.respawnIn}</span>}
              </div>
            ))}
          </div>

          <div className="text-xs uppercase tracking-wide text-stone-500 mb-1">Log</div>
          <div ref={logRef} style={{maxHeight:150, overflowY:'auto'}} className="text-[11px] font-mono text-stone-300 space-y-1 border border-stone-800 rounded p-2 bg-stone-950">
            {log.map((l,i)=> <div key={i}>{l}</div>)}
          </div>
        </div>
      </div>
    </div>
  );
}
