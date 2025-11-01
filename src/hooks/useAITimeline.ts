import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
export type TimelineMetric = { type:string; value:number; recorded_at:string };
export type AITimelineResponse = { summary:string; metrics: TimelineMetric[] };
export function useAITimeline(){ return useQuery<AITimelineResponse>({ queryKey:['ai-timeline'], queryFn: async()=> api('/ai/timeline') }); }
