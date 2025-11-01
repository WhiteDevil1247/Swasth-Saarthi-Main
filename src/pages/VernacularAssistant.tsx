import { useEffect, useRef, useState } from 'react';
import { useChatLogs } from '../hooks/useChatLogs';
import { api } from '../lib/api';
export default function VernacularAssistant(){
  const { list, append } = useChatLogs();
  const [lang, setLang] = useState<'en'|'hi'>('en');
  const [text, setText] = useState('');
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(()=>{ bottomRef.current?.scrollIntoView({behavior:'smooth'}); }, [list.data, typing]);
  async function send(){
    const content = text.trim(); if(!content) return; setText('');
    await append.mutateAsync({ role:'user', content });
    try{
      setTyping(true);
      const r = await api('/ai/infer',{ method:'POST', body:{ input: lang==='hi'? `Hindi: ${content}`: content }});
      const reply = (r?.result as string) || '...';
      await append.mutateAsync({ role:'assistant', content: reply });
    } finally { setTyping(false); }
  }
  return (
    <div className="space-y-4 fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Vernacular Assistant</h1>
        <select aria-label="Select language" value={lang} onChange={(e)=> setLang(e.target.value as any)} className="px-2 py-1 rounded-md bg-neutral-800 border border-neutral-700">
          <option value="en">English</option>
          <option value="hi">हिन्दी</option>
        </select>
      </div>
      <div className="p-4 rounded-md border border-neutral-800 h-[60vh] overflow-y-auto bg-neutral-900 space-y-2">
        {list.isLoading && <div className="text-sm text-neutral-400">Loading…</div>}
        {list.data?.slice().reverse().map((m)=> (
          <div key={(m._id||'')+m.created_at+m.content} className={`flex ${m.role==='user'?'justify-end':'justify-start'}`}>
            <div className={`max-w-[75%] rounded-md px-3 py-2 text-sm ${m.role==='user'?'bg-sky-600 text-white':'bg-neutral-800 text-neutral-100'}`}>{m.content}</div>
          </div>
        ))}
        {typing && (<div className="flex justify-start"><div className="max-w-[75%] rounded-md px-3 py-2 text-sm bg-neutral-800 animate-pulse">Typing…</div></div>)}
        <div ref={bottomRef} />
      </div>
      <div className="flex gap-2">
        <input className="px-3 py-2 rounded-md bg-neutral-800 border border-neutral-700 flex-1" placeholder={lang==='hi'? 'अपना संदेश लिखें…':'Type your message…'} value={text} onChange={(e)=> setText(e.target.value)} onKeyDown={(e)=>{ if(e.key==='Enter') send(); }} />
        <button className="px-3 py-2 rounded-md bg-sky-600 text-white" onClick={send}>Send</button>
      </div>
    </div>
  );
}
