import * as React from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function AssuranceUI({
  open,
  onOpenChange,
  warningMessage = "Are you sure?",
  onCancel,
  confirmation,
  children,
}) {
  const missingProps = [];
  if (open === undefined) missingProps.push("open");
  if (!onOpenChange) missingProps.push("onOpenChange");
  if (!onCancel) missingProps.push("onCancel");
  if (!confirmation) missingProps.push("confirmation");
  if (!children) missingProps.push("children");
  if (confirmation && !confirmation.text)
    missingProps.push("confirmation.text");
  if (confirmation && !confirmation.onConfirm)
    missingProps.push("confirmation.onConfirm");

  if (missingProps.length > 0) {
    console.error(
      `AssuranceUI is missing required props: ${missingProps.join(", ")}`
    );
    return null;
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        className="max-w-xs rounded-3xl p-0 overflow-hidden bg-white shadow-lg border border-gray-100 
                   animate-in fade-in-0 zoom-in-95 duration-200"
      >
        <DialogDescription></DialogDescription>
        <DialogHeader className="p-5 text-center flex justify-center items-center">
          <DialogTitle className="text-md font-normal text-gray-800 leading-relaxed">
            {warningMessage}
          </DialogTitle>
        </DialogHeader>
        <DialogFooter className="flex justify-center w-full h-[50px] border-t border-gray-200 divide-x divide-gray-200">
          <Button
            variant="ghost"
            onClick={onCancel}
            className="flex-1 py-3 rounded-none text-blue-500 font-normal text-md hover:bg-gray-200 h-full"
          >
            Cancel
          </Button>
          <Button
            variant="ghost"
            onClick={confirmation.onConfirm}
            className="flex-1 py-3 rounded-none text-red-500 font-normal text-md hover:bg-gray-200 h-full"
          >
            {confirmation.text || "I'm sure"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
