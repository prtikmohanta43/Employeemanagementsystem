# Employee Management System

A simple, responsive web app for managing employees, attendance and salary records. Built with plain **HTML, CSS and JavaScript**, with no frameworks, no backend and no database. All data is saved in your own browser.

## Live Demo

**[Dashboard | Employee Management System](https://employee-management-system1-three.vercel.app/)**

## Features

- **Dashboard** shows total employees, how many are present today, and salary paid this month
- **Add Employee** with name, role and an optional department
- **Employees List** with live search and delete (deleting an employee also removes their attendance and salary records)
- **Attendance** lets you pick an employee and a date, mark Present or Absent, and blocks duplicate entries for the same day
- **Salary** lets you record monthly salary per employee, with a running total
- **Responsive** layout that works on phones, tablets and desktops
- **Safe by design**: names are shown as plain text, so HTML typed into a field can't run, and storage errors are handled
- **Single-page navigation** between all sections, with no page reloads

## Tech Stack

| Part | Technology |
|------|------------|
| Structure | HTML5 |
| Styling | CSS3 (Flexbox, Grid, CSS variables) |
| Logic | Vanilla JavaScript (ES6) |
| Storage | Browser `localStorage` |
| Hosting | Vercel |

## Project Structure

```
Employee-management-system/
├── index.html    Layout, navigation and the five page templates
├── style.css     All styling (lime, black and white theme)
├── script.js     App logic: storage, forms, tables, dashboard and page switching
└── README.md     Project documentation
```

## How It Works

- `index.html` holds the header and one hidden `<template>` for each page.
- The part of the web address after `#` chooses the page: `#add`, `#list`, `#attendance` or `#salary`. With no `#`, the Dashboard shows.
- `script.js` copies the matching template into the page and runs that page's code.
- Records are saved in `localStorage` under these keys: `ems_employees`, `ems_attendance` and `ems_salary`.

## Getting Started

### Run locally

1. Clone the repository:
   ```bash
   git clone https://github.com/prathna7653-hue/Employee-management-system-.git
   ```
2. Open the folder.
3. Double-click `index.html` to open it in your browser. No installation or server is needed.

### Deploy

The project is plain static files, so it can be hosted for free on Vercel, Netlify or GitHub Pages. Upload the three files (`index.html`, `style.css`, `script.js`) and publish.

## Usage

1. Open **Add Employee** and save a few employees.
2. Go to **Attendance** and mark each person Present or Absent for a date.
3. Go to **Salary** and add a salary record for a month.
4. Return to the **Dashboard** to see the totals update.
5. Use **Employees** to search or remove people.

## Notes and Limitations

- Data is stored only in the browser you use. Clearing browser data erases it, and it does not sync between devices.
- There is no login, so this is meant for learning, demos and small personal use, not for real payroll data.

## Future Improvements

- Edit employee details
- Export records to CSV or PDF
- Login and user roles
- Monthly attendance reports and charts
- A real backend and database

## Author

**prathna7653-hue**
GitHub: [github.com/prathna7653-hue](https://github.com/prathna7653-hue)

## License

This project is open for learning and personal use.
