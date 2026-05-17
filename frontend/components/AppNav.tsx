'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { AppBar, Button, Stack, Toolbar, Typography } from '@mui/material'

const navItems = [
  { href: '/', label: 'Gravar áudio' },
  { href: '/analyses', label: 'Relatórios' },
]

export default function AppNav() {
  const pathname = usePathname()

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: '#1c1c1e',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <Toolbar sx={{ maxWidth: 960, width: '100%', mx: 'auto', px: { xs: 2, sm: 3 } }}>
        <Typography
          variant="h6"
          sx={{ flexGrow: 1, fontWeight: 600, letterSpacing: '-0.5px' }}
        >
          Análise de Voz
        </Typography>
        <Stack direction="row" spacing={1}>
          {navItems.map((item) => {
            const active =
              item.href === '/'
                ? pathname === '/'
                : pathname.startsWith(item.href)

            return (
              <Button
                key={item.href}
                component={Link}
                href={item.href}
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                  color: active ? '#fff' : 'rgba(255,255,255,0.65)',
                  bgcolor: active ? 'rgba(102, 126, 234, 0.35)' : 'transparent',
                  '&:hover': {
                    bgcolor: active
                      ? 'rgba(102, 126, 234, 0.45)'
                      : 'rgba(255,255,255,0.08)',
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
