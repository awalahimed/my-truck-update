import { useQuery } from '@tanstack/react-query'
import { orpc } from '../../lib/oprc'

export const useFetchConfig = () => {
  return useQuery({
    queryKey: ['handshake'],
    queryFn: () => orpc.handshake(),
  })
}