import React from "react";

export default function EmptyState({ icon, title, description, action }: {
  icon: React.ComponentType<any> | React.ReactNode; title: string; description?: string; action?: React.ReactNode;
}) {
  const renderedIcon = React.isValidElement(icon)
    ? icon
    : (typeof icon === "function" || (typeof icon === "object" && icon !== null && "$$typeof" in icon))
      ? React.createElement(icon as any, { size: 28 })
      : icon;
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3">{renderedIcon}</div>
      <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
      {description && <p className="text-xs text-slate-500 mt-1 max-w-xs">{description}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}
