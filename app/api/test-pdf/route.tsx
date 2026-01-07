/**
 * Test PDF endpoint to diagnose PDF generation issues
 * This creates a minimal PDF to verify react-pdf works on Vercel
 */

import { NextResponse } from 'next/server'
import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer'

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

    const timestamp = new Date().toISOString()

    // Create Document directly to satisfy pdf() type requirements
    const pdfDocument = (
      <Document>
        <Page size="A4" style={styles.page}>
          <View>
            <Text style={styles.title}>Test PDF</Text>
            <Text style={styles.text}>If you can see this, PDF generation works!</Text>
            <Text style={styles.text}>Generated at: {timestamp}</Text>
          </View>
        </Page>
      </Document>
    )

    const pdfDoc = pdf(pdfDocument)
    // toBlob() returns a Blob which we can convert to ArrayBuffer
    const pdfBlob = await pdfDoc.toBlob()
    const pdfArrayBuffer = await pdfBlob.arrayBuffer()

    console.log('✅ Test PDF: Generated successfully, size:', pdfArrayBuffer.byteLength, 'bytes')

    return new NextResponse(pdfArrayBuffer, {
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
