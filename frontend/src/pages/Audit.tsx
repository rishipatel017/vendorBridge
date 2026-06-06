import { useState, useEffect } from 'react'
import {
  Box, Typography, Card, Table, TableBody, TableCell, TableHead, TableRow,
  CircularProgress, Pagination,
} from '@mui/material'
import api from '../services/api'
import { format } from 'date-fns'

const Audit = () => {
  const [logs, setLogs] = useState<any[]>([])
  const [meta, setMeta] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true)
      try {
        const res = await api.get(`/audit?page=${page}`)
        setLogs(res.data.data || [])
        setMeta(res.data.meta || null)
      } catch (err) {
        console.error('Failed to fetch audit logs:', err)
        setLogs([])
      } finally {
        setLoading(false)
      }
    }
    fetchLogs()
  }, [page])

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Box className="page-header" sx={{ mb: 0 }}>
          <Typography variant="h1">Audit Log</Typography>
          <Typography>System-wide activity and changes tracking</Typography>
        </Box>
      </Box>

      <Card sx={{ p: 0, overflow: 'hidden' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
        ) : (
          <Box sx={{ overflowX: 'auto' }}>
            <Table className="vb-table">
              <TableHead>
                <TableRow>
                  <TableCell>Timestamp</TableCell>
                  <TableCell>User</TableCell>
                  <TableCell>Action</TableCell>
                  <TableCell>Entity</TableCell>
                  <TableCell>IP Address</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {logs.map(log => (
                  <TableRow key={log.id}>
                    <TableCell sx={{ fontSize: 13 }}>{format(new Date(log.createdAt), 'dd MMM yyyy, HH:mm:ss')}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{log.user?.firstName} {log.user?.lastName}</TableCell>
                    <TableCell><span className={`status-badge badge-active`} style={{ background: 'rgba(79,70,229,0.1)', color: '#818cf8', borderColor: 'rgba(79,70,229,0.2)' }}>{log.action}</span></TableCell>
                    <TableCell sx={{ fontFamily: 'monospace', fontSize: 13 }}>{log.entity}</TableCell>
                    <TableCell sx={{ fontSize: 12, color: 'text.secondary' }}>{log.ipAddress || 'Unknown'}</TableCell>
                  </TableRow>
                ))}
                {logs.length === 0 && (
                  <TableRow><TableCell colSpan={5} align="center" sx={{ py: 4 }}>No audit logs found</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </Box>
        )}
      </Card>

      {meta && meta.totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Pagination
            count={meta.totalPages}
            page={page}
            onChange={(_, val) => setPage(val)}
            color="primary"
          />
        </Box>
      )}
    </Box>
  )
}

export default Audit
