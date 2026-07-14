import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

export default function AppLayout() {
  return (
    <div className="layout bg-background text-[#111111]">
      <Sidebar />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}