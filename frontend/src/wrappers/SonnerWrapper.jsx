import { Toaster } from "sonner";
function SonnerWrapper({ children }) {
  return (
    <>
      {children}
      <Toaster />
    </>
  );
}

export default SonnerWrapper;
