import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { makeCkanRequest } from '../../src/utils/http';
import statusSuccess from '../fixtures/responses/status-success.json';

vi.mock('axios');

describe('ckan_status_show integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns markdown formatted status information', async () => {
    vi.mocked(axios.get).mockResolvedValue({ data: statusSuccess });

    const result = await makeCkanRequest(
      'http://demo.ckan.org',
      'status_show'
    );

    expect(result).toHaveProperty('ckan_version', '2.10.1');
    expect(result).toHaveProperty('site_title', 'CKAN Demo');
    expect(result).toHaveProperty('site_url', 'http://demo.ckan.org');
  });

  it('handles missing optional fields gracefully', async () => {
    const minimalStatus = {
      help: 'http://demo.ckan.org/api/3/action/help_show?name=ckan_status_show',
      success: true,
      result: {
        ckan_version: '2.10.0',
        offline: false
      }
    };

    vi.mocked(axios.get).mockResolvedValue({ data: minimalStatus });

    const result = await makeCkanRequest(
      'http://demo.ckan.org',
      'status_show'
    );

    expect(result).toHaveProperty('ckan_version', '2.10.0');
    expect(result).toHaveProperty('offline', false);
  });
});
