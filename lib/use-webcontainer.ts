"use client";

import { useState, useRef, useCallback } from "react";
import { WebContainer } from "@webcontainer/api";
import type { FileMap } from "@/lib/generation";

// Converts our flat { "app/page.tsx": "...", "package.json": "..." } map into
// the nested tree structure @webcontainer/api's mount() requires.
function toWebContainerTree(files: FileMap) {
  const tree: Record<string, any> = {};

  for (const [path, contents] of Object.entries(files)) {
    const parts = path.split("/");
    let current = tree;

    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!current[part]) {
        current[part] = { directory: {} };
      }
      current = current[part].directory;
    }

    const fileName = parts[parts.length - 1];
    current[fileName] = { file: { contents } };
  }

  return tree;
}

export type PreviewStatus = "idle" | "booting" | "installing" | "starting" | "ready" | "error";

export function useWebContainerPreview() {
  const [status, setStatus] = useState<PreviewStatus>("idle");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const containerRef = useRef<WebContainer | null>(null);

  const appendLog = useCallback((line: string) => {
    setLogs((prev) => [...prev.slice(-200), line]);
  }, []);

  const boot = useCallback(
    async (files: FileMap) => {
      try {
        setErrorMessage(null);
        setStatus("booting");
        appendLog("Booting WebContainer...");

        if (!containerRef.current) {
          containerRef.current = await WebContainer.boot();
        }
        const container = containerRef.current;

        await container.mount(toWebContainerTree(files));

        setStatus("installing");
        appendLog("Installing dependencies (this can take a minute the first time)...");

        const installProcess = await container.spawn("npm", ["install"]);
        installProcess.output.pipeTo(
          new WritableStream({
            write(chunk) {
              appendLog(chunk);
            },
          })
        );
        const installExitCode = await installProcess.exit;
        if (installExitCode !== 0) {
          throw new Error(`npm install failed (exit code ${installExitCode})`);
        }

        setStatus("starting");
        appendLog("Starting dev server...");

        const devProcess = await container.spawn("npm", ["run", "dev"]);
        devProcess.output.pipeTo(
          new WritableStream({
            write(chunk) {
              appendLog(chunk);
            },
          })
        );

        container.on("server-ready", (_port, url) => {
          setPreviewUrl(url);
          setStatus("ready");
          appendLog(`Preview ready at ${url}`);
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to boot preview";
        setErrorMessage(message);
        setStatus("error");
        appendLog(`ERROR: ${message}`);
      }
    },
    [appendLog]
  );

  // Updates a single file in an already-booted container without a full reboot —
  // used for live-editing in Monaco.
  const writeFile = useCallback(async (path: string, contents: string) => {
    if (!containerRef.current) return;
    await containerRef.current.fs.writeFile(path, contents);
  }, []);

  return { status, previewUrl, logs, errorMessage, boot, writeFile };
}
