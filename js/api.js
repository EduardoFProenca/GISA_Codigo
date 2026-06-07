const BASE_URL = 'https://backend-gisa.onrender.com/gisa-api';

const defaultHeaders = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
};

async function handleApiResponse(response) {
  if (!response.ok) {
    let errorBody = null;

    try {
      errorBody = await response.json();
    } catch (err) {
      // Não há corpo JSON válido
    }

    const error = new Error(
      errorBody?.message || response.statusText || 'Erro ao processar a resposta da API.'
    );
    error.status = response.status;
    error.body = errorBody;
    throw error;
  }

  if (response.status === 204) {
    return { status: response.status, body: null };
  }

  try {
    const data = await response.json();
    return { status: response.status, body: data };
  } catch (err) {
    return { status: response.status, body: null };
  }
}

function handleFetchError(error) {
  if (error instanceof TypeError) {
    throw new Error('Falha de rede ou o servidor não está acessível.');
  }

  throw error;
}

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const config = {
    headers: { ...defaultHeaders, ...(options.headers || {}) },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    return await handleApiResponse(response);
  } catch (error) {
    handleFetchError(error);
  }
}

const apiClient = {
  get: (endpoint) => request(endpoint, { method: 'GET' }),
  post: (endpoint, body) =>
    request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  put: (endpoint, body) =>
    request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),
  delete: (endpoint) => request(endpoint, { method: 'DELETE' }),
};

export { BASE_URL, apiClient, handleFetchError };
export default apiClient;
