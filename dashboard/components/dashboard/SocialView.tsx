"use client";

import { useState } from "react";
import type { ChannelMeta } from "@/lib/data/channels";
import { SOCIAL_PLATFORMS, type SocialPayload, type SocialPlatformData } from "@/lib/data/socialPlatforms";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { DataTable } from "@/components/dashboard/DataTable";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { LineTrendChart } from "@/components/charts/LineTrendChart";
import { ChannelView } from "@/components/dashboard/ChannelView";
import { cn } from "@/lib/utils/cn";

type TabId = "all" | SocialPlatformData["id"];

export function SocialView({ meta, payload }: { meta: ChannelMeta; payload: SocialPayload }) {
  const [tab, setTab] = useState<TabId>("all");
  const activePlatform = payload.platforms.find((p) => p.id === tab);

  return (
    <div>
      <PageHeader title={meta.label} description={meta.description} source={payload.source} />

      <div className="mb-5 flex gap-1 border-b border-border">
        <TabButton active={tab === "all"} onClick={() => setTab("all")}>
          Tous
        </TabButton>
        {SOCIAL_PLATFORMS.map((p) => (
          <TabButton key={p.id} active={tab === p.id} onClick={() => setTab(p.id)} color={p.color}>
            {p.label}
          </TabButton>
        ))}
      </div>

      {tab === "all" || !activePlatform ? (
        <ChannelView meta={meta} payload={payload} hideHeader />
      ) : (
        <PlatformPanel platform={activePlatform} granularity={payload.granularity} />
      )}
    </div>
  );
}

function TabButton({ active, onClick, children, color }: { active: boolean; onClick: () => void; children: React.ReactNode; color?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "-mb-px flex items-center gap-1.5 border-b-2 px-3 py-2 font-mono text-xs transition-colors",
        active ? "border-accent text-text-primary" : "border-transparent text-text-secondary hover:text-text-primary",
      )}
    >
      {color ? <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} /> : null}
      {children}
    </button>
  );
}

function PlatformPanel({ platform, granularity }: { platform: SocialPlatformData; granularity: SocialPayload["granularity"] }) {
  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {platform.kpis.map((kpi) => (
          <KpiCard key={kpi.key} kpi={kpi} />
        ))}
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader title="Impressions" />
          <CardBody>
            <LineTrendChart
              data={platform.trend}
              seriesKeys={[`${platform.id}Impressions`]}
              labels={{ [`${platform.id}Impressions`]: "Impressions" }}
              granularity={granularity}
              format="number"
              colors={{ [`${platform.id}Impressions`]: platform.color }}
              legend={false}
            />
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Abonnés" />
          <CardBody>
            <LineTrendChart
              data={platform.trend}
              seriesKeys={[`${platform.id}Followers`]}
              labels={{ [`${platform.id}Followers`]: "Abonnés" }}
              granularity={granularity}
              format="number"
              colors={{ [`${platform.id}Followers`]: platform.color }}
              legend={false}
            />
          </CardBody>
        </Card>
      </div>

      <div className="mt-4">
        <Card>
          <CardHeader title={`Meilleurs posts — ${platform.label}`} />
          {platform.posts.length > 0 ? (
            <DataTable
              columns={[
                { key: "title", label: "Post" },
                { key: "impressions", label: "Impressions", format: "number" },
                { key: "engagementRate", label: "Engagement", format: "percent" },
              ]}
              rows={platform.posts}
            />
          ) : (
            <CardBody>
              <p className="text-sm text-text-muted">Aucun post récent pour cette plateforme sur la période.</p>
            </CardBody>
          )}
        </Card>
      </div>
    </div>
  );
}
