import { Link, useLocation } from 'react-router-dom'

import { AppBar, Box, Button, Stack, Toolbar, Typography } from '@mui/material'
import GraphicEqRoundedIcon from '@mui/icons-material/GraphicEqRounded'

const navItems = [
  { href: '/', label: 'Gravar áudio' },
  { href: '/analyses', label: 'Relatórios' },
]

export default function AppNav() {
  const { pathname } = useLocation()

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        background: 'rgba(255, 255, 255, 0.72)',
        backdropFilter: 'saturate(180%) blur(20px)',
        WebkitBackdropFilter: 'saturate(180%) blur(20px)',
        borderBottom: '1px solid rgba(15, 23, 42, 0.06)',
        color: '#0f172a',
      }}
    >
      <Toolbar sx={{ maxWidth: 1100, width: '100%', mx: 'auto', px: { xs: 2, sm: 3 } }}>
        <Stack direction="row" spacing={1.5} sx={{ flexGrow: 1, alignItems: 'center' }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              boxShadow: '0 6px 16px rgba(99, 102, 241, 0.35)',
            }}
          >
            <GraphicEqRoundedIcon sx={{ color: '#fff', fontSize: 22 }} />
          </Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              letterSpacing: '-0.5px',
              background: 'linear-gradient(135deg, #0f172a 0%, #4f46e5 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Análise de Voz
          </Typography>
        </Stack>

        <Stack
          direction="row"
          spacing={0.5}
          sx={{
            p: 0.5,
            borderRadius: '999px',
            background: 'rgba(15, 23, 42, 0.04)',
            border: '1px solid rgba(15, 23, 42, 0.05)',
          }}
        >
          {navItems.map((item) => {
            const active =
              item.href === '/'
                ? pathname === '/'
                : pathname.startsWith(item.href)

            return (
              <Button
                key={item.href}
                component={Link}
                to={item.href}
                disableElevation
                size="small"
                sx={{
                  borderRadius: '999px',
                  px: 2.5,
                  py: 0.75,
                  minHeight: 0,
                  color: active ? '#fff' : '#475569',
                  background: active
                    ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
                    : 'transparent',
                  boxShadow: active
                    ? '0 4px 12px rgba(99, 102, 241, 0.35)'
                    : 'none',
                  '&:hover': {
                    background: active
                      ? 'linear-gradient(135deg, #5256e8 0%, #7c3aed 100%)'
                      : 'rgba(15, 23, 42, 0.06)',
                    transform: 'none',
                    boxShadow: active
                      ? '0 6px 14px rgba(99, 102, 241, 0.45)'
                      : 'none',
                  },
                }}
              >
                {item.label}
              </Button>
            )
          })}
        </Stack>
      </Toolbar>
    </AppBar>
  )
}
