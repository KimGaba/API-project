function initSiteChrome(currentPage) {
  const page = currentPage || document.body.dataset.page || '';
  document.querySelectorAll('[data-page-link]').forEach((link) => {
    if (link.dataset.pageLink === page) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    }
  });

  const menuToggle = document.getElementById('menu-toggle');
  const closeNavButton = document.getElementById('close-nav');
  const sidebarOverlay = document.getElementById('sidebar-overlay');

  function setNavState(open) {
    document.body.classList.toggle('nav-open', open);
    if (menuToggle) menuToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  }

  if (menuToggle) menuToggle.addEventListener('click', () => setNavState(true));
  if (closeNavButton) closeNavButton.addEventListener('click', () => setNavState(false));
  if (sidebarOverlay) sidebarOverlay.addEventListener('click', () => setNavState(false));

  document.querySelectorAll('.sidebar a').forEach((link) => {
    link.addEventListener('click', () => {
      if (window.innerWidth < 1120) setNavState(false);
    });
  });

  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') setNavState(false);
  });
  window.addEventListener('resize', () => {
    if (window.innerWidth >= 1120) setNavState(false);
  });
}

const apiOrigin = `${window.location.protocol}//${window.location.hostname}:3011`;

async function postJson(url, payload) {
  const response = await fetch(`${apiOrigin}${url}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify(payload)
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.message || 'Request failed');
  }

  return data;
}

function initOAuthButtons() {
  // Show error from OAuth redirect if present
  const params = new URLSearchParams(window.location.search);
  const oauthError = params.get('error');
  if (oauthError) {
    const messageEl = document.getElementById('login-message') || document.getElementById('signup-message');
    if (messageEl) {
      const messages = {
        oauth_not_configured: 'This login method is not configured yet. Use email/password instead.',
        oauth_denied: 'Login was cancelled.',
        oauth_state: 'Login session expired — please try again.',
        oauth_failed: 'Login failed — please try again or use email/password.',
      };
      messageEl.textContent = messages[oauthError] || `Login error: ${oauthError}`;
      messageEl.className = 'auth-message error';
    }
  }

  document.querySelectorAll('[data-oauth]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const provider = btn.dataset.oauth;
      window.location.href = `${apiOrigin}/auth/oauth/${provider}`;
    });
  });
}

function initAuthForms() {
  const signupForm = document.getElementById('signup-form');
  const loginForm = document.getElementById('login-form');

  if (signupForm) {
    signupForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const message = document.getElementById('signup-message');
      const formData = new FormData(signupForm);

      if (message) {
        message.textContent = 'Creating account...';
        message.className = 'auth-message';
      }

      try {
        await postJson('/auth/signup', {
          displayName: formData.get('displayName') || null,
          email: formData.get('email'),
          password: formData.get('password')
        });

        if (message) {
          message.textContent = 'Account created — redirecting to dashboard…';
          message.className = 'auth-message success';
        }
        setTimeout(() => {
          window.location.href = `${window.location.protocol}//${window.location.hostname}:3012/`;
        }, 600);
      } catch (error) {
        if (message) {
          message.textContent = error instanceof Error ? error.message : 'Signup failed';
          message.className = 'auth-message error';
        }
      }
    });
  }

  if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const message = document.getElementById('login-message');
      const formData = new FormData(loginForm);

      if (message) {
        message.textContent = 'Logging in...';
        message.className = 'auth-message';
      }

      try {
        await postJson('/auth/login', {
          email: formData.get('email'),
          password: formData.get('password')
        });

        if (message) {
          message.textContent = 'Logged in — redirecting…';
          message.className = 'auth-message success';
        }
        setTimeout(() => {
          window.location.href = `${window.location.protocol}//${window.location.hostname}:3012/`;
        }, 400);
      } catch (error) {
        if (message) {
          message.textContent = error instanceof Error ? error.message : 'Login failed';
          message.className = 'auth-message error';
        }
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initSiteChrome();
  initOAuthButtons();
  initAuthForms();
});
