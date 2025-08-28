import { Outlet } from "react-router";
import "./App.css";
import Sidebar from "./app/Sidebar";
import LoginPage from "./app/Auth";

function App({ children }) {
  return (
    <div className="h-[100vh] flex">
      <Sidebar />
      <main className="h-full flex-1 overflow-hidden">
        {children || <Outlet />}
      </main>
    </div>
  );
}

export default App;
