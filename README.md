<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# SMANESI Olympiad Club (SOC) Attendance Website

This is the official attendance website for the SMANESI Olympiad Club (SOC).

## Features

- Member attendance tracking
- Admin dashboard with summary statistics
- User management for admins (add, edit, delete, CSV upload)
- Olympiad field integration

## Run Locally

**Prerequisites:** Node.js

1.  Install dependencies:
    `npm install`
2.  Run the app:
    `npm run dev`

## Admin Usage

### Logging In

To log in as an admin, use the following credentials:

-   **Email:** admin@soc.com
-   **Password:** password

### Managing Users

Admins can manage users from the "Manage Users" page, accessible from the dashboard.

#### Adding a User Manually

1.  Navigate to the "Manage Users" page.
2.  Fill out the "Add New User" form with the user's information.
3.  Click the "Add User" button.

#### Adding Users via CSV

1.  Create a CSV file with the following columns: `full_name`, `email`, `password`, `role`, `field`.
2.  Navigate to the "Manage Users" page.
3.  Click the "Choose File" button and select your CSV file.
4.  The users will be automatically added to the system.
