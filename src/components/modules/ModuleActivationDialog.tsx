import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogBody,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

interface ModuleActivationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  moduleName: string;
  moduleId: string;
  action: "activate" | "deactivate";
  tier: "core" | "addon" | "premium";
  price: number;
  currency: string;
  dependentModules?: string[];
  onConfirm: (reason: string, activationType: "plan_included" | "manual" | "addon" | "trial") => void;
}

export function ModuleActivationDialog({
  open,
  onOpenChange,
  moduleName,
  moduleId,
  action,
  tier,
  price,
  currency,
  dependentModules = [],
  onConfirm,
}: ModuleActivationDialogProps) {
  const [reason, setReason] = useState("");
  const [activationType, setActivationType] = useState<"plan_included" | "manual" | "addon" | "trial">("manual");

  const handleConfirm = () => {
    onConfirm(reason, activationType);
    setReason("");
    setActivationType("manual");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {action === "activate" ? "Activate" : "Deactivate"} {moduleName}?
          </DialogTitle>
          <DialogDescription className="space-y-3">
            {action === "activate" ? (
              <>
                <p>
                  This will enable the <strong>{moduleName}</strong> module for this institution.
                </p>
                {tier !== "core" && (
                  <p className="text-sm bg-muted p-2 rounded">
                    💰 Billing Impact: {currency} {price.toLocaleString()}/month
                  </p>
                )}
              </>
            ) : (
              <>
                <p>
                  This will disable the <strong>{moduleName}</strong> module. Users will lose access to this functionality.
                </p>
                {dependentModules.length > 0 && (
                  <p className="text-amber-600 bg-amber-50 dark:bg-amber-950/20 p-2 rounded text-sm">
                    ⚠️ Warning: These modules depend on {moduleName}:{" "}
                    <strong>{dependentModules.join(", ")}</strong>
                  </p>
                )}
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <DialogBody>
          <div className="space-y-4">
            {action === "activate" && (
              <div className="space-y-2">
                <Label htmlFor="activation-type">Activation Type</Label>
                <Select value={activationType} onValueChange={(v) => setActivationType(v as typeof activationType)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="plan_included">Plan Included</SelectItem>
                    <SelectItem value="manual">Manual Activation</SelectItem>
                    <SelectItem value="addon">Paid Add-on</SelectItem>
                    <SelectItem value="trial">Trial Period</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="reason">Reason (optional)</Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={action === "activate" ? "Why is this module being activated?" : "Why is this module being deactivated?"}
                rows={3}
              />
            </div>
          </div>
        </DialogBody>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleConfirm}>
            {action === "activate" ? "Activate Module" : "Deactivate Module"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
