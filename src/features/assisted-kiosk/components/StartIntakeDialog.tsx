import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { AssistedPatient } from "@/features/assisted-kiosk/types";
export function StartIntakeDialog({
  patient,
  open,
  loading,
  onOpenChange,
  onConfirm,
}: {
  patient: AssistedPatient | null;
  open: boolean;
  loading: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}) {
  if (!patient) return null;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-lg">
        <DialogHeader>
          <p className="text-xs font-semibold uppercase text-primary">Assisted care</p>
          <DialogTitle className="text-2xl">Start assisted intake?</DialogTitle>
          <DialogDescription>
            You are about to begin an assisted patient intake. This demonstration does not create a
            real encounter.
          </DialogDescription>
        </DialogHeader>
        <div className="border-y border-border py-4">
          <p className="text-lg font-semibold">{patient.name}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {patient.age} years · {patient.language} · {patient.id}
          </p>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" className="min-h-12" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button className="min-h-12" onClick={onConfirm} disabled={loading}>
            {loading ? <Loader2 className="animate-spin" /> : <ArrowRight />}Start intake
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
