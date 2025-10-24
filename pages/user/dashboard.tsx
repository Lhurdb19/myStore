import { useSession, signOut } from "next-auth/react";
import Navbar from "@/components/navbar";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function UserDashboard() {
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!session) router.push("/");
  }, [session]);

  if (!session) return null;

  return (
    <>
      {/* <Navbar /> */}
      <div className="p-4">
        <h2>Welcome, {session.user.name}</h2>
        <p>Role: {session.user.role}</p>
        <button onClick={() => signOut({ callbackUrl: "/" })}>Logout</button>
      </div>
    </>
  );
}
