import { useState, useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { RPCLink } from '@orpc/client/websocket'
import { createORPCClient } from '@orpc/client'
import type { WSRouter } from '../../../../backend/src/routes/ws-router'
import {URL} from "../../config/index"  
const WS_URL = URL.WEBSOCKET

interface Order {
  id: string
  customerId: string
  customerName: string
  customerPhone: string
  pickupAddress: string
  deliveryAddress: string
  pickupLatitude: string
  pickupLongitude: string
  deliveryLatitude: string
  deliveryLongitude: string
  materials: string[]
  vehicleType: string
  notes: string | null
  status: string
  createdAt: Date
  driverId?: string
  driverName?: string
  driverPhone?: string
}

export function useCallCenterWebSocket() {
  const [pendingOrders, setPendingOrders] = useState<Order[]>([])
  const [allOrders, setAllOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [connected, setConnected] = useState(false)
  
  const wsRef = useRef<WebSocket | null>(null)
  const orpcClientRef = useRef<any>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const reconnectAttemptsRef = useRef(0)
  const maxReconnectAttempts = 5

  // Fetch pending orders via WebSocket
  const fetchPendingOrders = async () => {
    if (!orpcClientRef.current) {
      console.log('[CallCenter WS] No ORPC client available')
      return
    }

    try {
      console.log('[CallCenter WS] Fetching pending orders...')
      const response = await orpcClientRef.current.agent.getPendingOrders()
      console.log('[CallCenter WS] Pending orders response:', response)
      setPendingOrders(response.orders || [])
      console.log('[CallCenter WS] Set pending orders count:', response.orders?.length || 0)
    } catch (error) {
      console.error('[CallCenter WS] Error fetching pending orders:', error)
      toast.error('Failed to fetch pending orders')
    }
  }

  // Fetch all orders via WebSocket
  const fetchAllOrders = async () => {
    if (!orpcClientRef.current) {
      console.log('[CallCenter WS] No ORPC client available')
      return
    }

    try {
      console.log('[CallCenter WS] Fetching all orders...')
      const response = await orpcClientRef.current.agent.getAllOrders()
      console.log('[CallCenter WS] All orders response:', response)
      setAllOrders(response.orders || [])
      console.log('[CallCenter WS] Set all orders count:', response.orders?.length || 0)
    } catch (error) {
      console.error('[CallCenter WS] Error fetching all orders:', error)
    } finally {
      setLoading(false)
    }
  }

  // Connect to WebSocket
  const connect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }

    // Get session cookie (Better Auth handles this automatically)
    const wsUrlWithCookie = WS_URL
    
    console.log('[CallCenter WS] Connecting to:', wsUrlWithCookie)
    const ws = new WebSocket(wsUrlWithCookie)
    
    ws.onopen = () => {
      console.log('[CallCenter WS] Connected')
      setConnected(true)
      wsRef.current = ws
      reconnectAttemptsRef.current = 0
      
      try {
        const link = new RPCLink({ websocket: ws })
        const client = createORPCClient<any>(link)
        orpcClientRef.current = client
        
        console.log('[CallCenter WS] ORPC client created')
        
        // Wait a bit for the connection to be fully established
        setTimeout(() => {
          console.log('[CallCenter WS] Starting initial fetch...')
          fetchPendingOrders()
          fetchAllOrders()
        }, 500)
      } catch (e) {
        console.error('[CallCenter WS] ORPC client setup error:', e)
      }
    }

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data)
        console.log('[CallCenter WS] Message received:', message)
        
        // Handle real-time order updates
        if (message.type === 'new_order_for_approval' || message.type === 'new_order' || message.type === 'order_updated') {
          console.log('[CallCenter WS] Order update detected, refetching...')
          // Refetch orders when there's an update
          fetchPendingOrders()
          fetchAllOrders()
        }
      } catch (error) {
        console.error('[CallCenter WS] Message parse error:', error)
      }
    }

    ws.onclose = (event) => {
      console.log('[CallCenter WS] Disconnected:', event.code, event.reason)
      setConnected(false)
      wsRef.current = null
      orpcClientRef.current = null

      // Reconnect with exponential backoff
      if (reconnectAttemptsRef.current < maxReconnectAttempts) {
        const attempt = reconnectAttemptsRef.current + 1
        reconnectAttemptsRef.current = attempt

        const delay = Math.pow(2, attempt - 1) * 1000
        console.log(`[CallCenter WS] Reconnecting in ${delay}ms (attempt ${attempt})`)
        
        reconnectTimeoutRef.current = setTimeout(() => {
          connect()
        }, delay)
      } else {
        toast.error('WebSocket connection lost. Please refresh the page.')
      }
    }

    ws.onerror = (error) => {
      console.error('[CallCenter WS] Error:', error)
      setConnected(false)
    }
  }

  // Disconnect
  const disconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }
    if (wsRef.current) {
      wsRef.current.close()
    }
    reconnectAttemptsRef.current = maxReconnectAttempts
  }

  // Approve order
  const approveOrder = async (orderId: string) => {
    try {
      // Use HTTP for actions (more reliable)
      const { orpc } = await import('../../lib/oprc')
      await orpc.order.callCenterApprove({ orderId })
      toast.success('Order approved successfully')
      
      // Refetch via WebSocket
      await fetchPendingOrders()
      await fetchAllOrders()
      return true
    } catch (error) {
      console.error('Error approving order:', error)
      toast.error('Failed to approve order')
      return false
    }
  }

  // Get nearby agents for an order (or all agents if orderId omitted)
  const getNearbyAgents = async (orderId?: string) => {
    try {
      console.log('[CallCenter] Fetching agents for order:', orderId);
      const { orpc } = await import('../../lib/oprc');
      const response = await orpc.order.getNearbyAgents(orderId ? { orderId } : ({} as any));
      console.log('[CallCenter] Agents response:', response);
      const agents = response.agents || [];
      console.log('[CallCenter] Agents count:', agents.length);
      return agents;
    } catch (error) {
      console.error('Error fetching nearby agents:', error);
      toast.error('Failed to fetch agents: ' + (error instanceof Error ? error.message : String(error)));
      return [];
    }
  };

  // Approve order with agent assignment (now only assigns, agent must approve first)
  const approveOrderWithAgent = async (orderId: string, agentId: string) => {
    try {
      console.log('[CallCenter] Selecting agent for order:', { orderId, agentId })
      const { orpc } = await import('../../lib/oprc')
      const result = await orpc.order.callCenterSelectAgent({ orderId, agentId })
      console.log('[CallCenter] Agent selection result:', result)
      toast.success('Agent selected, waiting for agent to verify')
      
      // Wait a moment for the server to process
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Refetch via WebSocket
      console.log('[CallCenter] Refetching orders...')
      await fetchPendingOrders()
      await fetchAllOrders()
      console.log('[CallCenter] Orders refetched')
      return true
    } catch (error) {
      console.error('Error selecting agent:', error)
      toast.error('Failed to select agent: ' + (error instanceof Error ? error.message : String(error)))
      return false
    }
  }

  // Final approval after agent approved
  const callCenterFinalApprove = async (orderId: string) => {
    try {
      console.log('[CallCenter] Final approve for order:', orderId)
      const { orpc } = await import('../../lib/oprc')
      const result = await orpc.order.callCenterFinalApprove({ orderId })
      console.log('[CallCenter] Final approval result:', result)
      toast.success('Order approved and sent to drivers')
      
      // Wait a moment for the server to process
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Refetch via WebSocket
      console.log('[CallCenter] Refetching orders...')
      await fetchPendingOrders()
      await fetchAllOrders()
      console.log('[CallCenter] Orders refetched')
      return true
    } catch (error) {
      console.error('Error final approving order:', error)
      toast.error('Failed to approve order: ' + (error instanceof Error ? error.message : String(error)))
      return false
    }
  }

  // Reject order
  const rejectOrder = async (orderId: string, reason: string) => {
    try {
      // Use HTTP for actions (more reliable)
      const { orpc } = await import('../../lib/oprc')
      await orpc.order.callCenterReject({ orderId, reason })
      toast.success('Order rejected')
      
      // Refetch via WebSocket
      await fetchPendingOrders()
      await fetchAllOrders()
      return true
    } catch (error) {
      console.error('Error rejecting order:', error)
      toast.error('Failed to reject order')
      return false
    }
  }

  // Connect on mount
  useEffect(() => {
    // Delay connection to allow auth to initialize
    const timer = setTimeout(() => {
      connect()
    }, 1000)
    
    return () => {
      clearTimeout(timer)
      disconnect()
    }
  }, [])

  return {
    pendingOrders,
    allOrders,
    loading,
    connected,
    approveOrder,
    approveOrderWithAgent,
    callCenterFinalApprove,
    rejectOrder,
    getNearbyAgents,
    refetch: () => {
      fetchPendingOrders()
      fetchAllOrders()
    },
  }
}
