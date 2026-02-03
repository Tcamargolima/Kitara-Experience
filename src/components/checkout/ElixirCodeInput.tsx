import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Check, X } from "lucide-react";
import { applyElixir, type ElixirValidation } from "@/lib/api";

interface Props {
  value?: string;
  onApplied?: (result: ElixirValidation | null) => void;
}

export const ElixirCodeInput = ({ value = "", onApplied }: Props) => {
  const [code, setCode] = useState(value);
  const [validating, setValidating] = useState(false);
  const [result, setResult] = useState<ElixirValidation | null>(null);

  const handleApply = async () => {
    if (!code.trim()) return;
    setValidating(true);
    try {
      const res = await applyElixir(code.trim().toUpperCase());
      setResult(res);
      if (onApplied) onApplied(res);
    } finally {
      setValidating(false);
    }
  };

  return (
    <div>
      <div className="flex gap-2">
        <Input value={code} onChange={(e) => { setCode(e.target.value.toUpperCase()); setResult(null); }} placeholder="ELIXIR2024" className="kitara-input font-mono" />
        <Button onClick={handleApply} disabled={validating || !code.trim()} variant="outline" className="border-secondary text-secondary">
          {validating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Aplicar"}
        </Button>
      </div>
      {result && (
        <div className={`mt-2 flex items-center gap-2 text-sm ${result.valid ? "text-primary" : "text-destructive"}`}>
          {result.valid ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
          {result.message}
        </div>
      )}
    </div>
  );
};

export default ElixirCodeInput;
