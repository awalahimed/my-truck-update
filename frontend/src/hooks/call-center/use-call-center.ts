import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { orpc } from '../../lib/oprc'

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

export function useCallCenter() {
  const [pendingOrders, setPendingOrders] = useState<Order[]>([])
  const [allOrders, setAllOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  // DATA FETCHING: Using HTTP/ORPC with 5-second polling
  // Note: WebSocket would be ideal but requires JWT token in URL
  // Web dashboard uses Better Auth session cookies which WebSocket doesn't support
  // TODO: Update WebSocket server to support cookie-based auth for web clients
  
  // Fetch pending orders (PENDING_APPROVAL)
  const fetchPendingOrders = async () => {
    try {
      const response = await orpc.order.getPendingOrders()
      setPendingOrders((response.orders as any) || [])
    } catch (error) {
      console.error('Error fetching pending orders:', error)
      // Don't show toast on every poll failure to avoid spam
    }
  }

  // Fetch all orders for monitoring
  const fetchAllOrders = async () => {
    try {
      const response = await orpc.order.getMyOrders()
      setAllOrders((response.orders as any) || [])
    } catch (error) {
      console.error('Error fetching all orders:', error)
    } finally {
      setLoading(false)
    }
  }

  // Approve order
  const approveOrder = async (orderId: string) => {
    try {
      await orpc.order.callCenterApprove({ orderId })
      toast.success('Order approved successfully')
      await fetchPendingOrders()
      await fetchAllOrders()
      return true
    } catch (error) {
      console.error('Error approving order:', error)
      toast.error('Failed to approve order')
      return false
    }
  }

  // Reject order
  const rejectOrder = async (orderId: string, reason: string) => {
    try {
      await orpc.order.callCenterReject({ orderId, reason })
      toast.success('Order rejected')
      await fetchPendingOrders()
      await fetchAllOrders()
      return true
    } catch (error) {
      console.error('Error rejecting order:', error)
      toast.error('Failed to reject order')
      return false
    }
  }

  // Initial fetch and polling
  useEffect(() => {
    fetchPendingOrders()
    fetchAllOrders()

    // Poll for updates every 5 seconds (reduced from 10 for better responsiveness)
    // Note: WebSocket would be better but requires JWT token auth
    // Web dashboard uses Better Auth cookies which WebSocket doesn't support yet
    const interval = setInterval(() => {
      fetchPendingOrders()
      fetchAllOrders()
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  return {
    pendingOrders,
    allOrders,
    loading,
    approveOrder,
    rejectOrder,
    refetch: () => {
      fetchPendingOrders()
      fetchAllOrders()
    },
  }
}
