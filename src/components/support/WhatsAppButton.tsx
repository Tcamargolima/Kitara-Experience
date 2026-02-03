import { useState } from "react";
import { MessageCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { createSupportSession } from "@/lib/api";

export const WhatsAppButton = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleClick = async () => {
    setLoading(true);

    try {
      const result = await createSupportSession();

      if (result.success && result.whatsapp_url) {
        // Open WhatsApp
        window.open(result.whatsapp_url, "_blank");
        
        toast({
          title: "Sessão de suporte criada",
          description: `ID: ${result.session_id}`,
        });
      } else {
        toast({
          title: "Erro",
          description: result.error || "Não foi possível criar sessão de suporte.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível conectar ao suporte.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleClick}
      disabled={loading}
      className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full p-0 bg-[#25D366] hover:bg-[#128C7E] shadow-lg shadow-[#25D366]/30 transition-all duration-300 hover:scale-110"
      aria-label="Suporte WhatsApp"
    >
      {loading ? (
        <Loader2 className="h-6 w-6 animate-spin text-white" />
      ) : (
        <MessageCircle className="h-6 w-6 text-white" />
      )}
    </Button>
  );
};
