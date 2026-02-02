import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CreateTicketDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  userId: string;
}

const CreateTicketDialog = ({ open, onOpenChange, onSuccess, userId }: CreateTicketDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] kitara-card">
        <DialogHeader>
          <DialogTitle className="font-cinzel text-secondary">Create Ticket</DialogTitle>
          <DialogDescription>
            Ticket creation functionality coming soon.
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTicketDialog;
