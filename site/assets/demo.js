const API_BASE = 'http://192.168.86.23:3011';

document.addEventListener('DOMContentLoaded', () => {
  const routeSelect = document.getElementById('route-select');
  const apiKeyInput = document.getElementById('api-key');
  const queryInput = document.getElementById('query-input');
  const countryInput = document.getElementById('country-input');
  const countryHelp = document.getElementById('country-help');
  const limitInput = document.getElementById('limit-input');
  const requestUrlInput = document.getElementById('request-url');
  const requestPreview = document.getElementById('playground-request');
  const responsePreview = document.getElementById('playground-response');
  const responseStatus = document.getElementById('response-status');
  const responseTime = document.getElementById('response-time');
  const responseType = document.getElementById('response-type');
  const searchSummary = document.getElementById('search-summary');
  const searchResults = document.getElementById('search-results');
  const runButton = document.getElementById('run-request');

  if (!routeSelect) return;

  const controls = [routeSelect, apiKeyInput, queryInput, countryInput, limitInput];
  let countryCatalog = [
    { code: 'NO', name: 'Norway', enabled: true, sourceStatus: 'pilot' },
    { code: 'GB', name: 'United Kingdom', enabled: true, sourceStatus: 'pilot' },
    { code: 'DK', name: 'Denmark', enabled: false, sourceStatus: 'planned' },
    { code: 'FI', name: 'Finland', enabled: false, sourceStatus: 'planned' }
  ];

  function getConfig() {
    return {
      route: routeSelect.value,
      apiKey: apiKeyInput.value.trim(),
      q: queryInput.value.trim(),
      country: countryInput.value.trim(),
      limit: limitInput.value.trim()
    };
  }

  function buildRequest(config) {
    let path = '/health';
    const headers = {};
    const params = new URLSearchParams();

    if (config.route === 'countries') {
      path = '/v1/meta/countries';
      headers['x-api-key'] = config.apiKey;
    }
    if (config.route === 'search') {
      path = '/v1/companies/search';
      headers['x-api-key'] = config.apiKey;
      if (config.q) params.set('q', config.q);
      if (config.country) params.set('country', config.country);
      if (config.limit) params.set('limit', config.limit);
    }

    const query = params.toString();
    const url = API_BASE + path + (query ? `?${query}` : '');
    return { url, headers };
  }

  function getCountryMeta(code) {
    return countryCatalog.find((entry) => entry.code === code) || null;
  }
  function getCountryLabel(code) {
    const match = getCountryMeta(code);
    return match ? `${match.name} (${match.code})` : code;
  }

  function renderCountryOptions(catalog) {
    countryCatalog = Array.isArray(catalog) && catalog.length ? catalog : countryCatalog;
    const current = countryInput.value;
    const enabled = countryCatalog.filter((entry) => entry.enabled);
    const disabled = countryCatalog.filter((entry) => !entry.enabled);
    const fragments = ['<option value="">All enabled countries</option>'];

    enabled.forEach((entry) => {
      fragments.push(`<option value="${entry.code}">${entry.name} (${entry.code}) · live</option>`);
    });

    if (disabled.length) {
      fragments.push('<optgroup label="Listed but not enabled">');
      disabled.forEach((entry) => {
        fragments.push(`<option value="${entry.code}">${entry.name} (${entry.code}) · ${entry.sourceStatus}</option>`);
      });
      fragments.push('</optgroup>');
    }

    countryInput.innerHTML = fragments.join('');
    countryInput.value = countryCatalog.some((entry) => entry.code === current) ? current : '';
    countryHelp.innerHTML = `Showing <strong>${enabled.length}</strong> enabled ${enabled.length === 1 ? 'country' : 'countries'} plus <strong>${disabled.length}</strong> listed for roadmap context.`;
  }

  function renderSearchPlaceholder(title, detail, chips = ['Human-readable summary', 'Country labels', 'Clear empty states']) {
    searchSummary.innerHTML = `<div><strong>${title}</strong><div class="muted">${detail}</div></div><div class="summary-chips">${chips.map((chip) => `<span class="summary-chip">${chip}</span>`).join('')}</div>`;
    searchResults.innerHTML = '';
  }

  function renderSearchResults(payload, config) {
    const results = Array.isArray(payload?.data) ? payload.data : [];
    const meta = payload?.meta || {};
    const activeCountry = meta.country ? getCountryLabel(meta.country) : 'all enabled countries';
    const queryLabel = meta.query || config.q || 'all demo companies';
    const total = typeof meta.total === 'number' ? meta.total : results.length;

    searchSummary.innerHTML = `<div><strong>${total === 0 ? 'No matching companies' : `${total} matching compan${total === 1 ? 'y' : 'ies'}`}</strong><div class="muted">Query: <code>${queryLabel}</code> · Scope: <code>${activeCountry}</code> · Limit: <code>${meta.limit || config.limit || '—'}</code></div></div><div class="summary-chips"><span class="summary-chip">${activeCountry}</span><span class="summary-chip">${total} returned</span><span class="summary-chip">Source: seeded demo data</span></div>`;

    if (!results.length) {
      searchResults.innerHTML = '<div class="empty-state">No companies matched this search. Try a broader query like <code>Example</code>, remove the country filter, or raise the limit if you are testing denser datasets later.</div>';
      return;
    }

    searchResults.innerHTML = results.map((company) => `
      <article class="result-card">
        <h4>${company.name}</h4>
        <div class="result-meta">
          <span class="result-chip">${getCountryLabel(company.countryCode)}</span>
          <span class="result-chip">Status: ${company.status}</span>
          <span class="result-chip">Source: ${company.source}</span>
        </div>
        <div class="result-grid">
          <div><strong>Registration number</strong>${company.registrationNumber}</div>
          <div><strong>Company ID</strong>${company.id}</div>
        </div>
      </article>`).join('');
  }

  async function fetchCountryCatalogue() {
    const apiKey = apiKeyInput.value.trim();
    if (!apiKey) return renderCountryOptions(countryCatalog);
    try {
      const response = await fetch(`${API_BASE}/v1/meta/countries`, { headers: { 'x-api-key': apiKey } });
      if (!response.ok) throw new Error(`Country catalogue request failed with ${response.status}`);
      const payload = await response.json();
      renderCountryOptions(Array.isArray(payload?.data) && payload.data.length ? payload.data : countryCatalog);
    } catch {
      renderCountryOptions(countryCatalog);
    }
  }

  function updatePresetState() {
    const config = getConfig();
    const { url, headers } = buildRequest(config);
    const isHealth = config.route === 'health';
    const isSearch = config.route === 'search';
    queryInput.disabled = !isSearch;
    countryInput.disabled = !isSearch;
    limitInput.disabled = !isSearch;
    apiKeyInput.disabled = isHealth;
    requestUrlInput.value = url;
    requestPreview.textContent = [
      `fetch(${JSON.stringify(url)}, ${headers && Object.keys(headers).length ? JSON.stringify({ headers }, null, 2) : '{}'})`,
      '  .then((res) => res.json())',
      '  .then((json) => console.log(json));'
    ].join('\n');

    if (!isSearch) {
      renderSearchPlaceholder('Search results are hidden for this route', 'Switch back to GET /v1/companies/search to see formatted company cards and a query summary.', ['Search route only', 'Raw JSON still shown', 'Docs and demo stay aligned']);
    }
  }

  function setPreset(route) {
    routeSelect.value = route;
    queryInput.value = 'Example';
    countryInput.value = '';
    limitInput.value = '10';
    updatePresetState();
  }

  async function runRequest() {
    const config = getConfig();
    const { url, headers } = buildRequest(config);
    const init = Object.keys(headers).length ? { headers } : {};
    responseStatus.textContent = 'Status: loading…';
    responseTime.textContent = 'Time: …';
    responseType.textContent = 'Content-Type: …';
    responsePreview.textContent = 'Running request...';
    runButton.disabled = true;
    runButton.textContent = 'Running…';
    const started = performance.now();

    try {
      const response = await fetch(url, init);
      const elapsed = Math.round(performance.now() - started);
      const contentType = response.headers.get('content-type') || 'unknown';
      const text = await response.text();
      let formatted = text;
      let parsedJson = null;
      try { parsedJson = JSON.parse(text); formatted = JSON.stringify(parsedJson, null, 2); } catch {}
      responseStatus.textContent = `Status: ${response.status} ${response.statusText}`;
      responseTime.textContent = `Time: ${elapsed} ms`;
      responseType.textContent = `Content-Type: ${contentType}`;
      responsePreview.textContent = formatted;

      if (config.route === 'search') {
        if (response.ok && parsedJson) renderSearchResults(parsedJson, config);
        else if (parsedJson?.message) renderSearchPlaceholder('Search request needs attention', parsedJson.message, ['Validation or auth issue', 'See raw JSON below', 'Adjust filters and retry']);
        else renderSearchPlaceholder('Search request failed', 'The response could not be rendered into result cards. Check the raw response body for details.', ['Search route only', 'Raw JSON preserved', 'Retry after adjusting inputs']);
      }
      if (config.route === 'countries' && response.ok && parsedJson?.data) renderCountryOptions(parsedJson.data);
    } catch (error) {
      const elapsed = Math.round(performance.now() - started);
      responseStatus.textContent = 'Status: request failed';
      responseTime.textContent = `Time: ${elapsed} ms`;
      responseType.textContent = 'Content-Type: —';
      responsePreview.textContent = JSON.stringify({ error: 'PLAYGROUND_REQUEST_FAILED', message: error instanceof Error ? error.message : String(error) }, null, 2);
      if (config.route === 'search') renderSearchPlaceholder('Search request failed', error instanceof Error ? error.message : String(error), ['Network or CORS issue', 'Raw error captured', 'Check API availability']);
    } finally {
      runButton.disabled = false;
      runButton.textContent = 'Run request';
    }
  }

  controls.forEach((control) => control.addEventListener('input', updatePresetState));
  routeSelect.addEventListener('change', updatePresetState);
  apiKeyInput.addEventListener('change', fetchCountryCatalogue);
  runButton.addEventListener('click', runRequest);
  document.getElementById('load-search').addEventListener('click', () => setPreset('search'));
  document.getElementById('load-countries').addEventListener('click', () => setPreset('countries'));
  document.getElementById('load-health').addEventListener('click', () => setPreset('health'));

  document.querySelectorAll('.copy-btn').forEach((button) => {
    button.addEventListener('click', async () => {
      const selector = button.getAttribute('data-copy');
      const target = selector ? document.querySelector(selector) : null;
      if (!target) return;
      const text = target.textContent || '';
      try {
        await navigator.clipboard.writeText(text);
        const old = button.textContent;
        button.textContent = 'Copied';
        setTimeout(() => { button.textContent = old; }, 1200);
      } catch {
        const old = button.textContent;
        button.textContent = 'Copy failed';
        setTimeout(() => { button.textContent = old; }, 1200);
      }
    });
  });

  renderCountryOptions(countryCatalog);
  updatePresetState();
  fetchCountryCatalogue();
});
