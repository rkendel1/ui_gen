import { Commit, CommitHash, CommitType } from "../commits/types";
import { HistoryItem } from "../../types";

export function extractHistory(
  hash: CommitHash,
  commits: Record<CommitHash, Commit>
): HistoryItem[] {
  const flatHistory: HistoryItem[] = [];

  let currentCommitHash: CommitHash | null = hash;
  while (currentCommitHash !== null) {
    const commit: Commit | null = commits[currentCommitHash];

    if (commit) {
      flatHistory.unshift({
        role: "assistant",
        text: commit.variants[commit.selectedVariantIndex].code,
        images: [],
      });

      // For create/edit commits, include the user prompt turn.
      if (commit.type === "ai_create" || commit.type === "ai_edit") {
        flatHistory.unshift({
          role: "user",
          text: commit.inputs.text,
          images: commit.inputs.images,
        });
      }

      // Move to the parent of the current item
      currentCommitHash = commit.parentHash;
    } else {
      throw new Error("Malformed history: missing parent index");
    }
  }

  return flatHistory;
}

function displayHistoryItemType(itemType: CommitType) {
  switch (itemType) {
    case "ai_create":
      return "Create";
    case "ai_edit":
      return "Edit";
    case "code_create":
      return "Imported from code";
    default: {
      const exhaustiveCheck: never = itemType;
      throw new Error(`Unhandled case: ${exhaustiveCheck}`);
    }
  }
}

const setParentVersion = (commit: Commit, history: Commit[]) => {
  // If the commit has no parent, return null
  if (!commit.parentHash) return null;

  const parentIndex = history.findIndex(
    (item) => item.hash === commit.parentHash
  );
  const currentIndex = history.findIndex((item) => item.hash === commit.hash);

  // Only set parent version if the parent is not the previous commit
  // and parent exists
  return parentIndex !== -1 && parentIndex != currentIndex - 1
    ? parentIndex + 1
    : null;
};

export function summarizeHistoryItem(commit: Commit) {
  const commitType = commit.type;
  switch (commitType) {
    case "ai_create":
      return "Create";
    case "ai_edit":
      return commit.inputs.text;
    case "code_create":
      return "Imported from code";
    default: {
      const exhaustiveCheck: never = commitType;
      throw new Error(`Unhandled case: ${exhaustiveCheck}`);
    }
  }
}

export const renderHistory = (history: Commit[]) => {
  const renderedHistory = [];

  for (let i = 0; i < history.length; i++) {
    const commit = history[i];
    renderedHistory.push({
      ...commit,
      type: displayHistoryItemType(commit.type),
      summary: summarizeHistoryItem(commit),
      parentVersion: setParentVersion(commit, history),
    });
  }

  return renderedHistory;
};
