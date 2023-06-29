'use client'
import Link from 'next/link'
import Image from 'next/image'
import React from 'react';
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';
import Auth from '@/lib/login';
// import { useEffect } from 'react';

// Commented out code is for reference only. Feel free to delete it.

export default function Home() {

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


  const content = (
    <>
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
        <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
          <Popup trigger={<button> Login </button>} position="bottom left" offsetY={20}>
            <>
              <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-1">
                <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                  <form id="login-form" className="space-y-6" method="POST" onSubmit={Auth}>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">Email address</label>
                      <div className="mt-2">
                        <input id="email" name="email" type="email" required className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"/>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between">
                        <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">Password</label>
                      </div>
                      <div className="mt-2">
                        <input id="password" name="password" type="password" required className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"/>
                      </div>
                    </div>

                    <div>
                      <button id="login-submit" type="submit" className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">Sign in</button>
                    </div>
                  </form>
                </div>
              </div>
            </>
          </Popup>

          
          {/* <Link href="/login">Login</Link> */}
          {/* <code className="font-mono font-bold">src/app/page.tsx</code> */}
        </p>
        <p className="flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
          <Link href="/about">About</Link>
        </p>
      </div>

      <div className="relative flex place-items-center before:absolute before:h-[300px] before:w-[480px] before:-translate-x-1/2 before:rounded-full before:bg-gradient-radial before:from-white before:to-transparent before:blur-2xl before:content-[''] after:absolute after:-z-20 after:h-[180px] after:w-[240px] after:translate-x-1/3 after:bg-gradient-conic after:from-sky-200 after:via-blue-200 after:blur-2xl after:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-blue-700 before:dark:opacity-10 after:dark:from-sky-900 after:dark:via-[#0141ff] after:dark:opacity-40 before:lg:h-[360px]">
        <Image
          className="relative dark:drop-shadow-[0_0_0.3rem_#ffffff70] dark:invert"
          src="/GraphQL_Logo.svg.png"
          alt="GraphQL Logo"
          width={180}
          height={37}
          priority
        />
      </div>

      <div className="fixed bottom-0 right-0 flex h-48 w-full items-end justify-center bg-gradient-to-t from-white via-white dark:from-black dark:via-black lg:static lg:h-auto lg:w-auto lg:bg-none">
            By&nbsp; André J. Teetor @ &nbsp;{' '}
            <Image
              src="/Logo_Dark_1.png"
              alt="Gritlab Logo"
              className="dark:invert"
              width={100}
              height={24}
              priority
            />
      </div>
    </>
  );
  return (content)
}
