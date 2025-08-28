import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

function DialogBox({ title, description, children, onClose = null }) {
  return (
    onClose && (
      <Dialog>
        <DialogTrigger>
          <Button asChild variant={"outline"}>
            <div>{title}</div>
          </Button>
        </DialogTrigger>
        <DialogContent className={`font-inter font-[500] text-lg`}>
          <DialogHeader>
            <DialogTitle className={`text-3xl`}>{title}</DialogTitle>
            <DialogDescription className={`text-lg`}>
              {description}
            </DialogDescription>
          </DialogHeader>
          {children}
          <DialogFooter>
            <DialogClose>
              <Button asChild variant="secondary">
                <div>Cancel</div>
              </Button>{" "}
            </DialogClose>
            <DialogClose>
              <Button asChild>
                <div onClick={onClose.action}>{onClose.title}</div>
              </Button>{" "}
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  );
}

export default DialogBox;
