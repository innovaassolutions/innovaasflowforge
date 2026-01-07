/**
 * Test PDF endpoint to diagnose PDF generation issues
 * This creates a minimal PDF to verify react-pdf works on Vercel
 */

import { NextResponse } from 'next/server'
import { Document, Page, Text, View, StyleSheet, renderToBuffer } from '@react-pdf/renderer'
import React from 'react'

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

function MinimalPDF() {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View>
          <Text style={styles.title}>Test PDF</Text>
          <Text style={styles.text}>If you can see this, PDF generation works!</Text>
          <Text style={styles.text}>Generated at: {new Date().toISOString()}</Text>
        </View>
      </Page>
    </Document>
  )
}

export async function GET() {
  try {
    console.log('🧪 Test PDF: Starting generation...')

    const pdfBuffer = await renderToBuffer(<MinimalPDF />)

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
