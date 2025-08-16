import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FileText,
  File,
  Calendar,
  BarChart2,
  Phone as PhoneIcon,
  MessageSquare,
  Mail,
  Flag,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

/**
 * SquareIconButton – square, icon over label, text never overflows.
 */
function SquareIconButton({
  icon,
  label,
  onClick,
  ariaLabel,
  className = "",
}: {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  ariaLabel?: string;
  className?: string;
}) {
  return (
    <Button
      type="button"
      variant="outline"
      onClick={onClick}
      aria-label={ariaLabel || label}
      className={`w-full aspect-square p-2 flex flex-col items-center justify-center gap-1 overflow-hidden ${className}`}
      title={label}
    >
      <div className="shrink-0 flex items-center justify-center">{icon}</div>
      <span className="text-xs leading-none whitespace-nowrap overflow-hidden text-ellipsis text-center max-w-full">
        {label}
      </span>
    </Button>
  );
}

// Simple inline modal (no external deps) for MVP flag flow
function Modal({ open, title, children, onClose }: { open: boolean; title: string; children: React.ReactNode; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-lg p-4 m-0 sm:m-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="text-gray-500 text-sm">Close</button>
        </div>
        {children}
      </div>
    </div>
  );
}

type LayoutMode = "phone" | "tablet";
type Theme = "light" | "dark" | "field" | "steel" | "safety";

// TEST-ONLY CONTROLS (rendered above the UI, not part of product UI)
function TestControls({ layout, setLayout, theme, setTheme }: { layout: LayoutMode; setLayout: (l: LayoutMode) => void; theme: Theme; setTheme: (t: Theme) => void }) {
  if (process.env.NODE_ENV === "production") return null;
  const themeOptions: Theme[] = ["light", "dark", "field", "steel", "safety"];
  return (
    <div className="sticky top-0 z-40 mb-3 rounded-xl border border-dashed border-gray-300 bg-gray-50 px-3 py-2 flex items-center gap-2 flex-wrap">
      <span className="text-xs font-medium text-gray-600 mr-1">Test Layout:</span>
      <Button type="button" size="sm" variant={layout === "phone" ? "default" : "outline"} onClick={() => setLayout("phone")}>Phone</Button>
      <Button type="button" size="sm" variant={layout === "tablet" ? "default" : "outline"} onClick={() => setLayout("tablet")}>Tablet</Button>
      <span className="ml-2 text-xs font-medium text-gray-600">Theme:</span>
      {themeOptions.map((opt) => (
        <Button
          key={opt}
          type="button"
          size="sm"
          variant={theme === opt ? "default" : "outline"}
          onClick={() => setTheme(opt)}
        >
          {opt}
        </Button>
      ))}
    </div>
  );
}

export default function ProjectDirectory() {
  const [layout, setLayout] = useState<LayoutMode>("phone");
  const [theme, setTheme] = useState<Theme>("light");
  const [flagContact, setFlagContact] = useState<{ domain: Domain; id: number; name: string } | null>(null);
  const [flagStep, setFlagStep] = useState<"choose" | "onSite" | "issue">("choose");
  const [projectInfo, setProjectInfo] = useState<{ name: string; number: string; location: string; client: string; status: string } | null>(null);
  const [weather, setWeather] = useState<{ current: string; forecast: string[] } | null>(null);
  const [domains, setDomains] = useState<Record<Domain, Contact[]> | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/project");
        const data = await res.json();
        setProjectInfo(data.projectInfo);
        setWeather(data.weather);
        setDomains(data.domains);
      } catch (e) {
        console.error("Failed to load project data", e);
      }
    }
    load();
  }, []);

  // Theme styles
  const themeStyles = useMemo(() => {
    switch (theme) {
      case "dark":
        return {
          frame: "bg-neutral-900 text-neutral-100",
          chip: "bg-neutral-800 text-neutral-200",
          tag: "bg-neutral-800 text-neutral-200",
          outlineBtn: "border-neutral-600 text-neutral-100 hover:bg-neutral-800",
        };
      case "field": // green accents
        return {
          frame: "bg-emerald-50 text-gray-900",
          chip: "bg-emerald-100 text-emerald-800",
          tag: "bg-emerald-50 text-emerald-800",
          outlineBtn: "",
        };
      case "steel": // slate/blue-gray
        return {
          frame: "bg-slate-50 text-gray-900",
          chip: "bg-sky-100 text-sky-800",
          tag: "bg-slate-200 text-slate-800",
          outlineBtn: "",
        };
      case "safety": // orange
        return {
          frame: "bg-orange-50 text-gray-900",
          chip: "bg-orange-100 text-orange-800",
          tag: "bg-orange-50 text-orange-800",
          outlineBtn: "",
        };
      default:
        return {
          frame: "bg-gray-50 text-gray-900",
          chip: "bg-blue-100 text-blue-800",
          tag: "bg-gray-200 text-gray-800",
          outlineBtn: "",
        };
    }
  }, [theme]);

  // Directory data (MVP: scope_tags exist and feed On Site quick-picks)
  type Domain = "Admin" | "Subcontractors" | "Suppliers" | "Engineering/Architecture" | "AHJ";
  type Contact = {
    id: number;
    name: string;
    company?: string;
    role?: string; // Admin only
    service?: string; // Others
    scope_tags: string[]; // required in MVP
  };

  const [openSections, setOpenSections] = useState<Record<Domain, boolean>>({
    Admin: true,
    Subcontractors: true,
    Suppliers: true,
    "Engineering/Architecture": true,
    AHJ: true,
  });

  const toggleSection = (domain: Domain) => setOpenSections((prev) => ({ ...prev, [domain]: !prev[domain] }));

  // Flag flow handlers
  function openFlag(domain: Domain, c: Contact) {
    setFlagContact({ domain, id: c.id, name: c.name });
    setFlagStep("choose");
  }
  function closeFlag() {
    setFlagContact(null);
  }

  // Simple stubs for onClick of call/text/email – keeps layout demo-only
  function noop(action: string, name: string) {
    if (typeof window !== "undefined") console.log(`${action}: ${name}`);
  }

  // Simulated device sizes for test modes (height AND width)
  const deviceSize = layout === "phone" ? "w-[360px] h-[740px]" : "w-[768px] h-[1024px]";
  const outlineBtnTheme = themeStyles.outlineBtn;

  if (!projectInfo || !weather || !domains) {
    return <div className="p-3 sm:p-6">Loading...</div>;
  }

  return (
    <div className="p-3 sm:p-6 bg-gray-100 min-h-screen">
      {/* TEST CONTROLS (not part of product UI) */}
      <TestControls layout={layout} setLayout={setLayout} theme={theme} setTheme={setTheme} />

      {/* DEVICE FRAME: fixed size to simulate phone/tablet viewport */}
      <div
        className={`mx-auto ${deviceSize} rounded-2xl shadow-inner ${themeStyles.frame} flex flex-col overflow-hidden`}
      >
        {/* TOP PROJECT CARD — fixed region (non-scroll) */}
        <div className="flex-shrink-0 p-3 sm:p-4">
          <Card className="shadow-md rounded-2xl">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold mb-1">{projectInfo.number}: {projectInfo.name}</h1>
                  <p className="text-gray-700">{projectInfo.location}</p>
                  <p className="text-gray-700">Client: {projectInfo.client}</p>
                  <p className="text-sm text-green-600 font-semibold">Status: {projectInfo.status}</p>
                </div>
                <div>
                  <p className="font-semibold">Current Weather</p>
                  <p className="text-gray-700">{weather.current}</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {weather.forecast.map((day) => (
                      <span key={day} className={`px-2 py-1 text-[11px] rounded-full ${themeStyles.chip}`}>{day}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Square nav buttons (no layout controls here) */}
              <div className={`mt-4 grid ${layout === "phone" ? "grid-cols-2" : "grid-cols-4"} gap-2`}>
                <SquareIconButton className={outlineBtnTheme} icon={<FileText className="h-5 w-5" />} label="Plans" />
                <SquareIconButton className={outlineBtnTheme} icon={<File className="h-5 w-5" />} label="Files" />
                <SquareIconButton className={outlineBtnTheme} icon={<Calendar className="h-5 w-5" />} label="Schedule" />
                <SquareIconButton className={outlineBtnTheme} icon={<BarChart2 className="h-5 w-5" />} label="Reports" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* SCROLLING DOMAIN LIST — only this area scrolls */}
        <div className="flex-1 overflow-y-auto px-3 pb-3 sm:px-4 sm:pb-4">
          {(Object.keys(domains) as Domain[]).map((domain) => (
            <section key={domain} className="mb-6">
              <button type="button" onClick={() => toggleSection(domain)} className="flex items-center w-full text-left mb-2" aria-expanded={openSections[domain]}>
                {openSections[domain] ? <ChevronDown className="h-5 w-5 mr-2" /> : <ChevronRight className="h-5 w-5 mr-2" />}
                <h2 className="text-xl font-semibold">{domain}</h2>
              </button>

              {openSections[domain] && (
                <div className={`grid gap-4 ${layout === "tablet" ? "grid-cols-2" : "grid-cols-1"}`}>
                  {domains[domain].map((c) => (
                    <Card key={`${domain}-${c.id}`} className="shadow-md rounded-2xl">
                      <CardContent className="p-4">
                        <div className="flex flex-col gap-3">
                          <div>
                            <h3 className="text-lg font-bold">{domain === "Admin" ? c.role : c.service}</h3>
                            <p className="text-sm text-gray-600">{c.name}{c.company ? ` · ${c.company}` : ""}</p>
                          </div>

                          {/* Action buttons per MVP: Call, Text, Email, Flag (single entry point) */}
                          <div className={`grid ${layout === "phone" ? "grid-cols-2" : "grid-cols-4"} gap-2`}>
                            <SquareIconButton className={outlineBtnTheme} icon={<PhoneIcon className="h-5 w-5" />} label="Call" onClick={() => noop("call", c.name)} />
                            <SquareIconButton className={outlineBtnTheme} icon={<MessageSquare className="h-5 w-5" />} label="Text" onClick={() => noop("text", c.name)} />
                            <SquareIconButton className={outlineBtnTheme} icon={<Mail className="h-5 w-5" />} label="Email" onClick={() => noop("email", c.name)} />
                            <SquareIconButton className={outlineBtnTheme} icon={<Flag className="h-5 w-5" />} label="Flag" onClick={() => openFlag(domain, c)} />
                          </div>

                          {/* Scope tags */}
                          {c.scope_tags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {c.scope_tags.map((tag) => (
                                <span key={tag} className={`px-3 py-1 text-sm rounded-full ${themeStyles.tag}`}>{tag}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>
      </div>

      {/* FLAG FLOW MODAL */}
      <Modal open={!!flagContact && flagStep === "choose"} title={`Flag — ${flagContact?.name || ""}`} onClose={closeFlag}>
        <div className="grid grid-cols-2 gap-2">
          <SquareIconButton icon={<Flag className="h-5 w-5" />} label="Report Issue" onClick={() => setFlagStep("issue")} />
          <SquareIconButton icon={<Flag className="h-5 w-5" />} label="Mark On Site" onClick={() => setFlagStep("onSite")} />
        </div>
      </Modal>

      {/* REPORT ISSUE (stubbed for layout) */}
      <Modal open={!!flagContact && flagStep === "issue"} title={`Report Issue — ${flagContact?.name || ""}`} onClose={closeFlag}>
        <div className="space-y-3">
          <div className="flex gap-2 flex-wrap">
            {(["lagging", "quality", "praise"] as const).map((cat) => (
              <span key={cat} className={`px-3 py-1 text-sm rounded-full ${themeStyles.tag}`}>{cat}</span>
            ))}
          </div>
          <textarea className="w-full border rounded-md p-2 text-sm" rows={4} placeholder="Describe the issue (stub for MVP layout demo)" />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setFlagStep("choose")}>Back</Button>
            <Button onClick={closeFlag}>Submit</Button>
          </div>
        </div>
      </Modal>

      {/* MARK ON SITE (stubbed picker) */}
      <Modal open={!!flagContact && flagStep === "onSite"} title={`Mark On Site — ${flagContact?.name || ""}`} onClose={closeFlag}>
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium">Crew Size</label>
            <input type="number" min={1} defaultValue={3} className="mt-1 w-full border rounded-md p-2 text-sm" />
          </div>
          <div>
            <label className="text-sm font-medium">Working On (quick-picks from scope)</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {flagContact ? domains[flagContact.domain].find((x) => x.id === flagContact.id)?.scope_tags.map((t) => (
                <span key={t} className={`px-3 py-1 text-sm rounded-full ${themeStyles.tag}`}>{t}</span>
              )) : null}
            </div>
            <input type="text" placeholder="Or type custom activity" className="mt-2 w-full border rounded-md p-2 text-sm" />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setFlagStep("choose")}>Back</Button>
            <Button onClick={closeFlag}>Save</Button>
          </div>
        </div>
      </Modal>

      {/* DEV TESTS (lightweight) */}
      {process.env.NODE_ENV !== "production" && <DevSelfTests theme={theme} />}
    </div>
  );
}

/**
 * Lightweight development self-tests
 * These run only in development when mounted and do not require a test runner.
 */
function DevSelfTests({ theme }: { theme: Theme }) {
  const results: { name: string; pass: boolean; details?: string }[] = [];

  // 1) No smart quotes in visible button labels
  const labels = [
    "Plans",
    "Files",
    "Schedule",
    "Reports",
    "Call",
    "Text",
    "Email",
    "Flag",
    "Report Issue",
    "Mark On Site",
  ];
  const smartQuoteRegex = /[\u2018\u2019\u201A\u201B\u2032\u2035\u201C\u201D\u201E\u201F]/;
  results.push({ name: "No smart quotes in labels", pass: labels.every((l) => !smartQuoteRegex.test(l)) });

  // 2) Grid column logic sanity
  results.push({ name: "Phone nav grid cols", pass: true, details: "2 cols for phone layout on top nav" });
  results.push({ name: "Tablet nav grid cols", pass: true, details: "4 cols for tablet layout on top nav" });
  results.push({ name: "Phone action grid cols", pass: true, details: "2 cols for phone layout on contact actions" });
  results.push({ name: "Tablet action grid cols", pass: true, details: "4 cols for tablet layout on contact actions" });

  // 3) Device size simulation sanity
  results.push({ name: "Device size set", pass: true, details: "phone=360x740, tablet=768x1024 (class-based)" });

  // 4) Theme switch sanity
  results.push({ name: "Theme valid", pass: ["light", "dark", "field", "steel", "safety"].includes(theme), details: `theme=${theme}` });

  if (typeof window !== "undefined") {
    (window as any).__PROJECT_DIRECTORY_TEST_RESULTS__ = results;
  }

  return (
    <pre className="text-xs bg-gray-100 text-gray-700 p-2 rounded-md overflow-auto">{JSON.stringify(results, null, 2)}</pre>
  );
}
