# Fancy 2FA (Guardian Gate)

A secure, privacy-focused Two-Factor Authentication (2FA) dashboard built with Next.js and Supabase. Manage your TOTP codes, organize accounts with tags, and generate codes via a secure API.

## Features

- 🔐 **Secure 2FA Management**: Store and manage TOTP secrets for multiple accounts.
- 🏷️ **Tag Organization**: Categorize accounts with custom tags and colors.
- 🚀 **Modern Dashboard**: Built with Next.js 15, Tailwind CSS, and Radix UI.
- 📱 **API Access**: Generate TOTP codes programmatically via a secured API endpoint.
- 🔍 **Search & Sort**: Quickly find accounts with search and sorting capabilities.
- ☁️ **Supabase Backend**: Reliable data persistence with Row Level Security (RLS).

## Prerequisites

- Node.js 18+ installed.
- A Supabase account and project.

## Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd fancy-2fa
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Environment Configuration

Copy the example environment file to `.env.local`:

```bash
cp .env.example .env.local
```

Edit `.env.local` and configure the following variables:

| Variable | Description |
| :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL (e.g., `https://xyz.supabase.co`). |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase project's `anon` (public) key. |
| `SUPABASE_SERVICE_ROLE_KEY` | (Optional) Your Supabase `service_role` key. Used for admin/server-side operations bypassing RLS. |
| `AUTH_SECRET_KEY` | **Required.** The password used to log in to the web dashboard. Choose a strong secret. |
| `API_AUTH_TOKEN` | **Required.** The token used to authenticate requests to the `/api/totp` endpoint. |

### 4. Database Setup (Supabase)

1.  Go to your Supabase project's **SQL Editor**.
2.  Open the `supabase_schema.sql` file located in the root of this project.
3.  Copy the contents and run them in the Supabase SQL Editor.
    *   This creates the necessary tables: `users`, `tags`, `accounts`, `account_tags`.
    *   It sets up Row Level Security (RLS) policies.
    *   It creates a default admin user.

### 5. Run the Application

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Web Dashboard
1.  Navigate to the login page.
2.  Enter the `AUTH_SECRET_KEY` you configured in `.env.local`.
3.  Use the dashboard to add accounts, create tags, and view TOTP codes.

### API: Generate TOTP Code
You can generate a TOTP code programmatically using the API.

**Endpoint:** `GET /api/totp`

**Headers:**
- `Authorization`: `Bearer <API_AUTH_TOKEN>`

**Query Parameters:**
- `issuer` (required): The name of the service (e.g., "Google", "GitHub").
- `account` (optional): The account name/email (e.g., "user@example.com").

**Example Request:**
```bash
curl -H "Authorization: Bearer your-api-token" \
     "http://localhost:3000/api/totp?issuer=Google&account=user@example.com"
```

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Database:** Supabase
- **Styling:** Tailwind CSS, Radix UI, Lucide React
- **Auth/TOTP:** `otpauth`
- **AI Integration:** Genkit (Google GenAI)

## License

[MIT](LICENSE)
