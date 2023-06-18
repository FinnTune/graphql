import { Metadata } from "next"

import LoginPage from "./login-page"
import Loginpopup from "./login-page"

// TODO: add server-side redirect if logged in

export const metadata: Metadata = {
  title: "Login",
}
const Page = () => {
  return <Loginpopup />
}

export default Page