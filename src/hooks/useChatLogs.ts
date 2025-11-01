import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
export type ChatMessage = { _id?:string; role:'user'|'assistant'; content:string; created_at?:string };
export function useChatLogs(){
  const qc = useQueryClient();
  const list = useQuery<ChatMessage[]>({ queryKey:['chat-logs'], queryFn: async()=> api('/chat') });
  const append = useMutation({ mutationFn: (msg: {role:'user'|'assistant'; content:string})=> api('/chat',{method:'POST', body: msg}), onSuccess: ()=> qc.invalidateQueries({queryKey:['chat-logs']}) });
  return { list, append };
}
