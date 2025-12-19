import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GoogleIcon } from "@/components/ui/provider-icons";
import { authClient } from "@/lib/auth-client";
import {
  createFileRoute,
  Link,
  redirect,
  useRouter,
} from "@tanstack/react-router";
import { Facebook, FileText, Github } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/login")({
  beforeLoad: async () => {
    const { data: session } = await authClient.getSession();

    if (session) {
      throw redirect({ to: "/dashboard" });
    }
  },
  component: LoginPage,
});

function LoginPage() {
  const [isSignUp, setIsSignUp] = useState<boolean>(false);
  const [fullName, setFullName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (isSignUp) {
        const { error } = await authClient.signUp.email({
          email,
          password,
          name: fullName,
        });

        if (error) {
          return;
        }

        setIsSignUp(false);
        return;
      }

      const { error } = await authClient.signIn.email({
        email,
        password,
      });

      if (error) {
        return;
      }

      router.navigate({ to: "/" });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="flex min-h-screen">
      <div className="flex flex-1 flex-col justify-center px-6 py-12 bg-linear-to-br from-background to-muted/30">
        <div className="mx-auto w-full max-w-md">
          <Link to="/" className="mb-8 flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <FileText className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-3xl font-semibold">HyperDocs</span>
          </Link>

          <div className="mb-6">
            <h1 className="text-2xl font-semibold">
              {isSignUp ? "Create your account" : "Welcome back"}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {isSignUp
                ? "Start collaborating with your team today"
                : "Sign in to continue to your documents"}
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <Button
              variant="outline"
              className="w-full flex items-center gap-2 bg-transparent font-medium hover:border-primary/50"
              onClick={async () => {
                await authClient.signIn.social({
                  provider: "google",
                  callbackURL: `${window.location.origin}/`,
                });
              }}
            >
              <GoogleIcon className="h-4 w-4" />
              Continue with Google
            </Button>

            <Button
              variant="outline"
              className="w-full flex items-center gap-2 bg-transparent font-medium hover:border-primary/50"
              onClick={async () => {
                await authClient.signIn.social({
                  provider: "github",
                  callbackURL: `${window.location.origin}/`,
                });
              }}
            >
              <Github className="h-4 w-4" />
              Continue with GitHub
            </Button>

            <Button
              variant="outline"
              className="w-full flex items-center gap-2 bg-transparent font-medium hover:border-primary/50"
              onClick={async () => {
                await authClient.signIn.social({
                  provider: "facebook",
                  callbackURL: `${window.location.origin}/`,
                });
              }}
            >
              <Facebook className="h-4 w-4" />
              Continue with Facebook
            </Button>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with email
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {isSignUp && (
              <div className="flex flex-col gap-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="Name"
                  type="text"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
            )}
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full font-semibold">
              {isSignUp ? "Create account" : "Sign in"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
            <span
              onClick={() => setIsSignUp(!isSignUp)}
              className="font-medium text-foreground hover:underline cursor-pointer"
            >
              {isSignUp ? "Sign in" : "Sign up"}
            </span>
          </p>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center bg-linear-to-br from-primary/10 via-primary/5 to-background overflow-hidden">
        <div className="max-w-md px-8 text-center">
          <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/30">
            <FileText className="h-8 w-8 text-primary-foreground" />
          </div>
          <h2 className="text-2xl font-semibold tracking-tight">
            Write smarter, together
          </h2>
          <p className="mt-3 text-muted-foreground">
            Real-time collaboration and AI-powered writing. Everything you need
            to create great documents.
          </p>
        </div>
      </div>
    </div>
  );
}
