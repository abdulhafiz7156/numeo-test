import { useCallback, useEffect, useMemo, useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import type { User } from "../types";
import { UserRow } from "./UserRow";

type SortKey = "name" | "email" | "age";
type SortDirection = "asc" | "desc";

interface UserTableProps {
  users: User[];
  hasMore: boolean;
  savingUserId: number | null;
  sortKey: SortKey;
  sortDirection: SortDirection;
  onSortChange: (key: SortKey) => void;
  onRowSelect: (userId: number) => void;
  onReachEnd: () => void;
}

const ROW_HEIGHT = 52;

export function UserTable({
  users,
  hasMore,
  savingUserId,
  sortKey,
  sortDirection,
  onSortChange,
  onRowSelect,
  onReachEnd
}: UserTableProps): JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: users.length,
    getScrollElement: () => containerRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 8
  });

  const virtualItems = rowVirtualizer.getVirtualItems();
  const totalSize = rowVirtualizer.getTotalSize();

  const topOffset = virtualItems[0]?.start ?? 0;
  const bottomOffset =
    totalSize - (virtualItems[virtualItems.length - 1]?.end ?? 0);

  const sortIcon = useCallback(
    (key: SortKey) => {
      if (sortKey !== key) {
        return "↕";
      }
      return sortDirection === "asc" ? "↑" : "↓";
    },
    [sortDirection, sortKey]
  );

  useEffect(() => {
    const element = containerRef.current;
    if (!element) {
      return;
    }

    const onScroll = () => {
      const distanceFromBottom =
        element.scrollHeight - element.scrollTop - element.clientHeight;
      if (distanceFromBottom < ROW_HEIGHT * 6 && hasMore) {
        onReachEnd();
      }
    };

    element.addEventListener("scroll", onScroll);
    return () => element.removeEventListener("scroll", onScroll);
  }, [hasMore, onReachEnd]);

  const header = useMemo(
    () => (
      <div className="header row">
        <span>ID</span>
        <button type="button" className="sort-btn" onClick={() => onSortChange("name")}>
          Name {sortIcon("name")}
        </button>
        <button type="button" className="sort-btn" onClick={() => onSortChange("email")}>
          Email {sortIcon("email")}
        </button>
        <button type="button" className="sort-btn" onClick={() => onSortChange("age")}>
          Age {sortIcon("age")}
        </button>
        <span>Status</span>
        <span>Score</span>
      </div>
    ),
    [onSortChange, sortIcon]
  );

  return (
    <section className="table-shell" aria-label="Users Table">
      {header}
      <div className="table-body" ref={containerRef}>
        <div style={{ height: topOffset }} />
        {virtualItems.map((virtualRow) => {
          const user = users[virtualRow.index];
          return (
            <UserRow
              key={user.id}
              user={user}
              onSelect={onRowSelect}
              isSaving={savingUserId === user.id}
            />
          );
        })}
        <div style={{ height: bottomOffset }} />
      </div>
    </section>
  );
}
