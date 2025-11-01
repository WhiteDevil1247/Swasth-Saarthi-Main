import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mic, Send } from "lucide-react";
import { useChatLogs } from "@/hooks/useChatLogs";
import { api } from "@/lib/api";

export default function VernacularAssistant() {
  const { list, append } = useChatLogs();
  const [lang, setLang] = useState<'en'|'hi'>('en');
  const [text, setText] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [list.data, typing]);

  async function send() {
    const content = text.trim();
    if (!content) return;
    setText("");
    await append.mutateAsync({ role: 'user', content });
    try {
      setTyping(true);
      // Call mock AI infer endpoint with lang hint
      const r = await api('/ai/infer', { method: 'POST', body: { input: lang === 'hi' ? `Hindi: ${content}` : content } });
      const reply = (r?.result as string) || '...';
      await append.mutateAsync({ role: 'assistant', content: reply });
    } finally {
      setTyping(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Vernacular Assistant</h1>
          <p className="text-muted-foreground">Chat in your preferred language</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={lang} onValueChange={(v: any) => setLang(v)}>
            <SelectTrigger className="w-32"><SelectValue placeholder="Language" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="hi">हिन्दी</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="p-4 h-[60vh] overflow-y-auto space-y-3">
        {list.isLoading && <div className="text-sm text-muted-foreground">Loading conversation…</div>}
        {list.data?.slice().reverse().map((m) => (
          <div key={m._id + m.created_at + m.content} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[75%] rounded-md px-3 py-2 text-sm ${m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
              {m.content}
            </div>
          </div>
        ))}
        {typing && (
          <div className="flex justify-start">
            <div className="max-w-[75%] rounded-md px-3 py-2 text-sm bg-muted animate-pulse">Typing…</div>
          </div>
        )}
        <div ref={bottomRef} />
      </Card>

      <div className="flex gap-2">
        <Input
          placeholder={lang === 'hi' ? 'अपना संदेश लिखें…' : 'Type your message…'}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') send(); }}
        />
        <Button variant="outline"><Mic className="w-4 h-4" /></Button>
        <Button onClick={send}><Send className="w-4 h-4 mr-1" /> Send</Button>
      </div>
    </div>
  );
}
