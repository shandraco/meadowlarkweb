import LoginForm from "@/components/auth/LoginForm";

export const metadata = { title: "Staff Sign In | Meadowlark Farm" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  return <LoginForm next={next && next.startsWith("/") ? next : "/admin"} />;
}
