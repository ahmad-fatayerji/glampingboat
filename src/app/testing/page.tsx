// src/app/page.tsx (or wherever this is)
import SignIn from "@/components/Sign-in"
import CredentialsSignIn from "@/components/CredentialsSignIn"

export default function Home() {
  return (
    <>
      <SignIn />
      <CredentialsSignIn />
    </>
  )
}
