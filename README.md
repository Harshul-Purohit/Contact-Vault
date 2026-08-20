# ContactVault: Next.js App Router Learning & Study Guide

Welcome to **ContactVault**, a secure, lightweight Contact Management application built from scratch to study, understand, and master the core features of Next.js 15+ App Router, TypeScript, Tailwind CSS, Axios, and JSON-Server.

---

## 1. Project Overview & What it Does
ContactVault is a practice contact directory where users can register an account, sign in, and manage (Create, Read, Update, Delete) their personal contact lists.
* **Route Protection**: Unauthenticated guests are automatically redirected away from the contacts page to `/login`.
* **User Isolation**: A logged-in user can only see, edit, or delete contacts that they created.
* **Practice Backend**: Relies on a mock REST API using `json-server` running on a separate port (`3001`).

---

## 2. Tech Stack & Selection Rationale
* **Next.js (App Router)**: Offers a unified React framework with Server Components (which reduce client JavaScript load) and Server Actions (which replace traditional REST route handlers for write mutations).
* **React 19**: Employs React 19's form actions and state hooks (`useActionState`) to manage pending transitions without boilerplate state machines.
* **TypeScript**: Enforces structural safety across API responses, cookie schemas, and component interfaces.
* **Tailwind CSS (v4)**: Enables fast layout implementation with high readability.
* **Axios**: Provides a promise-based HTTP client for the server-to-server calls, allowing custom configurations and response interceptors.
* **JSON-Server**: A rapid prototyping database tool that creates a full mock REST API from a static JSON file (`db.json`).

---

## 3. Project Architecture & Directory Layout

### Folder Tree
```text
contactvault/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── register/
│   │   │       └── page.tsx
│   │   │   └── register.tsx (DELETED - resolved route conflict)
│   │   ├── _components/
│   │   │   ├── LogoutButton.tsx
│   │   │   └── Navabar.tsx
│   │   ├── _data/
│   │   │   └── db.json (JSON-Server database)
│   │   ├── contact/
│   │   │   ├── [id]/
│   │   │   │   └── edit/
│   │   │   │       ├── EditForm.tsx (Client component form)
│   │   │   │       └── page.tsx (Server component page)
│   │   │   ├── new/
│   │   │   │   └── page.tsx
│   │   │   └── page.tsx (Contact list dashboard)
│   │   ├── favicon.ico
│   │   ├── globals.css (Tailwind CSS configuration)
│   │   ├── layout.tsx (Shared root layout)
│   │   └── page.tsx (Public home/landing page)
│   └── lib/
│       ├── actions.ts (Server Actions for auth/mutations)
│       ├── api.ts (Axios configurations and database queries)
│       └── types.ts (TypeScript interface contracts)
├── tsconfig.json
├── package.json
└── README.md
```

### Key Files & Their Responsibilities
1. **[types.ts](file:///e:/Next_JS/contactvault/src/lib/types.ts)**: Declares data types (`User`, `Contact`, `Session`) ensuring data integrity across modules.
2. **[api.ts](file:///e:/Next_JS/contactvault/src/lib/api.ts)**: Initializes the Axios client to hit `http://localhost:3001` and exports the db service queries.
3. **[actions.ts](file:///e:/Next_JS/contactvault/src/lib/actions.ts)**: Serves as the central server actions controller for writing credentials, updating cookies, mutating contacts, and purging cache.
4. **[Navabar.tsx](file:///e:/Next_JS/contactvault/src/app/_components/Navabar.tsx)**: Server Component that reads cookie stores using `cookies()` directly during render to render login/logout actions.
5. **[LogoutButton.tsx](file:///e:/Next_JS/contactvault/src/app/_components/LogoutButton.tsx)**: Server Component form that binds the `logoutUser` server action to a standard button without client JS.
6. **[contact/page.tsx](file:///e:/Next_JS/contactvault/src/app/contact/page.tsx)**: Secure dashboard that queries, filters, and renders contacts or empty/error placeholders.
7. **[edit/page.tsx](file:///e:/Next_JS/contactvault/src/app/contact/[id]/edit/page.tsx)**: Dynamic server page verifying ownership of a contact before passing data down to the client form.

---

## 4. Next.js Routing Mechanics

### App Router Structure
Next.js uses folder-based routing inside `src/app`.
* **Route Groups (`(auth)`)**: Folders wrapped in parentheses are used to organize code (e.g. login and registration files) but do not impact the URL path. URL maps to `/login` and `/register`.
* **Dynamic Route Segments (`[id]`)**: The folder name `[id]` defines a parameter placeholder. For instance, `/contact/1/edit` injects `{ id: "1" }` into the page parameters.

### Root Layout
The file `layout.tsx` defines the outer shell of the HTML document (header, html, body tags) that surrounds all routes.
The dynamic `Navbar` is loaded inside this shell. Since layout templates do not re-render on route switches, the application updates only the interior `{children}` segment, saving bandwidth.

---

## 5. Server vs. Client Components

Next.js divides components based on execution boundaries. By default, all files in the App Router are **React Server Components (RSC)** unless they declare `"use client"` at the top.

| Feature / Metric | React Server Components (RSC) | Client Components |
| :--- | :--- | :--- |
| **Execution Location** | Server only | Pre-rendered on server, hydrated in browser |
| **Interactivity** | No event handlers (`onClick`, `onSubmit`) | Yes (standard interactive hooks) |
| **React Hooks** | Cannot use (`useState`, `useEffect`, `useActionState`) | Full Hook support |
| **Direct Cookie Access** | Yes (via `cookies()` from `next/headers`) | No (unless exposed via client-side cookie API) |
| **Direct Database API** | Yes (can execute Axios, DB connections safely) | No (must request backend endpoints) |

### Why specific files need `"use client"` in ContactVault:
* **`login/page.tsx` & `register/page.tsx`**: Must use `useActionState` to track if submission is pending and to show validation errors to the user in real time.
* **`contact/new/page.tsx`**: Uses `useActionState` to handle form inputs and show creation errors.
* **`EditForm.tsx`**: Employs form actions and `useActionState` to handle field updates and state lifecycles.

---

## 6. Authentication Architecture & Session Flow

ContactVault implements session cookie authentication on the server:

```
[Login Form (Client)] ---> Submit Credentials ---> [Server Action (actions.ts)]
                                                               |
                                                  Verify credentials via Axios
                                                               |
                                         Set "contactvault_session" Cookie (httpOnly)
                                                               |
                                            Redirect to /contact (Server-side)
```

1. **Sign In**: The user enters their email and password.
2. **Verification**: The `loginUser` Server Action fetches all registered users from `json-server` and searches for a match.
3. **Session Cookie**: If credentials match, the server serializes a session payload (`{ userId, userName, email }`) and sets it as an `httpOnly`, `secure` cookie named `contactvault_session`.
4. **Direct Navbar Read**: During rendering, `Navabar.tsx` executes `await cookies()`. If the session cookie is present, it extracts the `userName` to display a personalized greeting.
5. **Sign Out**: The `logoutUser` Server Action deletes the `contactvault_session` cookie and triggers a redirect to `/login`.

---

## 7. JSON-Server Database Architecture
The mock database is stored in [db.json](file:///e:/Next_JS/contactvault/src/app/_data/db.json). It defines two main tables:
* **`user`**: Stores account credentials.
  * Fields: `id`, `name`, `email`, `password`.
* **`contact`**: Contains directory items.
  * Fields: `id`, `name`, `email`, `userid`.
* **User-Contact Relationship**: The `userid` string in the `contact` table acts as a foreign key referencing the `id` of the `user` who created the contact.

---

## 8. Complete Step-by-Step Data Flows

### A. Login Data Flow
1. User enters email/password in `login/page.tsx` (Client component) and clicks "Sign In".
2. The form submits using `formAction` generated by `useActionState` linked to the `loginUser` Server Action.
3. `loginUser` executes on the server:
   - Fetches users from `http://localhost:3001/user` using Axios.
   - Compares email and password.
   - If mismatch: returns error message.
   - If match: creates session and writes `contactvault_session` cookie.
4. Next.js redirects to `/contact`.

### B. Creating a Contact
1. User fills name/email in `contact/new/page.tsx` (Client component) and clicks "Save".
2. Form submits to the `createContact` Server Action.
3. `createContact` executes on the server:
   - Fetches the active session from the cookie store.
   - Invokes Axios to POST to `http://localhost:3001/contact` with data `{ name, email, userid: session.userId }`.
   - Calls `revalidatePath("/contact")` to invalidate cached contacts page data.
4. Next.js redirects to `/contact`, forcing a fresh fetch.

### C. Updating a Contact
1. User opens `/contact/1/edit`.
2. The Server Component `[id]/edit/page.tsx` fetches the dynamic URL parameter `id` and queries the database for that contact.
3. Page ensures `contact.userid === session.userId`. If true, renders `<EditForm contact={contact} />`.
4. User changes fields and clicks "Save Changes".
5. Client-side form invokes the Server Action bound with the contact ID: `updateContact.bind(null, id)`.
6. `updateContact` performs Axios PUT request to `http://localhost:3001/contact/1`.
7. Calls `revalidatePath("/contact")` and redirects to `/contact`.

### D. Deleting a Contact
1. User clicks "Delete" next to a contact on `/contact`.
2. A server-side form submits: `action={deleteContact.bind(null, contact.id)}`.
3. `deleteContact` runs on the server:
   - Verifies the user owns the contact.
   - Calls Axios DELETE endpoint `http://localhost:3001/contact/id`.
   - Executes `revalidatePath("/contact")`.
4. Page re-renders showing the updated list.

---

## 9. Next.js Concepts Covered
1. **Dynamic Rendering vs. Static Pre-rendering**: Using `cookies()` turns routes into dynamic renders since user cookies are not known during build time.
2. **On-demand Revalidation**: `revalidatePath()` triggers background updates to update static cache items instantly.
3. **Async Route Parameters**: Next.js 15+ changes `params` into dynamic Promises, requiring an `await params` resolution on the server.
4. **Form Action Bindings**: Bypassing event parameters by binding arguments directly using `action.bind()`.

---

## 10. How to Run the Project Locally

### 1. Start the Backend API (JSON-Server)
JSON-Server handles storing users and contacts in `db.json`. It runs on port `3001`.
```bash
npm run server
```

### 2. Start the Frontend (Next.js)
Runs the development server on port `3000`.
```bash
npm run dev
```

### 3. Open the App
Visit [http://localhost:3000](http://localhost:3000).

### 4. Practice Credentials
You can use the default user account from `db.json` to log in:
* **Email**: `purohit@gmail.com`
* **Password**: `123456789`

---

## 11. Interview Prep: Question & Answer Guide

### Q1. "Explain this project in 30 seconds."
> "ContactVault is a secure contact management application built with Next.js App Router and TypeScript. It implements login, logout, and full CRUD operations. It uses a server-side session cookie to keep user data secure, fetches database information via Axios from a mock JSON-Server backend, and uses React 19 Server Actions for write mutations, ensuring minimal client-side JavaScript."

### Q2. "Explain the architecture of this application."
> "The app is structured around Next.js App Router boundaries. The frontend UI is composed of React Server Components for pages and layouts, while interactive forms are Client Components. Operations that modify data are implemented as Server Actions in `actions.ts`. The backend is a decoupled mock REST server (`json-server`) running on port 3001. All API queries are handled using an Axios client."

### Q3. "Why did you use Server Actions instead of traditional API routes?"
> "Server Actions let us write functions that run exclusively on the server but can be invoked directly from forms or components. They remove the overhead of writing custom API handlers (like `/api/contacts/route.ts`), handle standard Form data naturally, and integrate directly with Next.js cache features like `revalidatePath()` and `redirect()` inside a single lifecycle."

### Q4. "How does the Navbar know if a user is logged in?"
> "The Navbar is an async Server Component. During execution, it accesses the server-side cookie store using the `cookies()` function from `next/headers`. It checks for the presence of the session cookie `contactvault_session`. If found, it parses the JSON data to display the logged-in user's name and appropriate route links; otherwise, it displays sign-in and registration links. This prevents layout shift during page hydration."

### Q5. "How did you ensure that users cannot view or edit other users' contacts?"
> "We enforce user isolation at both the Page level and the Server Action level.
> 1. **Fetching**: When rendering `/contact`, the Server Component gets the current session, queries all contacts from JSON-Server, and performs a server-side filter: `contacts.filter(c => c.userid === session.userId)`.
> 2. **Mutations**: Inside the `updateContact` and `deleteContact` Server Actions, before performing the Axios call, we query the contact details and verify: `if (contact.userid !== session.userId) throw new Error(...)`. This ensures API-level protection."

### Q6. "What is `revalidatePath` and why did you use it?"
> "Next.js aggressively caches pages to speed up navigation. When we perform mutations (like adding, editing, or deleting a contact), the cache becomes stale. By calling `revalidatePath("/contact")` inside our Server Actions, we instruct Next.js to purge the cached HTML for the contact dashboard, forcing the server to fetch fresh data on the next request."

### Q7. "What would you change if you were deploying this to production?"
> "For a production-ready application:
> 1. **Database**: Swap JSON-Server for a production database (like PostgreSQL or MongoDB) connected via an ORM (like Prisma).
> 2. **Authentication**: Replace our practice cookie verification with a library like Auth.js (NextAuth) or utilize JSON Web Tokens (JWT) encrypted with a secret key.
> 3. **Validation**: Use a library like Zod to validate input fields inside Server Actions.
> 4. **Middleware**: Implement Next.js Middleware (`middleware.ts`) to handle path-based redirects instead of performing inline redirects inside individual pages."

---

## 12. What I Learned From This Project
Building ContactVault demonstrates how:
1. **Server Components** serve as an excellent entry point for routes, managing secure data filters and cookie checks safely on the server.
2. **Client Components** should be kept small and focused purely on interactivity (like forms and button statuses).
3. **Form handling** in React 19 is simplified with `useActionState`, making form submissions and error handling straightforward.
4. **Direct API calls** inside Server Components remove loading delay, enabling immediate HTML delivery directly to the client browser.
