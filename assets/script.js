const passwordInput = document.getElementById("password");
const toggleVisibility = document.getElementById("toggleVisibility");
const visibilityIcon = document.getElementById("visibilityIcon");
const meterFill = document.getElementById("meterFill");
const strengthLabel = document.getElementById("strengthLabel");
const scoreText = document.getElementById("scoreText");
const crackTime = document.getElementById("crackTime");
const entropyText = document.getElementById("entropy");
const warningText = document.getElementById("warning");
const checksList = document.getElementById("checks");
const generateBtn = document.getElementById("generateBtn");
const lengthRange = document.getElementById("lengthRange");
const lengthValue = document.getElementById("lengthValue");
const generatedPassword = document.getElementById("generatedPassword");
const copyBtn = document.getElementById("copyBtn");

const commonPasswords = new Set([
  "password",
  "password123",
  "123456",
  "12345678",
  "qwerty",
  "admin",
  "letmein",
  "welcome",
  "iloveyou",
  "abc123",
  "111111"
]);

const keyboardPatterns = ["qwerty", "asdf", "zxcv", "1234", "abcd", "9876"];

const checkDefinitions = [
  { id: "length12", label: "At least 12 characters", test: value => value.length >= 12 },
  { id: "length16", label: "16+ characters for stronger security", test: value => value.length >= 16 },
  { id: "lower", label: "Contains lowercase letters", test: value => /[a-z]/.test(value) },
  { id: "upper", label: "Contains uppercase letters", test: value => /[A-Z]/.test(value) },
  { id: "number", label: "Contains numbers", test: value => /\d/.test(value) },
  { id: "symbol", label: "Contains symbols", test: value => /[^A-Za-z0-9]/.test(value) },
  { id: "common", label: "Not a common password", test: value => !commonPasswords.has(value.toLowerCase()) },
  { id: "pattern", label: "No obvious keyboard pattern", test: value => !hasKeyboardPattern(value) },
  { id: "repeat", label: "No heavy repeated characters", test: value => !/(.)\1{2,}/.test(value) },
  { id: "space", label: "No leading or trailing spaces", test: value => value === value.trim() }
];

function hasKeyboardPattern(value) {
  const lower = value.toLowerCase();
  return keyboardPatterns.some(pattern => lower.includes(pattern));
}

function getCharacterPoolSize(value) {
  let pool = 0;
  if (/[a-z]/.test(value)) pool += 26;
  if (/[A-Z]/.test(value)) pool += 26;
  if (/\d/.test(value)) pool += 10;
  if (/[^A-Za-z0-9]/.test(value)) pool += 32;
  return pool;
}

function estimateEntropy(value) {
  if (!value) return 0;
  const pool = Math.max(getCharacterPoolSize(value), 1);
  let entropy = Math.log2(pool) * value.length;

  if (commonPasswords.has(value.toLowerCase())) entropy *= 0.2;
  if (hasKeyboardPattern(value)) entropy *= 0.68;
  if (/(.)\1{2,}/.test(value)) entropy *= 0.72;
  if (/^[A-Za-z]+\d{1,4}$/.test(value)) entropy *= 0.78;

  return Math.max(0, Math.round(entropy));
}

function entropyToScore(entropy, value) {
  let score = Math.min(100, Math.round((entropy / 95) * 100));
  if (value.length < 8) score = Math.min(score, 30);
  if (commonPasswords.has(value.toLowerCase())) score = Math.min(score, 12);
  if (hasKeyboardPattern(value)) score = Math.min(score, 55);
  return score;
}

function getStrength(score) {
  if (score >= 85) return { label: "Very strong", color: "#15803d" };
  if (score >= 65) return { label: "Strong", color: "#0f766e" };
  if (score >= 42) return { label: "Moderate", color: "#b7791f" };
  if (score >= 18) return { label: "Weak", color: "#c2410c" };
  return { label: "Very weak", color: "#991b1b" };
}

function estimateCrackTime(entropy) {
  if (entropy <= 0) return "-";
  const guessesPerSecond = 1_000_000_000;
  const seconds = Math.pow(2, entropy - 1) / guessesPerSecond;

  if (seconds < 1) return "Instantly";
  if (seconds < 60) return `${Math.round(seconds)} seconds`;
  if (seconds < 3600) return `${Math.round(seconds / 60)} minutes`;
  if (seconds < 86400) return `${Math.round(seconds / 3600)} hours`;
  if (seconds < 31536000) return `${Math.round(seconds / 86400)} days`;
  if (seconds < 31536000000) return `${Math.round(seconds / 31536000)} years`;
  return "Thousands of years";
}

function getWarning(value) {
  if (!value) return "None";
  if (commonPasswords.has(value.toLowerCase())) return "Common password";
  if (hasKeyboardPattern(value)) return "Keyboard pattern";
  if (/(.)\1{2,}/.test(value)) return "Repeated characters";
  if (/^[A-Za-z]+\d{1,4}$/.test(value)) return "Predictable ending";
  return "None";
}

function renderChecks(value) {
  checksList.innerHTML = "";
  checkDefinitions.forEach(check => {
    const passed = value.length > 0 && check.test(value);
    const item = document.createElement("li");
    item.className = passed ? "pass" : "fail";
    item.textContent = `${passed ? "✓" : "•"} ${check.label}`;
    checksList.appendChild(item);
  });
}

function updateStrength() {
  const value = passwordInput.value;
  const entropy = estimateEntropy(value);
  const score = value ? entropyToScore(entropy, value) : 0;
  const strength = value ? getStrength(score) : { label: "Waiting for password", color: "#c2410c" };

  meterFill.style.width = `${score}%`;
  meterFill.style.background = strength.color;
  strengthLabel.textContent = strength.label;
  scoreText.textContent = `${score} / 100`;
  entropyText.textContent = `${entropy} bits`;
  crackTime.textContent = estimateCrackTime(entropy);
  warningText.textContent = getWarning(value);
  renderChecks(value);
}

function randomCharacter(chars) {
  const values = new Uint32Array(1);
  crypto.getRandomValues(values);
  return chars[values[0] % chars.length];
}

function shuffleSecure(chars) {
  const array = [...chars];
  for (let index = array.length - 1; index > 0; index -= 1) {
    const values = new Uint32Array(1);
    crypto.getRandomValues(values);
    const randomIndex = values[0] % (index + 1);
    [array[index], array[randomIndex]] = [array[randomIndex], array[index]];
  }
  return array.join("");
}

function generatePassword() {
  const length = Number(lengthRange.value);
  const lower = "abcdefghijkmnopqrstuvwxyz";
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const numbers = "23456789";
  const symbols = "!@#$%^&*_-+=?";
  const allChars = lower + upper + numbers + symbols;
  let password = [
    randomCharacter(lower),
    randomCharacter(upper),
    randomCharacter(numbers),
    randomCharacter(symbols)
  ].join("");

  while (password.length < length) {
    password += randomCharacter(allChars);
  }

  generatedPassword.value = shuffleSecure(password);
}

toggleVisibility.addEventListener("click", () => {
  const shouldShow = passwordInput.type === "password";
  passwordInput.type = shouldShow ? "text" : "password";
  visibilityIcon.textContent = shouldShow ? "Hide" : "Show";
  toggleVisibility.setAttribute("aria-label", shouldShow ? "Hide password" : "Show password");
  toggleVisibility.title = shouldShow ? "Hide password" : "Show password";
});

passwordInput.addEventListener("input", updateStrength);

lengthRange.addEventListener("input", () => {
  lengthValue.textContent = lengthRange.value;
});

generateBtn.addEventListener("click", () => {
  generatePassword();
  passwordInput.value = generatedPassword.value;
  updateStrength();
});

copyBtn.addEventListener("click", async () => {
  if (!generatedPassword.value) generatePassword();
  await navigator.clipboard.writeText(generatedPassword.value);
  copyBtn.textContent = "Copied";
  setTimeout(() => {
    copyBtn.textContent = "Copy";
  }, 1200);
});

renderChecks("");
generatePassword();
