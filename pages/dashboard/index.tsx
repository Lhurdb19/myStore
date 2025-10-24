import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";

export default function Dashboard({ user }: any) {
  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1>Welcome, {user.name}</h1>
      <h3>Role: {user.role}</h3>
      {user.role === "admin" ? (
        <p>This is the Admin Dashboard 🧭</p>
      ) : (
        <p>This is your User Dashboard 📦</p>
      )}
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);
  if (!session) {
    return { redirect: { destination: "/auth/login", permanent: false } };
  }

  return {
    props: { user: session.user },
  };
};
