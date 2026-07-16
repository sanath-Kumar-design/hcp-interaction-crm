import { useState } from "react";
import Sidebar from "./components/sidebar";
import KpiCards from "./components/kpi";
import AIAssistant from "./components/aiAssistant";
import InteractionForm from "./components/interactionForm";
import ContextSidebar from "./components/contextSidebar";
import Topnav from "./components/topnav";
import DirectoryPage from "./components/hcp directories/DirectoryPage";
import { EMPTY_FORM } from "./data";

function DashboardPage({
  formData,
  onFieldChange,
  onAIExtract,
  onSave,
  saved,
}) {
  return (
    <div className="mx-auto max-w-[1600px] px-4 py-5 lg:px-6 lg:py-6">
      <div className="mb-5">
        <div className="mb-1.5 flex items-center gap-2 text-[12px] font-medium text-slate-400">
          <span>Interactions</span>
          <span>/</span>
          <span className="text-slate-600">Log HCP Interaction</span>
        </div>

        <h1 className="text-[24px] font-bold tracking-tight text-slate-900">
          Log HCP Interaction
        </h1>

        <p className="mt-0.5 text-[14px] text-slate-500">
          Use AI to describe your meeting in natural language, or fill the form
          manually.
        </p>
      </div>

      <KpiCards />

      <div className="mt-5 flex gap-5">
        <div className="w-[420px] shrink-0">
          <div className="sticky top-0 h-[calc(100vh-280px)] min-h-[560px]">
            <AIAssistant onAIExtract={onAIExtract} />
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <div className="h-[calc(100vh-280px)] min-h-[560px]">
            <InteractionForm
              formData={formData}
              onChange={onFieldChange}
              onSave={onSave}
              saved={saved}
            />
          </div>
        </div>

        <ContextSidebar />
      </div>
    </div>
  );
}

export default function Layout() {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [saved, setSaved] = useState(false);
  const [currentPage, setCurrentPage] = useState("dashboard");

  const handleAIExtract = (data) => {
    setFormData((prev) => ({ ...prev, ...data }));
    setSaved(false);
  };

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar activePage={currentPage} onNavigate={setCurrentPage} />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Topnav />

        <main className="flex-1 overflow-y-auto scrollbar-thin">
          {currentPage === "directory" && (
            <div className="mx-auto max-w-[1600px] px-4 py-5 lg:px-6 lg:py-6">
              <DirectoryPage onNavigate={setCurrentPage} />
            </div>
          )}

          {currentPage === "dashboard" && (
            <DashboardPage
              formData={formData}
              onFieldChange={handleFieldChange}
              onAIExtract={handleAIExtract}
              onSave={handleSave}
              saved={saved}
            />
          )}
        </main>
      </div>
    </div>
  );
}