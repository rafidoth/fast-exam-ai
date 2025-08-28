import { Button } from "@/components/ui/button";
import { useSession } from "../context/SessionContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useEffect, useState } from "react";

function UserProfileDialog({ open }) {
  const session = useSession();
  const userDetails = session?.user?.user_metadata;
  const avatarUrl =
    "https://api.dicebear.com/7.x/initials/svg?seed=" + userDetails?.full_name;

  if (!session.isAuthenticated) {
    return null;
  }

  return (
    <Dialog>
      <DialogTrigger>
        <UserProfileDialogButton open={open} userDetails={userDetails} />
      </DialogTrigger>
      <DialogContent className={"font-inter font-medium"}>
        <DialogTitle></DialogTitle>
        <DialogHeader></DialogHeader>
        <div className="flex flex-col gap-y-2">
          <div className="flex gap-x-4">
            {avatarUrl !== "undefined" && (
              <img
                src={avatarUrl}
                alt="User Avatar"
                className="w-25 h-25 rounded-4xl object-cover "
              />
            )}
            <div className="flex flex-col">
              <p className="text-xl font-semibold">{userDetails?.full_name}</p>
              <p className="text-sm text-gray-500/80">{userDetails?.email}</p>
              <Button
                variant={"ghost"}
                className={
                  "my-4 w-25 text-sm font-semibold border border-red-500 bg-red-500/10 hover:bg-red-500/20"
                }
                onClick={session.signOut}
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function UserProfileDialogButton({ open, userDetails }) {
  const avatarUrl =
    "https://api.dicebear.com/7.x/initials/svg?seed=" + userDetails?.full_name;
  return (
    <div className="w-full flex justify-center py-2">
      {!open ? (
        <div className="h-[60px] flex items-center justify-center">
          {avatarUrl && (
            <img
              src={avatarUrl}
              alt="User Avatar"
              className="w-10 h-10 rounded-full object-cover border-2 border-black"
            />
          )}
        </div>
      ) : (
        <Button asChild variant={"default"}>
          <div className={"flex h-[60px] border-none"}>
            <div className="flex items-center justify-center">
              {avatarUrl && (
                <img
                  src={avatarUrl}
                  alt="User Avatar"
                  className="w-10 h-10 rounded-full object-cover border-2 border-black"
                />
              )}
            </div>
            <div>{userDetails?.name}</div>
          </div>
        </Button>
      )}
    </div>
  );
}

export default UserProfileDialog;
