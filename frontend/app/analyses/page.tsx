'use client'

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
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000'
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
        background: 'linear-gradient(to right, #f3f3f3, #ffffff, #f3f3f3)',
        py: 4,
        px: 2,
        overflow: 'auto',
      }}
    >
      <Box sx={{ maxWidth: 800, mx: 'auto' }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          spacing={2}
          sx={{ mb: 4 }}
        >
          <Box>
            <Typography
              variant="h4"
              sx={{ fontWeight: 300, color: '#1c1c1e', letterSpacing: '-1px' }}
            >
              Relatórios
            </Typography>
            <Typography sx={{ color: '#7c7c80', mt: 0.5 }}>
              Histórico de análises salvas na nuvem
            </Typography>
          </Box>
          <Button
            onClick={fetchAnalyses}
            variant="contained"
            startIcon={<RefreshRoundedIcon />}
            disabled={loading}
            sx={{
              textTransform: 'none',
              background: '#667eea',
              '&:hover': { background: '#5568d3' },
            }}
          >
            Atualizar
          </Button>
        </Stack>

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress sx={{ color: '#667eea' }} />
          </Box>
        )}

        {!loading && error && (
          <Box
            sx={{
              p: 2,
              mb: 3,
              borderRadius: 2,
              border: '2px solid #ef4444',
              background: '#fef2f2',
              color: '#991b1b',
            }}
          >
            {error}
          </Box>
        )}

        {!loading && !error && analyses.length === 0 && (
          <Typography sx={{ color: '#7c7c80', textAlign: 'center', py: 6 }}>
            Nenhuma análise salva ainda. Grave um áudio na página inicial para gerar a
            primeira.
          </Typography>
        )}

        <Stack spacing={2}>
          {analyses.map((item) => (
            <Card
              key={item.id}
              elevation={0}
              sx={{
                border: '1px solid #e5e7eb',
                borderRadius: 2,
                '&:hover': { borderColor: '#667eea' },
              }}
            >
              <CardContent>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="flex-start"
                  sx={{ mb: 1.5 }}
                >
                  <Typography variant="caption" sx={{ color: '#7c7c80' }}>
                    {formatDate(item.created_at)}
                  </Typography>
                  {item.emotion && (
                    <Chip
                      label={item.emotion}
                      size="small"
                      sx={{
                        background: '#eef2ff',
                        color: '#4338ca',
                        fontWeight: 600,
                        textTransform: 'capitalize',
                      }}
                    />
                  )}
                </Stack>

                {item.transcription && (
                  <Box sx={{ mb: 2 }}>
                    <Typography
                      variant="subtitle2"
                      sx={{ color: '#667eea', mb: 0.5 }}
                    >
                      Transcrição
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#4a4a4a' }}>
                      {item.transcription}
                    </Typography>
                  </Box>
                )}

                <Box>
                  <Typography variant="subtitle2" sx={{ color: '#667eea', mb: 0.5 }}>
                    Análise (LLM)
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: '#4a4a4a',
                      lineHeight: 1.6,
                      whiteSpace: 'pre-wrap',
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
