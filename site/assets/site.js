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

async function postJson(url, payload) {
  const response = await fetch(url, {
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
          message.textContent = 'Account created. You are now signed in.';
          message.className = 'auth-message success';
        }
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
          message.textContent = 'Logged in successfully.';
          message.className = 'auth-message success';
        }
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
  initAuthForms();
});
