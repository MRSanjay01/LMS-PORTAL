document.addEventListener('DOMContentLoaded', () => {
  initTransitions();
  initFormControls();
  initBackgroundParallax();
  initDemoCredentialsWatcher();
  checkLogoutMessage();
});

/**
 * 1. Smooth Page Transitions
 */
function initTransitions() {
  const overlay = document.getElementById('transition-overlay');
  
  // Fade in on page load
  if (overlay) {
    setTimeout(() => {
      overlay.classList.add('fade-out');
    }, 100);
  }

  // Intercept role switches to animate fade out
  const switchLinks = document.querySelectorAll('.role-switch-link');
  switchLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetUrl = link.getAttribute('href');
      
      if (overlay) {
        overlay.classList.remove('fade-out');
        setTimeout(() => {
          window.location.href = targetUrl;
        }, 400); // matches style.css transition time
      } else {
        window.location.href = targetUrl;
      }
    });
  });
}

/**
 * 2. Form Interactions, Validations & Animations
 */
function initFormControls() {
  const forms = [
    document.getElementById('student-login-form'),
    document.getElementById('admin-login-form')
  ];

  forms.forEach(form => {
    if (!form) return;

    const inputs = form.querySelectorAll('.form-input');
    const passwordInput = form.querySelector('input[type="password"]');
    const toggleBtn = form.querySelector('#password-toggle');
    const capsWarning = form.querySelector('#caps-lock-warning');
    const submitBtn = form.querySelector('#submit-login');
    const card = document.getElementById('login-container-card');

    // Float label fix on autocomplete / pre-loaded values
    inputs.forEach(input => {
      // Trigger check immediately in case browser auto-fills
      setTimeout(() => {
        if (input.value.trim() !== "") {
          input.placeholder = " "; // Make sure placeholder is set to space to trigger CSS pseudo
        }
      }, 200);

      input.addEventListener('change', () => {
        if (input.value.trim() !== "") {
          input.setAttribute('value', input.value);
        } else {
          input.removeAttribute('value');
        }
      });
    });

    // Password Visibility Toggle
    if (toggleBtn && passwordInput) {
      const openEyeSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`;
      const closedEyeSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`;

      toggleBtn.addEventListener('click', () => {
        const isPassword = passwordInput.type === 'password';
        passwordInput.type = isPassword ? 'text' : 'password';
        toggleBtn.innerHTML = isPassword ? closedEyeSVG : openEyeSVG;
        toggleBtn.setAttribute('aria-label', isPassword ? 'Hide Password' : 'Show Password');
        passwordInput.focus();
      });
    }

    // Caps Lock Detector
    if (passwordInput && capsWarning) {
      const checkCapsLock = (e) => {
        if (e.getModifierState && e.getModifierState('CapsLock')) {
          capsWarning.classList.add('active');
        } else {
          capsWarning.classList.remove('active');
        }
      };

      passwordInput.addEventListener('keydown', checkCapsLock);
      passwordInput.addEventListener('keyup', checkCapsLock);
      passwordInput.addEventListener('focus', checkCapsLock);
      passwordInput.addEventListener('blur', () => {
        capsWarning.classList.remove('active');
      });
    }

    // Form submission processing
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      let hasError = false;
      let errorMsg = "Please fill in all required fields.";

      // Front-end sanity validation
      inputs.forEach(input => {
        if (!input.value.trim()) {
          hasError = true;
          input.style.borderColor = "#f43f5e"; // temporary red focus outline
          setTimeout(() => {
            input.removeAttribute('style');
          }, 2000);
        }
      });

      if (hasError) {
        triggerShake(card);
        showToast(errorMsg, 'error');
        return;
      }

      // Roll Number / Email specific validation (basic regex check if student)
      if (form.id === 'student-login-form') {
        const identifierVal = form.querySelector('#student-identifier').value.trim();
        const scoreMatch = identifierVal.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/) || identifierVal.match(/^[0-9A-Za-z-]{4,15}$/);
        
        if (!scoreMatch) {
          triggerShake(card);
          showToast("Please enter a valid Roll Number or Email format.", "warning");
          return;
        }
      }

      // Initiate Simulated Authentication
      if (submitBtn) {
        submitBtn.classList.add('loading');
      }

      setTimeout(() => {
        // Stop loader
        if (submitBtn) {
          submitBtn.classList.remove('loading');
        }

        // Validate Mock Credentials
        let userType = 'Student';
        let loginSuccess = false;
        let roleParam = 'student';

        if (form.id === 'student-login-form') {
          const userVal = form.querySelector('#student-identifier').value.trim();
          const passVal = passwordInput.value;
          if ((userVal === 'student123' || userVal === 'student@aura.edu') && passVal === 'Password123') {
            loginSuccess = true;
            userType = 'Student';
            roleParam = 'student';
          } else if ((userVal === 'teacher123' || userVal === 'teacher@aura.edu' || userVal === 'h.vance@aura.edu') && passVal === 'Password123') {
            loginSuccess = true;
            userType = 'Teacher (Faculty)';
            roleParam = 'teacher';
          } else {
            showToast("Invalid credentials. Try student@aura.edu / Password123 or teacher@aura.edu / Password123.", "error");
            triggerShake(card);
          }
        } else {
          const userVal = form.querySelector('#admin-username').value.trim();
          const passVal = passwordInput.value;
          if (userVal === 'admin' && passVal === 'AdminPassword123') {
            loginSuccess = true;
            userType = 'Administrator';
            roleParam = 'admin';
          } else {
            showToast("Invalid credentials. Try admin / AdminPassword123.", "error");
            triggerShake(card);
          }
        }

        if (loginSuccess) {
          showToast(`Welcome back! ${userType} Authentication Successful. Redirecting...`, 'success');
          // Clear inputs
          inputs.forEach(inp => {
            inp.value = '';
            inp.removeAttribute('value');
          });

          // Redirect after 1.2s delay for visual feedback
          setTimeout(() => {
            const overlay = document.getElementById('transition-overlay');
            if (overlay) {
              overlay.classList.remove('fade-out');
              setTimeout(() => {
                window.location.href = `dashboard.html?role=${roleParam}`;
              }, 400);
            } else {
              window.location.href = `dashboard.html?role=${roleParam}`;
            }
          }, 1200);
        }
      }, 1500);
    });
  });
}

/**
 * 3. Card Shake Animation trigger
 */
function triggerShake(element) {
  if (!element) return;
  element.classList.add('shake');
  setTimeout(() => {
    element.classList.remove('shake');
  }, 400);
}

/**
 * 4. Micro-Parallax Background Orbs
 */
function initBackgroundParallax() {
  const container = document.querySelector('.bg-ambient');
  if (!container) return;
  
  const blobs = container.querySelectorAll('.blob');
  
  window.addEventListener('mousemove', (e) => {
    const moveX = (e.clientX - window.innerWidth / 2) * 0.015;
    const moveY = (e.clientY - window.innerHeight / 2) * 0.015;

    blobs.forEach((blob, idx) => {
      // Alternate direction and multiplier per blob
      const factor = (idx + 1) * 0.5;
      const direction = idx % 2 === 0 ? 1 : -1;
      blob.style.transform = `translate(${moveX * factor * direction}px, ${moveY * factor * direction}px)`;
    });
  });
}

/**
 * 5. Toast Notification System
 */
function showToast(message, type = 'success') {
  const root = document.getElementById('toast-root');
  if (!root) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  // Choose beautiful matching icon according to notification level
  let iconSVG = '';
  switch(type) {
    case 'success':
      iconSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;
      break;
    case 'error':
      iconSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`;
      break;
    case 'warning':
      iconSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`;
      break;
  }

  toast.innerHTML = `
    <div class="toast-icon">${iconSVG}</div>
    <div class="toast-message">${message}</div>
    <button class="toast-close" aria-label="Close message">&times;</button>
  `;

  root.appendChild(toast);

  // Trigger browser paint to slide it in
  setTimeout(() => {
    toast.classList.add('show');
  }, 10);

  // Auto clean up after 4 seconds
  const autoClose = setTimeout(() => {
    dismissToast(toast);
  }, 4000);

  // Close button trigger
  toast.querySelector('.toast-close').addEventListener('click', () => {
    clearTimeout(autoClose);
    dismissToast(toast);
  });
}

function dismissToast(toast) {
  toast.classList.remove('show');
  toast.style.transform = 'translateY(-20px) scale(0.95)';
  toast.style.opacity = '0';
  setTimeout(() => {
    toast.remove();
  }, 300);
}

/**
 * 6. Demo Credentials Indicator Badge (Hover/Click dynamic reveal helper drawer)
 */
function initDemoCredentialsWatcher() {
  const container = document.createElement('div');
  container.className = 'demo-creds-container';
  container.innerHTML = `
    <button class="demo-creds-trigger" aria-label="Show Demo Credentials">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
      <span>Demo Login Info</span>
    </button>
    <div class="demo-creds-card">
      <h4 class="demo-creds-title">Demo Access Codes</h4>
      <div class="demo-creds-section">
        <span class="demo-creds-role">STUDENT ACCOUNT</span>
        <div class="demo-creds-row"><strong>ID:</strong> <code>student@aura.edu</code> <button class="copy-btn" data-copy="student@aura.edu">Copy</button></div>
        <div class="demo-creds-row"><strong>Password:</strong> <code>Password123</code> <button class="copy-btn" data-copy="Password123">Copy</button></div>
      </div>
      <div class="demo-creds-section">
        <span class="demo-creds-role">TEACHER ACCOUNT</span>
        <div class="demo-creds-row"><strong>ID:</strong> <code>teacher@aura.edu</code> <button class="copy-btn" data-copy="teacher@aura.edu">Copy</button></div>
        <div class="demo-creds-row"><strong>Password:</strong> <code>Password123</code> <button class="copy-btn" data-copy="Password123">Copy</button></div>
      </div>
      <div class="demo-creds-section">
        <span class="demo-creds-role">ADMIN ACCESS</span>
        <div class="demo-creds-row"><strong>User:</strong> <code>admin</code> <button class="copy-btn" data-copy="admin">Copy</button></div>
        <div class="demo-creds-row"><strong>Password:</strong> <code>AdminPassword123</code> <button class="copy-btn" data-copy="AdminPassword123">Copy</button></div>
      </div>
    </div>
  `;
  document.body.appendChild(container);
  
  // Inline dynamic CSS injecting (prevents cluttering style.css)
  const style = document.createElement('style');
  style.textContent = `
    .demo-creds-container {
      position: fixed;
      bottom: 80px;
      right: 24px;
      z-index: 999;
      font-family: var(--font-body);
    }
    .demo-creds-trigger {
      display: flex;
      align-items: center;
      gap: 6px;
      background: rgba(15, 23, 42, 0.65);
      border: 1px solid var(--glass-border);
      backdrop-filter: blur(15px);
      -webkit-backdrop-filter: blur(15px);
      padding: 0.6rem 1rem;
      border-radius: 9999px;
      color: var(--accent-cyan);
      font-weight: 600;
      font-size: 0.8rem;
      cursor: pointer;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
      transition: all var(--transition-fast) ease;
    }
    .demo-creds-trigger:hover {
      background: rgba(6, 182, 212, 0.15);
      border-color: var(--accent-cyan);
      transform: translateY(-2px);
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.6), 0 0 15px rgba(6, 182, 212, 0.2);
    }
    .demo-creds-card {
      position: absolute;
      bottom: 50px;
      right: 0;
      width: 280px;
      background: rgba(15, 23, 42, 0.95);
      border: 1px solid var(--glass-border);
      backdrop-filter: blur(25px);
      -webkit-backdrop-filter: blur(25px);
      border-radius: var(--border-radius-md);
      padding: 1.25rem;
      box-shadow: 0 20px 50px rgba(0,0,0,0.7);
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
      opacity: 0;
      transform: scale(0.9) translateY(10px);
      transform-origin: bottom right;
      pointer-events: none;
      transition: all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.1);
    }
    .demo-creds-container.show-card .demo-creds-card {
      opacity: 1;
      transform: scale(1) translateY(0);
      pointer-events: auto;
    }
    .demo-creds-title {
      font-family: var(--font-heading);
      font-size: 0.95rem;
      font-weight: 700;
      color: #fff;
      border-bottom: 1px solid rgba(255,255,255,0.08);
      padding-bottom: 0.4rem;
    }
    .demo-creds-section {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }
    .demo-creds-role {
      font-size: 0.65rem;
      font-weight: 800;
      color: var(--accent-cyan);
      letter-spacing: 0.5px;
    }
    .demo-creds-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 0.75rem;
      color: var(--text-secondary);
      background: rgba(0,0,0,0.4);
      padding: 0.35rem 0.5rem;
      border-radius: var(--border-radius-sm);
      border: 1px solid rgba(255,255,255,0.03);
    }
    .demo-creds-row code {
      font-family: monospace;
      color: #fff;
      background: rgba(255,255,255,0.05);
      padding: 1px 4px;
      border-radius: 3px;
    }
    .copy-btn {
      background: transparent;
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 4px;
      color: var(--text-secondary);
      padding: 1px 6px;
      font-size: 0.65rem;
      cursor: pointer;
      transition: all var(--transition-fast);
    }
    .copy-btn:hover {
      background: var(--accent-cyan);
      border-color: var(--accent-cyan);
      color: #fff;
    }
    @media (max-width: 480px) {
      .demo-creds-container {
        bottom: 74px;
        right: 12px;
      }
      .demo-creds-card {
        right: -8px;
        width: 250px;
      }
    }
  `;
  document.head.appendChild(style);
  
  // Click event triggers
  const trigger = container.querySelector('.demo-creds-trigger');
  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    container.classList.toggle('show-card');
  });
  
  document.addEventListener('click', () => {
    container.classList.remove('show-card');
  });
  container.addEventListener('click', (e) => {
    e.stopPropagation();
  });
  
  // Copy logic execution
  const copyButtons = container.querySelectorAll('.copy-btn');
  copyButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const textToCopy = btn.getAttribute('data-copy');
      navigator.clipboard.writeText(textToCopy).then(() => {
        const originalText = btn.textContent;
        btn.textContent = 'Copied!';
        btn.style.background = '#10b981';
        btn.style.borderColor = '#10b981';
        btn.style.color = '#fff';
        
        setTimeout(() => {
          btn.textContent = originalText;
          btn.removeAttribute('style');
        }, 1200);
      });
    });
  });
}

/**
 * 7. Check for logout feedback message
 */
function checkLogoutMessage() {
  const params = new URLSearchParams(window.location.search);
  if (params.get('logout') === 'success') {
    // Show toast message immediately
    setTimeout(() => {
      showToast("Logged out successfully.", "success");
    }, 300);
    // Clean URL history state to remove query parameter
    window.history.replaceState({}, document.title, window.location.pathname);
  }
}
