/* ===== Employee Management System - script.js =====
   One shared script for all pages. Each page sets <body data-page="...">
   and the matching init function below runs automatically.
*/
"use strict";

/* ---------- Storage helpers ---------- */
const KEYS = {
  employees: "ems_employees",
  attendance: "ems_attendance",
  salary: "ems_salary"
};

function load(key) {
  try {
    const data = JSON.parse(localStorage.getItem(key));
    return Array.isArray(data) ? data : [];
  } catch (e) {
    return [];
  }
}

function save(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (e) {
    notify("Could not save data. Browser storage may be disabled.", "error");
    return false;
  }
}

/* ---------- Small utilities ---------- */
function $(id) {
  return document.getElementById(id);
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function today() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10); // YYYY-MM-DD in local time
}

function money(n) {
  return "Rs. " + Number(n).toLocaleString("en-IN");
}

function notify(text, type) {
  const box = $("msg");
  if (!box) return;
  box.textContent = text;
  box.className = "msg " + (type || "ok");
}

function findEmployee(id) {
  return load(KEYS.employees).find(function (e) { return e.id === id; });
}

/* Fill a <select> with employees. Returns true if there is at least one. */
function fillEmployeeSelect(select) {
  const employees = load(KEYS.employees);
  select.innerHTML = "";
  if (!employees.length) {
    const opt = document.createElement("option");
    opt.value = "";
    opt.textContent = "No employees yet - add one first";
    select.appendChild(opt);
    return false;
  }
  employees.forEach(function (e) {
    const opt = document.createElement("option");
    opt.value = e.id;
    opt.textContent = e.name + " (" + e.role + ")";
    select.appendChild(opt);
  });
  return true;
}

/* Draw table rows safely (textContent, never innerHTML). */
function renderRows(tbody, items, cellsFn, onDelete) {
  tbody.innerHTML = "";
  if (!items.length) {
    const tr = document.createElement("tr");
    const td = document.createElement("td");
    td.colSpan = 6;
    td.className = "empty";
    td.textContent = "No records yet.";
    tr.appendChild(td);
    tbody.appendChild(tr);
    return;
  }
  items.forEach(function (item) {
    const tr = document.createElement("tr");
    cellsFn(item).forEach(function (text) {
      const td = document.createElement("td");
      td.textContent = text;
      tr.appendChild(td);
    });
    const actionTd = document.createElement("td");
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "btn danger small";
    btn.textContent = "Delete";
    btn.addEventListener("click", function () { onDelete(item); });
    actionTd.appendChild(btn);
    tr.appendChild(actionTd);
    tbody.appendChild(tr);
  });
}

/* ---------- HOME (dashboard) ---------- */
function initHome() {
  const employees = load(KEYS.employees);
  const attendance = load(KEYS.attendance);
  const salary = load(KEYS.salary);
  const month = today().slice(0, 7);

  const presentToday = attendance.filter(function (a) {
    return a.date === today() && a.status === "Present";
  }).length;

  const salaryThisMonth = salary
    .filter(function (s) { return s.month === month; })
    .reduce(function (sum, s) { return sum + Number(s.amount); }, 0);

  $("statEmployees").textContent = employees.length;
  $("statPresent").textContent = presentToday;
  $("statSalary").textContent = money(salaryThisMonth);
}

/* ---------- ADD EMPLOYEE ---------- */
function initAdd() {
  $("employeeForm").addEventListener("submit", function (ev) {
    ev.preventDefault();
    const name = $("name").value.trim();
    const role = $("role").value.trim();
    const department = $("department").value.trim();

    if (!name || !role) {
      notify("Please enter both name and role.", "error");
      return;
    }

    const employees = load(KEYS.employees);
    employees.push({ id: uid(), name: name, role: role, department: department });
    if (save(KEYS.employees, employees)) {
      ev.target.reset();
      $("name").focus();
      notify(name + " was added successfully.", "ok");
    }
  });
}

/* ---------- EMPLOYEES LIST ---------- */
function initList() {
  const tbody = $("employeeBody");
  const search = $("search");

  function deleteEmployee(emp) {
    if (!confirm("Delete " + emp.name + " and their attendance and salary records?")) return;
    save(KEYS.employees, load(KEYS.employees).filter(function (x) { return x.id !== emp.id; }));
    save(KEYS.attendance, load(KEYS.attendance).filter(function (x) { return x.employeeId !== emp.id; }));
    save(KEYS.salary, load(KEYS.salary).filter(function (x) { return x.employeeId !== emp.id; }));
    draw();
  }

  function draw() {
    const q = search.value.trim().toLowerCase();
    const items = load(KEYS.employees).filter(function (e) {
      return (e.name + " " + e.role + " " + (e.department || "")).toLowerCase().includes(q);
    });
    renderRows(tbody, items, function (e) {
      return [e.name, e.role, e.department || "-"];
    }, deleteEmployee);
    $("count").textContent = items.length + (items.length === 1 ? " employee" : " employees");
  }

  search.addEventListener("input", draw);
  draw();
}

/* ---------- ATTENDANCE ---------- */
function initAttendance() {
  const select = $("employee");
  const tbody = $("attendanceBody");
  fillEmployeeSelect(select);
  $("date").value = today();

  function removeRecord(rec) {
    save(KEYS.attendance, load(KEYS.attendance).filter(function (x) { return x.id !== rec.id; }));
    draw();
  }

  function draw() {
    const items = load(KEYS.attendance).slice().reverse();
    renderRows(tbody, items, function (r) {
      return [r.date, r.name, r.status];
    }, removeRecord);
  }

  $("attendanceForm").addEventListener("submit", function (ev) {
    ev.preventDefault();
    const emp = findEmployee(select.value);
    const date = $("date").value;
    const status = $("status").value;

    if (!emp) { notify("Add an employee first.", "error"); return; }
    if (!date) { notify("Please choose a date.", "error"); return; }

    const records = load(KEYS.attendance);
    const duplicate = records.some(function (r) {
      return r.employeeId === emp.id && r.date === date;
    });
    if (duplicate) {
      notify("Attendance for " + emp.name + " on " + date + " is already saved.", "error");
      return;
    }

    records.push({ id: uid(), employeeId: emp.id, name: emp.name, date: date, status: status });
    if (save(KEYS.attendance, records)) {
      notify("Attendance saved.", "ok");
      draw();
    }
  });

  draw();
}

/* ---------- SALARY ---------- */
function initSalary() {
  const select = $("employee");
  const tbody = $("salaryBody");
  fillEmployeeSelect(select);
  $("month").value = today().slice(0, 7);

  function removeRecord(rec) {
    save(KEYS.salary, load(KEYS.salary).filter(function (x) { return x.id !== rec.id; }));
    draw();
  }

  function draw() {
    const items = load(KEYS.salary).slice().reverse();
    renderRows(tbody, items, function (s) {
      return [s.month, s.name, money(s.amount)];
    }, removeRecord);
    const total = items.reduce(function (sum, s) { return sum + Number(s.amount); }, 0);
    $("total").textContent = "Total paid: " + money(total);
  }

  $("salaryForm").addEventListener("submit", function (ev) {
    ev.preventDefault();
    const emp = findEmployee(select.value);
    const month = $("month").value;
    const amount = $("amount").value;

    if (!emp) { notify("Add an employee first.", "error"); return; }
    if (!month || amount === "" || Number(amount) < 0) {
      notify("Enter a valid month and amount.", "error");
      return;
    }

    const records = load(KEYS.salary);
    records.push({ id: uid(), employeeId: emp.id, name: emp.name, month: month, amount: Number(amount) });
    if (save(KEYS.salary, records)) {
      $("amount").value = "";
      notify("Salary record added.", "ok");
      draw();
    }
  });

  draw();
}

/* ---------- Page switcher (single-page app) ----------
   index.html holds one <template> per page. The URL hash picks which one
   is shown: #add, #list, #attendance, #salary (no hash = home).
*/
function showPage() {
  const pages = {
    home: initHome,
    add: initAdd,
    list: initList,
    attendance: initAttendance,
    salary: initSalary
  };
  let key = location.hash.replace("#", "");
  if (!pages[key]) key = "home";

  const tpl = document.getElementById("tpl-" + key);
  const view = $("view");
  view.innerHTML = "";
  view.appendChild(tpl.content.cloneNode(true));
  document.title = tpl.getAttribute("data-title") + " | Employee Management System";

  document.querySelectorAll("#nav a").forEach(function (a) {
    if (a.getAttribute("data-page") === key) a.setAttribute("aria-current", "page");
    else a.removeAttribute("aria-current");
  });

  pages[key]();
}

window.addEventListener("hashchange", showPage);
document.addEventListener("DOMContentLoaded", showPage);
