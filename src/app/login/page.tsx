import { LoginForm } from "@/components/auth/login-form";
import { Logo } from "@/components/logo";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
       <div className="w-full max-w-sm">
        <div className="flex justify-center mb-6">
            <Link href="/" className="flex items-center gap-2 text-primary">
                <Logo className="h-8 w-8" />
                <span className="text-2xl font-bold tracking-tight">Guardian Gate</span>
            </Link>
        </div>
        <LoginForm />
        <p className="mt-4 text-center text-sm text-muted-foreground">
            New to Guardian Gate?{" "}
            <Link href="#" className="font-medium text-primary hover:underline">
                Sign up
            </Link>
        </p>
      </div>
    </div>
  );
}
