document.addEventListener("DOMContentLoaded", () => {
  const today = new Date();
  const formattedToday = formatDate(today);
  loadTimetableForToday(formattedToday);
  generateCalendar();

  const settingsBtn = document.getElementById("settings-btn");
  const settingsPopup = document.getElementById("settings-popup");
  const closeBtn = document.querySelector(".close-btn");
  const darkModeToggle = document.getElementById("dark-mode-toggle");
  const saveSettingsBtn = document.getElementById("save-settings-btn");

  settingsBtn.addEventListener("click", () => {
    settingsPopup.style.display = "block";
  });

  closeBtn.addEventListener("click", () => {
    settingsPopup.style.display = "none";
  });

  window.addEventListener("click", event => {
    if (event.target === settingsPopup) {
      settingsPopup.style.display = "none";
    }
  });

  darkModeToggle.addEventListener("change", () => {
    if (darkModeToggle.checked) {
      document.body.classList.add("dark-mode");
      localStorage.setItem("darkMode", "enabled");
    } else {
      document.body.classList.remove("dark-mode");
      localStorage.setItem("darkMode", "disabled");
    }
    generateCalendar(); // Regenerate the calendar to apply the correct styles
  });

  saveSettingsBtn.addEventListener("click", () => {
    const period1 = document.getElementById("period1").value;
    const period2 = document.getElementById("period2").value;
    const period3 = document.getElementById("period3").value;
    const period4 = document.getElementById("period4").value;

    const timetable = {
      period1: period1,
      period2: period2,
      period3: period3,
      period4: period4,
    };

    localStorage.setItem("timetable", JSON.stringify(timetable));
    loadTimetableForToday(formattedToday); // Reload timetable for today
    settingsPopup.style.display = "none";
  });

  if (localStorage.getItem("darkMode") === "enabled") {
    darkModeToggle.checked = true;
    document.body.classList.add("dark-mode");
  }
});

function formatDate(date) {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const year = date.getFullYear();
  return `${year}-${month < 10 ? '0' + month : month}-${day < 10 ? '0' + day : day}`;
}

function formatMonthDay(date) {
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const month = date.getMonth();
  const day = date.getDate();
  return day === 1 ? `${monthNames[month]}` : `${monthNames[month]} ${day}`;
}

function getDayType(date) {
  const startDate = new Date(localStorage.getItem("startDate"));
  const currentDate = new Date(date);
  const diffTime = Math.abs(currentDate - startDate);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  return diffDays % 2 === 0 ? 'Day 1' : 'Day 2';
}

function displayDayType(date, isToday = true) {
  const dayType = getDayType(date);
  const displayDate = formatMonthDay(new Date(date));
  if (isToday) {
    document.getElementById("day-indicator").textContent = `Today is ${dayType}`;
  } else {
    document.getElementById("day-indicator").textContent = `${displayDate} is ${dayType}`;
  }
}

function loadTimetable(date) {
  const timetable = JSON.parse(localStorage.getItem("timetable"));

  if (timetable) {
    const timetableItems = document.getElementById("timetable-items");

    const dayType = getDayType(date);
    let period3 = timetable.period3;
    let period4 = timetable.period4;

    if (dayType === 'Day 2') {
      [period3, period4] = [period4, period3];
    }

    timetableItems.innerHTML = `
      <div>Period 1: ${timetable.period1}</div>
      <div>Period 2: ${timetable.period2}</div>
      <div>Period 3: ${period3}</div>
      <div>Period 4: ${period4}</div>
    `;

    console.log(`Timetable for ${date}: Period 1 - ${timetable.period1}, Period 2 - ${timetable.period2}, Period 3 - ${period3}, Period 4 - ${period4}`);
  }
}

function generateCalendar() {
  const calendarDiv = document.getElementById("calendar");
  const currentDate = new Date();
  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();

  const monthDays = new Date(year, month + 1, 0).getDate();
  let calendarHTML = "<table><thead><tr><th>Sun</th><th>Mon</th><th>Tue</th><th>Wed</th><th>Thu</th><th>Fri</th><th>Sat</th></tr></thead><tbody><tr>";

  // Get the day of the week the month starts on
  const firstDay = new Date(year, month, 1).getDay();

  // Fill in the blank days at the start of the month
  for (let i = 0; i < firstDay; i++) {
    calendarHTML += "<td></td>";
  }

  for (let i = 1; i <= monthDays; i++) {
    const date = new Date(year, month, i);
    const dayType = getDayType(formatDate(date));
    calendarHTML += `<td class="${dayType.toLowerCase().replace(' ', '')}" data-date="${formatDate(date)}">${i}<br>(${dayType})</td>`;
    if ((i + firstDay) % 7 === 0) {
      calendarHTML += "</tr><tr>";
    }
  }
  calendarHTML += "</tr></tbody></table>";

  calendarDiv.innerHTML = calendarHTML;

  // Add click event listeners to calendar days
  document.querySelectorAll(".calendar-container td").forEach(day => {
    day.addEventListener("click", () => {
      const date = day.getAttribute("data-date");
      displayTimetableForDate(date);
    });
  });
}

function loadTimetableForToday(date) {
  displayDayType(date, true); // Display "Today is"
  loadTimetable(date); // Load the timetable for today
}

function displayTimetableForDate(date) {
  const dayType = getDayType(new Date(date));
  const displayDate = new Date(date);
  displayDate.setDate(displayDate.getDate() + 1); // Add 1 to the date for title

  document.getElementById("day-indicator").textContent = `${formatMonthDay(displayDate)} is ${dayType}`;

  loadTimetable(date); // Load the timetable for the selected date
}