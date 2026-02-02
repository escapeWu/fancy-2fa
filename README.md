# Fancy 2FA (Guardian Gate)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FescapeWu%2Ffancy-2fa&env=NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY,SUPABASE_SERVICE_ROLE_KEY,AUTH_SECRET_KEY,API_AUTH_TOKEN)

English | [简体中文](./README-zh.md)

A secure, privacy-focused Two-Factor Authentication (2FA) dashboard.

## Features

- 📱 **API Access**: Generate TOTP codes programmatically via a secured API endpoint.
- 🔗 **Share Links**: Generate shareable links for individual 2FA codes, allowing temporary access without exposing secrets.
- 📋 **Quick Copy**: Quickly copy verification codes, account names, or remarks with a single click.
- 📥 **CSV Import/Export**: Bulk import and export accounts via CSV files, including remarks and tags.

<img width="394" height="619" src="https://github.com/user-attachments/assets/7db0971d-8688-430a-9b87-817d2dc1574b" />
<img width="394" height="619" src="https://github.com/user-attachments/assets/342a70fa-e7f8-4d40-be6d-6dc08bf26f88" />

## Getting Started

### 1. Environment Configuration

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

### 2. Database Setup (Supabase)

1.  Go to your Supabase project's **SQL Editor**.
2.  Open the `supabase_schema.sql` file located in the root of this project.
3.  Copy the contents and run them in the Supabase SQL Editor.

## API: Generate TOTP Code

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

## License

[MIT](LICENSE)
