"use client";

import { useState } from "react";
import { FilterTabs } from "./FilterTabs";
import { Timeline, type TimelineEntry } from "./Timeline";
import styles from "./ExperienceTabs.module.css";

export interface ExperienceGroupData {
  id: string;
  label: string;
  items: TimelineEntry[];
}

interface ExperienceTabsProps {
  groups: ExperienceGroupData[];
  /** Id of the section heading, which names the tablist. */
  labelledBy: string;
  moreLabel: string;
  lessLabel: string;
}

const PANEL_ID = "experiencia-panel";
const TAB_PREFIX = "experiencia-tab-";

/** FilterTabs + the Timeline of the chosen group, inside a tabpanel; switching tabs re-mounts with .mf-swap. */
export function ExperienceTabs({ groups, labelledBy, moreLabel, lessLabel }: ExperienceTabsProps) {
  const [value, setValue] = useState(groups[0]?.id ?? "");
  const current = groups.find((group) => group.id === value) ?? groups[0];

  return (
    <div className={styles.stack}>
      <FilterTabs
        options={groups.map((group) => ({
          id: group.id,
          label: group.label,
          // Chapters not started yet do not count.
          count: group.items.filter((item) => !item.future).length,
        }))}
        value={value}
        onChange={setValue}
        labelledBy={labelledBy}
        panelId={PANEL_ID}
        idPrefix={TAB_PREFIX}
      />
      <div id={PANEL_ID} role="tabpanel" aria-labelledby={`${TAB_PREFIX}${value}`} tabIndex={0} className={styles.panel}>
        <div key={value} className={styles.swap}>
          <Timeline items={current?.items ?? []} moreLabel={moreLabel} lessLabel={lessLabel} />
        </div>
      </div>
    </div>
  );
}
