
  // useEffect(() => {
  //   document.addEventListener("DOMContentLoaded", () => {
  //     const loginForm = document.getElementById("login-form") as HTMLFormElement;
  //     if(loginForm) {
  //         loginForm.addEventListener("submit", async (event) => {
  //             event.preventDefault();
  //             const email = (document.getElementById("email") as HTMLInputElement).value;
  //             const password = (document.getElementById("password") as HTMLInputElement).value;
              
  //             // Base64 encode the credentials
  //             const credentials = btoa(`${email}:${password}`);
    
  //             try {
  //               const response = await fetch("https://01.gritlab.ax/api/auth/signin", {
  //                 method: "POST",
  //                 headers: {
  //                   Authorization: `Basic ${credentials}`,
  //                 },
  //               });
  //               if (response.status === 200) {
  //                         const data = await response.json();
  //                         const jwt = data;
  //                         console.log("Acquired JWT: " + jwt);
  //                         localStorage.setItem("jwt", jwt);
  //                         window.location.href = "/profile.html";
  //                       }
  //             } catch (error) {
  //               console.error("Element with id 'loginSubmit' not found");
  //             }
  //         });
  //     }
  //   });
  // }, []);
