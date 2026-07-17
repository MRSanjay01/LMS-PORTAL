document.addEventListener('DOMContentLoaded', () => {
  initDashboardTransitions();
  initSidebarControls();
  initDropdownMenus();
  initLiveDate();
  initLMSDatabase();
  initProfileProfiling();
  initSearchQueryWatcher();
});

/**
 * 1. Intro Transition
 */
function initDashboardTransitions() {
  const overlay = document.getElementById('transition-overlay');
  if (overlay) {
    setTimeout(() => {
      overlay.classList.add('fade-out');
    }, 100);
  }
}

/**
 * 2. Collapsible Sidebar & Mobile Slides Drawer
 */
function initSidebarControls() {
  const sidebar = document.getElementById('sidebar');
  const collapseBtn = document.getElementById('sidebar-collapse-btn');
  const mobileToggle = document.getElementById('mobile-sidebar-toggle');
  
  if (collapseBtn && sidebar) {
    collapseBtn.addEventListener('click', () => {
      sidebar.classList.toggle('collapsed');
    });
  }

  if (mobileToggle && sidebar) {
    mobileToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      sidebar.classList.toggle('active');
    });

    document.addEventListener('click', (e) => {
      if (sidebar.classList.contains('active') && !sidebar.contains(e.target) && e.target !== mobileToggle) {
        sidebar.classList.remove('active');
      }
    });
  }
}

/**
 * 3. Navigation Dropdown Menus (Notifications & profiles)
 */
function initDropdownMenus() {
  const notificationBtn = document.getElementById('notification-btn');
  const notificationDropdown = document.getElementById('notification-dropdown');
  const profileBtn = document.getElementById('profile-dropdown-btn');
  const profileDropdown = document.getElementById('profile-dropdown');
  const clearNotificationsBtn = document.querySelector('.clear-notifications-btn');

  if (notificationBtn && notificationDropdown) {
    notificationBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeAllDropdowns([notificationDropdown]);
      notificationDropdown.classList.toggle('active');
    });
  }

  if (profileBtn && profileDropdown) {
    profileBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeAllDropdowns([profileDropdown]);
      profileDropdown.classList.toggle('active');
    });
  }

  if (clearNotificationsBtn && notificationDropdown) {
    clearNotificationsBtn.addEventListener('click', () => {
      const items = notificationDropdown.querySelectorAll('.notification-item');
      items.forEach(item => item.classList.remove('unread'));
      const badge = document.querySelector('.notification-badge');
      if (badge) badge.style.display = 'none';
      showToast("All notifications marked as read.", "success");
    });
  }

  document.addEventListener('click', () => {
    closeAllDropdowns();
  });

  function closeAllDropdowns(exclusions = []) {
    const dropdowns = [notificationDropdown, profileDropdown];
    dropdowns.forEach(drop => {
      if (drop && !exclusions.includes(drop)) {
        drop.classList.remove('active');
      }
    });
  }
}

/**
 * 4. In-Memory Database State Store & LocalStorage Sync
 */
let LMS_DB = null;
const DB_STORAGE_KEY = 'aura_university_lms_db_v2'; // version bump to clear old cached state

const defaultState = {
  departments: [
    { id: 'cs', name: 'Computer Science', code: 'CS', head: 'Dr. Helen Vance', faculty: 14, students: 420 },
    { id: 'ee', name: 'Electrical Engineering', code: 'EE', head: 'Prof. James Miller', faculty: 12, students: 310 },
    { id: 'me', name: 'Mechanical Engineering', code: 'ME', head: 'Dr. Emily Taylor', faculty: 10, students: 280 },
    { id: 'ph', name: 'Physics', code: 'PH', head: 'Dr. Robert Chen', faculty: 8, students: 150 },
    { id: 'ma', name: 'Mathematics', code: 'MA', head: 'Dr. Sarah Jenkins', faculty: 6, students: 120 }
  ],
  teachers: [
    { id: 1, name: 'Dr. Helen Vance', code: 'T-001', dept: 'Computer Science', email: 'h.vance@aura.edu', courses: 'Physics II, Quantum Mechanics' },
    { id: 2, name: 'Prof. James Miller', code: 'T-002', dept: 'Electrical Engineering', email: 'j.miller@aura.edu', courses: 'Advanced Algorithms' },
    { id: 3, name: 'Dr. Sarah Jenkins', code: 'T-003', dept: 'Mathematics', email: 's.jenkins@aura.edu', courses: 'Linear Algebra' },
    { id: 4, name: 'Dr. Emily Taylor', code: 'T-004', dept: 'Computer Science', email: 'e.taylor@aura.edu', courses: 'Database Systems, AI Intro' },
    { id: 5, name: 'Dr. Robert Chen', code: 'T-005', dept: 'Physics', email: 'r.chen@aura.edu', courses: 'Quantum Mechanics-III' }
  ],
  students: [
    { id: 1, name: 'Jane Doe', roll: 'student123', email: 'student@aura.edu', dept: 'Computer Science', year: '2024' },
    { id: 2, name: 'Alice Smith', roll: 'student456', email: 'alice.smith@aura.edu', dept: 'Electrical Engineering', year: '2025' },
    { id: 3, name: 'Bob Johnson', roll: 'student789', email: 'bob.johnson@aura.edu', dept: 'Computer Science', year: '2024' },
    { id: 4, name: 'Charlie Brown', roll: 'student101', email: 'charlie.brown@aura.edu', dept: 'Physics', year: '2026' }
  ],
  subjects: [
    { id: 1, name: 'Quantum Mechanics-III', code: 'PH-301', credits: 4, teacher: 'Dr. Robert Chen' },
    { id: 2, name: 'Algorithms & Complexity', code: 'CS-302', credits: 4, teacher: 'Prof. James Miller' },
    { id: 3, name: 'Database Systems', code: 'CS-204', credits: 3, teacher: 'Dr. Emily Taylor' },
    { id: 4, name: 'Linear Algebra', code: 'MA-101', credits: 3, teacher: 'Dr. Sarah Jenkins' },
    { id: 5, name: 'AI Introduction', code: 'CS-401', credits: 4, teacher: 'Dr. Emily Taylor' },
    { id: 6, name: 'Physics II: Electromagnetism', code: 'PH-201', credits: 4, teacher: 'Dr. Helen Vance' }
  ],
  uploadedMaterials: {
    'PH-201': [
      { id: 1, unit: 1, title: 'Coulombs Law & Electric Fields', type: 'pdf', url: '#', size: '2.4 MB', uploadedAt: 'Jul 10, 2026', uploadedBy: 'Dr. Helen Vance' },
      { id: 2, unit: 1, title: 'Gauss Law Lecture Slides', type: 'ppt', url: '#', size: '5.1 MB', uploadedAt: 'Jul 11, 2026', uploadedBy: 'Dr. Helen Vance' },
      { id: 3, unit: 2, title: 'Electromagnetic Induction Notes', type: 'pdf', url: '#', size: '1.8 MB', uploadedAt: 'Jul 12, 2026', uploadedBy: 'Dr. Helen Vance' },
      { id: 4, unit: 2, title: 'Faradays Law — YouTube Lecture', type: 'video', url: 'https://youtube.com', size: 'External', uploadedAt: 'Jul 13, 2026', uploadedBy: 'Dr. Helen Vance' },
      { id: 5, unit: 3, title: 'Maxwell Equations Reference Sheet', type: 'doc', url: '#', size: '340 KB', uploadedAt: 'Jul 14, 2026', uploadedBy: 'Dr. Helen Vance' }
    ],
    'CS-302': [
      { id: 6, unit: 1, title: 'Big-O Notation & Complexity', type: 'pdf', url: '#', size: '1.2 MB', uploadedAt: 'Jul 8, 2026', uploadedBy: 'Prof. James Miller' },
      { id: 7, unit: 1, title: 'Sorting Algorithms Practice Set', type: 'zip', url: '#', size: '800 KB', uploadedAt: 'Jul 9, 2026', uploadedBy: 'Prof. James Miller' },
      { id: 8, unit: 2, title: 'Graph Theory Introduction', type: 'ppt', url: '#', size: '3.6 MB', uploadedAt: 'Jul 10, 2026', uploadedBy: 'Prof. James Miller' }
    ]
  },
  announcements: [
    { id: 1, subjectCode: 'PH-201', title: 'Midterm Exam Rescheduled', body: 'The Physics II midterm has been moved to July 25, 2026. Please revise Units 1-3.', postedBy: 'Dr. Helen Vance', postedAt: 'Jul 14, 2026' },
    { id: 2, subjectCode: 'CS-302', title: 'Assignment 3 Due Date Extended', body: 'Algorithm Assignment 3 deadline extended by 2 days. New due date: July 22, 2026.', postedBy: 'Prof. James Miller', postedAt: 'Jul 13, 2026' },
    { id: 3, subjectCode: null, title: 'LMS Maintenance Window', body: 'System will be offline for maintenance on July 20, 2026 from 2:00 AM - 4:00 AM IST.', postedBy: 'Admin', postedAt: 'Jul 12, 2026' }
  ],
  submissions: [
    { id: 1, assignmentId: 2, studentName: 'Jane Doe', studentRoll: 'student123', subjectCode: 'PH-201', fileUrl: '#', submittedAt: 'Jul 5, 2026', marks: 92, feedback: "Excellent work. Minor calculation error in Q3.", graded: true },
    { id: 2, assignmentId: 4, studentName: 'Jane Doe', studentRoll: 'student123', subjectCode: 'CS-401', fileUrl: '#', submittedAt: 'Jul 10, 2026', marks: null, feedback: null, graded: false },
    { id: 3, assignmentId: 1, studentName: 'Bob Johnson', studentRoll: 'student789', subjectCode: 'CS-302', fileUrl: '#', submittedAt: 'Jul 15, 2026', marks: null, feedback: null, graded: false }
  ],
  recentActivities: {
    student: [
      { id: 1, icon: 'fa-file-invoice', color: 'color-cyan', title: 'Assignment graded', time: '10m ago', text: 'Physics II midterm evaluation finalized. Score: 92/100.' },
      { id: 2, icon: 'fa-bell', color: 'color-purple', title: 'New lecture materials', time: '32m ago', text: 'Dr. Helen Vance uploaded new materials. Check Physics II - Unit 2.' },
      { id: 3, icon: 'fa-graduation-cap', color: 'color-pink', title: 'Registration window open', time: '2h ago', text: 'The course request phase for the Fall 2026 term is now active.' }
    ],
    teacher: [
      { id: 1, icon: 'fa-cloud-arrow-up', color: 'color-cyan', title: 'Material uploaded', time: '1h ago', text: 'Maxwell Equations Reference Sheet added to Physics II — Unit 3.' },
      { id: 2, icon: 'fa-file-pen', color: 'color-purple', title: 'Assignment submitted', time: '3h ago', text: 'Jane Doe submitted Physics Midterm Assessment for grading.' },
      { id: 3, icon: 'fa-bell', color: 'color-pink', title: 'Announcement posted', time: '1d ago', text: 'Midterm exam reschedule notice sent to all PH-201 students.' }
    ],
    admin: [
      { id: 1, icon: 'fa-user-tie', color: 'color-cyan', title: 'Teacher added', time: '10m ago', text: 'Dr. Helen Vance assigned to Computer Science Department.' },
      { id: 2, icon: 'fa-user-graduate', color: 'color-purple', title: 'Student registered', time: '32m ago', text: 'User Alice Smith completed enrollment to Engineering Section A.' },
      { id: 3, icon: 'fa-book', color: 'color-pink', title: 'Subject created', time: '2h ago', text: 'Course "Quantum Mechanics-III" synced with grading structures.' }
    ]
  },
  studentCourses: [
    { code: 'CS-302', name: 'Algorithms & Complexity', instructor: 'Prof. James Miller', progress: 85, grade: 'A', marks: '95/100', room: 'Room 302', time: 'Mon/Wed 10:00 AM' },
    { code: 'CS-204', name: 'Database Systems', instructor: 'Dr. Emily Taylor', progress: 90, grade: 'A-', marks: '91/100', room: 'Room 104', time: 'Tue/Thu 11:30 AM' },
    { code: 'CS-401', name: 'AI Introduction', instructor: 'Dr. Emily Taylor', progress: 60, grade: 'A', marks: '97/100', room: 'Room 410', time: 'Mon/Wed 2:00 PM' },
    { code: 'PH-201', name: 'Physics II: Electromagnetism', instructor: 'Dr. Helen Vance', progress: 75, grade: 'B+', marks: '88/100', room: 'Room 201', time: 'Fri 9:00 AM' }
  ],
  studentAssignments: [
    { id: 1, title: 'Algorithms Assignment 3', course: 'CS-302', due: 'in 4 days', status: 'Pending', maxMarks: 100, submittedDate: null, feedback: null },
    { id: 2, title: 'Physics Midterm Assessment', course: 'PH-201', due: 'Graded', status: 'Submitted', maxMarks: 100, submittedDate: 'July 5, 2026', feedback: '92/100' },
    { id: 3, title: 'Database Schema Design', course: 'CS-204', due: 'in 1 day', status: 'Pending', maxMarks: 50, submittedDate: null, feedback: null },
    { id: 4, title: 'AI Neural Nets Essay', course: 'CS-401', due: 'Submitted', status: 'Under Review', maxMarks: 100, submittedDate: 'July 10, 2026', feedback: 'Under Review' }
  ],
  studentTuition: {
    totalFee: 4650,
    invoices: [
      { id: 'INV-2026-001', desc: 'Tuition Fee - Fall Semester 2026', amount: 4500, status: 'Paid', date: 'June 1, 2026' },
      { id: 'INV-2026-002', desc: 'Laboratory & Library Amenities Fee', amount: 150, status: 'Unpaid', date: 'July 1, 2026' }
    ]
  }
};

function initLMSDatabase() {
  const localData = localStorage.getItem(DB_STORAGE_KEY);
  if (localData) {
    try {
      LMS_DB = JSON.parse(localData);
      // Validate schema and migrate missing attributes
      if (!LMS_DB.uploadedMaterials) LMS_DB.uploadedMaterials = defaultState.uploadedMaterials || {};
      if (!LMS_DB.announcements) LMS_DB.announcements = defaultState.announcements || [];
      if (!LMS_DB.submissions) LMS_DB.submissions = defaultState.submissions || [];
      if (!LMS_DB.recentActivities) LMS_DB.recentActivities = defaultState.recentActivities || {};
      if (!LMS_DB.recentActivities.teacher) LMS_DB.recentActivities.teacher = (defaultState.recentActivities && defaultState.recentActivities.teacher) || [];
    } catch (e) {
      LMS_DB = defaultState;
    }
  } else {
    LMS_DB = defaultState;
    localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(LMS_DB));
  }
}

function saveLMSState() {
  localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(LMS_DB));
}

/**
 * 5. Single-Page Application View Routing & Rendering Engine
 */
let userRole = 'admin'; // active role
let activeView = 'dashboard'; // active tab view
let activeSearchQuery = '';

function initProfileProfiling() {
  const params = new URLSearchParams(window.location.search);
  userRole = params.get('role') || 'admin';

  const avatar = document.getElementById('profile-avatar-container');
  const initials = document.getElementById('profile-initials');
  const username = document.getElementById('profile-username');
  const roleText = document.getElementById('profile-role');
  const dropUsername = document.getElementById('profile-drop-username');
  const dropRole = document.getElementById('profile-drop-role');

  if (userRole === 'student') {
    document.body.classList.add('student-mode');
    if (initials) initials.innerText = 'JD';
    if (avatar) avatar.classList.add('student-theme');
    if (username) username.innerText = 'Jane Doe';
    if (roleText) roleText.innerText = 'Student Roll (CS)';
    if (dropUsername) dropUsername.innerText = 'Jane Doe';
    if (dropRole) dropRole.innerText = 'Undergraduate Student';
    renderStudentSidebar();

  } else if (userRole === 'teacher') {
    document.body.classList.add('teacher-mode');
    if (initials) initials.innerText = 'HV';
    if (avatar) avatar.classList.add('teacher-theme');
    if (username) username.innerText = 'Dr. Helen Vance';
    if (roleText) roleText.innerText = 'Faculty — Computer Science';
    if (dropUsername) dropUsername.innerText = 'Dr. Helen Vance';
    if (dropRole) dropRole.innerText = 'Faculty / Teacher';
    renderTeacherSidebar();

  } else {
    userRole = 'admin';
    document.body.classList.remove('student-mode');
    document.body.classList.remove('teacher-mode');
    if (initials) initials.innerText = 'AD';
    if (username) username.innerText = 'Dean Aura';
    if (roleText) roleText.innerText = 'LMS Admin';
    if (dropUsername) dropUsername.innerText = 'Dean Aura';
    if (dropRole) dropRole.innerText = 'LMS Administrator';
    renderAdminSidebar();
  }

  bindSidebarClickEvents();
  switchView('dashboard');

  const logouts = [
    document.getElementById('logout-trigger'),
    document.getElementById('profile-logout-btn')
  ];
  logouts.forEach(btn => {
    if (!btn) return;
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const overlay = document.getElementById('transition-overlay');
      if (overlay) {
        overlay.classList.remove('fade-out');
        setTimeout(() => { window.location.href = 'index.html?logout=success'; }, 400);
      } else {
        window.location.href = 'index.html?logout=success';
      }
    });
  });
}

function renderStudentSidebar() {
  const sidebarNav = document.getElementById('sidebar-nav-container');
  if (!sidebarNav) return;
  sidebarNav.innerHTML = `
    <span class="nav-section-title">Core Modules</span>
    <ul class="nav-links">
      <li class="nav-item" data-view="dashboard">
        <a href="#" class="nav-link">
          <i class="fa-solid fa-gauge"></i>
          <span class="nav-text">Dashboard</span>
        </a>
      </li>
      <li class="nav-item" data-view="courses">
        <a href="#" class="nav-link">
          <i class="fa-solid fa-book-open"></i>
          <span class="nav-text">My Courses</span>
        </a>
      </li>
      <li class="nav-item" data-view="schedules">
        <a href="#" class="nav-link">
          <i class="fa-solid fa-calendar-check"></i>
          <span class="nav-text">Schedules</span>
        </a>
      </li>
      <li class="nav-item" data-view="grades">
        <a href="#" class="nav-link">
          <i class="fa-solid fa-award"></i>
          <span class="nav-text">Grades</span>
        </a>
      </li>
      <li class="nav-item" data-view="assignments">
        <a href="#" class="nav-link">
          <i class="fa-solid fa-file-pen"></i>
          <span class="nav-text">Assignments</span>
        </a>
      </li>
      <li class="nav-item" data-view="materials">
        <a href="#" class="nav-link">
          <i class="fa-solid fa-folder-open"></i>
          <span class="nav-text">Study Materials</span>
        </a>
      </li>
    </ul>

    <span class="nav-section-title">Academic Settings</span>
    <ul class="nav-links">
      <li class="nav-item" data-view="tuition">
        <a href="#" class="nav-link">
          <i class="fa-solid fa-wallet"></i>
          <span class="nav-text">Tuition & Fees</span>
        </a>
      </li>
      <li class="nav-item" data-view="settings">
        <a href="#" class="nav-link">
          <i class="fa-solid fa-sliders"></i>
          <span class="nav-text">Settings</span>
        </a>
      </li>
    </ul>
  `;
}

function renderAdminSidebar() {
  const sidebarNav = document.getElementById('sidebar-nav-container');
  if (!sidebarNav) return;
  sidebarNav.innerHTML = `
    <span class="nav-section-title">Core Modules</span>
    <ul class="nav-links">
      <li class="nav-item" data-view="dashboard">
        <a href="#" class="nav-link">
          <i class="fa-solid fa-gauge"></i>
          <span class="nav-text">Dashboard</span>
        </a>
      </li>
      <li class="nav-item" data-view="departments">
        <a href="#" class="nav-link">
          <i class="fa-solid fa-building"></i>
          <span class="nav-text">Departments</span>
        </a>
      </li>
      <li class="nav-item" data-view="teachers">
        <a href="#" class="nav-link">
          <i class="fa-solid fa-chalkboard-user"></i>
          <span class="nav-text">Teachers</span>
        </a>
      </li>
      <li class="nav-item" data-view="students">
        <a href="#" class="nav-link">
          <i class="fa-solid fa-user-graduate"></i>
          <span class="nav-text">Students</span>
        </a>
      </li>
      <li class="nav-item" data-view="subjects">
        <a href="#" class="nav-link">
          <i class="fa-solid fa-book"></i>
          <span class="nav-text">Subjects</span>
        </a>
      </li>
    </ul>

    <span class="nav-section-title">Academic Settings</span>
    <ul class="nav-links">
      <li class="nav-item" data-view="years">
        <a href="#" class="nav-link">
          <i class="fa-solid fa-calendar-days"></i>
          <span class="nav-text">Academic Years</span>
        </a>
      </li>
      <li class="nav-item" data-view="semesters">
        <a href="#" class="nav-link">
          <i class="fa-solid fa-graduation-cap"></i>
          <span class="nav-text">Semesters</span>
        </a>
      </li>
    </ul>
  `;
}

function bindSidebarClickEvents() {
  const items = document.querySelectorAll('#sidebar-nav-container .nav-item');
  items.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const view = item.getAttribute('data-view');
      if (view) {
        switchView(view);
      }
    });
  });
}

function switchView(viewName) {
  activeView = viewName;
  
  // Update sidebar active class
  const items = document.querySelectorAll('#sidebar-nav-container .nav-item');
  items.forEach(item => {
    if (item.getAttribute('data-view') === viewName) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });

  // Clear search query on view switch
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.value = '';
    activeSearchQuery = '';
  }

  // Render view
  renderActiveView();
}


function renderActiveView() {
  const wrapper = document.getElementById('console-view-wrapper');
  if (!wrapper) return;

  if (userRole === 'student') {
    switch (activeView) {
      case 'dashboard':   renderStudentDashboard(wrapper); break;
      case 'courses':     renderStudentCoursesView(wrapper); break;
      case 'schedules':   renderStudentSchedulesView(wrapper); break;
      case 'grades':      renderStudentGradesView(wrapper); break;
      case 'assignments': renderStudentAssignmentsView(wrapper); break;
      case 'materials':   renderStudentMaterialsView(wrapper); break;
      case 'tuition':     renderStudentTuitionView(wrapper); break;
      case 'settings':    renderStudentSettingsView(wrapper); break;
      default:            renderStudentDashboard(wrapper);
    }
  } else if (userRole === 'teacher') {
    switch (activeView) {
      case 'dashboard':     renderTeacherDashboard(wrapper); break;
      case 'my-subjects':   renderTeacherSubjectsView(wrapper); break;
      case 'upload':        renderTeacherUploadView(wrapper); break;
      case 'submissions':   renderTeacherSubmissionsView(wrapper); break;
      case 'announcements': renderTeacherAnnouncementsView(wrapper); break;
      case 'students':      renderTeacherStudentRosterView(wrapper); break;
      case 'settings':      renderTeacherSettingsView(wrapper); break;
      default:              renderTeacherDashboard(wrapper);
    }
  } else {
    switch (activeView) {
      case 'dashboard':   renderAdminDashboard(wrapper); break;
      case 'departments': renderAdminDepartmentsView(wrapper); break;
      case 'teachers':    renderAdminTeachersView(wrapper); break;
      case 'students':    renderAdminStudentsView(wrapper); break;
      case 'subjects':    renderAdminSubjectsView(wrapper); break;
      case 'years':       renderAdminYearsView(wrapper); break;
      case 'semesters':   renderAdminSemestersView(wrapper); break;
      default:            renderAdminDashboard(wrapper);
    }
  }
}

function renderTeacherSidebar() {
  const sidebarNav = document.getElementById('sidebar-nav-container');
  if (!sidebarNav) return;
  sidebarNav.innerHTML = `
    <span class="nav-section-title">Teaching Console</span>
    <ul class="nav-links">
      <li class="nav-item" data-view="dashboard">
        <a href="#" class="nav-link">
          <i class="fa-solid fa-gauge"></i>
          <span class="nav-text">Dashboard</span>
        </a>
      </li>
      <li class="nav-item" data-view="my-subjects">
        <a href="#" class="nav-link">
          <i class="fa-solid fa-book-open"></i>
          <span class="nav-text">My Subjects</span>
        </a>
      </li>
      <li class="nav-item" data-view="upload">
        <a href="#" class="nav-link">
          <i class="fa-solid fa-cloud-arrow-up"></i>
          <span class="nav-text">Upload Material</span>
        </a>
      </li>
      <li class="nav-item" data-view="submissions">
        <a href="#" class="nav-link">
          <i class="fa-solid fa-file-pen"></i>
          <span class="nav-text">Submissions</span>
        </a>
      </li>
    </ul>

    <span class="nav-section-title">Management</span>
    <ul class="nav-links">
      <li class="nav-item" data-view="announcements">
        <a href="#" class="nav-link">
          <i class="fa-solid fa-bullhorn"></i>
          <span class="nav-text">Announcements</span>
        </a>
      </li>
      <li class="nav-item" data-view="students">
        <a href="#" class="nav-link">
          <i class="fa-solid fa-users"></i>
          <span class="nav-text">Student Roster</span>
        </a>
      </li>
      <li class="nav-item" data-view="settings">
        <a href="#" class="nav-link">
          <i class="fa-solid fa-sliders"></i>
          <span class="nav-text">Settings</span>
        </a>
      </li>
    </ul>
  `;
}

/**
 * 6. Search Query Watcher
 */
function initSearchQueryWatcher() {
  const searchInput = document.getElementById('search-input');
  if (!searchInput) return;

  searchInput.addEventListener('input', (e) => {
    activeSearchQuery = e.target.value.trim().toLowerCase();
    renderActiveView(); // re-render layout with active filter
  });
}

/**
 * 7. Student View Templates & Render Handlers
 */
function renderStudentDashboard(container) {
  container.innerHTML = `
    <!-- Welcome Jumbotron -->
    <section class="welcome-section">
      <div class="welcome-text">
        <span class="subtitle-badge">Student Console</span>
        <h2 class="welcome-title">System Status Overview</h2>
        <p class="welcome-desc">Jane Doe's personal academic statistics and console portal.</p>
      </div>
      <div class="welcome-date" id="live-date">
        <i class="fa-regular fa-calendar-check"></i>
        ${getLiveDateString()}
      </div>
    </section>

    <!-- Student Stats Grid -->
    <section class="stats-grid">
      <div class="stat-card">
        <div class="stat-card-glow"></div>
        <div class="stat-icon-wrapper cyan">
          <i class="fa-solid fa-award"></i>
        </div>
        <div class="stat-info">
          <span class="stat-label">Cumulative GPA</span>
          <h3 class="stat-value">3.84</h3>
        </div>
        <div class="stat-percentage positive">
          <i class="fa-solid fa-chart-line"></i>
          <span>Top 10%</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-card-glow"></div>
        <div class="stat-icon-wrapper blue">
          <i class="fa-solid fa-book-open"></i>
        </div>
        <div class="stat-info">
          <span class="stat-label">Registered Classes</span>
          <h3 class="stat-value">${LMS_DB.studentCourses.length}</h3>
        </div>
        <div class="stat-percentage positive">
          <i class="fa-solid fa-calendar-days"></i>
          <span>Active Sem</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-card-glow"></div>
        <div class="stat-icon-wrapper purple">
          <i class="fa-solid fa-clock"></i>
        </div>
        <div class="stat-info">
          <span class="stat-label">Pending Tasks</span>
          <h3 class="stat-value">${LMS_DB.studentAssignments.filter(a => a.status === 'Pending').length}</h3>
        </div>
        <div class="stat-percentage positive">
          <i class="fa-solid fa-circle-exclamation"></i>
          <span>Due Soon</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-card-glow"></div>
        <div class="stat-icon-wrapper pink">
          <i class="fa-solid fa-user-check"></i>
        </div>
        <div class="stat-info">
          <span class="stat-label">Attendance Rate</span>
          <h3 class="stat-value">96.5%</h3>
        </div>
        <div class="stat-percentage positive">
          <i class="fa-solid fa-circle-check"></i>
          <span>Excellent</span>
        </div>
      </div>
    </section>

    <!-- Lower Section Content: Quick Actions & Log Activities -->
    <div class="actions-activities-layout">
      
      <!-- Student Actions -->
      <section class="ops-section">
        <h4 class="section-heading">Quick Actions</h4>
        <div class="quick-actions-grid">
          <button class="action-card" onclick="switchView('courses')">
            <div class="action-icon-box cyan">
              <i class="fa-solid fa-graduation-cap"></i>
            </div>
            <div class="action-details">
              <h5>Register Courses</h5>
              <p>Enroll in Fall courses & semesters</p>
            </div>
            <i class="fa-solid fa-chevron-right action-add-btn"></i>
          </button>

          <button class="action-card" onclick="switchView('schedules')">
            <div class="action-icon-box blue">
              <i class="fa-solid fa-calendar-days"></i>
            </div>
            <div class="action-details">
              <h5>Class Schedule</h5>
              <p>Check timetables & lecture rooms</p>
            </div>
            <i class="fa-solid fa-chevron-right action-add-btn"></i>
          </button>

          <button class="action-card" onclick="switchView('assignments')">
            <div class="action-icon-box purple">
              <i class="fa-solid fa-file-arrow-up"></i>
            </div>
            <div class="action-details">
              <h5>Submit Assignment</h5>
              <p>Upload homework & modules</p>
            </div>
            <i class="fa-solid fa-chevron-right action-add-btn"></i>
          </button>

          <button class="action-card" onclick="triggerContactAdvisor()">
            <div class="action-icon-box pink">
              <i class="fa-solid fa-user-tie"></i>
            </div>
            <div class="action-details">
              <h5>Contact Advisor</h5>
              <p>Schedule advice or guidance session</p>
            </div>
            <i class="fa-solid fa-chevron-right action-add-btn"></i>
          </button>
        </div>
      </section>

      <!-- Student Recent Activities -->
      <section class="activity-section">
        <h4 class="section-heading">Recent System Activity</h4>
        <div class="activity-card">
          <ul class="activity-timeline">
            ${LMS_DB.recentActivities.student.map(activity => `
              <li class="activity-timeline-item">
                <div class="activity-icon-badge ${activity.color}">
                  <i class="fa-solid ${activity.icon}"></i>
                </div>
                <div class="activity-content">
                  <div class="activity-meta">
                    <h6>${activity.title}</h6>
                    <span class="activity-time">${activity.time}</span>
                  </div>
                  <p>${activity.text}</p>
                </div>
              </li>
            `).join('')}
          </ul>
        </div>
      </section>
    </div>
  `;
}

function renderStudentCoursesView(container) {
  const filteredCourses = LMS_DB.studentCourses.filter(c => 
    c.name.toLowerCase().includes(activeSearchQuery) || 
    c.code.toLowerCase().includes(activeSearchQuery) || 
    c.instructor.toLowerCase().includes(activeSearchQuery)
  );

  container.innerHTML = `
    <section class="welcome-section">
      <div class="welcome-text">
        <span class="subtitle-badge">Academic Module</span>
        <h2 class="welcome-title">My Registered Courses</h2>
        <p class="welcome-desc">Browse syllabus, track progress, and review active lecture rooms.</p>
      </div>
      <button class="welcome-date add-btn-action" onclick="triggerCourseEnrollment()">
        <i class="fa-solid fa-plus"></i> Enroll in Course
      </button>
    </section>

    <div class="view-panel-grid courses-grid-container">
      ${filteredCourses.length === 0 ? renderEmptyState() : filteredCourses.map(course => `
        <div class="panel-card course-card">
          <div class="course-card-header">
            <span class="course-code-badge">${course.code}</span>
            <div class="course-progress-radial">
              <span>${course.progress}%</span>
            </div>
          </div>
          <h4 class="course-title">${course.name}</h4>
          <div class="course-meta-details">
            <p><i class="fa-solid fa-chalkboard-user"></i> <span>${course.instructor}</span></p>
            <p><i class="fa-solid fa-map-location-dot"></i> <span>${course.room}</span></p>
            <p><i class="fa-solid fa-clock"></i> <span>${course.time}</span></p>
          </div>
          <div class="course-progress-bar-wrapper">
            <div class="course-progress-bar-fill" style="width: ${course.progress}%"></div>
          </div>
          <div class="course-card-actions">
            <button class="action-btn secondary" onclick="showToast('Syllabus PDF resource downloaded.', 'success')">Syllabus</button>
            <button class="action-btn primary" onclick="switchView('assignments')">Assignments</button>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function renderStudentSchedulesView(container) {
  container.innerHTML = `
    <section class="welcome-section">
      <div class="welcome-text">
        <span class="subtitle-badge">Timetable Module</span>
        <h2 class="welcome-title">Class Schedules & Rooms</h2>
        <p class="welcome-desc">Review your weekly schedule and assigned faculty nodes.</p>
      </div>
    </section>

    <div class="panel-card schedule-container">
      <div class="schedule-grid">
        <div class="schedule-header">Time</div>
        <div class="schedule-header">Monday</div>
        <div class="schedule-header">Tuesday</div>
        <div class="schedule-header">Wednesday</div>
        <div class="schedule-header">Thursday</div>
        <div class="schedule-header">Friday</div>

        <div class="schedule-time">09:00 - 10:30</div>
        <div class="schedule-slot"></div>
        <div class="schedule-slot active cyan">
          <h6>Physics II</h6>
          <span>Dr. Vance (Rm 201)</span>
        </div>
        <div class="schedule-slot"></div>
        <div class="schedule-slot active cyan">
          <h6>Physics II</h6>
          <span>Dr. Vance (Rm 201)</span>
        </div>
        <div class="schedule-slot"></div>

        <div class="schedule-time">10:45 - 12:15</div>
        <div class="schedule-slot active blue">
          <h6>Algorithms</h6>
          <span>Prof. Miller (Rm 302)</span>
        </div>
        <div class="schedule-slot"></div>
        <div class="schedule-slot active blue">
          <h6>Algorithms</h6>
          <span>Prof. Miller (Rm 302)</span>
        </div>
        <div class="schedule-slot"></div>
        <div class="schedule-slot"></div>

        <div class="schedule-time">13:30 - 15:00</div>
        <div class="schedule-slot"></div>
        <div class="schedule-slot active purple">
          <h6>Database Systems</h6>
          <span>Dr. Taylor (Rm 104)</span>
        </div>
        <div class="schedule-slot"></div>
        <div class="schedule-slot active purple">
          <h6>Database Systems</h6>
          <span>Dr. Taylor (Rm 104)</span>
        </div>
        <div class="schedule-slot"></div>

        <div class="schedule-time">15:15 - 16:45</div>
        <div class="schedule-slot active pink">
          <h6>AI Intro</h6>
          <span>Dr. Jenkins (Rm 410)</span>
        </div>
        <div class="schedule-slot"></div>
        <div class="schedule-slot active pink">
          <h6>AI Intro</h6>
          <span>Dr. Jenkins (Rm 410)</span>
        </div>
        <div class="schedule-slot"></div>
        <div class="schedule-slot"></div>
      </div>
    </div>
  `;
}

function renderStudentGradesView(container) {
  const filteredGrades = LMS_DB.studentCourses.filter(c => 
    c.name.toLowerCase().includes(activeSearchQuery) || 
    c.code.toLowerCase().includes(activeSearchQuery)
  );

  container.innerHTML = `
    <section class="welcome-section">
      <div class="welcome-text">
        <span class="subtitle-badge">Evaluation Module</span>
        <h2 class="welcome-title">Academic Grades Report</h2>
        <p class="welcome-desc">Review GPA parameters, semester marks, and credit completions.</p>
      </div>
      <div class="welcome-date gpa-summary-badge">
        Cumulative GPA: <span>3.84</span>
      </div>
    </section>

    <div class="panel-card table-wrapper">
      <table class="data-table">
        <thead>
          <tr>
            <th>Course Code</th>
            <th>Course Name</th>
            <th>Instructor</th>
            <th>Final Grade</th>
            <th>Marks Earned</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${filteredGrades.length === 0 ? `<tr><td colspan="6" style="text-align: center;">No records match your query.</td></tr>` : filteredGrades.map(course => `
            <tr>
              <td><strong>${course.code}</strong></td>
              <td>${course.name}</td>
              <td>${course.instructor}</td>
              <td><span class="grade-pill">${course.grade}</span></td>
              <td>${course.marks}</td>
              <td><span class="status-indicator active">Completed</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <!-- Live GPA Calculator Widget -->
    <div class="panel-card calculator-card">
      <h4 class="section-heading"><i class="fa-solid fa-calculator"></i> GPA Forecast Calculator</h4>
      <p class="welcome-desc" style="margin-bottom: 1.25rem;">Estimate your term GPA by modifying forecasted grades for registered courses.</p>
      <div class="calculator-rows">
        ${LMS_DB.studentCourses.map((c, index) => `
          <div class="calc-row">
            <span class="calc-course-name">${c.name}</span>
            <select class="calc-grade-select form-input" data-credits="4" onchange="recalculateForecastGPA()">
              <option value="4.0" ${c.grade.startsWith('A') ? 'selected' : ''}>A (4.0)</option>
              <option value="3.7">A- (3.7)</option>
              <option value="3.3">B+ (3.3)</option>
              <option value="3.0">B (3.0)</option>
              <option value="2.7">B- (2.7)</option>
              <option value="2.0">C (2.0)</option>
            </select>
          </div>
        `).join('')}
      </div>
      <div class="calculator-result">
        Estimated Term GPA: <span id="forecast-gpa-val">3.85</span>
      </div>
    </div>
  `;
}

function renderStudentAssignmentsView(container) {
  const filteredAssignments = LMS_DB.studentAssignments.filter(a => 
    a.title.toLowerCase().includes(activeSearchQuery) || 
    a.course.toLowerCase().includes(activeSearchQuery)
  );

  container.innerHTML = `
    <section class="welcome-section">
      <div class="welcome-text">
        <span class="subtitle-badge">Tasks Module</span>
        <h2 class="welcome-title">Academic Assignments</h2>
        <p class="welcome-desc">Manage your course tasks, review teacher feedback, and upload solutions.</p>
      </div>
    </section>

    <div class="panel-card table-wrapper">
      <table class="data-table">
        <thead>
          <tr>
            <th>Assignment Title</th>
            <th>Course</th>
            <th>Due Date / Status</th>
            <th>Evaluation Feed</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          ${filteredAssignments.length === 0 ? `<tr><td colspan="5" style="text-align: center;">No assignments matching your query.</td></tr>` : filteredAssignments.map(task => `
            <tr>
              <td><strong>${task.title}</strong></td>
              <td><span class="course-code-badge">${task.course}</span></td>
              <td>
                <span class="status-indicator ${task.status.toLowerCase() === 'pending' ? 'pending' : 'active'}">
                  ${task.status === 'Pending' ? `Due ${task.due}` : 'Submitted'}
                </span>
              </td>
              <td>
                ${task.feedback ? `<span class="feedback-badge">${task.feedback}</span>` : `<span class="text-muted">Unsubmitted</span>`}
              </td>
              <td>
                ${task.status === 'Pending' 
                  ? `<button class="action-btn primary small" onclick="openAssignmentUploadModal(${task.id})"><i class="fa-solid fa-cloud-arrow-up"></i> Upload</button>` 
                  : `<button class="action-btn secondary small" disabled><i class="fa-solid fa-check"></i> Submitted</button>`}
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function renderStudentTuitionView(container) {
  container.innerHTML = `
    <section class="welcome-section">
      <div class="welcome-text">
        <span class="subtitle-badge">Finance Module</span>
        <h2 class="welcome-title">Tuition Ledger & Receipts</h2>
        <p class="welcome-desc">Review your semester invoices, pay fees, and print audit reports.</p>
      </div>
    </section>

    <div class="panel-card tuition-summary-card">
      <div class="tuition-balance">
        <span class="stat-label">Outstanding Term Balance</span>
        <h3 class="stat-value purple-glow">$${LMS_DB.studentTuition.invoices.reduce((acc, inv) => inv.status === 'Unpaid' ? acc + inv.amount : acc, 0)}</h3>
      </div>
      <button class="action-btn primary pay-now-btn" onclick="triggerTuitionCheckout()">
        <i class="fa-solid fa-credit-card"></i> Pay Outstanding Fees
      </button>
    </div>

    <div class="panel-card table-wrapper">
      <h4 class="section-heading">Billing Invoices</h4>
      <table class="data-table">
        <thead>
          <tr>
            <th>Invoice ID</th>
            <th>Description</th>
            <th>Issue Date</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Receipt</th>
          </tr>
        </thead>
        <tbody>
          ${LMS_DB.studentTuition.invoices.map(invoice => `
            <tr>
              <td><strong>${invoice.id}</strong></td>
              <td>${invoice.desc}</td>
              <td>${invoice.date}</td>
              <td>$${invoice.amount}</td>
              <td>
                <span class="status-indicator ${invoice.status === 'Paid' ? 'active' : 'error'}">
                  ${invoice.status}
                </span>
              </td>
              <td>
                <button class="action-btn secondary small" onclick="showToast('Downloading invoice PDF...', 'success')">
                  <i class="fa-solid fa-download"></i> PDF
                </button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function renderStudentSettingsView(container) {
  container.innerHTML = `
    <section class="welcome-section">
      <div class="welcome-text">
        <span class="subtitle-badge">Configuration Module</span>
        <h2 class="welcome-title">Settings & Profile</h2>
        <p class="welcome-desc">Manage your email settings, notifications, and security protocols.</p>
      </div>
    </section>

    <div class="panel-card settings-card">
      <h4 class="section-heading">Personal Details</h4>
      <form id="student-settings-form" class="settings-form-grid" onsubmit="saveStudentSettings(event)">
        <div class="form-group">
          <label class="static-label">Roll Number</label>
          <input type="text" class="form-input" value="student123" disabled>
        </div>
        <div class="form-group">
          <label class="static-label">Department</label>
          <input type="text" class="form-input" value="Computer Science" disabled>
        </div>
        <div class="form-group">
          <label for="student-email" class="static-label">Academic Email</label>
          <input type="email" id="student-email" class="form-input" value="${LMS_DB.students.find(s => s.roll === 'student123').email}" required>
        </div>
        <div class="form-group">
          <label for="student-phone" class="static-label">Contact Number</label>
          <input type="text" id="student-phone" class="form-input" value="+1 (555) 124-9080">
        </div>
        <div style="grid-column: span 2; display: flex; justify-content: flex-end;">
          <button type="submit" class="action-btn primary">Save Profile Settings</button>
        </div>
      </form>
    </div>

    <div class="panel-card settings-card">
      <h4 class="section-heading">System Customization</h4>
      <div class="toggle-row">
        <div>
          <h6>Toggle Interface Theme</h6>
          <p class="welcome-desc" style="margin-top: 2px;">Enable active night contrast styling overlays.</p>
        </div>
        <button class="action-btn secondary" onclick="toggleDarkMode()">Switch Dark Mode</button>
      </div>
      <div class="toggle-row" style="border-top: 1px solid rgba(255,255,255,0.06); padding-top: 1.25rem; margin-top: 1.25rem;">
        <div>
          <h6>Email Alerts</h6>
          <p class="welcome-desc" style="margin-top: 2px;">Get immediate logs on uploaded grades and solutions.</p>
        </div>
        <input type="checkbox" id="email-notifs-toggle" checked style="width: 20px; height: 20px; accent-color: var(--accent-purple);">
      </div>
    </div>
  `;
}

function saveStudentSettings(e) {
  e.preventDefault();
  const emailVal = document.getElementById('student-email').value;
  const student = LMS_DB.students.find(s => s.roll === 'student123');
  if (student) {
    student.email = emailVal;
    saveLMSState();
  }
  showToast("Profile credentials successfully synced.", "success");
}

function toggleDarkMode() {
  document.body.classList.toggle('light-contrast');
  showToast("Interface theme updated.", "success");
}

/**
 * 8. Administrator View Templates & Render Handlers
 */
function renderAdminDashboard(container) {
  container.innerHTML = `
    <!-- Welcome Jumbotron -->
    <section class="welcome-section">
      <div class="welcome-text">
        <span class="subtitle-badge">Academic Console</span>
        <h2 class="welcome-title">System Status Overview</h2>
        <p class="welcome-desc">Institutional operational statistics and quick actions directory.</p>
      </div>
      <div class="welcome-date" id="live-date">
        <i class="fa-regular fa-calendar-check"></i>
        ${getLiveDateString()}
      </div>
    </section>

    <!-- Admin Stats Grid -->
    <section class="stats-grid">
      <div class="stat-card" onclick="switchView('departments')" style="cursor: pointer;">
        <div class="stat-card-glow"></div>
        <div class="stat-icon-wrapper cyan">
          <i class="fa-solid fa-building"></i>
        </div>
        <div class="stat-info">
          <span class="stat-label">Total Departments</span>
          <h3 class="stat-value">${LMS_DB.departments.length}</h3>
        </div>
        <div class="stat-percentage positive">
          <i class="fa-solid fa-arrow-up-right"></i>
          <span>Live Node</span>
        </div>
      </div>

      <div class="stat-card" onclick="switchView('teachers')" style="cursor: pointer;">
        <div class="stat-card-glow"></div>
        <div class="stat-icon-wrapper blue">
          <i class="fa-solid fa-chalkboard-user"></i>
        </div>
        <div class="stat-info">
          <span class="stat-label">Total Teachers</span>
          <h3 class="stat-value">${LMS_DB.teachers.length}</h3>
        </div>
        <div class="stat-percentage positive">
          <i class="fa-solid fa-arrow-up-right"></i>
          <span>Active</span>
        </div>
      </div>

      <div class="stat-card" onclick="switchView('students')" style="cursor: pointer;">
        <div class="stat-card-glow"></div>
        <div class="stat-icon-wrapper purple">
          <i class="fa-solid fa-user-graduate"></i>
        </div>
        <div class="stat-info">
          <span class="stat-label">Total Students</span>
          <h3 class="stat-value">${LMS_DB.students.length}</h3>
        </div>
        <div class="stat-percentage positive">
          <i class="fa-solid fa-plus"></i>
          <span>Active</span>
        </div>
      </div>

      <div class="stat-card" onclick="switchView('subjects')" style="cursor: pointer;">
        <div class="stat-card-glow"></div>
        <div class="stat-icon-wrapper pink">
          <i class="fa-solid fa-book"></i>
        </div>
        <div class="stat-info">
          <span class="stat-label">Total Subjects</span>
          <h3 class="stat-value">${LMS_DB.subjects.length}</h3>
        </div>
        <div class="stat-percentage positive">
          <i class="fa-solid fa-check"></i>
          <span>Syllabus Sync</span>
        </div>
      </div>
    </section>

    <!-- Lower Section Content: Quick Actions & Log Activities -->
    <div class="actions-activities-layout">
      
      <!-- Admin Actions -->
      <section class="ops-section">
        <h4 class="section-heading">Quick Actions</h4>
        <div class="quick-actions-grid">
          <button class="action-card" onclick="openAddDepartmentModal()">
            <div class="action-icon-box cyan">
              <i class="fa-solid fa-building-circle-plus"></i>
            </div>
            <div class="action-details">
              <h5>Add Department</h5>
              <p>Register new academic faculties</p>
            </div>
            <i class="fa-solid fa-circle-plus action-add-btn"></i>
          </button>

          <button class="action-card" onclick="openAddTeacherModal()">
            <div class="action-icon-box blue">
              <i class="fa-solid fa-user-tie"></i>
            </div>
            <div class="action-details">
              <h5>Add Teacher</h5>
              <p>Register faculty and assign subjects</p>
            </div>
            <i class="fa-solid fa-circle-plus action-add-btn"></i>
          </button>

          <button class="action-card" onclick="openAddStudentModal()">
            <div class="action-icon-box purple">
              <i class="fa-solid fa-user-plus"></i>
            </div>
            <div class="action-details">
              <h5>Add Student</h5>
              <p>Enroll student records & assign sections</p>
            </div>
            <i class="fa-solid fa-circle-plus action-add-btn"></i>
          </button>

          <button class="action-card" onclick="openAddSubjectModal()">
            <div class="action-icon-box pink">
              <i class="fa-solid fa-book-medical"></i>
            </div>
            <div class="action-details">
              <h5>Add Subject</h5>
              <p>Add new module to course list</p>
            </div>
            <i class="fa-solid fa-circle-plus action-add-btn"></i>
          </button>
        </div>
      </section>

      <!-- Admin Recent Activities -->
      <section class="activity-section">
        <h4 class="section-heading">Recent System Activity</h4>
        <div class="activity-card">
          <ul class="activity-timeline">
            ${LMS_DB.recentActivities.admin.map(activity => `
              <li class="activity-timeline-item">
                <div class="activity-icon-badge ${activity.color}">
                  <i class="fa-solid ${activity.icon}"></i>
                </div>
                <div class="activity-content">
                  <div class="activity-meta">
                    <h6>${activity.title}</h6>
                    <span class="activity-time">${activity.time}</span>
                  </div>
                  <p>${activity.text}</p>
                </div>
              </li>
            `).join('')}
          </ul>
        </div>
      </section>
    </div>
  `;
}

function renderAdminDepartmentsView(container) {
  const filteredDepts = LMS_DB.departments.filter(d => 
    d.name.toLowerCase().includes(activeSearchQuery) || 
    d.code.toLowerCase().includes(activeSearchQuery) ||
    d.head.toLowerCase().includes(activeSearchQuery)
  );

  container.innerHTML = `
    <section class="welcome-section">
      <div class="welcome-text">
        <span class="subtitle-badge">Governance</span>
        <h2 class="welcome-title">Departments Directory</h2>
        <p class="welcome-desc">Manage institutional curriculum blocks, assign chairs, and monitor structures.</p>
      </div>
      <button class="welcome-date add-btn-action" onclick="openAddDepartmentModal()">
        <i class="fa-solid fa-plus"></i> Add Department
      </button>
    </section>

    <div class="panel-card table-wrapper">
      <table class="data-table">
        <thead>
          <tr>
            <th>Dept Code</th>
            <th>Department Name</th>
            <th>Chairperson</th>
            <th>Faculty Nodes</th>
            <th>Enrolled Students</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${filteredDepts.length === 0 ? `<tr><td colspan="6" style="text-align: center;">No records found.</td></tr>` : filteredDepts.map(dept => `
            <tr>
              <td><span class="course-code-badge">${dept.code}</span></td>
              <td><strong>${dept.name}</strong></td>
              <td>${dept.head}</td>
              <td>${dept.faculty} Teachers</td>
              <td>${dept.students} Active</td>
              <td>
                <button class="action-btn secondary small" onclick="deleteRecord('departments', '${dept.id}')"><i class="fa-solid fa-trash-can"></i> Delete</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function renderAdminTeachersView(container) {
  const filteredTeachers = LMS_DB.teachers.filter(t => 
    t.name.toLowerCase().includes(activeSearchQuery) || 
    t.code.toLowerCase().includes(activeSearchQuery) ||
    t.dept.toLowerCase().includes(activeSearchQuery) ||
    t.email.toLowerCase().includes(activeSearchQuery)
  );

  container.innerHTML = `
    <section class="welcome-section">
      <div class="welcome-text">
        <span class="subtitle-badge">Staff Management</span>
        <h2 class="welcome-title">Faculty Members</h2>
        <p class="welcome-desc">Monitor teaching assignments, edit profiles, and view contact sheets.</p>
      </div>
      <button class="welcome-date add-btn-action" onclick="openAddTeacherModal()">
        <i class="fa-solid fa-plus"></i> Add Teacher
      </button>
    </section>

    <div class="panel-card table-wrapper">
      <table class="data-table">
        <thead>
          <tr>
            <th>ID Code</th>
            <th>Teacher Name</th>
            <th>Department</th>
            <th>Email</th>
            <th>Assigned Courses</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${filteredTeachers.length === 0 ? `<tr><td colspan="6" style="text-align: center;">No records matching search.</td></tr>` : filteredTeachers.map(teach => `
            <tr>
              <td><strong>${teach.code}</strong></td>
              <td>${teach.name}</td>
              <td>${teach.dept}</td>
              <td><code>${teach.email}</code></td>
              <td>${teach.courses}</td>
              <td>
                <button class="action-btn secondary small" onclick="deleteRecord('teachers', ${teach.id})"><i class="fa-solid fa-trash-can"></i> Delete</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function renderAdminStudentsView(container) {
  const filteredStudents = LMS_DB.students.filter(s => 
    s.name.toLowerCase().includes(activeSearchQuery) || 
    s.roll.toLowerCase().includes(activeSearchQuery) ||
    s.dept.toLowerCase().includes(activeSearchQuery) ||
    s.email.toLowerCase().includes(activeSearchQuery)
  );

  container.innerHTML = `
    <section class="welcome-section">
      <div class="welcome-text">
        <span class="subtitle-badge">Registrar</span>
        <h2 class="welcome-title">Students Registry</h2>
        <p class="welcome-desc">Verify enrollments, check department filters, and query roll details.</p>
      </div>
      <button class="welcome-date add-btn-action" onclick="openAddStudentModal()">
        <i class="fa-solid fa-plus"></i> Add Student
      </button>
    </section>

    <div class="panel-card table-wrapper">
      <table class="data-table">
        <thead>
          <tr>
            <th>Roll ID</th>
            <th>Student Name</th>
            <th>Department</th>
            <th>Academic Email</th>
            <th>Enroll Year</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${filteredStudents.length === 0 ? `<tr><td colspan="6" style="text-align: center;">No student records found.</td></tr>` : filteredStudents.map(student => `
            <tr>
              <td><strong>${student.roll}</strong></td>
              <td>${student.name}</td>
              <td>${student.dept}</td>
              <td><code>${student.email}</code></td>
              <td>${student.year}</td>
              <td>
                <button class="action-btn secondary small" onclick="deleteRecord('students', ${student.id})"><i class="fa-solid fa-trash-can"></i> Delete</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function renderAdminSubjectsView(container) {
  const filteredSubs = LMS_DB.subjects.filter(s => 
    s.name.toLowerCase().includes(activeSearchQuery) || 
    s.code.toLowerCase().includes(activeSearchQuery) ||
    s.teacher.toLowerCase().includes(activeSearchQuery)
  );

  container.innerHTML = `
    <section class="welcome-section">
      <div class="welcome-text">
        <span class="subtitle-badge">Curriculum</span>
        <h2 class="welcome-title">Syllabus Subjects</h2>
        <p class="welcome-desc">Manage academic syllabus details, credit points, andassigned faculty.</p>
      </div>
      <button class="welcome-date add-btn-action" onclick="openAddSubjectModal()">
        <i class="fa-solid fa-plus"></i> Add Subject
      </button>
    </section>

    <div class="panel-card table-wrapper">
      <table class="data-table">
        <thead>
          <tr>
            <th>Subject Code</th>
            <th>Subject Name</th>
            <th>Credit Weight</th>
            <th>Assigned Professor</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${filteredSubs.length === 0 ? `<tr><td colspan="5" style="text-align: center;">No matches.</td></tr>` : filteredSubs.map(sub => `
            <tr>
              <td><span class="course-code-badge">${sub.code}</span></td>
              <td><strong>${sub.name}</strong></td>
              <td>${sub.credits} Credits</td>
              <td>${sub.teacher}</td>
              <td>
                <button class="action-btn secondary small" onclick="deleteRecord('subjects', ${sub.id})"><i class="fa-solid fa-trash-can"></i> Delete</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function renderAdminYearsView(container) {
  container.innerHTML = `
    <section class="welcome-section">
      <div class="welcome-text">
        <span class="subtitle-badge">Settings</span>
        <h2 class="welcome-title">Academic Years Config</h2>
        <p class="welcome-desc">Manage operational years, admission periods, and calendar loops.</p>
      </div>
    </section>

    <div class="panel-card table-wrapper">
      <table class="data-table">
        <thead>
          <tr>
            <th>Academic Year</th>
            <th>Session Scope</th>
            <th>Enrollment Threshold</th>
            <th>Term Status</th>
            <th>Operations</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>2026 - 2027</strong></td>
            <td>June 2026 - May 2027</td>
            <td>4,500 Max</td>
            <td><span class="status-indicator active">Active Term</span></td>
            <td><button class="action-btn secondary small" disabled>Current</button></td>
          </tr>
          <tr>
            <td><strong>2025 - 2026</strong></td>
            <td>June 2025 - May 2026</td>
            <td>4,000 Max</td>
            <td><span class="status-indicator pending">Archived</span></td>
            <td><button class="action-btn secondary small" onclick="showToast('Opening archives...', 'success')">Archives</button></td>
          </tr>
        </tbody>
      </table>
    </div>
  `;
}

function renderAdminSemestersView(container) {
  container.innerHTML = `
    <section class="welcome-section">
      <div class="welcome-text">
        <span class="subtitle-badge">Settings</span>
        <h2 class="welcome-title">Term Semesters</h2>
        <p class="welcome-desc">Initiate course requests, adjust evaluation scopes, and close terms.</p>
      </div>
    </section>

    <div class="panel-card table-wrapper">
      <table class="data-table">
        <thead>
          <tr>
            <th>Semester ID</th>
            <th>Term Focus</th>
            <th>Status</th>
            <th>Scope Dates</th>
            <th>Curriculum State</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>SEM-FALL-2026</strong></td>
            <td>Fall Term (1st Sem)</td>
            <td><span class="status-indicator active">Registering</span></td>
            <td>July 2026 - Dec 2026</td>
            <td><button class="action-btn primary small" onclick="showToast('Closing semester window.', 'warning')">Close Window</button></td>
          </tr>
          <tr>
            <td><strong>SEM-SPRING-2026</strong></td>
            <td>Spring Term (2nd Sem)</td>
            <td><span class="status-indicator pending">Historical</span></td>
            <td>Jan 2026 - June 2026</td>
            <td><button class="action-btn secondary small" disabled>Finalized</button></td>
          </tr>
        </tbody>
      </table>
    </div>
  `;
}

/**
 * 9. Reusable Modal Overlay System (Dynamically injected into DOM)
 */
function createModalFrame(title, contentHTML, submitLabel, onSubmitCallback) {
  const oldModal = document.getElementById('lms-dynamic-modal');
  if (oldModal) oldModal.remove();

  const modal = document.createElement('div');
  modal.id = 'lms-dynamic-modal';
  modal.className = 'lms-modal-overlay';
  modal.innerHTML = `
    <div class="lms-modal-card">
      <div class="lms-modal-header">
        <h5>${title}</h5>
        <button class="lms-modal-close" onclick="closeLMSModal()">&times;</button>
      </div>
      <form id="lms-modal-form" onsubmit="event.preventDefault();">
        <div class="lms-modal-body">
          ${contentHTML}
        </div>
        <div class="lms-modal-footer">
          <button type="button" class="action-btn secondary" onclick="closeLMSModal()">Cancel</button>
          <button type="submit" class="action-btn primary">${submitLabel}</button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(modal);
  
  setTimeout(() => {
    modal.classList.add('show');
  }, 10);

  const form = modal.querySelector('#lms-modal-form');
  form.addEventListener('submit', () => {
    if (onSubmitCallback(form)) {
      closeLMSModal();
    }
  });
}

function closeLMSModal() {
  const modal = document.getElementById('lms-dynamic-modal');
  if (!modal) return;
  modal.classList.remove('show');
  setTimeout(() => {
    modal.remove();
  }, 300);
}

/**
 * 10. Forms / Add Action Handlers
 */
function openAddDepartmentModal() {
  const formHTML = `
    <div class="form-group" style="margin-bottom: 1rem;">
      <label for="modal-dept-name" class="static-label">Department Name</label>
      <input type="text" id="modal-dept-name" class="form-input" placeholder="e.g. Civil Engineering" required>
    </div>
    <div class="form-group" style="margin-bottom: 1rem;">
      <label for="modal-dept-code" class="static-label">Dept Code</label>
      <input type="text" id="modal-dept-code" class="form-input" placeholder="e.g. CE" required>
    </div>
    <div class="form-group" style="margin-bottom: 1rem;">
      <label for="modal-dept-head" class="static-label">Chairperson Head</label>
      <input type="text" id="modal-dept-head" class="form-input" placeholder="e.g. Dr. John Carter" required>
    </div>
  `;

  createModalFrame("Add New Department", formHTML, "Add Department", (form) => {
    const name = form.querySelector('#modal-dept-name').value.trim();
    const code = form.querySelector('#modal-dept-code').value.trim().toUpperCase();
    const head = form.querySelector('#modal-dept-head').value.trim();

    const id = code.toLowerCase();
    
    if (LMS_DB.departments.some(d => d.code === code)) {
      showToast("Department code already registered.", "error");
      return false;
    }

    LMS_DB.departments.push({ id, name, code, head, faculty: 1, students: 0 });
    LMS_DB.recentActivities.admin.unshift({
      id: Date.now(),
      icon: 'fa-building',
      color: 'color-cyan',
      title: 'Department created',
      time: 'Just now',
      text: `Faculty of ${name} (${code}) added with head ${head}.`
    });
    saveLMSState();
    showToast("Department successfully enrolled.", "success");
    renderActiveView();
    return true;
  });
}

function openAddTeacherModal() {
  const deptOptions = LMS_DB.departments.map(d => `<option value="${d.name}">${d.name}</option>`).join('');
  const formHTML = `
    <div class="form-group" style="margin-bottom: 1rem;">
      <label for="modal-teach-name" class="static-label">Teacher Full Name</label>
      <input type="text" id="modal-teach-name" class="form-input" placeholder="e.g. Dr. Alan Turing" required>
    </div>
    <div class="form-group" style="margin-bottom: 1rem;">
      <label for="modal-teach-dept" class="static-label">Department</label>
      <select id="modal-teach-dept" class="form-input" required>
        ${deptOptions}
      </select>
    </div>
    <div class="form-group" style="margin-bottom: 1rem;">
      <label for="modal-teach-email" class="static-label">Professional Email</label>
      <input type="email" id="modal-teach-email" class="form-input" placeholder="e.g. a.turing@aura.edu" required>
    </div>
  `;

  createModalFrame("Add New Faculty Member", formHTML, "Enlist Faculty", (form) => {
    const name = form.querySelector('#modal-teach-name').value.trim();
    const dept = form.querySelector('#modal-teach-dept').value;
    const email = form.querySelector('#modal-teach-email').value.trim();

    const code = `T-0${LMS_DB.teachers.length + 1}`;
    const id = Date.now();

    LMS_DB.teachers.push({ id, name, code, dept, email, courses: 'Not Assigned' });

    const targetDept = LMS_DB.departments.find(d => d.name === dept);
    if (targetDept) targetDept.faculty += 1;

    LMS_DB.recentActivities.admin.unshift({
      id: Date.now(),
      icon: 'fa-user-tie',
      color: 'color-cyan',
      title: 'Teacher added',
      time: 'Just now',
      text: `${name} has been enrolled in ${dept} faculty.`
    });

    saveLMSState();
    showToast("Faculty member successfully enlisted.", "success");
    renderActiveView();
    return true;
  });
}

function openAddStudentModal() {
  const deptOptions = LMS_DB.departments.map(d => `<option value="${d.name}">${d.name}</option>`).join('');
  const formHTML = `
    <div class="form-group" style="margin-bottom: 1rem;">
      <label for="modal-student-name" class="static-label">Student Name</label>
      <input type="text" id="modal-student-name" class="form-input" placeholder="e.g. John Watson" required>
    </div>
    <div class="form-group" style="margin-bottom: 1rem;">
      <label for="modal-student-dept" class="static-label">Department</label>
      <select id="modal-student-dept" class="form-input" required>
        ${deptOptions}
      </select>
    </div>
    <div class="form-group" style="margin-bottom: 1rem;">
      <label for="modal-student-email" class="static-label">Student Email</label>
      <input type="email" id="modal-student-email" class="form-input" placeholder="e.g. j.watson@aura.edu" required>
    </div>
  `;

  createModalFrame("Add Student Record", formHTML, "Enlist Student", (form) => {
    const name = form.querySelector('#modal-student-name').value.trim();
    const dept = form.querySelector('#modal-student-dept').value;
    const email = form.querySelector('#modal-student-email').value.trim();

    const id = Date.now();
    const roll = `student${Math.floor(100 + Math.random() * 900)}`;
    const year = new Date().getFullYear().toString();

    LMS_DB.students.push({ id, name, roll, email, dept, year });

    const targetDept = LMS_DB.departments.find(d => d.name === dept);
    if (targetDept) targetDept.students += 1;

    LMS_DB.recentActivities.admin.unshift({
      id: Date.now(),
      icon: 'fa-user-graduate',
      color: 'color-purple',
      title: 'Student registered',
      time: 'Just now',
      text: `${name} has been enrolled in ${dept}.`
    });

    saveLMSState();
    showToast("Student record registered successfully.", "success");
    renderActiveView();
    return true;
  });
}

function openAddSubjectModal() {
  const teacherOptions = LMS_DB.teachers.map(t => `<option value="${t.name}">${t.name}</option>`).join('');
  const formHTML = `
    <div class="form-group" style="margin-bottom: 1rem;">
      <label for="modal-sub-name" class="static-label">Subject Title</label>
      <input type="text" id="modal-sub-name" class="form-input" placeholder="e.g. Compiler Design" required>
    </div>
    <div class="form-group" style="margin-bottom: 1rem;">
      <label for="modal-sub-code" class="static-label">Subject Code</label>
      <input type="text" id="modal-sub-code" class="form-input" placeholder="e.g. CS-404" required>
    </div>
    <div class="form-group" style="margin-bottom: 1rem;">
      <label for="modal-sub-credits" class="static-label">Credit Hours</label>
      <input type="number" id="modal-sub-credits" class="form-input" value="4" min="1" max="5" required>
    </div>
    <div class="form-group" style="margin-bottom: 1rem;">
      <label for="modal-sub-teacher" class="static-label">Assigned Teacher</label>
      <select id="modal-sub-teacher" class="form-input" required>
        ${teacherOptions}
      </select>
    </div>
  `;

  createModalFrame("Add Curriculum Subject", formHTML, "Enrol Subject", (form) => {
    const name = form.querySelector('#modal-sub-name').value.trim();
    const code = form.querySelector('#modal-sub-code').value.trim().toUpperCase();
    const credits = parseInt(form.querySelector('#modal-sub-credits').value);
    const teacher = form.querySelector('#modal-sub-teacher').value;

    const id = Date.now();

    LMS_DB.subjects.push({ id, name, code, credits, teacher });

    LMS_DB.recentActivities.admin.unshift({
      id: Date.now(),
      icon: 'fa-book',
      color: 'color-pink',
      title: 'Subject created',
      time: 'Just now',
      text: `Curriculum module "${name}" assigned to ${teacher}.`
    });

    saveLMSState();
    showToast("Curriculum subject created.", "success");
    renderActiveView();
    return true;
  });
}

function openAssignmentUploadModal(assignmentId) {
  const assignment = LMS_DB.studentAssignments.find(a => a.id === assignmentId);
  if (!assignment) return;

  const formHTML = `
    <p class="welcome-desc" style="margin-bottom: 1.25rem;">Solution submission for <strong>${assignment.title}</strong>.</p>
    <div class="drag-drop-zone" id="drag-drop-zone" onclick="triggerFileInputClick()">
      <i class="fa-solid fa-cloud-arrow-up"></i>
      <p>Drag and drop your solution file here, or <span>browse</span></p>
      <span class="small-hint">PDF, DOCX, ZIP (Max 15MB)</span>
      <input type="file" id="modal-file-input" style="display: none;" onchange="handleFileSelected(this)">
    </div>
    <div id="selected-file-display" style="display:none; margin-top: 1rem;" class="demo-creds-row">
      <span id="selected-file-name" style="font-weight:600; color: #fff;"></span>
      <button type="button" class="copy-btn" onclick="clearSelectedFile()" style="background:#ef4444; border-color:#ef4444; color:#fff;">Remove</button>
    </div>
  `;

  createModalFrame("Upload Assignment solution", formHTML, "Submit Solution", (form) => {
    const fileInput = form.querySelector('#modal-file-input');
    const selectedFile = fileInput.files[0];
    if (!selectedFile) {
      showToast("Please select a file to submit.", "warning");
      return false;
    }

    assignment.status = 'Submitted';
    assignment.due = 'Submitted';
    assignment.feedback = 'Under Review';
    assignment.submittedDate = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

    LMS_DB.recentActivities.student.unshift({
      id: Date.now(),
      icon: 'fa-file-invoice',
      color: 'color-purple',
      title: 'Assignment submitted',
      time: 'Just now',
      text: `Successfully uploaded "${selectedFile.name}" for ${assignment.title}.`
    });

    saveLMSState();
    showToast("Assignment solution submitted.", "success");
    renderActiveView();
    return true;
  });
}

function triggerFileInputClick() {
  const input = document.getElementById('modal-file-input');
  if (input) input.click();
}

function handleFileSelected(input) {
  const file = input.files[0];
  const display = document.getElementById('selected-file-display');
  const nameLabel = document.getElementById('selected-file-name');
  if (file && display && nameLabel) {
    nameLabel.innerText = file.name;
    display.style.display = 'flex';
  }
}

function clearSelectedFile() {
  const input = document.getElementById('modal-file-input');
  const display = document.getElementById('selected-file-display');
  if (input && display) {
    input.value = '';
    display.style.display = 'none';
  }
}

function triggerCourseEnrollment() {
  const coursesAvailable = LMS_DB.subjects.filter(sub => 
    !LMS_DB.studentCourses.some(c => c.code === sub.code)
  );

  if (coursesAvailable.length === 0) {
    showToast("You are already enrolled in all available courses.", "warning");
    return;
  }

  const options = coursesAvailable.map(c => `<option value="${c.code}">${c.code} - ${c.name} (${c.teacher})</option>`).join('');

  const formHTML = `
    <div class="form-group" style="margin-bottom: 1rem;">
      <label for="modal-enroll-code" class="static-label">Available Courses</label>
      <select id="modal-enroll-code" class="form-input" required>
        ${options}
      </select>
    </div>
  `;

  createModalFrame("Enroll in Course", formHTML, "Confirm Registration", (form) => {
    const code = form.querySelector('#modal-enroll-code').value;
    const subject = LMS_DB.subjects.find(s => s.code === code);
    
    if (subject) {
      LMS_DB.studentCourses.push({
        code: subject.code,
        name: subject.name,
        instructor: subject.teacher,
        progress: 0,
        grade: 'IP',
        marks: 'In Progress',
        room: 'Room ' + Math.floor(100 + Math.random() * 400),
        time: 'Mon/Wed 12:00 PM'
      });

      LMS_DB.recentActivities.student.unshift({
        id: Date.now(),
        icon: 'fa-graduation-cap',
        color: 'color-cyan',
        title: 'Course Enrolled',
        time: 'Just now',
        text: `Enrolled in "${subject.name}" (${subject.code}) taught by ${subject.teacher}.`
      });

      saveLMSState();
      showToast("Registered for course successfully.", "success");
      renderActiveView();
      return true;
    }
    return false;
  });
}

function triggerTuitionCheckout() {
  const unpaidInvoices = LMS_DB.studentTuition.invoices.filter(i => i.status === 'Unpaid');
  if (unpaidInvoices.length === 0) {
    showToast("All term invoices have already been paid.", "warning");
    return;
  }

  const invoiceAmount = unpaidInvoices.reduce((acc, inv) => acc + inv.amount, 0);

  const formHTML = `
    <p class="welcome-desc" style="margin-bottom: 1.25rem;">Review payment details before processing secure payment.</p>
    <div class="demo-creds-row" style="margin-bottom:1rem;">
      <span>Total Amount to Pay:</span>
      <strong style="color: #fff; font-size: 1rem;">$${invoiceAmount}</strong>
    </div>
    <div class="form-group" style="margin-bottom: 1rem;">
      <label for="checkout-card" class="static-label">Card Number</label>
      <input type="text" id="checkout-card" class="form-input" placeholder="4111 2222 3333 4444" required>
    </div>
    <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
      <div class="form-group">
        <label for="checkout-exp" class="static-label">Expiry Date</label>
        <input type="text" id="checkout-exp" class="form-input" placeholder="MM/YY" required>
      </div>
      <div class="form-group">
        <label for="checkout-cvv" class="static-label">CVV</label>
        <input type="text" id="checkout-cvv" class="form-input" placeholder="123" required>
      </div>
    </div>
  `;

  createModalFrame("Secure Fee Payment", formHTML, "Authorize Transaction", (form) => {
    unpaidInvoices.forEach(inv => inv.status = 'Paid');
    
    LMS_DB.recentActivities.student.unshift({
      id: Date.now(),
      icon: 'fa-file-invoice',
      color: 'color-cyan',
      title: 'Fee Invoice Paid',
      time: 'Just now',
      text: `Term balance invoice successfully authorized. Transacted amount: $${invoiceAmount}.`
    });

    saveLMSState();
    showToast("Fee payment processed successfully.", "success");
    renderActiveView();
    return true;
  });
}

function triggerContactAdvisor() {
  const formHTML = `
    <div class="form-group" style="margin-bottom: 1rem;">
      <label for="advisor-subject" class="static-label">Meeting Topic</label>
      <input type="text" id="advisor-subject" class="form-input" placeholder="e.g. Schedule adjustments or syllabus review" required>
    </div>
    <div class="form-group" style="margin-bottom: 1rem;">
      <label for="advisor-date" class="static-label">Preferred Date</label>
      <input type="date" id="advisor-date" class="form-input" required>
    </div>
    <div class="form-group" style="margin-bottom: 1rem;">
      <label for="advisor-msg" class="static-label">Brief message</label>
      <textarea id="advisor-msg" class="form-input" rows="3" placeholder="Briefly describe what you'd like to discuss..."></textarea>
    </div>
  `;

  createModalFrame("Request Advice Session", formHTML, "Send Meeting Request", (form) => {
    const subject = form.querySelector('#advisor-subject').value.trim();
    const date = form.querySelector('#advisor-date').value;

    LMS_DB.recentActivities.student.unshift({
      id: Date.now(),
      icon: 'fa-bell',
      color: 'color-purple',
      title: 'Meeting Scheduled',
      time: 'Just now',
      text: `Guidance request on "${subject}" sent for ${date}.`
    });

    saveLMSState();
    showToast("Meeting advice request sent.", "success");
    renderActiveView();
    return true;
  });
}

function deleteRecord(storeName, recordId) {
  if (confirm("Are you sure you want to delete this record? This action will remove it from database tables.")) {
    const lengthBefore = LMS_DB[storeName].length;
    LMS_DB[storeName] = LMS_DB[storeName].filter(item => item.id !== recordId);
    
    if (LMS_DB[storeName].length < lengthBefore) {
      saveLMSState();
      showToast("Record deleted from system database.", "success");
      renderActiveView();
    }
  }
}

/**
 * Helper Utility Date/Time methods
 */
function getLiveDateString() {
  const options = { month: 'long', day: 'numeric', year: 'numeric' };
  return new Date().toLocaleDateString('en-US', options);
}

function getLiveDate() {
  initLiveDate();
}

function initLiveDate() {
  const liveDate = document.getElementById('live-date');
  if (liveDate) {
    liveDate.innerHTML = `<i class="fa-regular fa-calendar-check"></i> ${getLiveDateString()}`;
  }
}

function renderEmptyState() {
  return `
    <div style="grid-column: span 4; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 4rem; opacity:0.6; text-align: center;">
      <i class="fa-solid fa-folder-open" style="font-size: 3rem; margin-bottom: 1rem; color: var(--text-muted);"></i>
      <h5>No records match your criteria</h5>
      <p style="font-size: 0.8rem; color: var(--text-muted); margin-top: 4px;">Try searching with a different keyword or reset active filters.</p>
    </div>
  `;
}

/**
 * Self-contained Toast popup system triggers
 */
function showToast(message, type = 'success') {
  const root = document.getElementById('toast-root');
  if (!root) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
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
  setTimeout(() => {
    toast.classList.add('show');
  }, 10);

  const autoClose = setTimeout(() => {
    dismissToast(toast);
  }, 4000);

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

/* =========================================================
 * 10. TEACHER PORTAL — View Render Functions
 * ========================================================= */

function getMaterialIcon(type) {
  const map = { pdf:'fa-file-pdf', ppt:'fa-file-powerpoint', doc:'fa-file-word', zip:'fa-file-zipper', video:'fa-circle-play', img:'fa-file-image' };
  return map[type] || 'fa-file';
}
function getMaterialColor(type) {
  const map = { pdf:'red', ppt:'orange', doc:'blue', zip:'purple', video:'cyan', img:'pink' };
  return map[type] || 'cyan';
}

// 10.1 Teacher Dashboard
function renderTeacherDashboard(container) {
  const mySubjects = LMS_DB.subjects.filter(s => s.teacher === 'Dr. Helen Vance');
  const totalMaterials = Object.values(LMS_DB.uploadedMaterials).flat().filter(m => m.uploadedBy === 'Dr. Helen Vance').length;
  const pendingGrades = LMS_DB.submissions.filter(s => !s.graded).length;
  const activities = LMS_DB.recentActivities.teacher || [];

  container.innerHTML = `
    <section class="welcome-section">
      <div class="welcome-text">
        <span class="subtitle-badge" style="background:rgba(16,185,129,0.1);border-color:rgba(16,185,129,0.25);color:#34d399;">Teaching Console</span>
        <h2 class="welcome-title">Welcome back, Dr. Vance &#x1F469;&#x200D;&#x1F3EB;</h2>
        <p class="welcome-desc">Faculty portal for Computer Science — manage materials, track submissions, and communicate with students.</p>
      </div>
      <div class="welcome-date"><i class="fa-regular fa-calendar-check"></i> ${getLiveDateString()}</div>
    </section>

    <section class="stats-grid">
      <div class="stat-card">
        <div class="stat-card-glow"></div>
        <div class="stat-icon-wrapper" style="background:rgba(16,185,129,0.15);">
          <i class="fa-solid fa-book-open" style="color:#34d399;"></i>
        </div>
        <div class="stat-info">
          <span class="stat-label">My Subjects</span>
          <h3 class="stat-value">${mySubjects.length}</h3>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-card-glow"></div>
        <div class="stat-icon-wrapper cyan"><i class="fa-solid fa-cloud-arrow-up"></i></div>
        <div class="stat-info"><span class="stat-label">Materials Uploaded</span><h3 class="stat-value">${totalMaterials}</h3></div>
      </div>
      <div class="stat-card">
        <div class="stat-card-glow"></div>
        <div class="stat-icon-wrapper purple"><i class="fa-solid fa-file-pen"></i></div>
        <div class="stat-info"><span class="stat-label">Pending to Grade</span><h3 class="stat-value">${pendingGrades}</h3></div>
      </div>
      <div class="stat-card">
        <div class="stat-card-glow"></div>
        <div class="stat-icon-wrapper pink"><i class="fa-solid fa-users"></i></div>
        <div class="stat-info"><span class="stat-label">Enrolled Students</span><h3 class="stat-value">${LMS_DB.students.length}</h3></div>
      </div>
    </section>

    <section class="content-grid">
      <div class="content-panel" style="grid-column:span 2;">
        <div class="panel-header">
          <h3 class="panel-title"><i class="fa-solid fa-book-open"></i> My Assigned Subjects</h3>
          <button class="btn-secondary btn-sm" onclick="switchView('my-subjects')">View All</button>
        </div>
        <div class="table-container">
          <table class="data-table">
            <thead><tr><th>Subject</th><th>Code</th><th>Credits</th><th>Materials</th><th>Action</th></tr></thead>
            <tbody>
              ${mySubjects.map(s => {
                const count = (LMS_DB.uploadedMaterials[s.code] || []).length;
                return '<tr><td><strong>' + s.name + '</strong></td><td><span class="badge badge-cyan">' + s.code + '</span></td><td>' + s.credits + ' Credits</td><td><span class="badge badge-purple">' + count + ' Files</span></td><td><button class="btn-secondary btn-sm" onclick="switchView(\'my-subjects\')">Manage</button></td></tr>';
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
      <div class="content-panel">
        <div class="panel-header"><h3 class="panel-title"><i class="fa-solid fa-clock-rotate-left"></i> Recent Activity</h3></div>
        <ul class="activity-list">
          ${activities.map(a => '<li class="activity-item"><div class="activity-icon ' + a.color + '"><i class="fa-solid ' + a.icon + '"></i></div><div class="activity-content"><div class="activity-title">' + a.title + ' <span class="activity-time">' + a.time + '</span></div><p class="activity-text">' + a.text + '</p></div></li>').join('')}
        </ul>
      </div>
      <div class="content-panel">
        <div class="panel-header">
          <h3 class="panel-title"><i class="fa-solid fa-bullhorn"></i> Latest Announcements</h3>
          <button class="btn-secondary btn-sm" onclick="switchView('announcements')">Manage</button>
        </div>
        <ul class="activity-list">
          ${LMS_DB.announcements.slice(0,3).map(a => '<li class="activity-item"><div class="activity-icon color-cyan"><i class="fa-solid fa-bell"></i></div><div class="activity-content"><div class="activity-title">' + a.title + ' <span class="activity-time">' + a.postedAt + '</span></div><p class="activity-text">' + a.body.substring(0,80) + '&hellip;</p></div></li>').join('')}
        </ul>
      </div>
    </section>`;
}

// 10.2 My Subjects View
function renderTeacherSubjectsView(container) {
  let mySubjects = LMS_DB.subjects.filter(s => s.teacher === 'Dr. Helen Vance');
  if (activeSearchQuery) {
    mySubjects = mySubjects.filter(s => 
      s.name.toLowerCase().includes(activeSearchQuery) || 
      s.code.toLowerCase().includes(activeSearchQuery)
    );
  }
  const unitNames = ['Introduction &amp; Fundamentals','Core Concepts','Advanced Topics','Applications','Revision &amp; Assessment'];

  let html = `
    <section class="welcome-section">
      <div class="welcome-text">
        <span class="subtitle-badge" style="background:rgba(16,185,129,0.1);border-color:rgba(16,185,129,0.25);color:#34d399;">Teaching Console</span>
        <h2 class="welcome-title">My Subjects</h2>
        <p class="welcome-desc">Manage materials for each assigned subject, organised into 5 units.</p>
      </div>
    </section>`;

  mySubjects.forEach(subject => {
    const materials = LMS_DB.uploadedMaterials[subject.code] || [];
    let unitBlocks = '';
    for (let u = 1; u <= 5; u++) {
      const unitFiles = materials.filter(m => m.unit === u);
      const fileRows = unitFiles.length === 0
        ? '<div class="empty-state-sm"><i class="fa-solid fa-folder-open"></i> No files uploaded for this unit yet.</div>'
        : '<div class="material-list">' + unitFiles.map(f =>
            '<div class="material-row">' +
              '<div class="mat-icon ' + getMaterialColor(f.type) + '"><i class="fa-solid ' + getMaterialIcon(f.type) + '"></i></div>' +
              '<div class="mat-info"><span class="mat-title">' + f.title + '</span><span class="mat-meta">' + f.size + ' &bull; Uploaded ' + f.uploadedAt + '</span></div>' +
              '<div class="mat-actions">' +
                '<a href="' + f.url + '" target="_blank" class="btn-icon" title="Download"><i class="fa-solid fa-download"></i></a>' +
                '<button class="btn-icon danger" title="Delete" onclick="deleteMaterial(' + f.id + ',\'' + subject.code + '\')"><i class="fa-solid fa-trash"></i></button>' +
              '</div>' +
            '</div>').join('') + '</div>';
      unitBlocks += '<div class="unit-block"><div class="unit-header" onclick="toggleUnit(this)"><div class="unit-title-wrap"><span class="unit-badge">Unit ' + u + '</span><span class="unit-name">Unit ' + u + ': ' + unitNames[u-1] + '</span></div><div style="display:flex;align-items:center;gap:.75rem;"><span class="badge badge-purple">' + unitFiles.length + ' file' + (unitFiles.length!==1?'s':'') + '</span><i class="fa-solid fa-chevron-down unit-chevron"></i></div></div><div class="unit-body">' + fileRows + '<button class="btn-secondary btn-sm" style="margin-top:.75rem;" onclick="switchView(\'upload\')"><i class="fa-solid fa-plus"></i> Add to Unit ' + u + '</button></div></div>';
    }
    html += '<div class="content-panel" style="margin-bottom:1.5rem;"><div class="panel-header"><div><h3 class="panel-title" style="color:#34d399;"><i class="fa-solid fa-book-open"></i> ' + subject.name + '</h3><span style="font-size:.8rem;color:var(--text-muted);">' + subject.code + ' &bull; ' + subject.credits + ' Credits</span></div><button class="btn-primary btn-sm" onclick="switchView(\'upload\')" style="background:linear-gradient(135deg,#10b981,#059669);"><i class="fa-solid fa-plus"></i> Upload Material</button></div><div class="unit-accordion">' + unitBlocks + '</div></div>';
  });

  container.innerHTML = html;
}

function toggleUnit(header) {
  const block = header.closest('.unit-block');
  const isOpen = block.classList.toggle('open');
  const chevron = header.querySelector('.unit-chevron');
  if (chevron) chevron.style.transform = isOpen ? 'rotate(180deg)' : 'rotate(0deg)';
}

function deleteMaterial(id, subjectCode) {
  if (!LMS_DB.uploadedMaterials[subjectCode]) return;
  LMS_DB.uploadedMaterials[subjectCode] = LMS_DB.uploadedMaterials[subjectCode].filter(m => m.id !== id);
  saveLMSState();
  showToast('Material deleted.', 'success');
  renderTeacherSubjectsView(document.getElementById('console-view-wrapper'));
}

// 10.3 Upload Material View
function renderTeacherUploadView(container) {
  const mySubjects = LMS_DB.subjects.filter(s => s.teacher === 'Dr. Helen Vance');
  container.innerHTML = `
    <section class="welcome-section">
      <div class="welcome-text">
        <span class="subtitle-badge" style="background:rgba(16,185,129,0.1);border-color:rgba(16,185,129,0.25);color:#34d399;">Teaching Console</span>
        <h2 class="welcome-title">Upload Study Material</h2>
        <p class="welcome-desc">Add lecture notes, slides, videos, or any resource for your students.</p>
      </div>
    </section>
    <div class="content-panel" style="max-width:660px;margin:0 auto;">
      <div class="panel-header"><h3 class="panel-title"><i class="fa-solid fa-cloud-arrow-up"></i> New Material</h3></div>
      <form id="upload-form" style="display:flex;flex-direction:column;gap:1.25rem;">
        <div class="form-group">
          <label class="form-label">Subject <span class="required">*</span></label>
          <select id="up-subject" class="form-input" required>
            <option value="">— Select Subject —</option>
            ${mySubjects.map(s => '<option value="' + s.code + '">' + s.name + ' (' + s.code + ')</option>').join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Unit <span class="required">*</span></label>
          <select id="up-unit" class="form-input" required>
            <option value="">— Select Unit —</option>
            <option value="1">Unit 1: Introduction &amp; Fundamentals</option>
            <option value="2">Unit 2: Core Concepts</option>
            <option value="3">Unit 3: Advanced Topics</option>
            <option value="4">Unit 4: Applications</option>
            <option value="5">Unit 5: Revision &amp; Assessment</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Title <span class="required">*</span></label>
          <input type="text" id="up-title" class="form-input" placeholder="e.g. Lecture 3 — Maxwell's Equations" required />
        </div>
        <div class="form-group">
          <label class="form-label">Type</label>
          <select id="up-type" class="form-input">
            <option value="pdf">PDF Document</option>
            <option value="ppt">PowerPoint Slides</option>
            <option value="doc">Word Document</option>
            <option value="video">Video / YouTube Link</option>
            <option value="zip">ZIP Archive</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">External URL (optional)</label>
          <input type="url" id="up-url" class="form-input" placeholder="https://…" />
        </div>
        <div style="border:2px dashed rgba(16,185,129,0.35);border-radius:12px;padding:2rem;text-align:center;cursor:pointer;"
             onclick="document.getElementById('up-file').click()"
             onmouseenter="this.style.borderColor='#10b981'" onmouseleave="this.style.borderColor='rgba(16,185,129,0.35)'">
          <i class="fa-solid fa-cloud-arrow-up" style="font-size:2rem;color:#34d399;margin-bottom:.5rem;display:block;"></i>
          <p style="margin:0;color:var(--text-primary);">Click to browse or drag &amp; drop</p>
          <p style="margin:.4rem 0 0;font-size:.8rem;color:var(--text-muted);">PDF, PPTX, DOCX, ZIP, MP4 — Max 50 MB</p>
          <input type="file" id="up-file" style="display:none;" accept=".pdf,.pptx,.ppt,.docx,.doc,.zip,.mp4" />
          <div id="up-file-name" style="margin-top:.6rem;color:#34d399;font-weight:500;display:none;"></div>
        </div>
        <div style="display:flex;gap:1rem;justify-content:flex-end;">
          <button type="button" class="btn-secondary" onclick="switchView('my-subjects')">Cancel</button>
          <button type="submit" class="btn-primary" style="background:linear-gradient(135deg,#10b981,#059669);">
            <i class="fa-solid fa-cloud-arrow-up"></i> Upload
          </button>
        </div>
      </form>
    </div>`;

  document.getElementById('up-file').addEventListener('change', function() {
    const el = document.getElementById('up-file-name');
    if (this.files.length > 0) { el.textContent = '✓ ' + this.files[0].name; el.style.display = 'block'; }
  });

  document.getElementById('upload-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const code  = document.getElementById('up-subject').value;
    const unit  = parseInt(document.getElementById('up-unit').value);
    const title = document.getElementById('up-title').value.trim();
    const type  = document.getElementById('up-type').value;
    const url   = document.getElementById('up-url').value.trim() || '#';
    const fi    = document.getElementById('up-file');
    const size  = fi.files.length > 0 ? (fi.files[0].size/1048576).toFixed(1) + ' MB' : 'External';
    if (!code || !unit || !title) { showToast('Please fill all required fields.', 'error'); return; }
    if (!LMS_DB.uploadedMaterials[code]) LMS_DB.uploadedMaterials[code] = [];
    LMS_DB.uploadedMaterials[code].push({
      id: Date.now(), unit, title, type, url, size,
      uploadedAt: new Date().toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}),
      uploadedBy: 'Dr. Helen Vance'
    });
    saveLMSState();
    showToast('"' + title + '" uploaded to Unit ' + unit + '!', 'success');
    switchView('my-subjects');
  });
}

// 10.4 Submissions & Grading View
function renderTeacherSubmissionsView(container) {
  let subs = LMS_DB.submissions;
  if (activeSearchQuery) {
    subs = subs.filter(s => 
      s.studentName.toLowerCase().includes(activeSearchQuery) ||
      s.studentRoll.toLowerCase().includes(activeSearchQuery) ||
      s.subjectCode.toLowerCase().includes(activeSearchQuery)
    );
  }

  container.innerHTML = `
    <section class="welcome-section">
      <div class="welcome-text">
        <span class="subtitle-badge" style="background:rgba(16,185,129,0.1);border-color:rgba(16,185,129,0.25);color:#34d399;">Teaching Console</span>
        <h2 class="welcome-title">Student Submissions</h2>
        <p class="welcome-desc">Review, download, and grade assignment submissions.</p>
      </div>
    </section>
    <div class="content-panel">
      <div class="panel-header">
        <h3 class="panel-title"><i class="fa-solid fa-file-pen"></i> All Submissions</h3>
        <div style="display:flex;gap:.75rem;">
          <span class="badge badge-warning">${subs.filter(s=>!s.graded).length} Pending</span>
          <span class="badge badge-success">${subs.filter(s=>s.graded).length} Graded</span>
        </div>
      </div>
      <div class="table-container">
        <table class="data-table">
          <thead><tr><th>Student</th><th>Subject</th><th>Submitted</th><th>Status</th><th>Marks</th><th>Action</th></tr></thead>
          <tbody>
            ${subs.map(s =>
              '<tr><td><strong>' + s.studentName + '</strong><br><span style="font-size:.75rem;color:var(--text-muted);">' + s.studentRoll + '</span></td>' +
              '<td><span class="badge badge-cyan">' + s.subjectCode + '</span></td>' +
              '<td>' + s.submittedAt + '</td>' +
              '<td>' + (s.graded ? '<span class="badge badge-success">Graded</span>' : '<span class="badge badge-warning">Pending</span>') + '</td>' +
              '<td>' + (s.marks !== null ? '<strong>' + s.marks + '/100</strong>' : '&mdash;') + '</td>' +
              '<td><button class="btn-secondary btn-sm" onclick="openGradeModal(' + s.id + ')"><i class="fa-solid ' + (s.graded?'fa-eye':'fa-pen') + '"></i> ' + (s.graded?'View':'Grade') + '</button></td></tr>'
            ).join('')}
          </tbody>
        </table>
      </div>
    </div>
    <div id="grade-modal" class="modal-overlay" style="display:none;" onclick="if(event.target===this)closeGradeModal()">
      <div class="modal-card" style="max-width:480px;">
        <div class="modal-header">
          <h3 id="grade-modal-title" class="modal-title">Grade Submission</h3>
          <button class="modal-close" onclick="closeGradeModal()"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">Marks (out of 100)</label>
            <input type="number" id="grade-marks-input" class="form-input" min="0" max="100" placeholder="e.g. 85" />
          </div>
          <div class="form-group">
            <label class="form-label">Feedback / Comments</label>
            <textarea id="grade-feedback-input" class="form-input" rows="4" placeholder="Write feedback…" style="resize:vertical;"></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" onclick="closeGradeModal()">Cancel</button>
          <button class="btn-primary" style="background:linear-gradient(135deg,#10b981,#059669);" onclick="submitGrade()">
            <i class="fa-solid fa-check"></i> Submit Grade
          </button>
        </div>
      </div>
    </div>`;
}

let _gradingSubId = null;
function openGradeModal(id) {
  _gradingSubId = id;
  const s = LMS_DB.submissions.find(x => x.id === id);
  if (!s) return;
  document.getElementById('grade-modal-title').textContent = 'Grade — ' + s.studentName + ' (' + s.subjectCode + ')';
  document.getElementById('grade-marks-input').value = s.marks !== null ? s.marks : '';
  document.getElementById('grade-feedback-input').value = s.feedback || '';
  document.getElementById('grade-modal').style.display = 'flex';
}
function closeGradeModal() {
  const m = document.getElementById('grade-modal');
  if (m) m.style.display = 'none';
  _gradingSubId = null;
}
function submitGrade() {
  const marks = parseInt(document.getElementById('grade-marks-input').value);
  const feedback = document.getElementById('grade-feedback-input').value.trim();
  if (isNaN(marks) || marks < 0 || marks > 100) { showToast('Enter valid marks (0–100).', 'error'); return; }
  const s = LMS_DB.submissions.find(x => x.id === _gradingSubId);
  if (s) { s.marks = marks; s.feedback = feedback; s.graded = true; saveLMSState(); showToast('Grade saved: ' + marks + '/100 for ' + s.studentName + '.', 'success'); }
  closeGradeModal();
  renderTeacherSubmissionsView(document.getElementById('console-view-wrapper'));
}

// 10.5 Announcements View
function renderTeacherAnnouncementsView(container) {
  const mySubjects = LMS_DB.subjects.filter(s => s.teacher === 'Dr. Helen Vance');
  let myAnnouncements = LMS_DB.announcements;
  if (activeSearchQuery) {
    myAnnouncements = myAnnouncements.filter(a => 
      a.title.toLowerCase().includes(activeSearchQuery) ||
      a.body.toLowerCase().includes(activeSearchQuery) ||
      (a.subjectCode && a.subjectCode.toLowerCase().includes(activeSearchQuery))
    );
  }


  container.innerHTML = `
    <section class="welcome-section">
      <div class="welcome-text">
        <span class="subtitle-badge" style="background:rgba(16,185,129,0.1);border-color:rgba(16,185,129,0.25);color:#34d399;">Teaching Console</span>
        <h2 class="welcome-title">Announcements</h2>
        <p class="welcome-desc">Post notices and updates for your students across all subjects.</p>
      </div>
    </section>
    <div style="display:grid;grid-template-columns:1fr 1.6fr;gap:1.5rem;align-items:start;">
      <div class="content-panel">
        <div class="panel-header"><h3 class="panel-title"><i class="fa-solid fa-pen-to-square"></i> New Announcement</h3></div>
        <form id="ann-form" style="display:flex;flex-direction:column;gap:1rem;">
          <div class="form-group">
            <label class="form-label">Subject (blank = all students)</label>
            <select id="ann-sub" class="form-input">
              <option value="">General / All Students</option>
              ${mySubjects.map(s => '<option value="' + s.code + '">' + s.name + '</option>').join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Title <span class="required">*</span></label>
            <input type="text" id="ann-title" class="form-input" placeholder="Announcement title…" required />
          </div>
          <div class="form-group">
            <label class="form-label">Message <span class="required">*</span></label>
            <textarea id="ann-body" class="form-input" rows="5" placeholder="Write your message…" style="resize:vertical;" required></textarea>
          </div>
          <button type="submit" class="btn-primary" style="background:linear-gradient(135deg,#10b981,#059669);">
            <i class="fa-solid fa-bullhorn"></i> Post Announcement
          </button>
        </form>
      </div>
      <div class="content-panel">
        <div class="panel-header">
          <h3 class="panel-title"><i class="fa-solid fa-list-ul"></i> Posted Announcements</h3>
          <span class="badge badge-cyan">${myAnnouncements.length} total</span>
        </div>
        <div style="display:flex;flex-direction:column;gap:1rem;">
          ${myAnnouncements.length === 0
            ? '<div class="empty-state-sm"><i class="fa-solid fa-bullhorn"></i> No announcements yet.</div>'
            : myAnnouncements.map(a =>
                '<div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:1rem;">' +
                '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:.5rem;">' +
                '<div><strong>' + a.title + '</strong>' +
                (a.subjectCode ? '<span class="badge badge-cyan" style="margin-left:.5rem;">' + a.subjectCode + '</span>' : '<span class="badge" style="margin-left:.5rem;background:rgba(255,255,255,0.08);">General</span>') +
                '</div><button class="btn-icon danger" onclick="deleteAnnouncement(' + a.id + ')"><i class="fa-solid fa-trash"></i></button></div>' +
                '<p style="color:var(--text-muted);font-size:.85rem;margin:0 0 .5rem;">' + a.body + '</p>' +
                '<span style="font-size:.75rem;color:var(--text-muted);">By ' + a.postedBy + ' &bull; ' + a.postedAt + '</span></div>'
              ).join('')}
        </div>
      </div>
    </div>`;

  document.getElementById('ann-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const subjectCode = document.getElementById('ann-sub').value || null;
    const title = document.getElementById('ann-title').value.trim();
    const body  = document.getElementById('ann-body').value.trim();
    if (!title || !body) { showToast('Fill in title and message.', 'error'); return; }
    LMS_DB.announcements.unshift({ id: Date.now(), subjectCode, title, body, postedBy: 'Dr. Helen Vance', postedAt: new Date().toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}) });
    saveLMSState();
    showToast('Announcement posted!', 'success');
    renderTeacherAnnouncementsView(document.getElementById('console-view-wrapper'));
  });
}

function deleteAnnouncement(id) {
  LMS_DB.announcements = LMS_DB.announcements.filter(a => a.id !== id);
  saveLMSState();
  showToast('Announcement deleted.', 'success');
  renderTeacherAnnouncementsView(document.getElementById('console-view-wrapper'));
}

// 10.6 Student Roster
function renderTeacherStudentRosterView(container) {
  let students = LMS_DB.students;
  if (activeSearchQuery) {
    students = students.filter(st => 
      st.name.toLowerCase().includes(activeSearchQuery) ||
      st.roll.toLowerCase().includes(activeSearchQuery) ||
      st.email.toLowerCase().includes(activeSearchQuery) ||
      st.dept.toLowerCase().includes(activeSearchQuery)
    );
  }

  container.innerHTML = `
    <section class="welcome-section">
      <div class="welcome-text">
        <span class="subtitle-badge" style="background:rgba(16,185,129,0.1);border-color:rgba(16,185,129,0.25);color:#34d399;">Teaching Console</span>
        <h2 class="welcome-title">Student Roster</h2>
        <p class="welcome-desc">Students enrolled in your subjects and their submission records.</p>
      </div>
    </section>
    <div class="content-panel">
      <div class="panel-header">
        <h3 class="panel-title"><i class="fa-solid fa-users"></i> Enrolled Students</h3>
        <span class="badge badge-cyan">${students.length} Students</span>
      </div>
      <div class="table-container">
        <table class="data-table">
          <thead><tr><th>#</th><th>Name</th><th>Roll Number</th><th>Email</th><th>Department</th><th>Year</th><th>Submissions</th></tr></thead>
          <tbody>
            ${students.map((st, i) => {
              const subs = LMS_DB.submissions.filter(s => s.studentRoll === st.roll).length;
              const initials = st.name.split(' ').map(n=>n[0]).join('').substring(0,2);
              return '<tr><td>' + (i+1) + '</td><td><div style="display:flex;align-items:center;gap:.75rem;"><div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#10b981,#059669);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:.8rem;color:#fff;flex-shrink:0;">' + initials + '</div><strong>' + st.name + '</strong></div></td><td><span class="badge badge-purple">' + st.roll + '</span></td><td style="font-size:.85rem;color:var(--text-muted);">' + st.email + '</td><td>' + st.dept + '</td><td>' + st.year + '</td><td>' + (subs > 0 ? '<span class="badge badge-cyan">' + subs + '</span>' : '<span class="badge">0</span>') + '</td></tr>';
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>`;
}

// 10.7 Teacher Settings
function renderTeacherSettingsView(container) {
  container.innerHTML = `
    <section class="welcome-section">
      <div class="welcome-text">
        <span class="subtitle-badge" style="background:rgba(16,185,129,0.1);border-color:rgba(16,185,129,0.25);color:#34d399;">Teaching Console</span>
        <h2 class="welcome-title">Account Settings</h2>
        <p class="welcome-desc">Manage your faculty profile and notification preferences.</p>
      </div>
    </section>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:1.5rem;">
      <div class="content-panel">
        <div class="panel-header"><h3 class="panel-title"><i class="fa-solid fa-id-card"></i> Faculty Profile</h3></div>
        <div style="display:flex;flex-direction:column;gap:1rem;">
          <div style="display:flex;align-items:center;gap:1rem;padding:1rem;background:rgba(16,185,129,0.06);border-radius:12px;border:1px solid rgba(16,185,129,0.15);">
            <div style="width:64px;height:64px;border-radius:50%;background:linear-gradient(135deg,#10b981,#059669);display:flex;align-items:center;justify-content:center;font-size:1.4rem;font-weight:700;color:#fff;">HV</div>
            <div><strong style="font-size:1.1rem;">Dr. Helen Vance</strong><br>
            <span style="color:var(--text-muted);font-size:.85rem;">Faculty — Computer Science</span><br>
            <span style="color:#34d399;font-size:.8rem;">h.vance@aura.edu</span></div>
          </div>
          <div class="form-group"><label class="form-label">Full Name</label><input type="text" class="form-input" value="Dr. Helen Vance" /></div>
          <div class="form-group"><label class="form-label">Email</label><input type="email" class="form-input" value="h.vance@aura.edu" /></div>
          <div class="form-group"><label class="form-label">Department</label><input type="text" class="form-input" value="Computer Science" readonly style="opacity:.6;cursor:not-allowed;" /></div>
          <button class="btn-primary" style="background:linear-gradient(135deg,#10b981,#059669);" onclick="showToast('Profile updated!','success')"><i class="fa-solid fa-check"></i> Save Changes</button>
        </div>
      </div>
      <div class="content-panel">
        <div class="panel-header"><h3 class="panel-title"><i class="fa-solid fa-bell"></i> Notifications</h3></div>
        <div style="display:flex;flex-direction:column;gap:.75rem;margin-bottom:1.5rem;">
          ${[['Email on new submissions',true],['Email on student questions',true],['Weekly digest',false],['System maintenance',true]].map(([l,c]) =>
            '<label style="display:flex;align-items:center;justify-content:space-between;padding:.75rem 1rem;background:rgba(255,255,255,.03);border-radius:10px;border:1px solid rgba(255,255,255,.07);cursor:pointer;"><span>' + l + '</span><input type="checkbox" ' + (c?'checked':'') + ' style="width:16px;height:16px;accent-color:#10b981;" /></label>'
          ).join('')}
        </div>
        <div class="panel-header"><h3 class="panel-title"><i class="fa-solid fa-lock"></i> Security</h3></div>
        <div class="form-group"><label class="form-label">New Password</label><input type="password" class="form-input" placeholder="Enter new password…" /></div>
        <div class="form-group"><label class="form-label">Confirm</label><input type="password" class="form-input" placeholder="Re-enter password…" /></div>
        <button class="btn-secondary" onclick="showToast('Password updated!','success')"><i class="fa-solid fa-key"></i> Change Password</button>
      </div>
    </div>`;
}

// 10.8 Student Materials View (student sees uploaded materials)
function renderStudentMaterialsView(container) {
  const courses = LMS_DB.studentCourses;
  const unitNames = ['Introduction &amp; Fundamentals','Core Concepts','Advanced Topics','Applications','Revision &amp; Assessment'];

  let html = `
    <section class="welcome-section">
      <div class="welcome-text">
        <span class="subtitle-badge" style="background:rgba(139,92,246,.1);border-color:rgba(139,92,246,.2);color:#c084fc;">Student Console</span>
        <h2 class="welcome-title">Study Materials</h2>
        <p class="welcome-desc">Access lecture notes, slides, and resources uploaded by your teachers.</p>
      </div>
    </section>`;

  courses.forEach(course => {
    const materials = LMS_DB.uploadedMaterials[course.code] || [];
    let unitBlocks = '';
    
    if (materials.length === 0) {
      unitBlocks = '<div class="empty-state-sm"><i class="fa-solid fa-folder-open"></i> No materials have been uploaded for this subject yet.</div>';
    } else {
      for (let u = 1; u <= 5; u++) {
        const files = materials.filter(m => m.unit === u);
        if (files.length === 0) continue;
        const rows = files.map(f =>
          '<div class="material-row"><div class="mat-icon ' + getMaterialColor(f.type) + '"><i class="fa-solid ' + getMaterialIcon(f.type) + '"></i></div><div class="mat-info"><span class="mat-title">' + f.title + '</span><span class="mat-meta">' + f.size + ' &bull; ' + f.uploadedAt + ' by ' + f.uploadedBy + '</span></div><div class="mat-actions"><a href="' + f.url + '" target="_blank" class="btn-icon" title="Open"><i class="fa-solid fa-arrow-up-right-from-square"></i></a></div></div>'
        ).join('');
        unitBlocks += '<div class="unit-block"><div class="unit-header" onclick="toggleUnit(this)"><div class="unit-title-wrap"><span class="unit-badge" style="background:rgba(139,92,246,.2);color:#c084fc;">Unit ' + u + '</span><span class="unit-name">Unit ' + u + ': ' + unitNames[u-1] + '</span></div><div style="display:flex;align-items:center;gap:.75rem;"><span class="badge badge-purple">' + files.length + ' file' + (files.length!==1?'s':'') + '</span><i class="fa-solid fa-chevron-down unit-chevron"></i></div></div><div class="unit-body"><div class="material-list">' + rows + '</div></div></div>';
      }
    }
    
    html += '<div class="content-panel" style="margin-bottom:1.5rem;"><div class="panel-header"><div><h3 class="panel-title" style="color:#c084fc;"><i class="fa-solid fa-book-open"></i> ' + course.name + '</h3><span style="font-size:.8rem;color:var(--text-muted);">' + course.code + ' &bull; ' + course.instructor + '</span></div></div><div class="unit-accordion">' + unitBlocks + '</div></div>';
  });

  container.innerHTML = html;
}

