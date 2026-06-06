import { useState, useEffect } from 'react'
import {
  Box, Typography, Card, CardContent, List, ListItem, ListItemText,
  ListItemIcon, Chip, CircularProgress, IconButton, Divider, Badge,
} from '@mui/material'
import {
  CheckCircle as CheckIcon,
  Description,
  ShoppingCart,
  Approval,
  Business,
  Receipt,
  Error as ErrorIcon,
  Info as InfoIcon,
} from '@mui/icons-material'
import api from '../services/api'
import { format } from 'date-fns'

interface Notification {
  id: string
  type: 'RFQ' | 'QUOTATION' | 'PO' | 'APPROVAL' | 'VENDOR' | 'INVOICE' | 'SYSTEM'
  title: string
  message: string
  read: boolean
  createdAt: string
  entityId?: string
  entityType?: string
}

const Notifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    setLoading(true)
    try {
      const res = await api.get('/notifications')
      setNotifications(res.data.data || [])
      setUnreadCount(res.data.unreadCount || 0)
    } catch (err) {
      console.error(err)
      // Mock data for now if API fails
      setNotifications([
        {
          id: '1',
          type: 'APPROVAL',
          title: 'New Quotation Pending Approval',
          message: 'Quotation Q-2024-001 from TechCorp requires your approval',
          read: false,
          createdAt: new Date().toISOString(),
          entityId: 'q-1',
          entityType: 'quotation',
        },
        {
          id: '2',
          type: 'PO',
          title: 'Purchase Order Sent',
          message: 'PO PO-2024-001 has been sent to vendor',
          read: false,
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          entityId: 'po-1',
          entityType: 'po',
        },
        {
          id: '3',
          type: 'RFQ',
          title: 'New RFQ Created',
          message: 'RFQ RFQ-2024-001 has been created and sent to vendors',
          read: true,
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          entityId: 'rfq-1',
          entityType: 'rfq',
        },
      ])
      setUnreadCount(2)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (id: string) => {
    try {
      await api.put(`/notifications/${id}/read`)
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, read: true } : n
      ))
      setUnreadCount(Math.max(0, unreadCount - 1))
    } catch (err) {
      console.error(err)
    }
  }

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all')
      setNotifications(notifications.map(n => ({ ...n, read: true })))
      setUnreadCount(0)
    } catch (err) {
      console.error(err)
    }
  }

  const getIcon = (type: string) => {
    const icons: Record<string, JSX.Element> = {
      RFQ: <Description sx={{ color: '#4f46e5' }} />,
      QUOTATION: <Description sx={{ color: '#0ea5e9' }} />,
      PO: <ShoppingCart sx={{ color: '#10b981' }} />,
      APPROVAL: <Approval sx={{ color: '#f59e0b' }} />,
      VENDOR: <Business sx={{ color: '#8b5cf6' }} />,
      INVOICE: <Receipt sx={{ color: '#ec4899' }} />,
      SYSTEM: <InfoIcon sx={{ color: '#6b7280' }} />,
    }
    return icons[type] || icons.SYSTEM
  }

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      RFQ: '#4f46e5',
      QUOTATION: '#0ea5e9',
      PO: '#10b981',
      APPROVAL: '#f59e0b',
      VENDOR: '#8b5cf6',
      INVOICE: '#ec4899',
      SYSTEM: '#6b7280',
    }
    return colors[type] || colors.SYSTEM
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Box className="page-header" sx={{ mb: 0 }}>
          <Typography variant="h1">Notifications</Typography>
          <Typography>Stay updated with your procurement activities</Typography>
        </Box>
        {unreadCount > 0 && (
          <IconButton onClick={markAllAsRead} sx={{ color: 'primary.main' }}>
            Mark all as read
          </IconButton>
        )}
      </Box>

      <Card sx={{ p: 0, overflow: 'hidden' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {notifications.length === 0 ? (
              <ListItem sx={{ py: 8, justifyContent: 'center' }}>
                <Box sx={{ textAlign: 'center' }}>
                  <InfoIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                  <Typography sx={{ color: 'text.secondary' }}>No notifications yet</Typography>
                </Box>
              </ListItem>
            ) : (
              notifications.map((notification, index) => (
                <Box key={notification.id}>
                  <ListItem
                    sx={{
                      py: 2.5,
                      px: 3,
                      bgcolor: notification.read ? 'transparent' : 'rgba(79,70,229,0.03)',
                      cursor: 'pointer',
                      '&:hover': { bgcolor: 'rgba(79,70,229,0.05)' },
                    }}
                    onClick={() => !notification.read && markAsRead(notification.id)}
                  >
                    <ListItemIcon sx={{ minWidth: 48 }}>
                      <Box sx={{ p: 1, borderRadius: 2, bgcolor: `${getTypeColor(notification.type)}15` }}>
                        {getIcon(notification.type)}
                      </Box>
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
                          <Typography sx={{ fontWeight: 600, fontSize: 14 }}>
                            {notification.title}
                          </Typography>
                          {!notification.read && (
                            <Badge
                              variant="dot"
                              sx={{
                                '& .MuiBadge-dot': {
                                  width: 8,
                                  height: 8,
                                  bgcolor: '#4f46e5',
                                },
                              }}
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography sx={{ fontSize: 13, color: 'text.secondary', mb: 0.5 }}>
                            {notification.message}
                          </Typography>
                          <Typography sx={{ fontSize: 11, color: 'text.disabled' }}>
                            {format(new Date(notification.createdAt), 'dd MMM yyyy, HH:mm')}
                          </Typography>
                        </Box>
                      }
                    />
                    {!notification.read && (
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation()
                          markAsRead(notification.id)
                        }}
                        sx={{ ml: 1 }}
                      >
                        <CheckIcon fontSize="small" sx={{ color: '#10b981' }} />
                      </IconButton>
                    )}
                  </ListItem>
                  {index < notifications.length - 1 && <Divider />}
                </Box>
              ))
            )}
          </List>
        )}
      </Card>
    </Box>
  )
}

export default Notifications
