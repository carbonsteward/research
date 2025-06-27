/**
 * Health API Integration Tests
 * Tests the health check endpoint functionality
 */

import { createMocks } from 'node-mocks-http'
import { NextRequest } from 'next/server'
import { GET } from '@/app/api/health/route'

describe('/api/health', () => {
  it('should return health status', async () => {
    // Create a mock request
    const mockRequest = new NextRequest('http://localhost:3000/api/health', {
      method: 'GET',
    })

    // Call the API route handler
    const response = await GET(mockRequest)

    // Parse the response
    const data = await response.json()

    // Assertions
    expect(response.status).toBe(200)
    expect(data).toHaveProperty('status', 'healthy')
    expect(data).toHaveProperty('timestamp')
    expect(data).toHaveProperty('service', 'chatpdd-api')
    expect(new Date(data.timestamp)).toBeInstanceOf(Date)
  })

  it('should return valid JSON structure', async () => {
    const mockRequest = new NextRequest('http://localhost:3000/api/health', {
      method: 'GET',
    })

    const response = await GET(mockRequest)
    const data = await response.json()

    // Verify JSON structure
    expect(typeof data).toBe('object')
    expect(Object.keys(data)).toEqual(
      expect.arrayContaining(['status', 'timestamp', 'service'])
    )
  })

  it('should have proper content type', async () => {
    const mockRequest = new NextRequest('http://localhost:3000/api/health', {
      method: 'GET',
    })

    const response = await GET(mockRequest)

    expect(response.headers.get('content-type')).toContain('application/json')
  })
})
