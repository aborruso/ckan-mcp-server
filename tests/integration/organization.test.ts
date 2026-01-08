import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { makeCkanRequest } from '../../src/utils/http';
import orgListFixture from '../fixtures/responses/organization-list-success.json';
import orgShowFixture from '../fixtures/responses/organization-show-success.json';
import orgSearchFixture from '../fixtures/responses/organization-search-success.json';

vi.mock('axios');

describe('ckan_organization_list', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns list of organizations', async () => {
    vi.mocked(axios.get).mockResolvedValue({ data: orgListFixture });

    const result = await makeCkanRequest(
      'http://demo.ckan.org',
      'organization_list',
      {}
    );

    expect(result).toBeInstanceOf(Array);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toHaveProperty('id');
    expect(result[0]).toHaveProperty('name');
    expect(result[0]).toHaveProperty('title');
  });

  it('handles empty organization list', async () => {
    const emptyResults = {
      help: 'http://demo.ckan.org/api/3/action/help_show?name=organization_list',
      success: true,
      result: []
    };

    vi.mocked(axios.get).mockResolvedValue({ data: emptyResults });

    const result = await makeCkanRequest(
      'http://demo.ckan.org',
      'organization_list',
      {}
    );

    expect(result).toEqual([]);
  });
});

describe('ckan_organization_show', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns organization details for valid ID', async () => {
    vi.mocked(axios.get).mockResolvedValue({ data: orgShowFixture });

    const result = await makeCkanRequest(
      'http://demo.ckan.org',
      'organization_show',
      { id: 'example-org' }
    );

    expect(result).toHaveProperty('id', 'org-1');
    expect(result).toHaveProperty('name', 'example-org');
    expect(result).toHaveProperty('title', 'Example Organization');
  });

  it('includes organization metadata', async () => {
    vi.mocked(axios.get).mockResolvedValue({ data: orgShowFixture });

    const result = await makeCkanRequest(
      'http://demo.ckan.org',
      'organization_show',
      { id: 'example-org' }
    );

    expect(result).toHaveProperty('package_count');
    expect(result).toHaveProperty('created');
    expect(result).toHaveProperty('state');
    expect(result).toHaveProperty('users');
    expect(result).toHaveProperty('packages');
  });
});

describe('ckan_organization_search', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('searches organizations by pattern', async () => {
    vi.mocked(axios.get).mockResolvedValue({ data: orgSearchFixture });

    const result = await makeCkanRequest(
      'http://demo.ckan.org',
      'package_search',
      { q: 'organization:example*', rows: 0 }
    );

    expect(result).toHaveProperty('count');
    expect(result).toHaveProperty('results');
  });

  it('handles empty search results', async () => {
    const emptyResults = {
      help: 'http://demo.ckan.org/api/3/action/help_show?name=package_search',
      success: true,
      result: {
        count: 0,
        results: [],
        facets: {}
      }
    };

    vi.mocked(axios.get).mockResolvedValue({ data: emptyResults });

    const result = await makeCkanRequest(
      'http://demo.ckan.org',
      'package_search',
      { q: 'organization:nonexistent*', rows: 0 }
    );

    expect(result.count).toBe(0);
    expect(result.results).toEqual([]);
  });
});
