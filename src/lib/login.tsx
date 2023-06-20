import Toastify from "toastify-js";

export default async function Auth() {
    console.log("Authenticating...");

    const emailElement = document.getElementById("email");
    const passwordElement = document.getElementById("password");

    let email: string;
    let password: string;

    if (emailElement) {
    email = (emailElement as HTMLInputElement).value;
    } else {
        throw new Error("Element with id 'email' not found");
    }
    
    if (passwordElement) {
        password = (passwordElement as HTMLInputElement).value;
    } else {
        throw new Error("Element with id 'password' not found");
    }

    // Base64 encode the credentials
    const credentials = btoa(`${email}:${password}`); 
    
    try {
    const response = await fetch("https://01.gritlab.ax/api/auth/signin", {
        method: "POST",
        headers: {
        Authorization: `${credentials}`,
        },
    });

    if (response.status === 200) {
        const data = await response.json();
        const jwt = data;
        console.log("Acquired JWT: " + jwt);
        localStorage.setItem("jwt", jwt);
        window.location.href = "/";
    } else {
        Toastify({
        text: "Invalid credentials. Please try again.",
        duration: 2000, // Display duration in ms
        close: true, // Add a close button to the notification
        gravity: "top", // Toast position (top or bottom)
        style: { background: "red" }, // Toast background color
        }).showToast();
    }
    } catch (error) {
    console.error("Error:", error);
    Toastify({
        text: "An error occured. Please try again.",
        duration: 2000, // Display duration in ms
        close: true, // Add a close button to the notification
        gravity: "top", // Toast position (top or bottom)
        style: { background: "red" }, // Toast background color
    }).showToast();
    }
}