/**
 * Test PDF endpoint using Pages Router
 *
 * Pages Router API routes work better with @react-pdf/renderer
 * because they don't have the same bundling issues as App Router.
 *
 * See: https://github.com/diegomura/react-pdf/issues/2460
 */

import type { NextApiRequest, NextApiResponse } from 'next'
import { renderToBuffer } from '@react-pdf/renderer'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
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

const TestDocument = () => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View>
        <Text style={styles.title}>Test PDF</Text>
        <Text style={styles.text}>If you can see this, PDF generation works!</Text>
        <Text style={styles.text}>Using Pages Router API with @react-pdf/renderer</Text>
        <Text style={styles.text}>Generated at: {new Date().toISOString()}</Text>
      </View>
    </Page>
  </Document>
)

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    console.log('🧪 Test PDF (Pages Router): Starting generation...')

    const buffer = await renderToBuffer(<TestDocument />)

    console.log('✅ Test PDF: Generated successfully, size:', buffer.length, 'bytes')

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', 'inline; filename="test.pdf"')
    res.send(buffer)
  } catch (error: any) {
    console.error('❌ Test PDF error:', {
      message: error?.message,
      stack: error?.stack,
      name: error?.name,
    })

    res.status(500).json({
      success: false,
      error: error?.message || 'Unknown error',
      stack: error?.stack,
    })
  }
}
