import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card.tsx";
import { Button } from "@/components/ui/button.tsx";
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
  Settings,
} from "lucide-react";
import { supabase } from './supabaseClient';

/**
 * SquareIconButton – square, icon over label, text never overflows.
 */
function SquareIconButton({
  icon,
  label,
  onClick,
  ariaLabel,
  className = "",
  variant = "outline", // Add variant prop with default value
}: {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  ariaLabel?: string;
  className?: string;
  variant?: 'default' | 'outline'; // Add variant to the prop type
}) {
  return (
    <Button
      type="button"
      variant={variant} // Pass variant down to Button
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
      <div className="relative w-full sm:max-w-md bg-card rounded-t-2xl sm:rounded-2xl shadow-lg p-4 m-0 sm:m-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="text-muted-foreground text-sm">Close</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function ProjectDirectory() {
  const [flagContact, setFlagContact] = useState<{ domain: Domain; id: number; name: string } | null>(null);
  const [flagStep, setFlagStep] = useState<"choose" | "onSite" | "issue">("choose");
  const [projectInfo, setProjectInfo] = useState<{ name: string; number: string; location: string; client: string; status: string; id: string } | null>(null);
  const [weather, setWeather] = useState<{ current: string; forecast: string[] } | null>(null);
  const [domains, setDomains] = useState<Record<Domain, Contact[]> | null>(null);
  const [issueDescription, setIssueDescription] = useState<string>("");
  const [crewSize, setCrewSize] = useState<number>(3);
  const [workingOn, setWorkingOn] = useState<string>("");
  const [openSettingsModal, setOpenSettingsModal] = useState(false);
  const [editableProjectInfo, setEditableProjectInfo] = useState(projectInfo);
  const [openReportsModal, setOpenReportsModal] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        // Fetch project info
        const { data: projectData, error: projectError } = await supabase.from('projects').select('*').single();
        if (projectError) throw projectError;
        setProjectInfo(projectData);
        setEditableProjectInfo(projectData);

        // Fetch weather data
        const { data: weatherData, error: weatherError } = await supabase.from('weather').select('*').single();
        if (weatherError) throw weatherError;
        setWeather(weatherData);

        // Fetch contacts and group by domain
        const { data: contactsData, error: contactsError } = await supabase.from('contacts').select('*');
        if (contactsError) throw contactsError;

        const groupedContacts = contactsData.reduce((acc: Record<Domain, Contact[]>, contact: Contact) => {
          const domain = contact.domain as Domain;
          if (!acc[domain]) {
            acc[domain] = [];
          }
          acc[domain].push(contact);
          return acc;
        }, {} as Record<Domain, Contact[]>);
        setDomains(groupedContacts);

      } catch (e) {
        console.error("Failed to load project data", e);
      }
    }
    load();
  }, []);

  // Static UI styles
  const ui = {
    chip: "bg-primary/10 text-primary",
    tag: "bg-muted text-muted-foreground",
    outlineBtn: "",
  };

  // Directory data (MVP: scope_tags exist and feed On Site quick-picks)
  type Domain = "Admin" | "Subcontractors" | "Suppliers" | "Engineering/Architecture" | "AHJ";
  type Contact = {
    id: number;
    name: string;
    company?: string;
    role?: string; // Admin only
    service?: string; // Others
    scope_tags: string[]; // required in MVP
    phone?: string;
    email?: string;
    address?: string;
    domain: Domain; // Added for grouping
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
    setIssueDescription("");
    setCrewSize(3);
    setWorkingOn("");
  }

  function handleReportIssue() {
    console.log("Reporting issue for:", flagContact?.name, "Description:", issueDescription);
    // Here you would typically send this data to your backend
    closeFlag();
  }

  function handleMarkOnSite() {
    console.log("Marking on site for:", flagContact?.name, "Crew Size:", crewSize, "Working On:", workingOn);
    // Here you would typically send this data to your backend
    closeFlag();
  }

  function handleSaveProjectSettings() {
    console.log("Saving project settings:", editableProjectInfo);
    // Here you would typically send this data to your backend
    const saveSettings = async () => {
      if (!editableProjectInfo) return;
      const { error } = await supabase.from('projects').update(editableProjectInfo).eq('id', editableProjectInfo.id);
      if (error) {
        console.error("Error saving project settings:", error);
      } else {
        setProjectInfo(editableProjectInfo);
        setOpenSettingsModal(false);
      }
    };
    saveSettings();
  }

  function handleGenerateReport() {
    console.log("Generating report...");
    // Here you would implement logic to generate and display the report
    setOpenReportsModal(false);
  }

  // Simple stubs for onClick of call/text/email – keeps layout demo-only
  function noop(action: string, name: string) {
    if (typeof window !== "undefined") console.log(`${action}: ${name}`);
  }

  if (!projectInfo || !weather || !domains) {
    return <div className="p-3 sm:p-6">Loading...</div>;
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background text-foreground">
      <div className="sticky top-0 z-10 p-3 sm:p-4 bg-background">
        <Card className="shadow-lg rounded-2xl border border-border hover:shadow-xl">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold mb-1 text-foreground">{projectInfo.number}: {projectInfo.name}</h1>
                <p className="text-muted-foreground">{projectInfo.location}</p>
                <p className="text-muted-foreground">Client: {projectInfo.client}</p>
                <p className="text-sm text-green-600 font-semibold">Status: {projectInfo.status}</p>
              </div>
              <div>
                <p className="font-semibold">Current Weather</p>
                <p className="text-muted-foreground">{weather.current}</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {weather.forecast.map((day) => (
                    <span key={day} className={`px-2 py-1 text-[11px] rounded-full ${ui.chip}`}>{day}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
              <SquareIconButton variant="outline" className="hover:bg-accent hover:text-accent-foreground" icon={<FileText className="h-5 w-5" />} label="Plans" />
              <SquareIconButton variant="outline" className="hover:bg-accent hover:text-accent-foreground" icon={<File className="h-5 w-5" />} label="Files" />
              <SquareIconButton variant="outline" className="hover:bg-accent hover:text-accent-foreground" icon={<Calendar className="h-5 w-5" />} label="Schedule" />
              <SquareIconButton variant="outline" className="hover:bg-accent hover:text-accent-foreground" icon={<BarChart2 className="h-5 w-5" />} label="Reports" onClick={() => setOpenReportsModal(true)} />
              <SquareIconButton variant="outline" className="hover:bg-accent hover:text-accent-foreground" icon={<Settings className="h-5 w-5" />} label="Settings" onClick={() => setOpenSettingsModal(true)} />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-3 sm:px-4 sm:pb-4">
        {(Object.keys(domains) as Domain[]).map((domain) => (
          <section key={domain} className="mb-6">
            <button
              type="button"
              onClick={() => toggleSection(domain)}
              className="flex items-center w-full text-left mb-2"
              aria-expanded={openSections[domain]}
            >
              {openSections[domain] ? <ChevronDown className="h-5 w-5 mr-2" /> : <ChevronRight className="h-5 w-5 mr-2" />}
              <h2 className="text-xl font-semibold text-foreground">{domain}</h2>
            </button>

            {openSections[domain] && (
              <div className="grid gap-4 md:grid-cols-2">
                {domains[domain].map((c) => (
                  <Card key={`${domain}-${c.id}`} className="shadow-md rounded-2xl bg-card border border-border transition-all duration-200 hover:shadow-lg hover:border-primary/20">
                    <CardContent className="p-4">
                      <div className="flex flex-col gap-3">
                        <div>
                          <h3 className="text-lg font-bold text-foreground">{domain === "Admin" ? c.role : c.service}</h3>
                          <p className="text-sm text-muted-foreground">{c.name}{c.company ? ` · ${c.company}` : ""}</p>
                          {c.phone && <p className="text-sm text-muted-foreground"><PhoneIcon className="h-4 w-4 inline-block mr-1" />{c.phone}</p>}
                          {c.email && <p className="text-sm text-muted-foreground"><Mail className="h-4 w-4 inline-block mr-1" />{c.email}</p>}
                          {c.address && <p className="text-sm text-muted-foreground"><FileText className="h-4 w-4 inline-block mr-1" />{c.address}</p>}
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          <SquareIconButton variant="outline" className="text-muted-foreground hover:bg-accent hover:text-accent-foreground" icon={<PhoneIcon className="h-5 w-5" />} label="Call" onClick={() => noop("call", c.name)} />
                          <SquareIconButton variant="outline" className="text-muted-foreground hover:bg-accent hover:text-accent-foreground" icon={<MessageSquare className="h-5 w-5" />} label="Text" onClick={() => noop("text", c.name)} />
                          <SquareIconButton variant="outline" className="text-muted-foreground hover:bg-accent hover:text-accent-foreground" icon={<Mail className="h-5 w-5" />} label="Email" onClick={() => noop("email", c.name)} />
                          <SquareIconButton variant="outline" className="text-muted-foreground hover:bg-accent hover:text-accent-foreground" icon={<Flag className="h-5 w-5" />} label="Flag" onClick={() => openFlag(domain, c)} />
                        </div>

                        {c.scope_tags.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {c.scope_tags.map((tag) => (
                              <span key={tag} className={`px-3 py-1 text-sm rounded-full ${ui.tag}`}>{tag}</span>
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

      <Modal open={!!flagContact && flagStep === "choose"} title={`Flag — ${flagContact?.name || ""}`} onClose={closeFlag}>
        <div className="grid grid-cols-2 gap-2">
          <SquareIconButton icon={<Flag className="h-5 w-5" />} label="Report Issue" onClick={() => setFlagStep("issue")} />
          <SquareIconButton icon={<Flag className="h-5 w-5" />} label="Mark On Site" onClick={() => setFlagStep("onSite")} />
        </div>
      </Modal>

      <Modal open={!!flagContact && flagStep === "issue"} title={`Report Issue — ${flagContact?.name || ""}`} onClose={closeFlag}>
        <div className="space-y-3">
          <div className="flex gap-2 flex-wrap">
            {(["lagging", "quality", "praise"] as const).map((cat) => (
              <span key={cat} className={`px-3 py-1 text-sm rounded-full ${ui.tag}`}>{cat}</span>
            ))}
          </div>
          <textarea className="w-full border rounded-md p-2 text-sm" rows={4} placeholder="Describe the issue (stub for MVP layout demo)" value={issueDescription} onChange={(e) => setIssueDescription(e.target.value)} />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setFlagStep("choose")} className="hover:bg-accent">Back</Button>
            <Button onClick={handleReportIssue} className="bg-primary text-primary-foreground hover:bg-primary/90">Submit</Button>
          </div>
        </div>
      </Modal>

      <Modal open={!!flagContact && flagStep === "onSite"} title={`Mark On Site — ${flagContact?.name || ""}`} onClose={closeFlag}>
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium">Crew Size</label>
            <input type="number" min={1} defaultValue={3} className="mt-1 w-full border rounded-md p-2 text-sm" value={crewSize} onChange={(e) => setCrewSize(parseInt(e.target.value))} />
          </div>
          <div>
            <label className="text-sm font-medium">Working On (quick-picks from scope)</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {flagContact ? domains[flagContact.domain].find((x) => x.id === flagContact.id)?.scope_tags.map((t) => (
                <span key={t} className={`px-3 py-1 text-sm rounded-full ${ui.tag}`}>{t}</span>
              )) : null}
            </div>
            <input type="text" placeholder="Or type custom activity" className="mt-2 w-full border rounded-md p-2 text-sm" value={workingOn} onChange={(e) => setWorkingOn(e.target.value)} />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setFlagStep("choose")} className="hover:bg-accent">Back</Button>
            <Button onClick={handleMarkOnSite} className="bg-primary text-primary-foreground hover:bg-primary/90">Save</Button>
          </div>
        </div>
      </Modal>

      <Modal open={openSettingsModal} title="Project Settings" onClose={() => setOpenSettingsModal(false)}>
        {editableProjectInfo && (
          <div className="space-y-3">
            <div>
              <label htmlFor="projectName" className="text-sm font-medium">Project Name</label>
              <input type="text" id="projectName" className="mt-1 w-full border rounded-md p-2 text-sm" value={editableProjectInfo.name} onChange={(e) => setEditableProjectInfo({ ...editableProjectInfo, name: e.target.value })} />
            </div>
            <div>
              <label htmlFor="projectNumber" className="text-sm font-medium">Project Number</label>
              <input type="text" id="projectNumber" className="mt-1 w-full border rounded-md p-2 text-sm" value={editableProjectInfo.number} onChange={(e) => setEditableProjectInfo({ ...editableProjectInfo, number: e.target.value })} />
            </div>
            <div>
              <label htmlFor="projectLocation" className="text-sm font-medium">Location</label>
              <input type="text" id="projectLocation" className="mt-1 w-full border rounded-md p-2 text-sm" value={editableProjectInfo.location} onChange={(e) => setEditableProjectInfo({ ...editableProjectInfo, location: e.target.value })} />
            </div>
            <div>
              <label htmlFor="projectClient" className="text-sm font-medium">Client</label>
              <input type="text" id="projectClient" className="mt-1 w-full border rounded-md p-2 text-sm" value={editableProjectInfo.client} onChange={(e) => setEditableProjectInfo({ ...editableProjectInfo, client: e.target.value })} />
            </div>
            <div>
              <label htmlFor="projectStatus" className="text-sm font-medium">Status</label>
              <input type="text" id="projectStatus" className="mt-1 w-full border rounded-md p-2 text-sm" value={editableProjectInfo.status} onChange={(e) => setEditableProjectInfo({ ...editableProjectInfo, status: e.target.value })} />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpenSettingsModal(false)} className="hover:bg-accent">Cancel</Button>
              <Button onClick={handleSaveProjectSettings} className="bg-primary text-primary-foreground hover:bg-primary/90">Save</Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={openReportsModal} title="Generate Report" onClose={() => setOpenReportsModal(false)}>
        <div className="space-y-3">
          <div>
            <label htmlFor="reportType" className="text-sm font-medium">Report Type</label>
            <select id="reportType" className="mt-1 w-full border rounded-md p-2 text-sm">
              <option value="daily">Daily Progress</option>
              <option value="weekly">Weekly Summary</option>
              <option value="monthly">Monthly Overview</option>
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpenReportsModal(false)} className="hover:bg-accent">Cancel</Button>
            <Button onClick={handleGenerateReport} className="bg-primary text-primary-foreground hover:bg-primary/90">Generate Report</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
