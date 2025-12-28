import React, { useState, useEffect, useRef } from 'react';
import { 
  Home, Book, Activity, User, Play, X, Check, ArrowRight, ArrowLeft,
  Sparkles, Zap, Shield, Heart, MessageCircle, Moon, Sun, Cloud,
  Mic, Image as ImageIcon, Plus, Thermometer, Wind, Fingerprint, 
  Smile, Frown, Meh, Save, Trash2, Mail, Share2, Crown, Swords, Ghost,
  Flame, Anchor, Compass, Lock, Phone, AlertTriangle, SkipForward, Calendar, Clock
} from 'lucide-react';

/* --- API CLIENT --- */
const callAPI = async (mode, data={}, context={}, history=[]) => {
  try {
    const res = await fetch('/api/chat', { 
      method: 'POST', 
      headers: {'Content-Type':'application/json'}, 
      body: JSON.stringify({mode, data, context, history}) 
    });
    if(!res.ok) throw new Error();
    return await res.json();
  } catch (e) {
    // Fallbacks
    if(mode==='GENERATE_SCENARIOS') return Array.from({length:15},(_,i)=>({id:i, text:`Situation Exemple ${i+1}.`, type: i%2===0?'pos':'neg'}));
    if(mode==='GENERATE_ORACLE') return {title:"Le Sage", story:"Le silence est une réponse.", moral:"Patience.", source:"Proverbe"};
    if(mode==='ANALYZE_HERO') return {archetype:"Le Bâtisseur", analysis:"Base solide.", score_comment:"Bon niveau.", roadmap:Array.from({length:8},(_,i)=>({week:i+1, focus:`S${i+1}`, tasks:["Tâche A","Tâche B","Tâche C"]}))};
    if(mode==='SYNTHESIZE_IDENTITY') return {text: "Tu es une personne riche."};
    if(mode==='GENERATE_IDENTITY_QS') return ["Ton surnom ?", "Ta passion ?"];
    if(mode==='ANALYZE_ECHO') return {weather:{icon:"Sun", text:"Beau fixe"}, analysis:"Tu gères bien."};
    if(mode==='CHAT_THERAPIST') return {text: "Mode hors ligne."};
    return null;
  }
};

/* --- DATA --- */
const EMOTIONS = [{l:'Colère',e:'😡'},{l:'Peur',e:'😰'},{l:'Tristesse',e:'😢'},{l:'Honte',e:'😳'},{l:'Vide',e:'😶'},{l:'Calme',e:'😌'},{l:'Joie',e:'🤩'},{l:'Confiance',e:'🦁'}];
const STRATEGIES = [{l:"J'en parle", i:MessageCircle}, {l:"Musique", i:Play}, {l:"Je m'isole", i:Moon}, {l:"Je bouge", i:Activity}, {l:"Écrans", i:Fingerprint}, {l:"Création", i:Sparkles}, {l:"Gratitude", i:Heart}, {l:"Je savoure", i:Sun}];
const HERO_QUIZ = [
  { cat: 'competence', q: "Je finis ce que je commence." }, { cat: 'competence', q: "Je sais résoudre mes galères." }, { cat: 'competence', q: "J'ai des talents." },
  { cat: 'knowledge', q: "Je sais dire ce que je ressens." }, { cat: 'knowledge', q: "Je connais mes forces." },
  { cat: 'security', q: "Je me sens bien dans ma peau." }, { cat: 'security', q: "L'avenir ne m'effraie pas." },
  { cat: 'belonging', q: "Je me sens aimé(e)." }, { cat: 'belonging', q: "J'ai ma place dans un groupe." }
];

/* --- UI HELPERS --- */
const Glass = ({ children, onClick, className="" }) => <div onClick={onClick} className={`glass rounded-3xl overflow-hidden ${className}`}>{children}</div>;
const Btn = ({ onClick, children, variant='primary', disabled, className="" }) => {
  const s = { primary: "bg-[#2A9D8F] text-white shadow-lg", secondary: "bg-white border border-gray-200 text-gray-600", accent: "bg-[#FF8FAB] text-white", gold: "bg-[#E9C46A] text-white" };
  return <button onClick={onClick} disabled={disabled} className={`px-5 py-4 rounded-xl font-bold transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm ${s[variant]} ${className}`}>{children}</button>;
};

/* --- MODULES --- */
const SOS = ({ close }) => (
  <div className="fixed inset-0 z-50 bg-white/95 flex items-center justify-center p-6 animate-[fade_0.3s]">
    <div className="w-full max-w-sm glass border-red-100 rounded-3xl p-8 text-center shadow-xl">
      <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500 animate-pulse"><AlertTriangle size={48}/></div>
      <h2 className="text-3xl font-black text-gray-800 mb-6">Besoin d'aide ?</h2>
      <div className="space-y-3">
        <a href="tel:3114" className="block w-full bg-red-500 text-white font-bold py-4 rounded-xl flex justify-center gap-3 shadow-lg"><Phone/> 31 14 (Écoute)</a>
        <a href="tel:15" className="block w-full bg-white text-slate-900 font-bold py-4 rounded-xl flex justify-center gap-2 shadow-lg"><Activity/> 15 (Urgence)</a>
      </div>
      <button onClick={close} className="mt-10 text-gray-400 font-bold text-sm tracking-widest uppercase">RETOUR</button>
    </div>
  </div>
);

const Auth = ({ login }) => {
  const [u, setU] = useState(''); const [p, setP] = useState('');
  return <div className="h-full flex flex-col items-center justify-center p-8 bg-[#FDFBF7]">
    <div className="w-24 h-24 rounded-full bg-[#FF8FAB] flex items-center justify-center shadow-lg mb-6"><div className="text-white font-black text-4xl">TS</div></div>
    <h1 className="text-4xl font-black text-[#2D3748] mb-2">TheraSpace</h1>
    <p className="text-gray-400 mb-10 text-lg">Ton refuge numérique.</p>
    <div className="w-full space-y-4">
        <input placeholder="Pseudo" value={u} onChange={e=>setU(e.target.value)} className="input-soft"/>
        <input type="password" placeholder="Mot de passe" value={p} onChange={e=>setP(e.target.value)} className="input-soft"/>
        <Btn onClick={()=>login({name:u})} disabled={!u||!p} className="w-full mt-4">Entrer</Btn>
    </div>
  </div>;
};

const Dashboard = ({ nav, user }) => {
  const [sos, setSos] = useState(false);
  return <div className="h-full overflow-y-auto no-scroll p-6 pt-10 pb-32 space-y-6 relative">
    {sos && <SOS close={()=>setSos(false)}/>}
    <header className="flex justify-between items-center mb-4">
        <div><h1 className="text-3xl font-black text-[#2D3748]">Salut {user.name}</h1><p className="text-[#2A9D8F] text-sm font-medium">Espace Sécurisé</p></div>
        <button onClick={()=>setSos(true)} className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-500"><AlertTriangle/></button>
    </header>
    <div onClick={()=>nav('echo')} className="active:scale-95 transition-transform"><Glass className="p-8 flex justify-between items-center relative overflow-hidden h-40 bg-[#FF8FAB] text-white"><div><h3 className="text-3xl font-black mb-2">ÉCHO</h3><p className="opacity-90 text-sm">Exploration guidée</p></div><div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center"><Play size={40} fill="currentColor"/></div></Glass></div>
    <div className="grid grid-cols-2 gap-4">
        <Glass className="p-6 h-32 flex flex-col justify-between active:scale-95 bg-[#2A9D8F] text-white" onClick={()=>nav('therapist')}><MessageCircle size={32}/><h4 className="font-bold text-lg">Psy Virtuel</h4></Glass>
        <Glass className="p-6 h-32 flex flex-col justify-between active:scale-95 bg-[#E9C46A] text-white" onClick={()=>nav('oracle')}><Flame size={32}/><h4 className="font-bold text-lg">Oracle</h4></Glass>
    </div>
    <div className="grid grid-cols-2 gap-4">
        <Glass className="p-6 h-32 flex flex-col justify-between active:scale-95 bg-white text-gray-800" onClick={()=>nav('hero')}><Shield className="text-orange-400" size={32}/><h4 className="font-bold text-lg">Héros</h4></Glass>
        <Glass className="p-6 h-32 flex flex-col justify-between active:scale-95 bg-white text-gray-800" onClick={()=>nav('journal')}><Book className="text-teal-500" size={32}/><h4 className="font-bold text-lg">Journal</h4></Glass>
    </div>
  </div>;
};

const Echo = ({ exit }) => {
    const [cards, setCards] = useState([]); const [idx, setIdx] = useState(0); const [step, setStep] = useState('load'); const [hist, setHist] = useState([]); const [curr, setCurr] = useState({emotions:[], strategies:[]}); const [aiRes, setAiRes] = useState(null);
    useEffect(() => { const t = setTimeout(()=>{if(cards.length===0)setCards(Array.from({length:15},(_,i)=>({id:i, text:`Situation ${i+1}...`, type:"neu"}))); setStep('play'); }, 4000); callAPI('GENERATE_SCENARIOS').then(d => { clearTimeout(t); setCards(d); setStep('play'); }); }, []);
    const next = () => { const newHist = [...hist, {card:cards[idx], ...curr}]; if(idx<cards.length-1) { setHist(newHist); setIdx(idx+1); setStep('play'); setCurr({emotions:[], strategies:[]}); } else { setStep('analyzing'); callAPI('ANALYZE_ECHO', newHist).then(res => { setAiRes(res); setStep('feedback'); }); } };
    const toggle = (l, i) => l.includes(i) ? l.filter(x=>x!==i) : [...l, i];

    if(step==='load') return <div className="h-full flex flex-col items-center justify-center text-center"><Sparkles className="animate-spin text-[#FF8FAB] mb-4" size={48}/><h2 className="text-2xl font-bold text-gray-700">ÉCHO...</h2><p className="text-gray-400">Est-ce que ça résonne en toi ?</p></div>;
    if(step==='analyzing') return <div className="h-full flex flex-col items-center justify-center text-center"><Zap className="animate-pulse text-[#2A9D8F] mb-4" size={48}/><p className="text-gray-600">Analyse de ta session...</p></div>;
    if(step==='feedback') return <div className="h-full p-6 pt-10 bg-white overflow-y-auto"><h2 className="text-2xl font-black mb-6 text-[#2D3748]">Bilan IA</h2><div className="bg-blue-50 p-6 rounded-2xl mb-4 text-center"><h3 className="font-bold text-blue-800">Météo</h3><p className="text-blue-600 text-sm mt-2">{aiRes?.weather?.text}</p></div><div className="bg-gray-50 p-6 rounded-2xl mb-6"><h3 className="font-bold text-gray-800 mb-2">Compréhension</h3><p className="text-gray-600 text-sm leading-relaxed">{aiRes?.analysis}</p></div><Btn onClick={exit} variant="secondary" className="w-full">Terminer</Btn></div>;
    
    const card = cards[idx] || {text:"..."};
    const interaction = curr.emotions.length > 0 || curr.strategies.length > 0;
    
    if(step==='play') return <div className="h-full flex flex-col p-6 pt-10 bg-[#FF8FAB] text-white">
        <div className="flex justify-between mb-6"><button onClick={exit}><X color="white"/></button><span>{idx+1}/15</span><div/></div>
        <Glass className="flex-1 flex flex-col relative overflow-hidden bg-white/10 backdrop-blur-xl border-white/20">
            {!interaction ? 
             <div className="flex-1 flex flex-col justify-center items-center p-8 text-center"><h2 className="text-2xl font-black leading-snug mb-12">"{card.text}"</h2><div className="grid grid-cols-2 gap-4 w-full mt-auto"><Btn className="bg-white/20 border border-white/40" onClick={()=>next()}>Pas vécu</Btn><Btn className="bg-white text-pink-500" onClick={()=>setCurr({...curr, emotions:['vu']})}>Vécu</Btn></div></div> : 
             <div className="flex-1 flex flex-col p-6 overflow-y-auto bg-white rounded-3xl text-gray-800"><div className="space-y-6"><div><p className="text-gray-400 text-xs font-bold uppercase mb-2">Comment tu t'es senti(e) ?</p><div className="flex flex-wrap gap-2">{EMOTIONS.map(e=><button key={e.l} onClick={()=>setCurr({...curr, emotions:toggle(curr.emotions, e.l)})} className={`px-3 py-2 rounded-xl border text-sm font-bold flex gap-2 ${curr.emotions.includes(e.l)?'bg-pink-100 border-pink-200 text-pink-600':'bg-gray-50 border-gray-100 text-gray-500'}`}>{e.e} {e.l}</button>)}</div></div><div><p className="text-gray-400 text-xs font-bold uppercase mb-2">Ta réaction ?</p><div className="grid grid-cols-2 gap-2">{STRATEGIES.map(s=><button key={s.l} onClick={()=>setCurr({...curr, strategies:toggle(curr.strategies, s.l)})} className={`p-3 rounded-xl border text-sm font-bold flex flex-col items-center gap-2 ${curr.strategies.includes(s.l)?'bg-teal-100 border-teal-200 text-teal-700':'bg-gray-50 border-gray-100 text-gray-500'}`}><s.i size={18}/> {s.l}</button>)}</div></div></div><Btn onClick={next} className="mt-8 w-full">Suivant</Btn></div>
            }
        </Glass>
    </div>;
};

const Hero = ({ exit }) => {
    const [s, setS] = useState('intro'); const [q, setQ] = useState(0); const [sc, setSc] = useState({competence:0,knowledge:0,security:0,belonging:0}); const [res, setRes] = useState(null);
    const ans = (v) => { const cat = HERO_QUIZ[q].cat; setSc({...sc, [cat]: sc[cat]+v}); if(q<HERO_QUIZ.length-1) setQ(c=>c+1); else { setS('load'); callAPI('ANALYZE_HERO', sc).then(r=>{setRes(r); setS('res');}); } };
    if(s==='intro') return <div className="h-full p-8 flex flex-col items-center justify-center text-center bg-white"><Shield size={64} className="text-orange-400 mb-6"/><h2 className="text-3xl font-black mb-4 text-gray-800">La Forge</h2><p className="text-gray-400 mb-8">Boost ton estime.</p><Btn onClick={()=>setS('quiz')} variant="primary">Commencer</Btn><button onClick={exit} className="mt-8 text-gray-400">Quitter</button></div>;
    if(s==='quiz') return <div className="h-full p-8 flex flex-col justify-center bg-white"><div className="mb-6 text-xs font-bold text-orange-400 uppercase tracking-widest">Question {q+1}/{HERO_QUIZ.length}</div><h3 className="text-2xl font-bold mb-12 text-gray-800 leading-snug">"{HERO_QUIZ[q].q}"</h3><div className="space-y-3"><button onClick={()=>ans(0)} className="w-full p-4 rounded-xl border border-red-100 bg-red-50 text-red-600 font-bold">Pas du tout</button><button onClick={()=>ans(1)} className="w-full p-4 rounded-xl border border-orange-100 bg-orange-50 text-orange-600 font-bold">Plutôt non</button><button onClick={()=>ans(2)} className="w-full p-4 rounded-xl border border-teal-100 bg-teal-50 text-teal-600 font-bold">Plutôt oui</button><button onClick={()=>ans(3)} className="w-full p-4 rounded-xl border border-green-100 bg-green-50 text-green-600 font-bold">Tout à fait</button></div></div>;
    if(s==='load') return <div className="h-full flex items-center justify-center bg-white"><p className="text-orange-500 font-bold animate-pulse">Construction...</p></div>;
    const total = sc.competence + sc.knowledge + sc.security + sc.belonging; const pct = Math.round((total/42)*100);
    return <div className="h-full p-6 pt-10 flex flex-col overflow-y-auto bg-white"><div className="text-center mb-6"><Crown className="text-amber-400 mx-auto mb-4" size={48}/><h2 className="text-3xl font-black text-gray-800 leading-tight">{res.archetype}</h2></div><div className="bg-gray-100 rounded-xl p-4 mb-6"><div className="flex justify-between mb-2 text-xs font-bold text-gray-500 uppercase"><span>Confiance</span><span>{pct}%</span></div><div className="h-3 bg-gray-200 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-orange-400 to-yellow-400" style={{width:`${pct}%`}}/></div><p className="text-center text-xs text-gray-400 mt-2">{res.score_comment}</p></div><Glass className="p-6 mb-6 border-amber-500/30 bg-orange-50"><h3 className="font-bold text-amber-500 mb-2 text-sm uppercase">Analyse TCC</h3><p className="text-gray-700">{res.analysis}</p></Glass><div className="space-y-4 mb-8"><h3 className="font-bold text-gray-800 text-xl">Programme 8 Semaines</h3>{res.roadmap?.map((w, i) => (<div key={i} className="bg-gray-50 p-4 rounded-xl border border-gray-100"><div className="flex justify-between items-center mb-3"><span className="bg-teal-100 text-teal-800 font-bold px-3 py-1 rounded-full text-xs">Semaine {w.week}</span></div><ul className="space-y-2">{w.tasks.map((t, j) => <li key={j} className="flex gap-2 text-sm text-gray-600"><span className="text-teal-500">•</span> {t}</li>)}</ul></div>))}</div><Btn onClick={exit} variant="secondary" className="w-full">Terminer</Btn></div>;
};

const Oracle = ({ exit, ctx }) => {
    const [res, setRes] = useState(null); const [load, setLoad] = useState(false);
    const ask = () => { setLoad(true); callAPI('GENERATE_ORACLE', {}, ctx).then(r=>{setRes(r); setLoad(false)}); };
    return <div className="h-full p-6 pt-10 flex flex-col bg-[#E9C46A] text-[#2D3748]"><header className="flex justify-between items-center mb-8"><h2 className="text-2xl font-black flex gap-2"><Flame/> L'Oracle</h2><button onClick={exit}><X/></button></header>{!res ? <div className="flex-1 flex flex-col items-center justify-center text-center"><div onClick={ask} className="w-48 h-48 bg-white rounded-full flex items-center justify-center shadow-lg cursor-pointer active:scale-95 transition-transform">{load?<div className="animate-spin text-[#E9C46A]">⌛</div>:<span className="font-black text-xl">RÉVÉLATION</span>}</div></div> : <div className="flex-1 bg-white rounded-[30px] p-8 shadow-xl flex flex-col justify-center text-gray-800"><span className="text-xs font-bold text-orange-400 uppercase tracking-widest mb-4 block">{res.title}</span><p className="text-xl leading-relaxed italic mb-6">"{res.story}"</p><div className="bg-orange-50 p-4 rounded-xl border border-orange-100 mb-4"><p className="text-orange-800 text-sm font-bold">Leçon : {res.moral}</p></div><div className="text-xs text-gray-400 text-right italic mb-6">Source : {res.source}</div><Btn onClick={ask} variant="secondary" className="w-full !border-gray-200 !text-gray-500">Nouveau message</Btn></div>}</div>;
};

const Identity = ({ exit, onDone }) => {
    const [step, setStep] = useState('load'); const [qs, setQs] = useState([]); const [i, setI] = useState(0); const [ans, setAns] = useState({}); const [inp, setInp] = useState(""); const [res, setRes] = useState(null);
    useEffect(() => { callAPI('GENERATE_IDENTITY_QS').then(qList => { setQs(qList || ["Ton surnom ?"]); setStep('play'); }); }, []);
    const next = (val) => { const v = val||inp||"Passé"; const newAns = {...ans, [qs[i]]: v}; setAns(newAns); setInp(""); if(i<qs.length-1) setI(i+1); else { setStep('load_syn'); callAPI('SYNTHESIZE_IDENTITY', newAns).then(r=>{setRes(r); setStep('result'); onDone(newAns);}); } };
    if(step==='load'||step==='load_syn') return <div className="h-full flex items-center justify-center bg-white"><p className="animate-pulse font-bold text-teal-600">Connexion...</p></div>;
    if(step==='result') return <div className="h-full p-6 pt-10 flex flex-col bg-white"><h2 className="text-2xl font-black mb-6 text-teal-700">Ton Portrait</h2><div className="p-6 bg-teal-50 rounded-3xl mb-6 flex-1 overflow-y-auto"><p className="text-teal-900 italic leading-relaxed text-lg">"{res.text}"</p></div><div className="flex gap-2"><Btn variant="primary" onClick={()=>{localStorage.setItem('id_data', JSON.stringify(ans)); alert('Sauvegardé !')}} className="flex-1"><Check/> Sauver</Btn><Btn variant="accent" onClick={()=>window.location.href=`sms:&body=${encodeURIComponent("Mon Profil TheraSpace : " + res.narrative)}`} className="flex-1"><Share2/> SMS</Btn></div><button onClick={exit} className="w-full mt-4 text-gray-400 font-bold">Quitter</button></div>;
    return <div className="h-full p-6 pt-10 flex flex-col justify-center bg-[#2A9D8F] text-white"><button onClick={exit} className="absolute top-6 right-6"><X color="white"/></button><div className="w-full h-1 bg-white/20 rounded-full mb-8"><div className="h-full bg-white transition-all duration-300" style={{width: `${(i/qs.length)*100}%`}}/></div><h2 className="text-3xl font-black mb-8 leading-tight">{qs[i]}</h2><input autoFocus value={inp} onChange={e=>setInp(e.target.value)} className="w-full bg-transparent border-b-2 border-white/30 text-3xl font-bold pb-2 outline-none placeholder-white/40" placeholder="..."/><div className="mt-12 flex gap-4"><button onClick={()=>next("Passé")} className="p-4 rounded-xl border border-white/30 text-white/70">Passer</button><button onClick={()=>next()} disabled={!inp} className="flex-1 bg-white text-teal-700 font-bold rounded-xl py-4 disabled:opacity-50">Valider</button></div></div>;
};

const Journal = ({ exit }) => {
    const [notes, setNotes] = useState([]); const [add, setAdd] = useState(false); const [t, setT] = useState(""); const [c, setC] = useState("");
    const save = () => { if(c) { const d = new Date(); setNotes([{id:Date.now(), date:`${d.toLocaleDateString()}`, t, c}, ...notes]); setAdd(false); setT(""); setC(""); }};
    return <div className="h-full bg-[#FDFBF7] flex flex-col relative overflow-hidden">{!add ? <><header className="p-6 pt-10 flex justify-between items-center"><h2 className="text-2xl font-black flex gap-3 text-teal-800"><Book color="#2A9D8F"/> Note à moi-même</h2><button onClick={exit}><X color="#AAA"/></button></header><div className="flex-1 overflow-y-auto p-6 space-y-4 pb-32 no-scroll">{notes.map(n=><div key={n.id} className="card p-5"><div className="flex justify-between mb-2 text-teal-500 text-xs font-bold uppercase"><span>{n.date}</span></div><h3 className="font-bold mb-1 text-gray-800">{n.t}</h3><p className="text-gray-600 text-sm">{n.c}</p></div>)}</div><button onClick={()=>setAdd(true)} className="absolute bottom-8 right-6 w-14 h-14 rounded-full bg-teal-500 flex items-center justify-center shadow-lg text-white"><Plus size={28} color="white"/></button></> : <div className="absolute inset-0 bg-white z-50 flex flex-col"><header className="p-6 pt-10 flex justify-between items-center"><button onClick={()=>setAdd(false)} className="text-gray-400 font-bold p-2">Annuler</button><h3 className="text-gray-800 font-bold">Nouvelle Note</h3><button onClick={save} className="text-teal-600 font-bold p-2">Enregistrer</button></header><div className="flex-1 p-6 flex flex-col gap-4"><input placeholder="Titre..." value={t} onChange={e=>setT(e.target.value)} className="bg-transparent text-3xl font-black outline-none text-gray-800"/><textarea placeholder="Écris..." value={c} onChange={e=>setC(e.target.value)} className="flex-1 bg-transparent text-lg text-gray-600 outline-none resize-none"/></div></div>}</div>;
};

const Breath = ({ exit }) => {
    const [step, setStep] = useState(0); const [count, setCount] = useState(4);
    useEffect(() => { const t = setInterval(() => { setCount(c => { if (c > 1) return c - 1; if (step === 0) { setStep(1); return 2; } if (step === 1) { setStep(2); return 6; } if (step === 2) { setStep(0); return 4; } }); }, 1000); return () => clearInterval(t); }, [step]);
    const label = step===0 ? "INSPIRE" : step===1 ? "BLOQUE" : "EXPIRE";
    return <div className="h-full flex flex-col items-center justify-center bg-white relative overflow-hidden"><button onClick={exit} className="absolute top-6 right-6 text-gray-400 z-50"><X size={24}/></button><div className="text-center relative z-10 mb-12"><h2 className="text-4xl font-black text-teal-600 mb-2">{label}</h2><p className="text-teal-300 text-sm font-bold uppercase tracking-widest">Cohérence Cardiaque</p></div><div className="relative w-80 h-80 flex items-center justify-center p-20"><div className={`w-32 h-32 bg-teal-400 rounded-full anim-breathe`}></div><div className="absolute inset-0 flex items-center justify-center z-10"><span className={`text-6xl font-black text-white`}>{count}</span></div></div></div>;
};

const Therapist = ({ exit }) => {
    const [msgs, setMsgs] = useState([{role:'sys', text:"Bonjour. Je suis Théo. Comment te sens-tu ?"}]);
    const [inp, setInp] = useState(""); const [load, setLoad] = useState(false); const endRef = useRef(null);
    const send = () => { if(!inp.trim()) return; const newMsgs = [...msgs, {role:'user', text:inp}]; setMsgs(newMsgs); setInp(""); setLoad(true); const history = newMsgs.map(m => ({role: m.role==='user'?'user':'assistant', content: m.text})); callAPI('CHAT_THERAPIST', inp, {}, history).then(res => { setMsgs([...newMsgs, {role:'sys', text: res.text || "Erreur."}]); setLoad(false); }); };
    useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);
    return <div className="h-full flex flex-col bg-[#FDFBF7] relative"><div className="p-4 flex justify-between items-center bg-white shadow-sm z-10"><button onClick={exit}><ArrowLeft className="text-gray-400"/></button><span className="font-bold text-teal-700">Le Coin du Psy</span><div className="w-6"/></div><div className="flex-1 overflow-y-auto p-4 space-y-4"><div className="text-xs text-center text-gray-400 p-2 bg-gray-100 rounded-lg">Ceci est une IA. En cas d'urgence, contacte le 15.</div>{msgs.map((m,i)=><div key={i} className={`p-4 rounded-2xl max-w-[80%] text-sm leading-relaxed ${m.role==='user'?'bg-[#2A9D8F] text-white self-end ml-auto':'bg-white text-gray-700 shadow-sm self-start'}`}>{m.text}</div>)}{load && <div className="p-4 bg-white rounded-2xl w-16 shadow-sm">...</div>}<div ref={endRef}/></div><div className="p-4 bg-white border-t border-gray-100 flex gap-2"><input value={inp} onChange={e=>setInp(e.target.value)} placeholder="Écris ici..." className="input-soft flex-1 p-3"/><button onClick={send} disabled={!inp||load} className="bg-[#2A9D8F] text-white p-3 rounded-xl disabled:opacity-50"><Play/></button></div></div>;
};

// Main App
const App = () => {
    const [page, setPage] = useState('auth'); 
    const [user, setUser] = useState(null);
    const [ctx, setCtx] = useState({});

    const Nav = ({icon: IconComponent, to}) => <button onClick={()=>setPage(to)} className={`p-2 ${page===to?'text-teal-600':'text-gray-300'}`}><IconComponent size={28} /></button>;
    
    return (
    <div className="w-full h-full max-w-md mx-auto bg-[#FDFBF7] shadow-2xl relative flex flex-col overflow-hidden">
        <div className="flex-1 overflow-hidden">
        {page==='auth' && <Auth login={u=>{setUser(u); setPage('home')}}/>}
        {page==='home' && <Dashboard nav={setPage} user={user}/>}
        {page==='echo' && <Echo exit={()=>setPage('home')} />}
        {page==='hero' && <Hero exit={()=>setPage('home')} />}
        {page==='oracle' && <Oracle exit={()=>setPage('home')} ctx={ctx} />}
        {page==='identity' && <Identity exit={()=>setPage('home')} onDone={(data)=>setCtx(prev=>({...prev, identity:data}))} />}
        {page==='journal' && <Journal exit={()=>setPage('home')} />}
        {page==='breath' && <Breath exit={()=>setPage('home')} />}
        {page==='profile' && <Identity exit={()=>setPage('home')} onDone={(data)=>setCtx(prev=>({...prev, identity:data}))} />}
        {page==='therapist' && <Therapist exit={()=>setPage('home')} />}
        </div>
        {page!=='auth' && !['echo','hero','oracle','identity','breath','therapist'].includes(page) && 
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] h-20 bg-white border border-gray-100 rounded-full flex items-center justify-around px-6 shadow-xl z-50">
            <Nav icon={Home} to="home"/>
            <Nav icon={Wind} to="breath"/>
            <button onClick={()=>setPage('oracle')} className="w-14 h-14 rounded-full bg-[#E9C46A] text-white flex items-center justify-center shadow-lg -translate-y-6 border-4 border-[#FDFBF7]"><Flame size={28}/></button>
            <Nav icon={Shield} to="hero"/>
            <Nav icon={User} to="profile"/>
        </div>}
    </div>
    );
};

export default App;


