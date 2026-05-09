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

document.addEventListener('DOMContentLoaded', () => initSiteChrome());
