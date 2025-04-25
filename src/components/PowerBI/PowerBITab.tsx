
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { PowerBIEmbed } from './PowerBIEmbed';
import { Loader2 } from "lucide-react";

export const PowerBITab = () => {
  const { data: embedInfo, isLoading, error } = useQuery({
    queryKey: ['powerbi-token'],
    queryFn: async () => {
      const response = await fetch('/api/powerbi/token');
      if (!response.ok) {
        throw new Error('Failed to get PowerBI token');
      }
      return response.json();
    }
  });

  if (isLoading) {
    return (
      <div className="h-[calc(100vh-12rem)] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-[calc(100vh-12rem)] flex items-center justify-center text-destructive">
        Error cargando o informe de PowerBI
      </div>
    );
  }

  return (
    <PowerBIEmbed
      accessToken={embedInfo.accessToken}
      embedUrl={embedInfo.embedUrl}
      reportId={embedInfo.reportId}
    />
  );
};
