import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import FloatingOrb from "../ui/FloatingOrb";

export default function Layout() {
  return (
    <div className="min-h-screen flex relative overflow-hidden bg-grid">

      <FloatingOrb
        size={500}
        top="-120px"
        left="-120px"
        color="rgba(59,130,246,.25)"
      />

      <FloatingOrb
        size={400}
        bottom="-100px"
        right="-100px"
        color="rgba(168,85,247,.25)"
      />

      <FloatingOrb
        size={300}
        top="40%"
        left="40%"
        color="rgba(236,72,153,.15)"
      />

      <Sidebar />

      <main className="flex-1 p-8 overflow-auto relative z-10">
        <Outlet />
      </main>
    </div>
  );
}