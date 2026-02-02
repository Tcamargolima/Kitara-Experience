import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CreateSubscriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  userId: string;
}

const CreateSubscriptionDialog = ({ open, onOpenChange, onSuccess, userId }: CreateSubscriptionDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] kitara-card">
        <DialogHeader>
          <DialogTitle className="font-cinzel text-secondary">Create Subscription</DialogTitle>
          <DialogDescription>
            Subscription creation functionality coming soon.
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default CreateSubscriptionDialog;
