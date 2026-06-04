/* shared.js — Loaded by every page. Handles:
   1. Fetching the signed-in user from SWA's /.auth/me
   2. Injecting the user display + logout button into the nav
   3. Gracefully no-ops when running outside Azure SWA (e.g. local dev via file://)
*/
(async function initAuth() {
  'use strict';

  // SWA injects /.auth/me; on plain GitHub Pages or local this will 404/fail — that's fine.
  let user = null;
  try {
    const res = await fetch('/.auth/me', { credentials: 'same-origin' });
    if (res.ok) {
      const data = await res.json();
      user = (data.clientPrincipal) ? data.clientPrincipal : null;
    }
  } catch (_) {
    // Running outside SWA — skip auth UI
    return;
  }

  if (!user) return; // Not authenticated (SWA will redirect before we get here)

  // Build display name: prefer userDetails (email/UPN) over identityProvider
  const displayName = user.userDetails || user.userId || 'User';
  const initials = displayName
    .split(/[@.\s]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(p => p[0].toUpperCase())
    .join('');

  // Inject styles once
  if (!document.getElementById('authNavStyle')) {
    const s = document.createElement('style');
    s.id = 'authNavStyle';
    s.textContent = `
      .nav-user {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-left: auto;
        color: #cdd9e5;
        font-size: 12px;
      }
      .nav-user-avatar {
        width: 26px; height: 26px;
        border-radius: 50%;
        background: #388bfd44;
        border: 1px solid #388bfd66;
        display: flex; align-items: center; justify-content: center;
        font-size: 11px; font-weight: 700;
        color: #79c0ff;
        flex-shrink: 0;
      }
      .nav-user-name {
        max-width: 180px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .nav-logout {
        color: #cdd9e5;
        text-decoration: none;
        padding: 3px 10px;
        border: 1px solid #ffffff22;
        border-radius: 5px;
        font-size: 12px;
        transition: background .12s;
        white-space: nowrap;
      }
      .nav-logout:hover { background: #ffffff18; color: #fff; }
    `;
    document.head.appendChild(s);
  }

  // Find the nav and append the user widget
  const nav = document.querySelector('nav');
  if (!nav) return;

  const widget = document.createElement('div');
  widget.className = 'nav-user';
  widget.innerHTML = `
    <div class="nav-user-avatar" title="${displayName}">${initials}</div>
    <span class="nav-user-name" title="${displayName}">${displayName}</span>
    <a class="nav-logout" href="/.auth/logout?post_logout_redirect_uri=/">&#128275; Sign out</a>
  `;
  nav.appendChild(widget);
})();
