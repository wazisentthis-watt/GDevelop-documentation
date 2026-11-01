import { useState, useMemo } from 'react';
import { Sparkles, Zap, Shield, Wind, Loader2, AlertCircle, Dna } from 'lucide-react';
import ccrCore from './ccr-core.js';

/* ══════════════════════════════════════════════════
   REAL ATOMIC DATA + REAL FORMULA — shared with the shipped CCR v14 engine
   via ccr-core.js, not a second hand-copied table. (The old copy here had
   quietly drifted from the shipped numbers — wrong conductivity units on
   several heavy elements, Xenon's electronegativity changed from 0.00 to
   2.60, a few atomic radii off by tens of picometers. This import is the
   fix: one source of truth, not two that can disagree.)
   ══════════════════════════════════════════════════ */
const { ELEM, calcStats: coreCalcStats, mvPattern: coreMvPattern, findC } = ccrCore;
const ELEM_NAMES = {Li:'Lithium',C:'Carbon',O:'Oxygen',Si:'Silicon',N:'Nitrogen',F:'Fluorine',Na:'Sodium',Mg:'Magnesium',P:'Phosphorus',Cl:'Chlorine',Ca:'Calcium',Ti:'Titanium',Cr:'Chromium',Fe:'Iron',Cu:'Copper',Mo:'Molybdenum',Ag:'Silver',Xe:'Xenon',W:'Tungsten',Os:'Osmium',Ir:'Iridium',Pt:'Platinum',Au:'Gold',U:'Uranium'};
const ELEMS = Object.keys(ELEM);

// calcStats/mvPattern here are thin wrappers: same engine, Builder-friendly shape
// (Title Case pattern names, a flat battlePower field, PRED clamped to 100 for display).
function calcStats(cr, co, ro){
  const s = coreCalcStats(cr, co, ro);
  const battlePower = Math.round(18 + Math.sqrt(Math.max(0,s.RAW))*14 + s.STB*10);
  return { ...s, PRED: Math.min(100, s.PRED), battlePower };
}
function mvPattern(ro){
  const p = coreMvPattern(ro);
  return p.charAt(0).toUpperCase() + p.slice(1);
}
function isMetalLike(t){ return t==='metal' || t==='heavy'; }
function bondType(a, b){
  const ea = ELEM[a], eb = ELEM[b];
  const dEN = Math.abs(ea.EN - eb.EN);
  if(ea.type==='noble' || eb.type==='noble') return {name:'PHASE-THROUGH', desc:'resists bonding entirely', dEN};
  if(isMetalLike(ea.type) && isMetalLike(eb.type)) return {name:'METALLIC', desc:'electrons shared across the whole structure', dEN};
  if(dEN > 1.7) return {name:'IONIC', desc:'electrons fully transfer', dEN};
  if(dEN >= 0.4) return {name:'POLAR COVALENT', desc:'electrons shared unevenly', dEN};
  return {name:'COVALENT', desc:'electrons shared evenly', dEN};
}
const COMPOUND_FX = {
  NaCl:'Chain damage ×3 to adjacent tiles', 'WF₆':'Maximum damage — dissolves structure',
  'Ca₃P₂':'Bone-mineral armor forms', 'Fe₂O₃':'Terrain oxidizes — rust spreads',
  UC:'Sustained fuel burn', NaF:'Strongest ionic chain in the game',
  'SiO₂':'Quartz field — insulated', MgO:'Healing chemistry', LiF:'Rapid stabilization',
};
function findCompound(a,b){
  const c = findC(a,b);
  if(!c || !COMPOUND_FX[c.name]) return undefined; // Builder only surfaces the 9 compounds it has flavor text for
  return { a:c.a, b:c.b, name:c.name, kJ:c.kJ, fx:COMPOUND_FX[c.name] };
}

/* Move generation — every move traces to a real number or real bond, nothing free-floating */
function BOND_MOVE_NAME(bond){
  return {IONIC:'Transfer Strike', METALLIC:'Resonance Wave', COVALENT:'Bound Exchange',
    'POLAR COVALENT':'Uneven Surge', 'PHASE-THROUGH':'Phase Slip'}[bond];
}
function generateMoves(crown, core, root, stats){
  const cCore = bondType(crown, core), cRoot = bondType(core, root), rCrown = bondType(root, crown);
  const pairs = [cCore, cRoot, rCrown];
  const strongest = pairs.reduce((a,b)=> b.dEN > a.dEN ? b : a);
  const compound = findCompound(crown, core) || findCompound(core, root) || findCompound(crown, root);
  const moves = [
    { name:`${ELEM_NAMES[crown]} Read`, type:'Crown', cost:`${Math.max(1,Math.round(stats.PRI*2))} SP`,
      desc:`Reads the field through ${crown}'s conductivity — ${stats.PRED}% prediction accuracy on the opponent's next Triangle pick.` },
    { name:`${ELEM_NAMES[core]} Strike`, type:'Core', cost:`${Math.max(2,Math.round(stats.RAW*8))} AP`,
      desc:`A direct attack scaled to ${core}'s affinity — RAW output ${stats.RAW}.` },
    { name:`${ELEM_NAMES[root]} Guard`, type:'Root', cost:`${mvPattern(root)} movement`,
      desc:`Stability from ${root}'s hardness and melting point — STB ${stats.STB}, moves like a ${mvPattern(root)}.` },
    { name: BOND_MOVE_NAME(strongest.name), type:'Signature', cost:`${stats.BLAST} tile radius`,
      desc:`The strongest bond in this build — ${strongest.name} between the two closest elements (ΔEN ${strongest.dEN.toFixed(2)}): ${strongest.desc}.` },
  ];
  if(compound){
    moves.push({ name:`${compound.name} Formation`, type:'Compound Ultimate', cost:'Once per match',
      desc:`${crown}/${core}/${root} contains a real known reaction — ${compound.name}, ${compound.kJ} kJ/mol. ${compound.fx}.` });
  }
  return moves;
}

const TYPE_COLOR = { Crown:'#B388FF', Core:'#FF6B6B', Root:'#4ECDC4', Signature:'#FFD84D', 'Compound Ultimate':'#00E5CC' };

export default function CCRBuilder(){
  const [mode, setMode] = useState('mella');
  const [crown, setCrown] = useState('Au');
  const [core, setCore] = useState('Fe');
  const [root, setRoot] = useState('C');
  const [kEl, setKEl] = useState('O');
  const [name, setName] = useState('');
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const activeCrown = mode==='mella' ? crown : kEl;
  const activeCore  = mode==='mella' ? core  : kEl;
  const activeRoot  = mode==='mella' ? root  : kEl;

  const stats = useMemo(()=> calcStats(activeCrown, activeCore, activeRoot), [activeCrown, activeCore, activeRoot]);
  const moves = useMemo(()=> generateMoves(activeCrown, activeCore, activeRoot, stats), [activeCrown, activeCore, activeRoot, stats]);

  async function handleAI(){
    if(!prompt.trim()) return;
    setLoading(true); setErr('');
    try{
      const list = ELEMS.join(', ');
      const ask = mode==='mella'
        ? `Pick three DIFFERENT elements (Crown, Core, Root) from ONLY this list: ${list}. Crown = perception/identity, Core = attack/energy, Root = structure/movement.`
        : `Pick ONE element from ONLY this list: ${list} that best matches this concept.`;
      const userMsg = `You design characters for CCR, a real chemistry-combat game. Character concept: "${prompt}". ${ask} Respond with ONLY raw JSON, no markdown fences, no preamble: ${mode==='mella' ? '{"name":"...","crown":"Xx","core":"Xx","root":"Xx","flavor":"one sentence"}' : '{"name":"...","element":"Xx","flavor":"one sentence"}'}`;
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ model:'claude-sonnet-4-6', max_tokens:300, messages:[{role:'user', content:userMsg}] })
      });
      const data = await res.json();
      const textBlock = (data.content||[]).find(b=>b.type==='text');
      const raw = (textBlock?.text || '').replace(/```json|```/g,'').trim();
      const parsed = JSON.parse(raw);
      if(mode==='mella'){
        if(!ELEM[parsed.crown] || !ELEM[parsed.core] || !ELEM[parsed.root]) throw new Error('invalid element in AI response');
        setCrown(parsed.crown); setCore(parsed.core); setRoot(parsed.root);
      } else {
        if(!ELEM[parsed.element]) throw new Error('invalid element in AI response');
        setKEl(parsed.element);
      }
      setName(parsed.name || '');
    }catch(e){
      setErr('Could not generate from that prompt — try rephrasing, or pick elements directly below.');
    }
    setLoading(false);
  }

  return (
    <div style={{minHeight:'100vh', background:'#060C10', color:'#E6EDF3', fontFamily:'-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif', padding:'16px'}}>
      <div style={{maxWidth:520, margin:'0 auto'}}>
        <h1 style={{fontSize:18, color:'#C8940A', margin:'0 0 4px', display:'flex', alignItems:'center', gap:8}}>
          <Dna size={20}/> CCR Builder
        </h1>
        <p style={{fontSize:11, color:'#8B949E', margin:'0 0 16px', textTransform:'uppercase', letterSpacing:0.5}}>
          Real atomic data in. Real CCR stats out. Nothing invented.
        </p>

        <div style={{display:'flex', gap:8, marginBottom:16}}>
          {['mella','kopani'].map(m => (
            <button key={m} onClick={()=>setMode(m)}
              style={{flex:1, padding:'10px', borderRadius:10, border:'1px solid #30363D',
                background: mode===m ? 'linear-gradient(135deg,#C8940A,#FFD84D)' : '#161B22',
                color: mode===m ? '#1a1400' : '#E6EDF3', fontWeight:700, fontSize:13}}>
              {m==='mella' ? 'MELLA (3-element)' : 'KoPani (1-element)'}
            </button>
          ))}
        </div>

        <div style={{background:'#0D1117', border:'1px solid #21262D', borderRadius:12, padding:14, marginBottom:14}}>
          <div style={{fontSize:10, color:'#8B949E', textTransform:'uppercase', marginBottom:8}}>Describe a concept (optional)</div>
          <textarea value={prompt} onChange={e=>setPrompt(e.target.value)} placeholder="e.g. a calm, patient healer who fights through water"
            style={{width:'100%', minHeight:60, background:'#161B22', border:'1px solid #30363D', borderRadius:8, color:'#E6EDF3', padding:8, fontSize:13, resize:'vertical'}}/>
          <button onClick={handleAI} disabled={loading || !prompt.trim()}
            style={{marginTop:8, width:'100%', padding:10, borderRadius:8, border:'none',
              background: loading ? '#30363D' : 'linear-gradient(135deg,#B388FF,#00E5CC)', color:'#0D1117', fontWeight:700, fontSize:13,
              display:'flex', alignItems:'center', justifyContent:'center', gap:6}}>
            {loading ? <><Loader2 size={14} className="spin"/> Generating…</> : <><Sparkles size={14}/> Generate from prompt</>}
          </button>
          {err && <div style={{marginTop:8, fontSize:11, color:'#FF6B6B', display:'flex', gap:6, alignItems:'flex-start'}}><AlertCircle size={13} style={{flexShrink:0, marginTop:1}}/>{err}</div>}
        </div>

        <div style={{background:'#0D1117', border:'1px solid #21262D', borderRadius:12, padding:14, marginBottom:14}}>
          <input value={name} onChange={e=>setName(e.target.value)} placeholder="Character name"
            style={{width:'100%', background:'#161B22', border:'1px solid #30363D', borderRadius:8, color:'#FFD84D', padding:8, fontSize:15, fontWeight:700, marginBottom:12}}/>

          {mode==='mella' ? (
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8}}>
              <ElemPick label="Crown" color="#B388FF" value={crown} onChange={setCrown}/>
              <ElemPick label="Core" color="#FF6B6B" value={core} onChange={setCore}/>
              <ElemPick label="Root" color="#4ECDC4" value={root} onChange={setRoot}/>
            </div>
          ) : (
            <ElemPick label="Element" color="#00E5CC" value={kEl} onChange={setKEl} full/>
          )}
        </div>

        <div style={{background:'#0D1117', border:'1px solid #21262D', borderRadius:12, padding:14, marginBottom:14}}>
          <div style={{fontSize:10, color:'#8B949E', textTransform:'uppercase', marginBottom:8}}>Computed stats — real formula</div>
          <div style={{display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8}}>
            <Stat icon={<Shield size={14}/>} label="HP" value={stats.HP}/>
            <Stat icon={<Zap size={14}/>} label="RAW" value={stats.RAW}/>
            <Stat icon={<Shield size={14}/>} label="STB" value={stats.STB}/>
            <Stat icon={<Wind size={14}/>} label="SP" value={stats.SP}/>
            <Stat label="PRED %" value={stats.PRED}/>
            <Stat label="BLAST" value={stats.BLAST}/>
          </div>
          {mode==='mella' && <div style={{marginTop:8, fontSize:11, color:'#8B949E'}}>Moves like a <b style={{color:'#4ECDC4'}}>{mvPattern(root)}</b> (set by Root = {root})</div>}
        </div>

        <div style={{background:'#0D1117', border:'1px solid #21262D', borderRadius:12, padding:14}}>
          <div style={{fontSize:10, color:'#8B949E', textTransform:'uppercase', marginBottom:8}}>
            {mode==='mella' ? 'Generated moves — from bond chemistry' : 'KoPani ability — from element identity'}
          </div>
          {(mode==='mella' ? moves : moves.slice(1,2)).map((mv,i)=>(
            <div key={i} style={{padding:'10px 0', borderBottom: i<moves.length-1 ? '1px solid #21262D':'none'}}>
              <div style={{display:'flex', justifyContent:'space-between', marginBottom:3}}>
                <b style={{fontSize:13, color: TYPE_COLOR[mv.type]}}>{mv.name}</b>
                <span style={{fontSize:10, color:'#8B949E'}}>{mv.cost}</span>
              </div>
              <div style={{fontSize:12, color:'#E6EDF3', lineHeight:1.4}}>{mv.desc}</div>
            </div>
          ))}
        </div>

        <p style={{fontSize:10, color:'#484F58', marginTop:16, lineHeight:1.5}}>
          Every stat and move above is computed live from real atomic data (electronegativity, ionization energy, density, radius, conductivity, melting point, specific heat, hardness) and real bond chemistry — the same formula the shipped combat engine uses. The prompt box only picks which elements to try; it never invents the numbers.
        </p>
      </div>
      <style>{`.spin{animation:spin 1s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

function ElemPick({label, color, value, onChange, full}){
  return (
    <div style={full ? {} : {}}>
      <div style={{fontSize:10, color, marginBottom:4, fontWeight:700}}>{label}</div>
      <select value={value} onChange={e=>onChange(e.target.value)}
        style={{width:'100%', background:'#161B22', border:`1px solid ${color}`, borderRadius:6, color:'#E6EDF3', padding:'6px 4px', fontSize:12}}>
        {ELEMS.map(el => <option key={el} value={el}>{el} — {ELEM_NAMES[el]}</option>)}
      </select>
    </div>
  );
}
function Stat({icon, label, value}){
  return (
    <div style={{background:'#161B22', border:'1px solid #30363D', borderRadius:8, padding:'8px 6px', textAlign:'center'}}>
      <div style={{fontSize:9, color:'#8B949E', display:'flex', alignItems:'center', justifyContent:'center', gap:3}}>{icon}{label}</div>
      <div style={{fontSize:16, fontWeight:700, color:'#FFD84D'}}>{value}</div>
    </div>
  );
}
