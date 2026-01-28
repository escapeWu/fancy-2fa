# **App Name**: Guardian Gate

## Core Features:

- User Authentication: Secure user login using username/password.
- 2FA Setup: Enable 2FA via authenticator app (TOTP).
- QR Code Generation: Generate QR code for easy authenticator app setup.
- Token Validation: Validate the token entered by the user against the server-generated token.
- Recovery Codes: Generate and store recovery codes for emergency access.
- Session Management: Manage user sessions after successful 2FA authentication.
- Multi 2FA Key Configuration: Configure multiple 2FA keys for a single account.
- Backup and Restore: Support backup and restore of 2FA keys via Google Drive/WebDAV.
- Anonymous Mode: Quickly configure 2FA keys and generate verification codes in anonymous mode.

## Style Guidelines:

- Primary color: Teal (#008080) for a modern and trustworthy feel.
- Background color: Light gray (#F0F0F0) to provide a clean and neutral backdrop.
- Accent color: Orange (#FFA500) to highlight important actions and elements.
- Body and headline font: 'Roboto' (sans-serif) for a clear and readable experience.
- Use lock and key icons with a modern, minimalist style to reinforce security concept.
- Clean and intuitive layout with clear instructions for 2FA setup, similar to Google Authenticator's interface; clean and free of any extraneous features.
- Subtle animations for user feedback during authentication, such as a smooth transition when a token is validated.