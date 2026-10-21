import { useQuery } from '@tanstack/react-query'
import { getHomeContent } from './homeApi'

export const homeContentQueryKey = ['home-content'] as const
export function useHomeContent(){return useQuery({queryKey:homeContentQueryKey,queryFn:()=>getHomeContent(),staleTime:300_000,placeholderData:previous=>previous})}
