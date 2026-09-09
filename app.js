/* =========================================================
   PLANNING DASHBOARD LOGIC
========================================================= */


/* =========================================================
   DATE UTILITIES
========================================================= */

function getTodayString() {

  const date = new Date();

  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}


const todayString = getTodayString();


function formatDate(dateString) {

  if (!dateString) {
    return "";
  }

  const date = new Date(
    `${dateString}T00:00:00`
  );

  return date.toLocaleDateString(
    undefined,
    {
      weekday: "short",
      month: "short",
      day: "numeric"
    }
  );
}


function formatTime(timeString) {

  if (!timeString) {
    return "";
  }

  const [hours, minutes] =
    timeString.split(":");

  const date = new Date();

  date.setHours(
    Number(hours),
    Number(minutes),
    0,
    0
  );

  return date.toLocaleTimeString(
    undefined,
    {
      hour: "numeric",
      minute: "2-digit"
    }
  );
}


/* =========================================================
   CURRENT DATE
========================================================= */

function renderCurrentDate() {

  const currentDate =
    document.getElementById("currentDate");

  if (!currentDate) {
    return;
  }

  currentDate.textContent =
    new Date().toLocaleDateString(
      undefined,
      {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric"
      }
    );
}


/* =========================================================
   APPLICATION DATA
========================================================= */

let tasks =
  loadData("tasks", []);

let events =
  loadData("events", []);

let reminders =
  loadData("reminders", []);

let notes =
  localStorage.getItem("notes") || "";

let currentFilter = "today";


/* =========================================================
   LOCAL STORAGE
========================================================= */

function loadData(key, fallback) {

  try {

    const stored =
      localStorage.getItem(key);

    if (!stored) {
      return fallback;
    }

    const parsed =
      JSON.parse(stored);

    return Array.isArray(parsed)
      ? parsed
      : fallback;

  } catch (error) {

    console.error(
      `Could not load ${key}:`,
      error
    );

    return fallback;
  }
}


function saveData(key, data) {

  try {

    localStorage.setItem(
      key,
      JSON.stringify(data)
    );

  } catch (error) {

    console.error(
      `Could not save ${key}:`,
      error
    );
  }
}


function saveTasks() {
  saveData("tasks", tasks);
}


function saveEvents() {
  saveData("events", events);
}


function saveReminders() {
  saveData("reminders", reminders);
}


/* =========================================================
   NAVIGATION
========================================================= */

function showView(viewName) {

  const views =
    document.querySelectorAll(".app-view");

  views.forEach(view => {

    view.classList.remove("active");

  });


  const selectedView =
    document.getElementById(
      `${viewName}View`
    );

  if (selectedView) {

    selectedView.classList.add("active");

  }


  const navButtons =
    document.querySelectorAll(".nav-button");

  navButtons.forEach(button => {

    button.classList.toggle(
      "active",
      button.dataset.view === viewName
    );

  });


  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });


  renderDashboard();

}


/* =========================================================
   QUICK ADD
========================================================= */

function focusQuickAdd() {

  showView("tasks");

  const input =
    document.getElementById("taskInput");

  if (input) {

    setTimeout(() => {

      input.focus();

    }, 100);

  }

}


/* =========================================================
   TASKS
========================================================= */


/* ADD TASK */

function addTask() {

  const input =
    document.getElementById("taskInput");

  const dateInput =
    document.getElementById("taskDate");

  const priorityInput =
    document.getElementById("taskPriority");


  if (!input) {
    return;
  }


  const text =
    input.value.trim();


  if (!text) {

    input.focus();

    return;

  }


  const date =
    dateInput.value || todayString;


  const priority =
    priorityInput.value || "medium";


  const task = {

    id: Date.now(),

    text,

    date,

    priority,

    completed: false,

    createdAt:
      new Date().toISOString()

  };


  tasks.push(task);

  saveTasks();


  input.value = "";

  dateInput.value = "";

  priorityInput.value = "medium";


  renderAll();

  input.focus();

}


/* TOGGLE TASK */

function toggleTask(id) {

  const task =
    tasks.find(
      task => task.id === id
    );


  if (!task) {
    return;
  }


  task.completed =
    !task.completed;


  saveTasks();

  renderAll();

}


/* DELETE TASK */

function deleteTask(id) {

  tasks =
    tasks.filter(
      task => task.id !== id
    );


  saveTasks();

  renderAll();

}


/* FILTER TASKS */

function setFilter(filter) {

  currentFilter = filter;


  document
    .querySelectorAll(".filter-button")
    .forEach(button => {

      button.classList.remove("active");

    });


  const filterButton =
    document.getElementById(
      `${filter}Filter`
    );


  if (filterButton) {

    filterButton.classList.add("active");

  }


  renderTasks();

}


/* GET FILTERED TASKS */

function getFilteredTasks() {

  if (currentFilter === "today") {

    return tasks.filter(
      task =>
        task.date === todayString
    );

  }


  if (currentFilter === "upcoming") {

    return tasks.filter(
      task =>
        task.date > todayString
    );

  }


  return [...tasks];

}


/* SORT TASKS */

function sortTasks(taskList) {

  const priorityOrder = {
    high: 1,
    medium: 2,
    low: 3
  };


  return [...taskList].sort(
    (a, b) => {

      if (a.completed !== b.completed) {

        return a.completed
          ? 1
          : -1;

      }


      if (a.date !== b.date) {

        return a.date.localeCompare(
          b.date
        );

      }


      return (
        priorityOrder[a.priority] -
        priorityOrder[b.priority]
      );

    }
  );

}


/* RENDER TASKS */

function renderTasks() {

  const taskList =
    document.getElementById("taskList");


  if (!taskList) {
    return;
  }


  const filteredTasks =
    sortTasks(
      getFilteredTasks()
    );


  if (filteredTasks.length === 0) {

    taskList.innerHTML = `
      <div class="empty-state">
        <h3>No tasks found</h3>
        <p>There are no tasks in this view.</p>
      </div>
    `;

    return;

  }


  taskList.innerHTML = "";


  filteredTasks.forEach(task => {

    const element =
      createTaskElement(task);

    taskList.appendChild(element);

  });

}


/* CREATE TASK ELEMENT */

function createTaskElement(task) {

  const div =
    document.createElement("div");


  div.className = "task";


  const checkbox =
    document.createElement("input");

  checkbox.type = "checkbox";

  checkbox.checked =
    task.completed;

  checkbox.setAttribute(
    "aria-label",
    `Complete ${task.text}`
  );


  checkbox.addEventListener(
    "change",
    () => toggleTask(task.id)
  );


  const content =
    document.createElement("div");

  content.className =
    "task-content";


  const title =
    document.createElement("div");

  title.className =
    "task-title";


  if (task.completed) {

    title.classList.add(
      "completed"
    );

  }


  title.textContent =
    task.text;


  const meta =
    document.createElement("div");

  meta.className =
    "task-meta";


  const date =
    document.createTextNode(
      formatDate(task.date)
    );


  const separator =
    document.createTextNode(
      " • "
    );


  const priority =
    document.createElement("span");

  priority.className =
    `priority ${task.priority}`;

  priority.textContent =
    task.priority;


  meta.appendChild(date);

  meta.appendChild(separator);

  meta.appendChild(priority);


  content.appendChild(title);

  content.appendChild(meta);


  const deleteButton =
    document.createElement("button");

  deleteButton.type =
    "button";

  deleteButton.className =
    "delete-button";

  deleteButton.textContent =
    "Delete";

  deleteButton.setAttribute(
    "aria-label",
    `Delete ${task.text}`
  );


  deleteButton.addEventListener(
    "click",
    () => deleteTask(task.id)
  );


  div.appendChild(checkbox);

  div.appendChild(content);

  div.appendChild(deleteButton);


  return div;

}


/* =========================================================
   NOTES
========================================================= */

function initializeNotes() {

  const notesElement =
    document.getElementById("notes");


  if (!notesElement) {
    return;
  }


  notesElement.value = notes;


  notesElement.addEventListener(
    "input",
    () => {

      notes =
        notesElement.value;

      localStorage.setItem(
        "notes",
        notes
      );


      const saveMessage =
        document.getElementById(
          "saveMessage"
        );


      if (saveMessage) {

        saveMessage.textContent =
          "Saved";

      }


      renderDashboardNotes();

    }
  );

}


/* =========================================================
   EVENTS
========================================================= */


/* SHOW EVENT FORM */

function showEventForm() {

  const form =
    document.getElementById(
      "eventFormCard"
    );


  if (!form) {
    return;
  }


  form.hidden = false;


  const title =
    document.getElementById(
      "eventTitle"
    );


  if (title) {
    title.focus();
  }

}


/* HIDE EVENT FORM */

function hideEventForm() {

  const form =
    document.getElementById(
      "eventFormCard"
    );


  if (form) {
    form.hidden = true;
  }

}


/* ADD EVENT */

function addEvent() {

  const title =
    document.getElementById(
      "eventTitle"
    ).value.trim();


  const date =
    document.getElementById(
      "eventDate"
    ).value;


  const startTime =
    document.getElementById(
      "eventStartTime"
    ).value;


  const endTime =
    document.getElementById(
      "eventEndTime"
    ).value;


  const description =
    document.getElementById(
      "eventDescription"
    ).value.trim();


  if (!title || !date) {
    return;
  }


  events.push({

    id: Date.now(),

    title,

    date,

    startTime,

    endTime,

    description,

    createdAt:
      new Date().toISOString()

  });


  saveEvents();


  document
    .getElementById("eventForm")
    .reset();


  hideEventForm();

  renderAll();

}


/* DELETE EVENT */

function deleteEvent(id) {

  events =
    events.filter(
      event => event.id !== id
    );


  saveEvents();

  renderAll();

}


/* SORT EVENTS */

function sortEvents(eventList) {

  return [...eventList].sort(
    (a, b) => {

      const first =
        `${a.date} ${a.startTime || "00:00"}`;

      const second =
        `${b.date} ${b.startTime || "00:00"}`;


      return first.localeCompare(
        second
      );

    }
  );

}


/* RENDER EVENTS */

function renderEvents() {

  const eventList =
    document.getElementById(
      "eventList"
    );


  if (!eventList) {
    return;
  }


  const sortedEvents =
    sortEvents(events);


  if (sortedEvents.length === 0) {

    eventList.innerHTML = `
      <div class="empty-state">
        <h3>No events yet</h3>
        <p>Add an event to start building your schedule.</p>
      </div>
    `;

    return;

  }


  eventList.innerHTML = "";


  sortedEvents.forEach(event => {

    const element =
      createEventElement(event);

    eventList.appendChild(element);

  });

}


/* CREATE EVENT ELEMENT */

function createEventElement(event) {

  const div =
    document.createElement("div");

  div.className =
    "event";


  const content =
    document.createElement("div");

  content.className =
    "event-content";


  const title =
    document.createElement("h3");

  title.textContent =
    event.title;


  const meta =
    document.createElement("div");

  meta.className =
    "event-meta";


  let timeText =
    formatDate(event.date);


  if (event.startTime) {

    timeText +=
      ` • ${formatTime(event.startTime)}`;

  }


  if (event.endTime) {

    timeText +=
      ` – ${formatTime(event.endTime)}`;

  }


  meta.textContent =
    timeText;


  content.appendChild(title);

  content.appendChild(meta);


  if (event.description) {

    const description =
      document.createElement("p");

    description.textContent =
      event.description;

    content.appendChild(
      description
    );

  }


  const deleteButton =
    document.createElement("button");

  deleteButton.type =
    "button";

  deleteButton.className =
    "delete-button";

  deleteButton.textContent =
    "Delete";


  deleteButton.addEventListener(
    "click",
    () => deleteEvent(event.id)
  );


  div.appendChild(content);

  div.appendChild(deleteButton);


  return div;

}


/* =========================================================
   REMINDERS
========================================================= */


/* SHOW REMINDER FORM */

function showReminderForm() {

  const form =
    document.getElementById(
      "reminderFormCard"
    );


  if (!form) {
    return;
  }


  form.hidden = false;


  const title =
    document.getElementById(
      "reminderTitle"
    );


  if (title) {
    title.focus();
  }

}


/* HIDE REMINDER FORM */

function hideReminderForm() {

  const form =
    document.getElementById(
      "reminderFormCard"
    );


  if (form) {
    form.hidden = true;
  }

}


/* ADD REMINDER */

function addReminder() {

  const title =
    document.getElementById(
      "reminderTitle"
    ).value.trim();


  const date =
    document.getElementById(
      "reminderDate"
    ).value;


  const time =
    document.getElementById(
      "reminderTime"
    ).value;


  if (!title || !date) {
    return;
  }


  reminders.push({

    id: Date.now(),

    title,

    date,

    time,

    completed: false,

    createdAt:
      new Date().toISOString()

  });


  saveReminders();


  document
    .getElementById("reminderForm")
    .reset();


  hideReminderForm();

  renderAll();

}


/* TOGGLE REMINDER */

function toggleReminder(id) {

  const reminder =
    reminders.find(
      reminder =>
        reminder.id === id
    );


  if (!reminder) {
    return;
  }


  reminder.completed =
    !reminder.completed;


  saveReminders();

  renderAll();

}


/* DELETE REMINDER */

function deleteReminder(id) {

  reminders =
    reminders.filter(
      reminder =>
        reminder.id !== id
    );


  saveReminders();

  renderAll();

}


/* SORT REMINDERS */

function sortReminders(reminderList) {

  return [...reminderList].sort(
    (a, b) => {

      const first =
        `${a.date} ${a.time || "00:00"}`;

      const second =
        `${b.date} ${b.time || "00:00"}`;


      return first.localeCompare(
        second
      );

    }
  );

}


/* RENDER REMINDERS */

function renderReminders() {

  const reminderList =
    document.getElementById(
      "reminderList"
    );


  if (!reminderList) {
    return;
  }


  const sortedReminders =
    sortReminders(reminders);


  if (sortedReminders.length === 0) {

    reminderList.innerHTML = `
      <div class="empty-state">
        <h3>No reminders</h3>
        <p>Add a reminder when something needs your attention later.</p>
      </div>
    `;

    return;

  }


  reminderList.innerHTML = "";


  sortedReminders.forEach(
    reminder => {

      const element =
        createReminderElement(
          reminder
        );

      reminderList.appendChild(
        element
      );

    }
  );

}


/* CREATE REMINDER ELEMENT */

function createReminderElement(
  reminder
) {

  const div =
    document.createElement("div");

  div.className =
    "reminder";


  const checkbox =
    document.createElement("input");

  checkbox.type =
    "checkbox";

  checkbox.checked =
    reminder.completed;


  checkbox.setAttribute(
    "aria-label",
    `Complete reminder ${reminder.title}`
  );


  checkbox.addEventListener(
    "change",
    () =>
      toggleReminder(
        reminder.id
      )
  );


  const content =
    document.createElement("div");

  content.className =
    "reminder-content";


  const title =
    document.createElement("div");

  title.className =
    "reminder-title";


  if (reminder.completed) {

    title.classList.add(
      "completed"
    );

  }


  title.textContent =
    reminder.title;


  const meta =
    document.createElement("div");

  meta.className =
    "reminder-meta";


  let reminderText =
    formatDate(reminder.date);


  if (reminder.time) {

    reminderText +=
      ` • ${formatTime(reminder.time)}`;

  }


  meta.textContent =
    reminderText;


  content.appendChild(title);

  content.appendChild(meta);


  const deleteButton =
    document.createElement("button");

  deleteButton.type =
    "button";

  deleteButton.className =
    "delete-button";

  deleteButton.textContent =
    "Delete";


  deleteButton.addEventListener(
    "click",
    () =>
      deleteReminder(
        reminder.id
      )
  );


  div.appendChild(checkbox);

  div.appendChild(content);

  div.appendChild(deleteButton);


  return div;

}


/* =========================================================
   DASHBOARD
========================================================= */

function renderDashboard() {

  renderDashboardStats();

  renderDashboardTasks();

  renderDashboardEvents();

  renderDashboardReminders();

  renderDashboardNotes();

}


/* DASHBOARD STATISTICS */

function renderDashboardStats() {

  const todayTasks =
    tasks.filter(
      task =>
        task.date === todayString
    );


  const completedTasks =
    todayTasks.filter(
      task =>
        task.completed
    );


  const upcomingTasks =
    tasks.filter(
      task =>
        task.date > todayString &&
        !task.completed
    );


  const activeReminders =
    reminders.filter(
      reminder =>
        !reminder.completed
    );


  setText(
    "taskCount",
    todayTasks.length
  );


  setText(
    "completedTaskCount",
    completedTasks.length
  );


  setText(
    "upcomingCount",
    upcomingTasks.length
  );


  setText(
    "reminderCount",
    activeReminders.length
  );

}


/* DASHBOARD TASKS */

function renderDashboardTasks() {

  const container =
    document.getElementById(
      "dashboardTaskList"
    );


  if (!container) {
    return;
  }


  const todayTasks =
    sortTasks(
      tasks.filter(
        task =>
          task.date === todayString
      )
    );


  if (todayTasks.length === 0) {

    container.innerHTML = `
      <div class="empty-state">
        <h3>No tasks today</h3>
        <p>Your task list is clear.</p>
      </div>
    `;

    return;

  }


  container.innerHTML = "";


  todayTasks
    .slice(0, 5)
    .forEach(task => {

      container.appendChild(
        createTaskElement(task)
      );

    });

}


/* DASHBOARD EVENTS */

function renderDashboardEvents() {

  const container =
    document.getElementById(
      "dashboardEventList"
    );


  if (!container) {
    return;
  }


  const upcomingEvents =
    sortEvents(
      events.filter(
        event =>
          event.date >= todayString
      )
    );


  if (upcomingEvents.length === 0) {

    container.innerHTML = `
      <div class="empty-state">
        <h3>No upcoming events</h3>
        <p>Your calendar is clear.</p>
      </div>
    `;

    return;

  }


  container.innerHTML = "";


  upcomingEvents
    .slice(0, 5)
    .forEach(event => {

      container.appendChild(
        createEventElement(event)
      );

    });

}


/* DASHBOARD REMINDERS */

function renderDashboardReminders() {

  const container =
    document.getElementById(
      "dashboardReminderList"
    );


  if (!container) {
    return;
  }


  const activeReminders =
    sortReminders(
      reminders.filter(
        reminder =>
          !reminder.completed
      )
    );


  if (activeReminders.length === 0) {

    container.innerHTML = `
      <div class="empty-state">
        <h3>No reminders</h3>
        <p>You're all caught up.</p>
      </div>
    `;

    return;

  }


  container.innerHTML = "";


  activeReminders
    .slice(0, 5)
    .forEach(reminder => {

      container.appendChild(
        createReminderElement(
          reminder
        )
      );

    });

}


/* DASHBOARD NOTES */

function renderDashboardNotes() {

  const container =
    document.getElementById(
      "dashboardNoteList"
    );


  if (!container) {
    return;
  }


  const hasNotes =
    notes.trim().length > 0;


  if (!hasNotes) {

    container.innerHTML = `
      <div class="empty-state">
        <h3>No notes yet</h3>
        <p>Start capturing your thoughts.</p>
      </div>
    `;

    return;

  }


  const preview =
    notes
      .trim()
      .replace(/\s+/g, " ")
      .slice(0, 250);


  container.innerHTML = "";


  const note =
    document.createElement("div");

  note.className =
    "note-preview";


  const paragraph =
    document.createElement("p");

  paragraph.textContent =
    preview +
    (notes.trim().length > 250
      ? "..."
      : "");


  note.appendChild(
    paragraph
  );


  container.appendChild(note);

}


/* =========================================================
   FORM HELPERS
========================================================= */

function setDefaultFormDates() {

  const taskDate =
    document.getElementById(
      "taskDate"
    );


  const eventDate =
    document.getElementById(
      "eventDate"
    );


  const reminderDate =
    document.getElementById(
      "reminderDate"
    );


  if (taskDate) {
    taskDate.value = todayString;
  }


  if (eventDate) {
    eventDate.value = todayString;
  }


  if (reminderDate) {
    reminderDate.value =
      todayString;
  }

}


/* =========================================================
   GENERAL HELPERS
========================================================= */

function setText(id, value) {

  const element =
    document.getElementById(id);


  if (element) {

    element.textContent =
      value;

  }

}


/* =========================================================
   RENDER EVERYTHING
========================================================= */

function renderAll() {

  renderTasks();

  renderEvents();

  renderReminders();

  renderDashboard();

}


/* =========================================================
   INITIALIZE APPLICATION
========================================================= */

function initializeApp() {

  renderCurrentDate();

  initializeNotes();

  setDefaultFormDates();

  renderAll();

}


/* =========================================================
   START
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  initializeApp
);
