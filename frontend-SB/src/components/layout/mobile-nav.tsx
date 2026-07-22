import { NavLink } from "react-router-dom";
import { Home, Store, MessageSquareWarning, Bell } from "lucide-react";
import { useAuth } from "@/contexts/auth_context";
import { cn } from "@/lib/utils";

const items = [
  { to: "/customer", label: "Home", icon: Home },
  { to: "/customer/restaurants", label: "Restaurants", icon: Store },
  { to: "/customer/complaints", label: "Complaints", icon: MessageSquareWarning },
  { to: "/customer/notifications", label: "Alerts", icon: Bell },
];

export default function MobileNav() {
  const { role } = useAuth();
  const navItems = items.filter((i) => i.to.startsWith(`/${role}`));

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 z-50 lg:hidden">
      <div className="flex items-center justify-around py-1.5">
        {navItems.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.to.split("/").length <= 2}
            className={({ isActive }) => cn(
              "flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition text-[10px] font-medium",
              isActive ? "text-primary-600" : "text-slate-400"
            )}>
            <item.icon size={18} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
