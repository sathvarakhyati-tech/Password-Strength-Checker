# Password Strength Checker

A cyber security mini-project that checks password strength directly in the browser.

## Features

- Live password strength score out of 100
- Entropy estimate in bits
- Estimated offline cracking time
- Security checklist for length, symbols, numbers, patterns, repeated characters, and common passwords
- Secure password generator using the browser `crypto` API
- Copy generated password button
- Local-only privacy design: passwords are not uploaded, stored, or sent to any server

## How to Run

Open `index.html` in any modern browser.

You can also run it with the included Node.js server:

```bash
npm start
```

Then open:

```text
http://localhost:3000
```

Or run it with Python:

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

## Project Structure

```text
password-strength-checker/
  index.html
  package.json
  README.md
  server.js
  assets/
    styles.css
    script.js
```

## Cyber Security Notes

Password strength is estimated using length, character diversity, entropy, and common weakness checks.
No password checker can prove that a password is safe, but this tool helps identify risky choices such as short passwords, common passwords, keyboard patterns, repeated characters, and predictable endings.

For real accounts, use a unique password for every account and store it in a trusted password manager.
