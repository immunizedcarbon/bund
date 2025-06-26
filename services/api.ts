import { API_KEY, BASE_URL } from '../constants';
import { AnyDocument, ListResponse, ResourceType } from '../types';

export const fetchApi = async <T,>(
  resource: ResourceType,
  filters: Record<string, any>,
  cursor?: string
): Promise<ListResponse<T>> => {
  const params = new URLSearchParams();

  for (const key in filters) {
    const value = filters[key];
    if (value) {
        if (Array.isArray(value)) {
            value.forEach(v => params.append(key, v));
        } else {
            params.append(key, value);
        }
    }
  }

  if (cursor) {
    params.append('cursor', cursor);
  }
  params.append('format', 'json');

  const url = `${BASE_URL}/${resource}?${params.toString()}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `ApiKey ${API_KEY}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || `API error: ${response.status}`);
  }

  return response.json();
};

export const fetchDocuments = (
  resource: ResourceType,
  filters: Record<string, any>,
  cursor?: string
): Promise<ListResponse<AnyDocument>> => {
  return fetchApi<AnyDocument>(resource, filters, cursor);
};
