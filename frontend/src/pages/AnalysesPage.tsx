import { useCallback, useEffect, useState } from 'react'

import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Stack,
  Typography,
} from '@mui/material'
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded'
import RecordVoiceOverRoundedIcon from '@mui/icons-material/RecordVoiceOverRounded'
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded'
import ErrorRoundedIcon from '@mui/icons-material/ErrorRounded'
import InboxRoundedIcon from '@mui/icons-material/InboxRounded'
import ScheduleRoundedIcon from '@mui/icons-material/ScheduleRounded'

type AnalysisRecord = {
  id: string
  created_at: string
  transcription: string | null
  emotion: string | null
  emotion_confidence: number | null
  llm_analysis: string
  audio_features: Record<string, number | null> | null
}

export default function AnalysesPage() {
  const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:5000'
  const [analyses, setAnalyses] = useState<AnalysisRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchAnalyses = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch(`${apiUrl}/api/analyses?limit=50`)
      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error ?? 'Falha ao carregar análises')
      }
      const data = await response.json()
      setAnalyses(data.analyses ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro de conexão')
      setAnalyses([])
    } finally {
      setLoading(false)
    }
  }, [apiUrl])

  useEffect(() => {
    fetchAnalyses()
  }, [fetchAnalyses])

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleString('pt-BR')
    } catch {
      return iso
    }
  }

  return (
    <Box
      sx={{
        flex: 1,
        py: { xs: 4, md: 6 },
        px: 2,
        overflow: 'auto',
      }}
    >
      <Box sx={{ maxWidth: 880, mx: 'auto' }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          sx={{
            mb: 4,
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
          }}
        >
          <Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                letterSpacing: '-1.5px',
                background: 'linear-gradient(135deg, #0f172a 0%, #4f46e5 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Relatórios
            </Typography>
            <Typography sx={{ color: '#64748b', mt: 0.5, fontSize: '0.95rem' }}>
              Histórico de análises salvas na nuvem
              {analyses.length > 0 && (
                <Box
                  component="span"
                  sx={{
                    ml: 1.5,
                    px: 1.25,
                    py: 0.25,
                    borderRadius: '999px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    background: 'rgba(99, 102, 241, 0.10)',
                    color: '#4f46e5',
                  }}
                >
                  {analyses.length}
                </Box>
              )}
            </Typography>
          </Box>
          <Button
            onClick={fetchAnalyses}
            variant="contained"
            startIcon={
              loading ? (
                <CircularProgress size={16} sx={{ color: '#fff' }} />
              ) : (
                <RefreshRoundedIcon />
              )
            }
            disabled={loading}
            sx={{
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5256e8 0%, #7c3aed 100%)',
              },
            }}
          >
            Atualizar
          </Button>
        </Stack>

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress sx={{ color: '#6366f1' }} />
          </Box>
        )}

        {!loading && error && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              px: 2.5,
              py: 2,
              mb: 3,
              borderRadius: 3,
              border: '1px solid rgba(239, 68, 68, 0.25)',
              background: 'rgba(239, 68, 68, 0.08)',
              color: '#991b1b',
            }}
          >
            <ErrorRoundedIcon sx={{ color: '#ef4444' }} />
            <Typography sx={{ fontWeight: 600 }}>{error}</Typography>
          </Box>
        )}

        {!loading && !error && analyses.length === 0 && (
          <Box
            sx={{
              textAlign: 'center',
              py: 10,
              px: 3,
              borderRadius: 4,
              background: 'rgba(255, 255, 255, 0.7)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px dashed rgba(99, 102, 241, 0.25)',
            }}
          >
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                mx: 'auto',
                mb: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(99, 102, 241, 0.10)',
              }}
            >
              <InboxRoundedIcon sx={{ fontSize: 32, color: '#6366f1' }} />
            </Box>
            <Typography
              sx={{ color: '#0f172a', fontWeight: 600, fontSize: '1.05rem', mb: 0.5 }}
            >
              Nenhuma análise ainda
            </Typography>
            <Typography sx={{ color: '#64748b', fontSize: '0.9rem' }}>
              Grave um áudio na página inicial para gerar a primeira.
            </Typography>
          </Box>
        )}

        <Stack spacing={2}>
          {analyses.map((item, index) => (
            <Card
              key={item.id}
              elevation={0}
              sx={{
                borderRadius: 4,
                background: 'rgba(255, 255, 255, 0.75)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(15, 23, 42, 0.06)',
                animation: `fadeInUp 0.4s ease both`,
                animationDelay: `${Math.min(index * 0.05, 0.4)}s`,
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: 4,
                  background: 'linear-gradient(180deg, #6366f1 0%, #8b5cf6 100%)',
                  opacity: 0,
                  transition: 'opacity 0.25s ease',
                },
                '&:hover': {
                  transform: 'translateY(-2px)',
                  borderColor: 'rgba(99, 102, 241, 0.25)',
                  boxShadow: '0 16px 40px -16px rgba(99, 102, 241, 0.25)',
                  '&::before': { opacity: 1 },
                },
              }}
            >
              <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
                <Stack
                  direction="row"
                  sx={{
                    mb: 2,
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    flexWrap: 'wrap',
                    gap: 1,
                  }}
                >
                  <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
                    <ScheduleRoundedIcon sx={{ fontSize: 16, color: '#94a3b8' }} />
                    <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500 }}>
                      {formatDate(item.created_at)}
                    </Typography>
                  </Stack>
                  {item.emotion && (
                    <Chip
                      label={
                        item.emotion_confidence !== null && item.emotion_confidence !== undefined
                          ? `${item.emotion} · ${(item.emotion_confidence * 100).toFixed(0)}%`
                          : item.emotion
                      }
                      size="small"
                      sx={{
                        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                        color: '#fff',
                        fontWeight: 600,
                        textTransform: 'capitalize',
                        boxShadow: '0 4px 12px rgba(99, 102, 241, 0.25)',
                      }}
                    />
                  )}
                </Stack>

                {item.transcription && (
                  <Box sx={{ mb: 2.5 }}>
                    <Stack direction="row" spacing={1} sx={{ mb: 1, alignItems: 'center' }}>
                      <RecordVoiceOverRoundedIcon sx={{ fontSize: 16, color: '#6366f1' }} />
                      <Typography
                        sx={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          color: '#6366f1',
                          textTransform: 'uppercase',
                          letterSpacing: '1px',
                        }}
                      >
                        Transcrição
                      </Typography>
                    </Stack>
                    <Typography
                      sx={{
                        fontSize: '0.92rem',
                        color: '#334155',
                        lineHeight: 1.65,
                        pl: 0.25,
                      }}
                    >
                      {item.transcription}
                    </Typography>
                  </Box>
                )}

                <Box>
                  <Stack direction="row" spacing={1} sx={{ mb: 1, alignItems: 'center' }}>
                    <AutoAwesomeRoundedIcon sx={{ fontSize: 16, color: '#6366f1' }} />
                    <Typography
                      sx={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        color: '#6366f1',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                      }}
                    >
                      Análise (LLM)
                    </Typography>
                  </Stack>
                  <Typography
                    sx={{
                      fontSize: '0.92rem',
                      color: '#334155',
                      lineHeight: 1.7,
                      whiteSpace: 'pre-wrap',
                      pl: 0.25,
                    }}
                  >
                    {item.llm_analysis}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Stack>
      </Box>
    </Box>
  )
}
