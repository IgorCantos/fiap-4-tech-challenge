import { NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import { join } from 'path'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const audioFile = formData.get('audio') as File

    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      )
    }

    // Convert the file to buffer
    const bytes = await audioFile.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Generate a unique filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const filename = `recording-${timestamp}.webm`
    
    // Save the file to the recordings directory
    const recordingsDir = join(process.cwd(), 'recordings')
    const filepath = join(recordingsDir, filename)

    // Create recordings directory if it doesn't exist
    const fs = require('fs')
    if (!fs.existsSync(recordingsDir)) {
      fs.mkdirSync(recordingsDir, { recursive: true })
    }

    // Write the file
    await writeFile(filepath, buffer)

    console.log(`Audio saved: ${filename}`)
    console.log(`File size: ${buffer.length} bytes`)

    return NextResponse.json({
      message: 'Audio received successfully',
      filename: filename,
      size: buffer.length,
      timestamp: new Date().toISOString()
    }, { status: 200 })

  } catch (error) {
    console.error('Error processing audio:', error)
    return NextResponse.json(
      { error: 'Failed to process audio file' },
      { status: 500 }
    )
  }
}
