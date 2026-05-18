import { Box } from '@mui/material'

import AppNav from './AppNav'

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'Inter, sans-serif',
        position: 'relative',
        background: '#f8fafc',
        '&::before': {
          content: '""',
          position: 'fixed',
          inset: 0,
          background:
            'radial-gradient(circle at 15% 20%, rgba(99, 102, 241, 0.12), transparent 45%), radial-gradient(circle at 85% 80%, rgba(139, 92, 246, 0.10), transparent 45%), radial-gradient(circle at 50% 100%, rgba(236, 72, 153, 0.06), transparent 55%)',
          pointerEvents: 'none',
          zIndex: 0,
        },
      }}
    >
      <AppNav />
      <Box
        component="main"
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {children}
      </Box>
    </Box>
  )
}
