import * as React from "react";
import { cn } from "../../lib/utils";

const TabsContext = React.createContext({ activeTab: "", setActiveTab: () => {} });

function Tabs({ value, onValueChange, className, children }) {
  const [tabState, setTabState] = React.useState(value);
  const currentTab = value !== undefined ? value : tabState;
  const setTab = onValueChange || setTabState;

  return (
    <TabsContext.Provider value={{ activeTab: currentTab, setActiveTab: setTab }}>
      <div className={cn("space-y-4", className)}>{children}</div>
    </TabsContext.Provider>
  );
}

function TabsList({ className, children }) {
  return (
    <div
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-lg bg-zinc-900 p-1 text-zinc-400 border border-zinc-800",
        className
      )}
    >
      {children}
    </div>
  );
}

function TabsTrigger({ value, className, children }) {
  const { activeTab, setActiveTab } = React.useContext(TabsContext);
  const isActive = activeTab === value;

  return (
    <button
      type="button"
      onClick={() => setActiveTab(value)}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3.5 py-1.5 text-xs font-bold transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400 disabled:pointer-events-none disabled:opacity-50",
        isActive
          ? "bg-zinc-100 text-zinc-950 shadow-sm"
          : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50",
        className
      )}
    >
      {children}
    </button>
  );
}

function TabsContent({ value, className, children }) {
  const { activeTab } = React.useContext(TabsContext);
  if (activeTab !== value) return null;

  return (
    <div className={cn("mt-2 ring-offset-zinc-950 focus-visible:outline-none animate-fade-in", className)}>
      {children}
    </div>
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
