import { createHash } from "node:crypto";
import { Icon } from "@/components/ui/Icon";
import type { ImageAsset } from "@/lib/content/assets";
import { AboutTrace } from "./AboutTrace";
import { Commit } from "./Commit";
import styles from "./CommitLog.module.css";

const GROUPS = ["now", "y2024", "before"] as const;
type Group = (typeof GROUPS)[number];

interface CommitEntry {
  /** One of GROUPS: when it happened. */
  group: string;
  type: string;
  title: string;
  body: string;
}

interface CommitLogProps {
  /** "commits on", before the branch. */
  heading: string;
  branch: string;
  /** "commits", after the count. */
  unit: string;
  /** The verb before when ("commitou"). */
  committed: string;
  /** The copy button's name, and what it announces once done. */
  copy: string;
  copied: string;
  /** Heading of each group ("Commits em 2024"), and the word for when in each row ("em 2024"). */
  groups: Record<Group, string>;
  when: Record<Group, string>;
  /** Newest first, as GitHub lists them. */
  commits: CommitEntry[];
  author: string;
  avatar: ImageAsset;
}

/** A short hash of the commit's own text: stable, different in every language, and only for show. */
function shortHash({ type, title, body }: CommitEntry): string {
  return createHash("sha1").update(`${type}: ${title}\n\n${body}`).digest("hex").slice(0, 7);
}

/**
 * The About text as a GitHub commit history, adapted to black and white: a head (the GitHub mark,
 * "commits on main", the count), then the commits grouped by when — each group's date beside GitHub's
 * commit mark on the rail, its commits in a box of hairline rows, newest first. Between the marks, down
 * the rail, runs the About bolt (AboutTrace): a dim broken line that the scroll lights, mark by mark,
 * down to the foot of the last box.
 */
export function CommitLog({ heading, branch, unit, committed, copy, copied, groups, when, commits, author, avatar }: CommitLogProps) {
  const last = commits.length - 1;
  const rows = commits.map((commit, i) => ({ ...commit, i, hash: shortHash(commit) }));

  return (
    <div className={styles.log}>
      <p className={styles.head}>
        <Icon name="github" size={18} />
        <span>{heading}</span>
        <span className={styles.branch}>
          <Icon name="branch" size={13} />
          {branch}
        </span>
        <span className={styles.count}>
          {commits.length} {unit}
        </span>
      </p>

      <div className={styles.timeline}>
        <AboutTrace />
        {GROUPS.map((group) => {
          const items = rows.filter((row) => row.group === group);
          if (!items.length) return null;
          return (
            <section key={group} className={styles.group} aria-labelledby={`about-log-${group}`}>
              <h3 className={styles.date} id={`about-log-${group}`}>
                <span className={styles.mark} data-trace="node" aria-hidden="true">
                  <Icon name="commit" size={16} strokeWidth={2} />
                </span>
                {groups[group]}
              </h3>
              <ol className={styles.box}>
                {items.map((row) => (
                  <Commit
                    key={row.i}
                    type={row.type}
                    title={row.title}
                    body={row.body}
                    hash={row.hash}
                    author={author}
                    avatar={avatar}
                    committed={`${committed} ${when[group]}`}
                    copy={copy}
                    copied={copied}
                    index={row.i}
                    end={row.i === last}
                    open={row.i === 0}
                  />
                ))}
              </ol>
            </section>
          );
        })}
      </div>
    </div>
  );
}
