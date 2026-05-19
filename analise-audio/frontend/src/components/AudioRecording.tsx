import { useEffect, useRef, useState } from 'react'

import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  Typography,
} from '@mui/material'

import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded'
import StopRoundedIcon from '@mui/icons-material/StopRounded'
import UploadIcon from '@mui/icons-material/Upload'
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded'
import FiberManualRecordRoundedIcon from '@mui/icons-material/FiberManualRecordRounded'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import ErrorRoundedIcon from '@mui/icons-material/ErrorRounded'
import HourglassTopRoundedIcon from '@mui/icons-material/HourglassTopRounded'
import RecordVoiceOverRoundedIcon from '@mui/icons-material/RecordVoiceOverRounded'
import MoodRoundedIcon from '@mui/icons-material/MoodRounded'
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded'

export default function AudioRecording() {
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [analysisResult, setAnalysisResult] = useState<any>(null)

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const bars = Array.from({ length: 48 })
  const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:5000'

  const startRecording = async () => {
    try {
      setAudioBlob(null)
      setRecordingTime(0)
      setUploadStatus('idle')
      setErrorMessage('')

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)

      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        setAudioBlob(blob)
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)
    } catch (error) {
      console.error(error)
    }
  }

  const stopRecording = () => {
    setIsRecording(false)

    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }

    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== 'inactive'
    ) {
      mediaRecorderRef.current.stop()
    }
  }

  const uploadAudio = async () => {
    if (!audioBlob) return

    setUploadStatus('uploading')
    setErrorMessage('')
    setAnalysisResult(null)

    setTimeout(() => {
      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: 'smooth',
      })
    }, 100)

    const formData = new FormData()
    formData.append('audio', audioBlob, 'recording.webm')

    try {
      const response = await fetch(`${apiUrl}/api/audio`, {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        setAnalysisResult(data.analysis)
        setUploadStatus('success')
      } else {
        setUploadStatus('error')
        setErrorMessage('Erro ao enviar áudio para o servidor')
      }
    } catch {
      setUploadStatus('error')
      setErrorMessage('Erro de conexão ao enviar áudio')
    }
  }

  const resetRecording = () => {
    setAudioBlob(null)
    setUploadStatus('idle')
    setErrorMessage('')
    setRecordingTime(0)
    setAnalysisResult(null)
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  const statusLabel = isRecording
    ? 'Gravando agora'
    : audioBlob
      ? 'Gravação pronta'
      : 'Pronto para gravar'

  return (
    <Box
      sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        py: { xs: 4, md: 6 },
        px: 2,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: 720,
          p: { xs: 3, md: 5 },
          borderRadius: 4,
          background: 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.6)',
          boxShadow:
            '0 20px 60px -20px rgba(99, 102, 241, 0.18), 0 8px 24px -8px rgba(15, 23, 42, 0.06)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 3,
        }}
      >
        <Stack spacing={1.5} sx={{ alignItems: 'center' }}>
          <Chip
            icon={
              <FiberManualRecordRoundedIcon
                sx={{
                  fontSize: '14px !important',
                  color: isRecording ? '#ef4444 !important' : '#94a3b8 !important',
                  animation: isRecording ? 'pulse 1.6s ease-in-out infinite' : 'none',
                }}
              />
            }
            label={statusLabel}
            sx={{
              borderRadius: '999px',
              fontWeight: 600,
              fontSize: '0.8rem',
              px: 1,
              background: isRecording
                ? 'rgba(239, 68, 68, 0.10)'
                : 'rgba(99, 102, 241, 0.08)',
              color: isRecording ? '#b91c1c' : '#4f46e5',
              border: isRecording
                ? '1px solid rgba(239, 68, 68, 0.2)'
                : '1px solid rgba(99, 102, 241, 0.18)',
            }}
          />
          <Typography
            sx={{
              fontSize: { xs: 56, md: 88 },
              fontWeight: 200,
              fontVariantNumeric: 'tabular-nums',
              letterSpacing: '-4px',
              lineHeight: 1,
              background: isRecording
                ? 'linear-gradient(135deg, #ef4444 0%, #f97316 100%)'
                : 'linear-gradient(135deg, #0f172a 0%, #475569 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              transition: 'all 0.4s ease',
            }}
          >
            {formatTime(recordingTime)}
          </Typography>
        </Stack>

        <Box
          sx={{
            width: '100%',
            height: 180,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
            px: 2,
            overflow: 'hidden',
          }}
        >
          {bars.map((_, index) => (
            <Box
              key={index}
              sx={{
                width: 4,
                borderRadius: 999,
                background: isRecording
                  ? `linear-gradient(180deg, #6366f1 0%, #8b5cf6 ${
                      40 + (index % 5) * 10
                    }%, #ec4899 100%)`
                  : 'linear-gradient(180deg, #cbd5e1 0%, #e2e8f0 100%)',
                height: isRecording ? `${20 + ((index * 13) % 110)}px` : '10px',
                animation: isRecording
                  ? `voiceWave ${0.6 + (index % 8) * 0.08}s ease-in-out infinite`
                  : 'none',
                animationDelay: `${index * 0.04}s`,
                transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
                opacity: isRecording ? 1 : 0.5,
              }}
            />
          ))}
        </Box>

        <Stack
          direction="row"
          spacing={2.5}
          sx={{ width: '100%', alignItems: 'center', justifyContent: 'center' }}
        >
          <Button
            onClick={isRecording ? stopRecording : startRecording}
            disableElevation
            sx={{
              width: 96,
              height: 96,
              minWidth: 96,
              borderRadius: '50%',
              padding: 0,
              color: '#fff',
              background: isRecording
                ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              boxShadow: isRecording
                ? '0 12px 32px rgba(239, 68, 68, 0.4)'
                : '0 12px 32px rgba(99, 102, 241, 0.35)',
              animation: isRecording ? 'pulse 1.8s ease-in-out infinite' : 'none',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                background: isRecording
                  ? 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)'
                  : 'linear-gradient(135deg, #5256e8 0%, #7c3aed 100%)',
                transform: 'scale(1.05)',
                boxShadow: isRecording
                  ? '0 16px 40px rgba(239, 68, 68, 0.5)'
                  : '0 16px 40px rgba(99, 102, 241, 0.45)',
              },
              '&:active': {
                transform: 'scale(0.98)',
              },
            }}
          >
            {isRecording ? (
              <StopRoundedIcon sx={{ fontSize: 44 }} />
            ) : (
              <PlayArrowRoundedIcon sx={{ fontSize: 50, ml: '3px' }} />
            )}
          </Button>

          {audioBlob && !isRecording && uploadStatus === 'idle' && (
            <Button
              onClick={uploadAudio}
              variant="contained"
              color="primary"
              startIcon={<UploadIcon />}
              sx={{
                height: 56,
                px: 4,
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                animation: 'fadeInUp 0.4s ease both',
              }}
            >
              Analisar áudio
            </Button>
          )}

          {audioBlob && !isRecording && uploadStatus !== 'idle' && uploadStatus !== 'uploading' && (
            <Button
              onClick={resetRecording}
              variant="outlined"
              color="primary"
              startIcon={<RestartAltRoundedIcon />}
              sx={{
                height: 56,
                px: 4,
                animation: 'fadeInUp 0.4s ease both',
              }}
            >
              Nova gravação
            </Button>
          )}
        </Stack>

        {audioBlob && !isRecording && (
          <Box
            sx={{
              width: '100%',
              maxWidth: 480,
              p: 1.5,
              borderRadius: 3,
              background: 'rgba(99, 102, 241, 0.06)',
              border: '1px solid rgba(99, 102, 241, 0.15)',
              animation: 'fadeInUp 0.4s ease both',
            }}
          >
            <audio
              controls
              src={URL.createObjectURL(audioBlob)}
              style={{ width: '100%', display: 'block' }}
            />
          </Box>
        )}
      </Paper>

      <Box sx={{ width: '100%', maxWidth: 720, mt: 3 }}>
        {uploadStatus === 'uploading' && (
          <StatusBanner
            icon={<HourglassTopRoundedIcon />}
            color="#f59e0b"
            bg="rgba(245, 158, 11, 0.08)"
            border="rgba(245, 158, 11, 0.25)"
          >
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
              <CircularProgress size={18} sx={{ color: '#d97706' }} />
              <Typography sx={{ fontWeight: 600, color: '#92400e' }}>
                Analisando áudio...
              </Typography>
            </Stack>
          </StatusBanner>
        )}

        {uploadStatus === 'success' && (
          <StatusBanner
            icon={<CheckCircleRoundedIcon />}
            color="#10b981"
            bg="rgba(16, 185, 129, 0.08)"
            border="rgba(16, 185, 129, 0.25)"
          >
            <Typography sx={{ fontWeight: 600, color: '#065f46' }}>
              Áudio analisado com sucesso!
            </Typography>
          </StatusBanner>
        )}

        {uploadStatus === 'error' && (
          <StatusBanner
            icon={<ErrorRoundedIcon />}
            color="#ef4444"
            bg="rgba(239, 68, 68, 0.08)"
            border="rgba(239, 68, 68, 0.25)"
          >
            <Typography sx={{ fontWeight: 600, color: '#991b1b' }}>
              {errorMessage}
            </Typography>
          </StatusBanner>
        )}

        {analysisResult && uploadStatus === 'success' && (
          <Paper
            elevation={0}
            sx={{
              mt: 2,
              p: { xs: 3, md: 4 },
              borderRadius: 4,
              background: 'rgba(255, 255, 255, 0.85)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(99, 102, 241, 0.15)',
              boxShadow: '0 20px 50px -20px rgba(99, 102, 241, 0.2)',
              animation: 'fadeInUp 0.5s ease both',
            }}
          >
            <Stack direction="row" spacing={1.5} sx={{ mb: 3, alignItems: 'center' }}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                }}
              >
                <AutoAwesomeRoundedIcon sx={{ color: '#fff', fontSize: 20 }} />
              </Box>
              <Typography
                sx={{
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  color: '#0f172a',
                  letterSpacing: '-0.5px',
                }}
              >
                Análise do áudio
              </Typography>
            </Stack>

            <Stack spacing={3}>
              {analysisResult.transcription && (
                <ResultSection
                  icon={<RecordVoiceOverRoundedIcon sx={{ fontSize: 18 }} />}
                  title="Transcrição"
                >
                  <Typography sx={{ fontSize: '0.95rem', color: '#334155', lineHeight: 1.7 }}>
                    {analysisResult.transcription}
                  </Typography>
                </ResultSection>
              )}

              {analysisResult.emotion && (
                <ResultSection
                  icon={<MoodRoundedIcon sx={{ fontSize: 18 }} />}
                  title="Emoção detectada"
                >
                  <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
                    <Chip
                      label={analysisResult.emotion}
                      sx={{
                        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                        color: '#fff',
                        fontWeight: 600,
                        textTransform: 'capitalize',
                      }}
                    />
                    {analysisResult.emotion_confidence !== undefined && (
                      <Typography sx={{ color: '#64748b', fontSize: '0.9rem' }}>
                        confiança: {' '}
                        <strong style={{ color: '#0f172a' }}>
                          {(analysisResult.emotion_confidence * 100).toFixed(0)}%
                        </strong>
                      </Typography>
                    )}
                  </Stack>
                </ResultSection>
              )}

              {analysisResult.analysis && (
                <ResultSection
                  icon={<AutoAwesomeRoundedIcon sx={{ fontSize: 18 }} />}
                  title="Análise completa"
                >
                  <Typography
                    sx={{
                      fontSize: '0.95rem',
                      color: '#334155',
                      lineHeight: 1.7,
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {analysisResult.analysis}
                  </Typography>
                </ResultSection>
              )}
            </Stack>
          </Paper>
        )}
      </Box>
    </Box>
  )
}

function StatusBanner({
  icon,
  color,
  bg,
  border,
  children,
}: {
  icon: React.ReactNode
  color: string
  bg: string
  border: string
  children: React.ReactNode
}) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        px: 2.5,
        py: 1.75,
        borderRadius: 3,
        background: bg,
        border: `1px solid ${border}`,
        animation: 'fadeInUp 0.3s ease both',
      }}
    >
      <Box sx={{ color, display: 'flex', alignItems: 'center' }}>{icon}</Box>
      {children}
    </Box>
  )
}

function ResultSection({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode
  title: string
  children: React.ReactNode
}) {
  return (
    <Box
      sx={{
        p: 2.5,
        borderRadius: 3,
        background: 'rgba(248, 250, 252, 0.6)',
        border: '1px solid rgba(15, 23, 42, 0.05)',
      }}
    >
      <Stack direction="row" spacing={1} sx={{ mb: 1.25, alignItems: 'center' }}>
        <Box
          sx={{
            color: '#6366f1',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {icon}
        </Box>
        <Typography
          sx={{
            fontSize: '0.78rem',
            fontWeight: 700,
            color: '#6366f1',
            textTransform: 'uppercase',
            letterSpacing: '1px',
          }}
        >
          {title}
        </Typography>
      </Stack>
      {children}
    </Box>
  )
}
