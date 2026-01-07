/**
 * Test PDF endpoint to diagnose PDF generation issues
 * Uses @joshuajaco/react-pdf-renderer-bundled which works with Next.js App Router
 * See: https://github.com/diegomura/react-pdf/issues/2350
 */

import { NextResponse } from 'next/server'
import { Document, Page, Text, View, StyleSheet, renderToBuffer } from '@joshuajaco/react-pdf-renderer-bundled'

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
    console.log('🧪 Test PDF: Starting generation with bundled react-pdf...')

    const buffer = await renderToBuffer(
      <Document>
        <Page size="A4" style={styles.page}>
          <View>
            <Text style={styles.title}>Test PDF</Text>
            <Text style={styles.text}>If you can see this, PDF generation works!</Text>
            <Text style={styles.text}>Using @joshuajaco/react-pdf-renderer-bundled</Text>
          </View>
        </Page>
      </Document>
    )

    console.log('✅ Test PDF: Generated successfully, size:', buffer.length, 'bytes')

    return new NextResponse(buffer, {
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
