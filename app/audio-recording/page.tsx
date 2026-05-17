'use client'

import { useEffect, useRef, useState } from 'react'

import {
  Box,
  Button,
  IconButton,
  Stack,
  Typography,
} from '@mui/material'

import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded'
import StopRoundedIcon from '@mui/icons-material/StopRounded'
import UploadIcon from '@mui/icons-material/Upload'

export default function AudioRecording() {
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioBlob, setAudioBlob] =
    useState<Blob | null>(null)
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [analysisResult, setAnalysisResult] = useState<any>(null)

  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const mediaRecorderRef =
    useRef<MediaRecorder | null>(null)

  const chunksRef = useRef<Blob[]>([])

  const bars = Array.from({ length: 42 })

  const startRecording = async () => {
    try {
      setAudioBlob(null)
      setRecordingTime(0)
      setUploadStatus('idle')
      setErrorMessage('')

      const stream =
        await navigator.mediaDevices.getUserMedia({
          audio: true,
        })

      const mediaRecorder = new MediaRecorder(stream)

      mediaRecorderRef.current = mediaRecorder

      chunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: 'audio/webm',
        })

        setAudioBlob(blob)

        stream.getTracks().forEach((track) => {
          track.stop()
        })
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

    const formData = new FormData()
    formData.append('audio', audioBlob, 'recording.webm')

    try {
      const response = await fetch('http://localhost:5000/api/audio', {
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
    } catch (error) {
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

    return `${String(hrs).padStart(2, '0')}:${String(
      mins
    ).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  return (
    <>
      <Box
        sx={{
          minHeight: '100vh',
          background:
            'linear-gradient(to right, #f3f3f3, #ffffff, #f3f3f3)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          py: 6,
          overflow: 'hidden',
        }}
      >
        {/* TOP */}
        <Stack
          spacing={1}
          sx={{
            mt: 4,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Typography
            sx={{
              fontSize: {
                xs: 52,
                md: 72,
              },
              fontWeight: 300,
              color: '#1c1c1e',
              letterSpacing: '-3px',
              lineHeight: 1,
            }}
          >
            {formatTime(recordingTime)}
          </Typography>

          <Typography
            sx={{
              color: '#7c7c80',
              fontSize: 20,
              fontWeight: 400,
            }}
          >
            {isRecording
              ? 'Gravando...'
              : 'Pronto para gravar'}
          </Typography>
        </Stack>

        {/* REAL AUDIO EFFECT */}
        <Box
          sx={{
            width: '100%',
            height: 220,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
            px: 3,
            overflow: 'hidden',
          }}
        >
          {bars.map((_, index) => (
            <Box
              key={index}
              sx={{
                width: 4,
                borderRadius: 999,
                background:
                  index % 2 === 0
                    ? '#7ea6ff'
                    : '#cddcff',

                height: isRecording
                  ? `${20 + ((index * 13) % 90)}px`
                  : '12px',

                animation: isRecording
                  ? `voiceWave ${
                      0.6 + (index % 8) * 0.08
                    }s ease-in-out infinite`
                  : 'none',

                animationDelay: `${index * 0.04}s`,

                transition: '0.3s ease',
                opacity: isRecording ? 1 : 0.35,
              }}
            />
          ))}
        </Box>

        {/* AUDIO PLAYER */}
        {audioBlob && !isRecording && (
          <Box
            sx={{
              width: '90%',
              maxWidth: 420,
              mb: 3,
            }}
          >
            <audio
              controls
              src={URL.createObjectURL(audioBlob)}
              style={{
                width: '100%',
              }}
            />
          </Box>
        )}

        {/* ANALYSIS RESULT */}
        {analysisResult && uploadStatus === 'success' && (
          <Box
            sx={{
              width: '90%',
              maxWidth: 600,
              mb: 3,
              px: 3,
              py: 2,
              background: '#f8f9fa',
              borderRadius: 2,
              border: '2px solid #667eea',
            }}
          >
            <Typography
              sx={{
                fontSize: '1.1rem',
                fontWeight: 600,
                color: '#1c1c1e',
                mb: 2,
              }}
            >
              📊 Análise do Áudio
            </Typography>

            {analysisResult.transcription && (
              <Box sx={{ mb: 2 }}>
                <Typography
                  sx={{
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    color: '#667eea',
                    mb: 1,
                  }}
                >
                  Transcrição:
                </Typography>
                <Typography
                  sx={{
                    fontSize: '0.9rem',
                    color: '#4a4a4a',
                    lineHeight: 1.6,
                  }}
                >
                  {analysisResult.transcription}
                </Typography>
              </Box>
            )}

            {analysisResult.emotion && (
              <Box sx={{ mb: 2 }}>
                <Typography
                  sx={{
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    color: '#667eea',
                    mb: 1,
                  }}
                >
                  Emoção Detectada:
                </Typography>
                <Typography
                  sx={{
                    fontSize: '0.9rem',
                    color: '#4a4a4a',
                  }}
                >
                  {analysisResult.emotion} (confiança: {analysisResult.emotion_confidence?.toFixed(2)})
                </Typography>
              </Box>
            )}

            {analysisResult.analysis && (
              <Box>
                <Typography
                  sx={{
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    color: '#667eea',
                    mb: 1,
                  }}
                >
                  Análise Completa:
                </Typography>
                <Typography
                  sx={{
                    fontSize: '0.9rem',
                    color: '#4a4a4a',
                    lineHeight: 1.6,
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {analysisResult.analysis}
                </Typography>
              </Box>
            )}
          </Box>
        )}

        {/* UPLOAD STATUS */}
        {uploadStatus === 'uploading' && (
          <Box
            sx={{
              mb: 3,
              px: 3,
              py: 2,
              background: '#fffbeb',
              borderRadius: 2,
              border: '2px solid #f59e0b',
              color: '#92400e',
              fontWeight: 500,
            }}
          >
            ⏳ Analisando áudio...
          </Box>
        )}

        {uploadStatus === 'success' && (
          <Box
            sx={{
              mb: 3,
              px: 3,
              py: 2,
              background: '#f0fdf4',
              borderRadius: 2,
              border: '2px solid #22c55e',
              color: '#166534',
              fontWeight: 500,
            }}
          >
            ✓ Áudio analisado com sucesso!
          </Box>
        )}

        {uploadStatus === 'error' && (
          <Box
            sx={{
              mb: 3,
              px: 3,
              py: 2,
              background: '#fef2f2',
              borderRadius: 2,
              border: '2px solid #ef4444',
              color: '#991b1b',
              fontWeight: 500,
            }}
          >
            ✗ {errorMessage}
          </Box>
        )}

        {/* CONTROLS */}
        <Stack
          direction="row"
          spacing={3}
          sx={{
            mb: 5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <IconButton
            onClick={
              isRecording
                ? stopRecording
                : startRecording
            }
            sx={{
              width: 92,
              height: 92,
              background: '#1c1c1e',
              boxShadow:
                '0 10px 30px rgba(0,0,0,0.12)',

              '&:hover': {
                background: '#2a2a2d',
              },
            }}
          >
            {isRecording ? (
              <StopRoundedIcon
                sx={{
                  color: 'white',
                  fontSize: 42,
                }}
              />
            ) : (
              <PlayArrowRoundedIcon
                sx={{
                  color: 'white',
                  fontSize: 46,
                  ml: '2px',
                }}
              />
            )}
          </IconButton>

          {audioBlob && !isRecording && uploadStatus === 'idle' && (
            <Button
              onClick={uploadAudio}
              variant="contained"
              startIcon={<UploadIcon />}
              sx={{
                height: 92,
                px: 4,
                background: '#667eea',
                '&:hover': {
                  background: '#5568d3',
                },
                fontSize: '1rem',
                fontWeight: 600,
                textTransform: 'none',
              }}
            >
              Analisar Áudio
            </Button>
          )}

          {audioBlob && !isRecording && uploadStatus !== 'idle' && (
            <Button
              onClick={resetRecording}
              variant="outlined"
              sx={{
                height: 92,
                px: 4,
                borderColor: '#667eea',
                color: '#667eea',
                '&:hover': {
                  borderColor: '#5568d3',
                  color: '#5568d3',
                },
                fontSize: '1rem',
                fontWeight: 600,
                textTransform: 'none',
              }}
            >
              Nova Gravação
            </Button>
          )}
        </Stack>
      </Box>

      <style jsx global>{`
        @keyframes voiceWave {
          0%,
          100% {
            transform: scaleY(0.35);
            opacity: 0.4;
          }

          25% {
            transform: scaleY(1);
            opacity: 1;
          }

          50% {
            transform: scaleY(1.8);
            opacity: 0.9;
          }

          75% {
            transform: scaleY(0.7);
            opacity: 0.6;
          }
        }

        body {
          margin: 0;
          padding: 0;
          overflow: hidden;
          font-family: Inter, sans-serif;
        }
      `}</style>
    </>
  )
}