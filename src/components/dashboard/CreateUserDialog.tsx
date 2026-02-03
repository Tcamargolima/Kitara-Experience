import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { adminCreateUser } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface CreateUserDialogProps {
  onUserCreated?: () => void;
}

/**
 * CreateUserDialog allows administrators to create new user accounts
 * directly from the dashboard. It uses Supabase auth to sign up the
 * user and then inserts corresponding records into the profiles and
 * user_roles tables. Only admins should have access to this dialog.
 */
const CreateUserDialog = ({ onUserCreated }: CreateUserDialogProps) => {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"admin" | "client">("client");
  const { toast } = useToast();

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setRole("client");
  };

  const handleCreate = async () => {
    if (!email.trim() || !password.trim()) {
      toast({
        title: "Validation error",
        description: "Email and password are required",
        variant: "destructive",
      });
      return;
    }
    try {
      // Create user via Supabase Auth signUp
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      const userId = data?.user?.id;
      if (userId) {
        await adminCreateUser(userId, email, role);
      }
      toast({ title: "Success", description: "User created successfully" });
      setOpen(false);
      resetForm();
      if (onUserCreated) onUserCreated();
    } catch (err: any) {
      const message = err?.message || "Failed to create user";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="kitara-button">New User</Button>
      </DialogTrigger>
      <DialogContent className="kitara-card">
        <DialogHeader>
          <DialogTitle className="font-cinzel text-secondary">Create New User</DialogTitle>
          <DialogDescription>Provide the credentials for the new account below</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Email</Label>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="kitara-input"
            />
          </div>
          <div>
            <Label>Password</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="kitara-input"
            />
          </div>
          <div>
            <Label>Role</Label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as "admin" | "client")}
              className="kitara-input"
              style={{
                backgroundColor: 'var(--input)',
                color: 'var(--foreground)',
                padding: '0.5rem 0.75rem',
              }}
            >
              <option value="client">Client</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleCreate} className="kitara-button">Create User</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateUserDialog;
