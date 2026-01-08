import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { makeCkanRequest } from '../../src/utils/http';
import datastoreFixture from '../fixtures/responses/datastore-search-success.json';
import notFoundError from '../fixtures/errors/not-found.json';

vi.mock('axios');

describe('ckan_datastore_search', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('basic functionality', () => {
    it('returns DataStore records for valid resource_id', async () => {
      vi.mocked(axios.get).mockResolvedValue({ data: datastoreFixture });

      const result = await makeCkanRequest(
        'http://demo.ckan.org',
        'datastore_search',
        { resource_id: 'res-1' }
      );

      expect(result).toHaveProperty('resource_id', 'res-1');
      expect(result).toHaveProperty('fields');
      expect(result).toHaveProperty('records');
      expect(result).toHaveProperty('total');
    });

    it('returns records array', async () => {
      vi.mocked(axios.get).mockResolvedValue({ data: datastoreFixture });

      const result = await makeCkanRequest(
        'http://demo.ckan.org',
        'datastore_search',
        { resource_id: 'res-1' }
      );

      expect(result.records).toBeInstanceOf(Array);
      expect(result.records.length).toBeGreaterThan(0);
    });

    it('includes field metadata', async () => {
      vi.mocked(axios.get).mockResolvedValue({ data: datastoreFixture });

      const result = await makeCkanRequest(
        'http://demo.ckan.org',
        'datastore_search',
        { resource_id: 'res-1' }
      );

      expect(result.fields).toBeInstanceOf(Array);
      expect(result.fields.length).toBeGreaterThan(0);
    });
  });

  describe('sorting', () => {
    it('supports sort parameter', async () => {
      vi.mocked(axios.get).mockResolvedValue({ data: datastoreFixture });

      await makeCkanRequest(
        'http://demo.ckan.org',
        'datastore_search',
        {
          resource_id: 'res-1',
          sort: 'popolazione desc'
        }
      );

      const axiosCall = vi.mocked(axios.get).mock.calls[0];
      expect(axiosCall[1].params.sort).toBe('popolazione desc');
    });
  });

  describe('pagination', () => {
    it('supports limit parameter', async () => {
      vi.mocked(axios.get).mockResolvedValue({ data: datastoreFixture });

      await makeCkanRequest(
        'http://demo.ckan.org',
        'datastore_search',
        {
          resource_id: 'res-1',
          limit: 50
        }
      );

      const axiosCall = vi.mocked(axios.get).mock.calls[0];
      expect(axiosCall[1].params.limit).toBe(50);
    });

    it('supports offset parameter', async () => {
      vi.mocked(axios.get).mockResolvedValue({ data: datastoreFixture });

      await makeCkanRequest(
        'http://demo.ckan.org',
        'datastore_search',
        {
          resource_id: 'res-1',
          offset: 100
        }
      );

      const axiosCall = vi.mocked(axios.get).mock.calls[0];
      expect(axiosCall[1].params.offset).toBe(100);
    });

    it('supports combined limit and offset', async () => {
      vi.mocked(axios.get).mockResolvedValue({ data: datastoreFixture });

      await makeCkanRequest(
        'http://demo.ckan.org',
        'datastore_search',
        {
          resource_id: 'res-1',
          limit: 50,
          offset: 100
        }
      );

      const axiosCall = vi.mocked(axios.get).mock.calls[0];
      expect(axiosCall[1].params.limit).toBe(50);
      expect(axiosCall[1].params.offset).toBe(100);
    });
  });

  describe('queries', () => {
    it('supports full-text search with q parameter', async () => {
      vi.mocked(axios.get).mockResolvedValue({ data: datastoreFixture });

      await makeCkanRequest(
        'http://demo.ckan.org',
        'datastore_search',
        {
          resource_id: 'res-1',
          q: 'test query'
        }
      );

      expect(axios.get).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          params: expect.objectContaining({
            q: 'test query'
          })
        })
      );
    });

    it('handles empty query results', async () => {
      const emptyResults = {
        help: 'http://demo.ckan.org/api/3/action/help_show?name=datastore_search',
        success: true,
        result: {
          resource_id: 'res-1',
          fields: [
            { id: '_id', type: 'int4' },
            { id: 'name', type: 'text' },
            { id: 'value', type: 'numeric' }
          ],
          records: [],
          records_format: 'objects',
          total: 0,
          filters: {},
          q: '',
          limit: 100,
          offset: 0,
          fields_order: ['_id', 'name', 'value'],
          include_total: true,
          total_estimation_threshold: null
        }
      };

      vi.mocked(axios.get).mockResolvedValue({ data: emptyResults });

      const result = await makeCkanRequest(
        'http://demo.ckan.org',
        'datastore_search',
        { resource_id: 'res-1', q: 'nonexistent' }
      );

      expect(result.total).toBe(0);
      expect(result.records).toEqual([]);
    });
  });

  describe('error handling', () => {
    it('handles 404 error for invalid resource_id', async () => {
      const error = new Error('Not Found') as any;
      error.isAxiosError = true;
      error.response = {
        status: 404,
        data: notFoundError
      };
      vi.mocked(axios.get).mockRejectedValue(error);

      await expect(
        makeCkanRequest(
          'http://demo.ckan.org',
          'datastore_search',
          { resource_id: 'invalid-resource' }
        )
      ).rejects.toThrow();
    });

    it('handles server error when querying DataStore', async () => {
      const error = new Error('Internal Server Error') as any;
      error.isAxiosError = true;
      error.response = {
        status: 500,
        data: {
          success: false,
          error: { message: 'Internal server error' }
        }
      };
      vi.mocked(axios.get).mockRejectedValue(error);

      await expect(
        makeCkanRequest(
          'http://demo.ckan.org',
          'datastore_search',
          { resource_id: 'res-1' }
        )
      ).rejects.toThrow();
    });

    it('handles timeout when querying DataStore', async () => {
      const error = new Error('timeout') as any;
      error.isAxiosError = true;
      error.code = 'ECONNABORTED';
      vi.mocked(axios.get).mockRejectedValue(error);

      await expect(
        makeCkanRequest(
          'http://demo.ckan.org',
          'datastore_search',
          { resource_id: 'res-1' }
        )
      ).rejects.toThrow();
    });
  });

  describe('response structure', () => {
    it('returns properly structured DataStore response', async () => {
      vi.mocked(axios.get).mockResolvedValue({ data: datastoreFixture });

      const result = await makeCkanRequest(
        'http://demo.ckan.org',
        'datastore_search',
        { resource_id: 'res-1' }
      );

      expect(result).toHaveProperty('resource_id');
      expect(result).toHaveProperty('fields');
      expect(result).toHaveProperty('records');
      expect(result).toHaveProperty('records_format');
      expect(result).toHaveProperty('total');
      expect(result).toHaveProperty('filters');
    });

    it('includes record metadata', async () => {
      vi.mocked(axios.get).mockResolvedValue({ data: datastoreFixture });

      const result = await makeCkanRequest(
        'http://demo.ckan.org',
        'datastore_search',
        { resource_id: 'res-1' }
      );

      if (result.records && result.records.length > 0) {
        const record = result.records[0];
        expect(record).toHaveProperty('_id');
        expect(record).toHaveProperty('name');
        expect(record).toHaveProperty('value');
        expect(record).toHaveProperty('date');
      }
    });

    it('includes field metadata', async () => {
      vi.mocked(axios.get).mockResolvedValue({ data: datastoreFixture });

      const result = await makeCkanRequest(
        'http://demo.ckan.org',
        'datastore_search',
        { resource_id: 'res-1' }
      );

      if (result.fields && result.fields.length > 0) {
        const field = result.fields[0];
        expect(field).toHaveProperty('id');
        expect(field).toHaveProperty('type');
      }
    });
  });



  describe('max limits', () => {
    it('supports maximum limit of 32000', async () => {
      vi.mocked(axios.get).mockResolvedValue({ data: datastoreFixture });

      await makeCkanRequest(
        'http://demo.ckan.org',
        'datastore_search',
        {
          resource_id: 'res-1',
          limit: 32000
        }
      );

      expect(axios.get).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          params: expect.objectContaining({
            limit: 32000
          })
        })
      );
    });

    it('handles very large result sets', async () => {
      const largeResults = {
        ...datastoreFixture,
        result: {
          ...datastoreFixture.result,
          total: 50000,
          records: Array(50000).fill(datastoreFixture.result.records[0])
        }
      };

      vi.mocked(axios.get).mockResolvedValue({ data: largeResults });

      const result = await makeCkanRequest(
        'http://demo.ckan.org',
        'datastore_search',
        { resource_id: 'res-1' }
      );

      expect(result.total).toBe(50000);
      expect(result.records.length).toBe(50000);
    });
  });
});
