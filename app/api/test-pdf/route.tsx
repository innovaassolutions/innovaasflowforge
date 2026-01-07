/**
 * Test PDF endpoint to diagnose PDF generation issues
 * This creates a minimal PDF to verify react-pdf works on Vercel
 */

import { NextResponse } from 'next/server'
import React from 'react'
import ReactPDF from '@react-pdf/renderer'

const { Document, Page, Text, View, StyleSheet, renderToBuffer } = ReactPDF

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#FFFFFF',
    padding: 40,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  text: {
    fontSize: 12,
    marginBottom: 10,
  },
})

export async function GET() {
  try {
    console.log('🧪 Test PDF: Starting generation...')

    // Create elements using React.createElement to avoid JSX transpilation issues
    const textTitle = React.createElement(Text, { style: styles.title }, 'Test PDF')
    const textBody = React.createElement(Text, { style: styles.text }, 'If you can see this, PDF generation works!')
    const textVersion = React.createElement(Text, { style: styles.text }, 'react-pdf v3.4.5')

    const view = React.createElement(View, null, textTitle, textBody, textVersion)
    const page = React.createElement(Page, { size: 'A4', style: styles.page }, view)
    const doc = React.createElement(Document, null, page)

    const pdfBuffer = await renderToBuffer(doc)

    console.log('✅ Test PDF: Generated successfully, size:', pdfBuffer.length, 'bytes')

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename="test.pdf"',
      },
    })
  } catch (error: any) {
    console.error('❌ Test PDF error:', {
      message: error?.message,
      stack: error?.stack,
      name: error?.name,
    })

    return NextResponse.json({
      success: false,
      error: error?.message || 'Unknown error',
      stack: error?.stack,
    }, { status: 500 })
  }
}
