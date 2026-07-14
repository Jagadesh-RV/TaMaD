import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

export default function Layout() {
  return (
    <div className="min-h-screen flex relative overflow-hidden bg-background text-[#111111]">
      <Sidebar />
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto relative z-10 bg-background">
        <Outlet />
      </main>
    </div>
  );
}