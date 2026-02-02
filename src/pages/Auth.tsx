import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Sparkles } from "lucide-react";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);

  const { isAuthenticated, loading, signIn, signUp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && !loading) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, loading, navigate]);

  const handleAuth = async () => {
    if (!email.trim() || !password.trim()) {
      toast({
        title: "Error",
        description: "Please fill in email and password",
        variant: "destructive",
      });
      return;
    }

    let result;
    if (isSignUp) {
      result = await signUp(email, password);
    } else {
      result = await signIn(email, password);
    }

    if (result.success) {
      toast({
        title: "Success",
        description: isSignUp ? "Account created successfully!" : "Login successful!",
      });
      navigate("/dashboard");
    } else {
      toast({
        title: "Error",
        description: result.error || "Authentication failed",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen kitara-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-4 border-primary mx-auto mb-4"></div>
          <p className="text-primary">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen kitara-bg flex items-center justify-center">
      <Card className="kitara-card w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <img src="/kitara/assets/logo.png" alt="KITARA logo" className="h-16 w-16 drop-shadow-lg" />
              <Sparkles className="h-6 w-6 text-secondary absolute -top-1 -right-1 animate-pulse" />
            </div>
          </div>
          <CardTitle className="kitara-title text-4xl font-cinzel mb-2">KITARA</CardTitle>
          <CardDescription className="text-lg text-muted-foreground">
            {isSignUp ? "Create your account" : "Sign in to continue"}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-secondary font-cinzel">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="kitara-input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-secondary font-cinzel">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="kitara-input"
              />
            </div>
            <Button
              onClick={handleAuth}
              className="kitara-button w-full"
              disabled={loading}
            >
              {loading ? "Loading..." : isSignUp ? "Create Account" : "Sign In"}
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-sm text-secondary hover:underline"
              >
                {isSignUp ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
