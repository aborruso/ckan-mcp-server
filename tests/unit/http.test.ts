import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { makeCkanRequest } from '../../src/utils/http';
import successResponse from '../fixtures/responses/status-success.json';

vi.mock('axios');

describe('makeCkanRequest', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('makes successful request and returns result', async () => {
    vi.mocked(axios.get).mockResolvedValue({ data: successResponse });

    const result = await makeCkanRequest(
      'http://demo.ckan.org',
      'ckan_status_show'
    );

    expect(axios.get).toHaveBeenCalledWith(
      'http://demo.ckan.org/api/3/action/ckan_status_show',
      expect.objectContaining({
        params: {},
        timeout: 30000,
        headers: {
          'User-Agent': 'CKAN-MCP-Server/1.0'
        }
      })
    );

    expect(result).toEqual(successResponse.result);
  });

  it('makes request with parameters', async () => {
    vi.mocked(axios.get).mockResolvedValue({ data: successResponse });

    await makeCkanRequest(
      'http://demo.ckan.org',
      'package_search',
      { q: 'test', rows: 10 }
    );

    expect(axios.get).toHaveBeenCalledWith(
      'http://demo.ckan.org/api/3/action/package_search',
      expect.objectContaining({
        params: { q: 'test', rows: 10 }
      })
    );
  });

  it('normalizes URL with trailing slash', async () => {
    vi.mocked(axios.get).mockResolvedValue({ data: successResponse });

    await makeCkanRequest(
      'http://demo.ckan.org/',
      'ckan_status_show'
    );

    expect(axios.get).toHaveBeenCalledWith(
      'http://demo.ckan.org/api/3/action/ckan_status_show',
      expect.any(Object)
    );
  });

  it('includes User-Agent header', async () => {
    vi.mocked(axios.get).mockResolvedValue({ data: successResponse });

    await makeCkanRequest('http://demo.ckan.org', 'ckan_status_show');

    const axiosCall = vi.mocked(axios.get).mock.calls[0];
    expect(axiosCall[1].headers['User-Agent']).toBe('CKAN-MCP-Server/1.0');
  });

  it('throws error when success=false in response', async () => {
    vi.mocked(axios.get).mockResolvedValue({
      data: {
        success: false,
        error: { message: 'Invalid request' }
      }
    });

    await expect(
      makeCkanRequest('http://demo.ckan.org', 'ckan_status_show')
    ).rejects.toThrow('CKAN API returned success=false');
  });

  it('uses correct timeout setting', async () => {
    vi.mocked(axios.get).mockResolvedValue({ data: successResponse });

    await makeCkanRequest('http://demo.ckan.org', 'ckan_status_show');

    const axiosCall = vi.mocked(axios.get).mock.calls[0];
    expect(axiosCall[1].timeout).toBe(30000);
  });
});
