# SplitBiller

## Overview

SplitBiller is a minimalist and aesthetic expense sharing application built with Next.js. It is designed to simplify the process of splitting bills among groups of people, handling both simple equal splits and complex itemized splits. The application features a robust algorithm to calculate the minimum number of transfers required to settle debts efficiently.

## Key Features

### Expense Management
* **Member Management:** Add and manage group members easily.
* **Bill Tracking:** Create, edit, and delete bills with detailed descriptions and timestamps.
* **Flexible Splitting:**
    * **Equal Split:** Automatically divides the total amount among selected members.
    * **Advanced Split:** Allows splitting by specific items and assigning them to specific members.

### Financial Logic
* **Debt Calculation:** Automatically calculates net balances and generates an optimized transfer list to settle all debts.
* **Smart Rounding:** Configurable rounding logic to handle currency denominations (e.g., Smart Auto-rounding, or Exact amounts).
* **Remaining Budget Calculation:** Real-time calculation of remaining unallocated amounts during itemized splitting.

### User Interface & Experience
* **Responsive Design:** Fully responsive interface optimized for mobile and desktop usage.
* **Theme Support:** Built-in Light Mode and Dark Mode with seamless switching.
* **Localization:** Complete bilingual support for Vietnamese and English.
* **Data Persistence:** Utilizes LocalStorage to persist data across sessions without requiring a backend database.

### History & Archiving
* **Settlement Workflow:** Mark all debts as settled to archive current bills.
* **History View:** Review past settled bills and split details.


## Project Status

Current Version: 3.1
Status: Active