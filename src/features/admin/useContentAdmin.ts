import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { featureNews,listApprovedNews,listContentSyncRuns,listEventsForAdmin,listNewsSources,listPendingNews,moderateNews,reorderNews,requestContentSync,saveNewsSource,setEventHidden } from './contentAdminApi'
import { homeContentQueryKey } from '../home/useHomeContent'

export const contentKeys={pending:['admin','news','pending'] as const,approved:['admin','news','approved'] as const,events:['admin','events'] as const,sources:['admin','sources'] as const,runs:['admin','sync-runs'] as const}
export function useContentAdmin(){const client=useQueryClient();const refreshNews=()=>Promise.all([client.invalidateQueries({queryKey:contentKeys.pending}),client.invalidateQueries({queryKey:contentKeys.approved}),client.invalidateQueries({queryKey:homeContentQueryKey})]);return{
  pending:useQuery({queryKey:contentKeys.pending,queryFn:listPendingNews}),approved:useQuery({queryKey:contentKeys.approved,queryFn:listApprovedNews}),events:useQuery({queryKey:contentKeys.events,queryFn:listEventsForAdmin}),sources:useQuery({queryKey:contentKeys.sources,queryFn:listNewsSources}),runs:useQuery({queryKey:contentKeys.runs,queryFn:listContentSyncRuns}),
  moderate:useMutation({mutationFn:({id,decision,edit}:Parameters<typeof moderateNews> extends [infer A,infer B,infer C]?{id:A;decision:B;edit:C}:never)=>moderateNews(id,decision,edit),onSuccess:refreshNews}),
  feature:useMutation({mutationFn:featureNews,onSuccess:refreshNews}),reorder:useMutation({mutationFn:reorderNews,onSuccess:refreshNews}),
  hideEvent:useMutation({mutationFn:({id,hidden}:{id:string;hidden:boolean})=>setEventHidden(id,hidden),onSuccess:()=>Promise.all([client.invalidateQueries({queryKey:contentKeys.events}),client.invalidateQueries({queryKey:homeContentQueryKey})])}),
  saveSource:useMutation({mutationFn:saveNewsSource,onSuccess:()=>client.invalidateQueries({queryKey:contentKeys.sources})}),
  sync:useMutation({mutationFn:requestContentSync,onSuccess:()=>client.invalidateQueries({queryKey:contentKeys.runs})}),
}}
