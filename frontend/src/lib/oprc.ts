import type { RouterClient } from '@orpc/server'
import { createORPCClient } from '@orpc/client'
import { RPCLink } from '@orpc/client/fetch'
import { URL } from '../config'
import type { AppRouter } from '../../../backend/src/routes/_app'

const link = new RPCLink({
  url: URL.ORPC,
  fetch: (input, init) => {
    return fetch(input, {
      ...init,
      credentials: 'include', // Include cookies in all requests
    })
  },
})

export const orpc: RouterClient<AppRouter> = createORPCClient(link)