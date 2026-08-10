# customer-support-crm[README (1).md](https://github.com/user-attachments/files/30896097/README.1.md)
# Customer Support Ticket CRM System

A full-stack customer support CRM built on Google Apps Script and Google Sheets — enabling support teams to create, track, assign, and manage tickets through a centralized dashboard, without needing a dedicated backend or database.

**Live Demo:** https://script.google.com/macros/s/AKfycbzMPNUvAnn-MSiNr9DeZyOeWCVowXnaQtN3U2IQEwMF3rFddnwYIm0_0cTLpr4JIIWPfA/exec
	

## Screenshots



<!-- ![Dashboard view](screenshots/dashboard.png) -->
<img width="1912" height="897" alt="image" src="https://github.com/user-attachments/assets/349b2938-9f31-45a1-b094-1905deb6a932" />

<!-- ![Ticket creation](screenshots/create-ticket.png) -->
<img width="1915" height="910" alt="image" src="https://github.com/user-attachments/assets/70aff013-373f-4e89-827c-3ac6c4a3f57f" />

<!-- ![Filter and search](screenshots/filter.png) -->
<img width="1918" height="917" alt="image" src="https://github.com/user-attachments/assets/c269fd96-c9a7-4d97-a97d-87371ddb8772" />


## Features

- Centralized dashboard to create, track, and manage support tickets
- Ticket status tracking (Open / In Progress / Resolved / Closed)
- Team assignment and ownership per ticket
- Search and filter across ticket fields
- Dashboard analytics for ticket volume and status breakdown
- CSV export for reporting
- Order management tied to support tickets

## Tech Stack

- **Google Apps Script** — server-side logic and web app hosting
- **JavaScript** — client-side interactivity
- **HTML/CSS** — dashboard UI
- **Google Sheets** — data storage (tickets, assignments, order records)

## How It Works

The app is deployed as a Google Apps Script web app, using a Google Sheet as its data layer instead of a traditional database. This keeps the whole system dependency-free and easy to run — anyone with the script can redeploy it against their own Sheet in minutes.

## Running It Yourself

1. Create a Google Sheet matching the expected structure (see `/schema` if included, or the `Sheet` references in `Code.gs`).
2. In the Apps Script editor: **Deploy → New deployment → Web app**.
   - Execute as: **Me**
   - Who has access: **Anyone**
3. Copy the generated `/exec` URL — that's your live app.

## Author

**Mohit Chogale**
[GitHub](https://github.com/SOLOPANEL) · [LinkedIn](https://www.linkedin.com/in/mohit-chogale/)

