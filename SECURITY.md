# Security Policy

## Supported versions

| Version | Supported |
| --- | --- |
| 0.1.x | ✅ |

## Reporting a vulnerability

**Please do not report security issues in public GitHub issues.**

Use GitHub's private vulnerability reporting:

1. Go to the **Security** tab of this repository.
2. Click **Report a vulnerability**.
3. Describe the issue, the affected version, and reproduction steps.

Alternatively, contact the maintainers directly if private reporting is unavailable.
You can expect an initial response within 7 days.

## Scope

JSON Toolbox is a static, client-side application. There is no backend and no
data is uploaded, so the most relevant classes of issues are:

- Cross-site scripting (XSS) through rendered JSON, diff output or imported files
- Leakage of locally stored data (the app only uses `localStorage` for preferences)
- Unexpected network requests or third-party data collection
- Vulnerabilities in bundled third-party dependencies

Out of scope: issues that require a compromised browser, malicious extensions,
or physical access to the user's device.

## Disclosure

Once a fix is available, we will publish a patched release and credit the
reporter unless anonymity is requested.
