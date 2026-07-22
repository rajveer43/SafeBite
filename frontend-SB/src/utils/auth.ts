export function getToken() { return localStorage.getItem("token"); }
export function logout() { localStorage.removeItem("token"); }
export function isLoggedIn() { return !!getToken(); }
