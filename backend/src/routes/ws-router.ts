import { os } from '@orpc/server'
import { driverController } from '../controllers/websocket/driver.js'
import { ownerController } from '../controllers/websocket/owner.js'
import { agentController } from '../controllers/websocket/agent.js'
import { customerController } from '../controllers/websocket/customer.js'
import { onboarding } from '../controllers/onboarding.js'

// Root handler for WebSocket (handles root path calls)
const wsRoot = os.handler(async () => {
  return { service: 'websocket', status: 'ready' }
})

// Handshake for WebSocket
const wsHandshake = os.handler(async () => {
  return { service: 'websocket', status: 'connected' }
})

export const wsRouter = {
  $: wsRoot, // Root handler for "/" path
  handshake: wsHandshake,
  driver: driverController,
  owner: ownerController,
  agent: agentController,
  customer: customerController,
  onboarding: onboarding,
}

export type WSRouter = typeof wsRouter
