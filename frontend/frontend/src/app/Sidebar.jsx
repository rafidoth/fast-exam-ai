import { File } from "lucide-react";
import { useState, useEffect } from "react";
import { NavLink } from "react-router";
import { useSession } from "../context/SessionContext";
import { fetchUserQuizsets } from "../api";
import UserProfileDialog from "./UserProfileDialog";
import { Timer } from "lucide-react";
import { Plus } from "lucide-react";
import { Columns2 } from "lucide-react";

function Sidebar() {
  const [open, setOpen] = useState(true);
  const [userQuizsets, setUserQuizsets] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const navItems = [
    { path: "/", label: "Create New Quiz Set", icon: <Plus /> },
    { path: "/exams", label: "Exams", icon: <Timer /> },
  ];

  const session = useSession();
  const userId = session?.user?.id;

  useEffect(() => {
    async function loadUserQuizsets() {
      if (!userId) return;
      setIsLoading(true);
      try {
        const quizsets = await fetchUserQuizsets(userId, 5);
        setUserQuizsets(quizsets);
      } catch (error) {
        console.error("Error fetching quizsets:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadUserQuizsets();
  }, [userId]);

  return (
    <SidebarUI
      open={open}
      navItems={navItems}
      userQuizsets={userQuizsets}
      isLoading={isLoading}
      setOpen={setOpen}
      session={session}
    />
  );
}

export default Sidebar;

function SidebarUI({
  open,
  navItems,
  userQuizsets,
  isLoading,
  setOpen,
  session,
}) {
  return (
    <div
      className={`bg-primary/10 rounded-r-2xl h-full transition-all duration-500 border-r border-primary/10 outline-none ${
        open ? "w-[300px]" : "w-[60px]"
      }`}
    >
      <div className="flex flex-col h-full">
        <button onClick={() => setOpen(!open)} className="p-4 outline-none">
          <Columns2 />
        </button>
        <nav className="flex-1 flex flex-col">
          <div>
            {navItems.map((item) => (
              <SidebarRow key={item.path} item={item} open={open} />
            ))}
          </div>

          {session.isAuthenticated && open && (
            <RecentQuizsetsList
              userQuizsets={userQuizsets}
              isLoading={isLoading}
            />
          )}
        </nav>
        <UserProfileDialog open={open} />
      </div>
    </div>
  );
}

function SidebarRow({ item, open }) {
  return (
    <div>
      <NavLink to={item.path} className="outline-none">
        {({ isActive }) => (
          <div
            className={`flex items-center py-2 px-4 text-sidebar-foreground hover:bg-accent/20 rounded-md transition-colors gap-x-2 
                    ${open ? "mx-2" : "mx-1 justify-center "}
                    ${
                      isActive
                        ? " border border-primary bg-primary/20 hover:bg-primary/20"
                        : ""
                    }`}
          >
            <span className="w-6 h-6">{item.icon}</span>
            {open && (
              <span
                className={`whitespace-nowrap overflow-hidden text-ellipsis
                            ${
                              isActive
                                ? "font-semibold px-2 rounded-sm font-bold font-black"
                                : "font-regular"
                            }`}
              >
                {item.label}
              </span>
            )}
          </div>
        )}
      </NavLink>
    </div>
  );
}

function RecentQuizsetsList({ userQuizsets, isLoading }) {
  return (
    <div className="mt-6 px-4">
      <h3 className="text-sm font-medium text-gray-500 mb-2">
        Recent Quizsets
      </h3>
      {isLoading ? (
        <div className="py-2 text-sm text-gray-400">Loading...</div>
      ) : userQuizsets.length > 0 ? (
        <div className="space-y-1">
          {userQuizsets.map((quizset) => (
            <NavLink key={quizset.id} to={`/q/${quizset.id}`}>
              {({ isActive }) => (
                <div
                  className={`flex items-center py-1.5 px-2 rounded-sm text-sm
                            ${
                              isActive
                                ? "bg-black text-white"
                                : "hover:bg-accent"
                            }
                          `}
                >
                  <span className="mr-2">
                    <File size={14} />
                  </span>
                  <span className="truncate">{quizset.title}</span>
                </div>
              )}
            </NavLink>
          ))}
        </div>
      ) : (
        <div className="py-2 text-sm text-gray-400">No quizsets found</div>
      )}
    </div>
  );
}
