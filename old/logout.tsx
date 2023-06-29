export function logout() {
    localStorage.removeItem("jwt");
    window.location.href = "/";
}