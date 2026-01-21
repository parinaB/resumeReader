const USERS_KEY = "ra_users";
const CURRENT_USER_KEY = "ra_current_user";

const getUsers = () => {
  const raw = localStorage.getItem(USERS_KEY);
  return raw ? JSON.parse(raw) : [];
};

const saveUsers = (users) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const hashPassword = async (password) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
};

export const handleSignup = async (username, password) => {
  const trimmedUsername = username.trim();
  if (trimmedUsername.length < 3 || password.length < 8) {
    throw new Error("Use a username (3+ chars) and password (8+ chars).");
  }
  const users = getUsers();
  if (users.some((user) => user.username === trimmedUsername)) {
    throw new Error("That username is already taken.");
  }
  const passwordHash = await hashPassword(password);
  const newUser = { username: trimmedUsername, passwordHash };
  saveUsers([...users, newUser]);
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify({ username: trimmedUsername }));
  return { username: trimmedUsername };
};

export const handleLogin = async (username, password) => {
  const trimmedUsername = username.trim();
  const users = getUsers();
  const user = users.find((entry) => entry.username === trimmedUsername);
  if (!user) {
    throw new Error("Invalid username or password.");
  }
  const passwordHash = await hashPassword(password);
  if (passwordHash !== user.passwordHash) {
    throw new Error("Invalid username or password.");
  }
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify({ username: trimmedUsername }));
  return { username: trimmedUsername };
};

export const checkAuth = () => {
  const raw = localStorage.getItem(CURRENT_USER_KEY);
  return raw ? JSON.parse(raw) : null;
};

export const logoutUser = () => {
  localStorage.removeItem(CURRENT_USER_KEY);
};
