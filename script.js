// ================================
// 宮古島旅遊網站 - Script
// ================================

document.addEventListener('DOMContentLoaded', () => {

  // ---- Navbar scroll effect ----
  const navbar = document.querySelector('.navbar');
  const scrollTopBtn = document.querySelector('.scroll-top');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    if (window.scrollY > 500) {
      scrollTopBtn.classList.add('visible');
    } else {
      scrollTopBtn.classList.remove('visible');
    }
  });

  // ---- Scroll to top ----
  scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // ---- Mobile nav toggle ----
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');

  navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    const spans = navToggle.querySelectorAll('span');
    if (navLinks.classList.contains('open')) {
      spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
      spans[1].style.opacity = '0';
      spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
    } else {
      spans[0].style.transform = '';
      spans[1].style.opacity = '';
      spans[2].style.transform = '';
    }
  });

  // Close mobile nav on link click
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      const spans = navToggle.querySelectorAll('span');
      spans[0].style.transform = '';
      spans[1].style.opacity = '';
      spans[2].style.transform = '';
    });
  });

  // ---- Active nav highlighting ----
  const sections = document.querySelectorAll('section[id]');
  const navItems = document.querySelectorAll('.nav-links a');

  function highlightNav() {
    const scrollPos = window.scrollY + 150;
    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');

      if (scrollPos >= top && scrollPos < top + height) {
        navItems.forEach(item => {
          item.classList.remove('active');
          if (item.getAttribute('href') === '#' + id) {
            item.classList.add('active');
          }
        });
      }
    });
  }

  window.addEventListener('scroll', highlightNav);
  highlightNav();

  // ---- Scroll animations (Intersection Observer) ----
  const fadeUpElements = document.querySelectorAll('.fade-up');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  fadeUpElements.forEach(el => observer.observe(el));

  // ---- Smooth scroll for anchor links ----
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        const offset = 80;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });



  // ---- Flight Calendar ----
  (function() {
    // Flight data from STARLUX Airlines 2026
    const flightData = {
      tpe: {
        depart: {
          4: [7,9,14,16,21],
          5: [5,7,14,19,21,26],
          6: [1,8,15],
          7: [27],
          8: [3,9,10,17,23,24,26,30,31],
          9: [2,6,7,9,13,14,16,20,21,23,28],
          10: [4,5,7,11,12,14,18,19,21]
        },
        return: {
          4: [16,23],
          5: [7,21,28],
          6: [8,10,17],
          7: [],
          8: [3,10,17,24,31],
          9: [7,9,13,14,16,20,21,23],
          10: [3,4,7,14,17,18,19,21,24]
        },
        goTime: ['10:40','13:00','1小時20分鐘'],
        retTime: ['14:00','14:10','1小時10分鐘'],
        codeFrom: 'TPE'
      },
      rmq: {
        depart: {
          4: [8,12,13,15,19,20,26],
          5: [3,4,10,11,17,18,25,31],
          6: [1,3,7,8,15,21,22],
          7: [],
          8: [2,3,9,10,16,17,23,24,30,31],
          9: [2,4,6,7,9,11,13,14,16,18,20,21,23,28],
          10: [4,5,7,11,12,14,18,19,21]
        },
        return: {
          4: [10,15,17,19,20,22,24,29],
          5: [6,8,13,20,22,29],
          6: [3,5,10,12,17,19,26],
          7: [],
          8: [3,5,7,9,10,12,14,16,17,19,21,24,26,28,30,31],
          9: [4,6,7,9,11,13,14,16,18,20,21,23,25],
          10: [3,4,7,9,14,16,18,19,21,23]
        },
        goTime: ['07:20','09:40','1小時20分鐘'],
        retTime: ['10:40','11:00','1小時20分鐘'],
        codeFrom: 'RMQ'
      }
    };

    // Taiwan 2026 national holidays (weekday-only, weekends auto-detected)
    const nationalHolidays = [
      '2026-05-01', // 勞動節
      '2026-06-19', // 端午節
      '2026-09-25', // 中秋節
    ];

    function isWeekend(year, month, day) {
      const d = new Date(year, month - 1, day);
      const dow = d.getDay();
      return dow === 0 || dow === 6;
    }

    function isHoliday(year, month, day) {
      if (isWeekend(year, month, day)) return true;
      const key = year + '-' + String(month).padStart(2,'0') + '-' + String(day).padStart(2,'0');
      return nationalHolidays.includes(key);
    }

    function isPast(year, month, day) {
      const today = new Date();
      today.setHours(0,0,0,0);
      const d = new Date(year, month - 1, day);
      return d < today;
    }

    function getDaysInMonth(year, month) {
      return new Date(year, month, 0).getDate();
    }

    function getFirstDayOfWeek(year, month) {
      // 0=Sun, we want Mon=0
      const d = new Date(year, month - 1, 1).getDay();
      return d === 0 ? 6 : d - 1;
    }

    const monthNames = ['','1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'];

    let currentCity = 'tpe';
    let currentType = 'depart';

    function renderCalendars() {
      const container = document.getElementById('cal-grid-container');
      if (!container) return;

      const data = flightData[currentCity][currentType];
      const months = [4,5,6,7,8,9,10];
      const year = 2026;

      let html = '';

      months.forEach(month => {
        const daysInMonth = getDaysInMonth(year, month);
        const firstDay = getFirstDayOfWeek(year, month);
        const flightDays = data[month] || [];

        html += '<div class="cal-month">';
        html += '<div class="cal-month-title">' + year + '年 ' + monthNames[month] + '</div>';
        html += '<div class="cal-weekdays">';
        ['一','二','三','四','五','六','日'].forEach(d => {
          html += '<div class="cal-weekday">' + d + '</div>';
        });
        html += '</div>';
        html += '<div class="cal-days">';

        // empty cells before first day
        for (let i = 0; i < firstDay; i++) {
          html += '<div class="cal-day empty"></div>';
        }

        for (let day = 1; day <= daysInMonth; day++) {
          const hasFlight = flightDays.includes(day);
          const past = isPast(year, month, day);
          const holiday = isHoliday(year, month, day);

          let cls = 'cal-day';
          let title = month + '/' + day;

          if (hasFlight) {
            if (past && holiday) {
              cls += ' past-holiday-flight';
              title += ' (假日・已過期)';
            } else if (past) {
              cls += ' past-flight';
              title += ' (已過期)';
            } else if (holiday) {
              cls += ' holiday-flight';
              title += ' (假日)';
            } else {
              cls += ' future-flight';
            }
          } else {
            if (holiday) {
              cls += ' no-flight holiday-no-flight';
            } else {
              cls += ' no-flight';
            }
          }

          html += '<div class="' + cls + '" title="' + title + '">' + day + '</div>';
        }

        html += '</div></div>';
      });

      container.innerHTML = html;
    }

    function updateFlightInfo() {
      const info = flightData[currentCity];
      // Departure flight
      const goTimes = document.querySelectorAll('#flight-route-go .route-time');
      if (goTimes.length >= 2) {
        goTimes[0].textContent = info.goTime[0];
        goTimes[1].textContent = info.goTime[1];
      }
      const goDur = document.getElementById('route-duration-go');
      if (goDur) goDur.textContent = info.goTime[2];

      // Return flight
      const retDepart = document.getElementById('return-depart-time');
      const retArrive = document.getElementById('return-arrive-time');
      const retDur = document.getElementById('route-duration-return');
      if (retDepart) retDepart.textContent = info.retTime[0];
      if (retArrive) retArrive.textContent = info.retTime[1];
      if (retDur) retDur.textContent = info.retTime[2];

      // Codes
      const codeFrom = document.getElementById('route-code-from');
      const codeTo = document.getElementById('route-code-to');
      if (codeFrom) codeFrom.textContent = info.codeFrom;
      if (codeTo) codeTo.textContent = info.codeFrom;
    }

    // City toggle
    document.querySelectorAll('.flight-toggle-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        document.querySelectorAll('.flight-toggle-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        currentCity = this.dataset.city;
        updateFlightInfo();
        renderCalendars();
      });
    });

    // Type toggle
    document.querySelectorAll('.type-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        document.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        currentType = this.dataset.type;
        renderCalendars();
      });
    });

    // Initial render
    updateFlightInfo();
    renderCalendars();
  })();

});
