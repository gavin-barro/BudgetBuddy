# BudgetBuddy

**BudgetBuddy** is a secure, user-friendly personal finance tracker application designed for young adults and students to manage their financial data privately.

The backend, built with **Java and Spring Boot**, handles core functionality including user authentication, profile management, financial account CRUD operations, and transaction management. The frontend, developed in **React.js** with **Chart.js**, provides intuitive UI components such as forms for signup/login, account/transaction entry, and an interactive dashboard displaying spending visualizations.

## Features

### Backend Features (Java/Spring Boot)
* **User Authentication & Profile Management (Epic 1):** Secure registration with email/password validation, login/logout with JWT tokens, and profile view/update (name, email, password).
* **Financial Account Management (Epic 2):** Add, view, edit, and delete accounts (name, type, balance) with strict ownership checks to ensure data privacy.
* **Transaction Management (Epic 3):**
    * Log new transactions (amount, type: income/expense, category, date, description).
    * Automatic balance updates on create/edit/delete.
    * Transaction history with filtering (by category), sorting (date/amount asc/desc), and pagination.
* **Interactive Dashboard (Epic 4):** A single summary endpoint providing total balance, recent transactions (top 10), monthly income/expense aggregates, and category spending (last 6 months).

### Frontend Features (React.js)
* **Authentication:** Signup and login forms with validation and password strength indicators.
* **Profile Page:** Interface for viewing and updating user information.
* **Account Management:** Forms to add, edit, or delete accounts and a list view.
* **Transaction Entry:** Intuitive forms with dropdowns for type, category, and account.
* **History View:** A responsive, paginated, and filterable transaction history table.
* **Dashboard:** Visual layout featuring pie charts for spending categories and bar charts for income vs. expense trends.

## Technologies Used

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React.js, Chart.js, Tailwind CSS |
| **Backend** | Java, Spring Boot, Spring Data JPA, Spring Security (JWT & Hashing) |
| **Database** | PostgreSQL (Users, Accounts, Transactions tables) |
| **Tools** | GitHub, Jira, Maven |

## Prerequisites

Ensure you have the following installed before starting:
* **Java JDK:** Version 17+
* **Node.js:** Version 16+ (includes npm)
* **PostgreSQL:** Version 13+ (Local or hosted, e.g., Railway)
* **Maven:** Version 3.8+

---

## Setup Instructions

### 1. Backend Setup

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/your-repo/budgetbuddy.git](https://github.com/your-repo/budgetbuddy.git)
    cd budgetbuddy/backend
    ```

2.  **Configuration:**
    Update `src/main/resources/application.properties` with your PostgreSQL details and JWT secret:
    ```properties
    spring.datasource.url=jdbc:postgresql://localhost:5432/budgetbuddy
    spring.datasource.username=your_username
    spring.datasource.password=your_password
    jwt.secret=your_secure_secret_key
    ```

3.  **Run Migrations:**
    If using Flyway, run migrations automatically. Otherwise, manually execute SQL scripts located in `db/migrations/` via `psql`.

4.  **Build and Run:**
    ```bash
    mvn clean install
    mvn spring-boot:run
    ```
    *The backend will start on `http://localhost:8080`.*

### 2. Frontend Setup

1.  **Navigate to the frontend directory:**
    ```bash
    cd ../frontend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Configuration:**
    Configure the API base URL in `src/services/api.js`:
    ```javascript
    const API_URL = "http://localhost:8080/api";
    ```

4.  **Run the application:**
    ```bash
    npm start
    ```
    *The frontend will run on `http://localhost:3000`.*

### 3. Database Setup

1.  **Create the database:**
    ```sql
    CREATE DATABASE budgetbuddy;
    ```

2.  **Initialize Schema:**
    Run the provided SQL scripts via `psql` or pgAdmin:
    * `V1__create_users_table.sql`
    * `V2__create_accounts_table.sql`
    * `V3__create_transactions_table.sql`

    *Note: The application uses `spring.jpa.hibernate.ddl-auto=update` for automatic schema updates during development.*

---

## Running the Application

1.  Start the **Backend** (`mvn spring-boot:run`).
2.  Start the **Frontend** (`npm start`).
3.  Open your browser to `http://localhost:3000`.
4.  **Workflow:** Sign up, log in, add accounts, log transactions, and view the dashboard visualizations.

## Testing

### Backend Tests
Run all unit and integration tests (Controllers, Services, Repositories):
```bash
cd backend
mvn test
```

## Authors
* Gavin Barro
* Rhys Jones