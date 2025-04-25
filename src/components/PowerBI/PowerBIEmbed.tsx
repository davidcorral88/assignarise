
import React, { useEffect, useRef } from 'react';
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

// PowerBI client library
declare global {
  interface Window {
    powerbi: any;
  }
}

interface PowerBIEmbedProps {
  accessToken: string;
  embedUrl: string;
  reportId: string;
}

export const PowerBIEmbed = ({ accessToken, embedUrl, reportId }: PowerBIEmbedProps) => {
  const reportContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const embedReport = async () => {
      if (!reportContainerRef.current || !accessToken) return;

      // Load the PowerBI client library
      await loadPowerBIClient();

      const config = {
        type: 'report',
        id: reportId,
        embedUrl: embedUrl,
        accessToken: accessToken,
        tokenType: 1,
        settings: {
          navContentPaneEnabled: false,
          filterPaneEnabled: true
        }
      };

      // Embed the report
      const report = window.powerbi.embed(reportContainerRef.current, config);

      // Cleanup
      return () => {
        report.off("loaded");
        report.off("error");
      };
    };

    embedReport();
  }, [accessToken, embedUrl, reportId]);

  const loadPowerBIClient = () => {
    return new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.powerbi.com/powerbi-client/powerbi.min.js';
      script.onload = () => resolve();
      script.onerror = () => reject();
      document.head.appendChild(script);
    });
  };

  return (
    <Card className="w-full h-[calc(100vh-12rem)] overflow-hidden">
      {!accessToken && (
        <div className="h-full flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}
      <div ref={reportContainerRef} className="w-full h-full" />
    </Card>
  );
};
