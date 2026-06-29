"use client";

import { useState, useCallback, useEffect } from "react";
import { Hammer, LogOut, Key } from "lucide-react";
import ChatPanel from "@/components/ChatPanel";
import FileTree from "@/components/FileTree";
import CodeEditor from "@/components/CodeEditor";
import PreviewPane from "@/components/PreviewPane";
import ExportToolbar from "@/components/ExportToolbar";
import { useWebContainerPreview } from "@/lib/use-webcontainer";
import type { FileMap } from "@/lib/generation";
import type { Provider } from "@/lib/ai-router";

export default function BuilderPage() {
  const [files, setFiles] = useState<FileMap>({});
  const [activePath, setActivePath] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [provider, setProvider] = useState<Provider>("anthropic");
  const [genError, setGenError] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const { status, previewUrl, errorMessage, logs, boot } = useWebContainerPreview();

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setUserEmail(d.user?.email ?? null))
      .catch(() => {});
  }, []);

  const handleGenerate = useCallback(
    async (description: string) => {
      setIsGenerating(true);
      setGenError(null);
      try {
        const res = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            description,
            provider,
            existingFiles: Object.keys(files).length > 0 ? files : undefined,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Generation failed");
        }

        setFiles(data.files);
        const firstPath = Object.keys(data.files)[0] ?? null;
        setActivePath(firstPath);

        await boot(data.files);
      } catch (err) {
        setGenError(err instanceof Error ? err.message : "Generation failed");
      } finally {
        setIsGenerating(false);
      }
    },
    [files, provider, boot]
  );

  function handleFileChange(newContent: string) {
    if (!activePath) return;
    setFiles((prev) => ({ ...prev, [activePath]: newContent }));
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }

  const hasProject = Object.keys(files).length > 0;

  return (
    <div className="flex h-screen flex-col">
      {/* Top bar */}
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-base-border bg-white px-4">
        <div className="flex items-center gap-2">
          <Hammer size={18} className="text-accent" />
          <span className="text-sm font-bold text-base-text">
            Dont Puck <span className="text-accent">App</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <ExportToolbar files={files} disabled={!hasProject} />
          <a
            href="/settings"
            className="flex items-center gap-1 text-xs text-base-muted hover:text-accent"
          >
            <Key size={13} /> Keys
          </a>
          {userEmail && (
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 text-xs text-base-muted hover:text-red-500"
            >
              <LogOut size={13} /> {userEmail}
            </button>
          )}
        </div>
      </header>

      {genError && (
        <div className="border-b border-red-200 bg-red-50 px-4 py-2 text-xs text-red-600">
          {genError}
        </div>
      )}

      {/* Main 4-pane layout */}
      <div className="flex flex-1 overflow-hidden">
        <div className="w-72 shrink-0">
          <ChatPanel
            onGenerate={handleGenerate}
            isGenerating={isGenerating}
            hasExistingProject={hasProject}
            provider={provider}
            onProviderChange={setProvider}
          />
        </div>

        <div className="w-56 shrink-0 overflow-y-auto border-r border-base-border bg-base-panel">
          <FileTree files={files} activePath={activePath} onSelect={setActivePath} />
        </div>

        <div className="flex-1 border-r border-base-border bg-white">
          <CodeEditor
            path={activePath}
            content={activePath ? files[activePath] ?? "" : ""}
            onChange={handleFileChange}
          />
        </div>

        <div className="w-[40%] shrink-0">
          <PreviewPane status={status} previewUrl={previewUrl} errorMessage={errorMessage} logs={logs} />
        </div>
      </div>
    </div>
  );
}
