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

const PANEL_PREFIX = "experiencia-panel-";
const TAB_PREFIX = "experiencia-tab-";

/**
 * FilterTabs + one tabpanel per group. Every group is in the HTML (search engines and no-JS readers get
 * the education and courses too); the others are `hidden`. The chosen one re-mounts with .mf-swap, so its
 * timeline enters again; a hidden timeline has no size, so it draws nothing and does not follow the scroll.
 */
export function ExperienceTabs({ groups, labelledBy, moreLabel, lessLabel }: ExperienceTabsProps) {
  const [value, setValue] = useState(groups[0]?.id ?? "");
  const selected = groups.some((group) => group.id === value) ? value : groups[0]?.id;

  return (
    <div className={styles.stack}>
      <FilterTabs
        options={groups.map((group) => ({
          id: group.id,
          label: group.label,
          // Chapters not started yet do not count.
          count: group.items.filter((item) => !item.future).length,
        }))}
        value={selected ?? ""}
        onChange={setValue}
        labelledBy={labelledBy}
        panelPrefix={PANEL_PREFIX}
        idPrefix={TAB_PREFIX}
        className={styles.tabs}
      />
      {groups.map((group) => {
        const on = group.id === selected;
        return (
          <div
            key={group.id}
            id={`${PANEL_PREFIX}${group.id}`}
            role="tabpanel"
            aria-labelledby={`${TAB_PREFIX}${group.id}`}
            tabIndex={0}
            hidden={!on}
            className={styles.panel}
          >
            <div key={on ? "on" : "off"} className={styles.swap}>
              <Timeline items={group.items} moreLabel={moreLabel} lessLabel={lessLabel} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
