import { useCallback, useEffect, useMemo, useState } from "react";
import { UserModal } from "./components/UserModal";
import { UserTable } from "./components/UserTable";
import { fetchUsers, saveUserPatch } from "./data/users";
import { useDebouncedValue } from "./hooks/useDebouncedValue";
import type { User, UserPatch, UserStatus } from "./types";

type SortKey = "name" | "email" | "age";
type SortDirection = "asc" | "desc";
type LoadState = "loading" | "ready" | "error";
type StatusFilter = UserStatus | "all";

const PAGE_CHUNK = 250;

function sortUsers(users: User[], sortKey: SortKey, sortDirection: SortDirection): User[] {
  return [...users].sort((a, b) => {
    let comparison = 0;
    if (sortKey === "age") {
      comparison = a.age - b.age;
    } else {
      comparison = a[sortKey].localeCompare(b[sortKey]);
    }
    return sortDirection === "asc" ? comparison : -comparison;
  });
}

export default function App(): JSX.Element {
  const [users, setUsers] = useState<User[]>([]);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [loadError, setLoadError] = useState("");

  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebouncedValue(searchInput, 400);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [visibleCount, setVisibleCount] = useState(PAGE_CHUNK);

  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [savingUserId, setSavingUserId] = useState<number | null>(null);
  const [saveError, setSaveError] = useState("");

  const load = useCallback(async () => {
    setLoadState("loading");
    setLoadError("");
    try {
      const data = await fetchUsers(10000);
      setUsers(data);
      setLoadState("ready");
    } catch (error) {
      setLoadState("error");
      setLoadError(error instanceof Error ? error.message : "Unknown error");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filteredAndSorted = useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase();
    const filtered = users.filter((user) => {
      const matchesSearch =
        query.length === 0 ||
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query);
      const matchesStatus = statusFilter === "all" || user.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
    return sortUsers(filtered, sortKey, sortDirection);
  }, [debouncedSearch, sortDirection, sortKey, statusFilter, users]);

  useEffect(() => {
    setVisibleCount(PAGE_CHUNK);
  }, [debouncedSearch, statusFilter, sortDirection, sortKey]);

  const visibleUsers = useMemo(
    () => filteredAndSorted.slice(0, visibleCount),
    [filteredAndSorted, visibleCount]
  );

  const hasMore = visibleCount < filteredAndSorted.length;

  const selectedUser = useMemo(
    () => users.find((user) => user.id === selectedUserId) ?? null,
    [selectedUserId, users]
  );

  const onSortChange = useCallback((key: SortKey) => {
    setSortDirection((previousDirection) => {
      if (key === sortKey) {
        return previousDirection === "asc" ? "desc" : "asc";
      }
      return "asc";
    });
    setSortKey(key);
  }, [sortKey]);

  const onReachEnd = useCallback(() => {
    setVisibleCount((current) =>
      Math.min(current + PAGE_CHUNK, filteredAndSorted.length)
    );
  }, [filteredAndSorted.length]);

  const onSelectUser = useCallback((userId: number) => {
    setSaveError("");
    setSelectedUserId(userId);
  }, []);

  const onSaveUser = useCallback(
    async (patch: UserPatch) => {
      if (!selectedUser) {
        return;
      }

      const previousUser = selectedUser;
      const optimisticUser: User = {
        ...previousUser,
        ...patch,
        updatedAt: Date.now()
      };

      setSaveError("");
      setSavingUserId(previousUser.id);
      setUsers((current) =>
        current.map((user) => (user.id === previousUser.id ? optimisticUser : user))
      );

      try {
        const savedUser = await saveUserPatch(previousUser, patch);
        setUsers((current) =>
          current.map((user) => (user.id === previousUser.id ? savedUser : user))
        );
      } catch (error) {
        setUsers((current) =>
          current.map((user) => (user.id === previousUser.id ? previousUser : user))
        );
        setSaveError(error instanceof Error ? error.message : "Save failed");
      } finally {
        setSavingUserId(null);
      }
    },
    [selectedUser]
  );

  if (loadState === "loading") {
    return (
      <main className="app-shell center">
        <p className="state-title">Loading users...</p>
      </main>
    );
  }

  if (loadState === "error") {
    return (
      <main className="app-shell center">
        <p className="state-title">Could not load users</p>
        <p className="state-subtitle">{loadError}</p>
        <button type="button" onClick={() => void load()}>
          Retry
        </button>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <header className="toolbar">
        <h1>High-Volume Users Dashboard</h1>
        <div className="controls">
          <input
            type="search"
            placeholder="Search name or email..."
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
          />
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
          >
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </header>

      <section className="summary">
        <span>Total: {users.length.toLocaleString()}</span>
        <span>Matched: {filteredAndSorted.length.toLocaleString()}</span>
        <span>Rendered: {visibleUsers.length.toLocaleString()}</span>
      </section>

      {filteredAndSorted.length === 0 ? (
        <section className="empty-state">
          <p className="state-title">No users found</p>
          <p className="state-subtitle">Try changing filters or search query.</p>
        </section>
      ) : (
        <UserTable
          users={visibleUsers}
          hasMore={hasMore}
          sortKey={sortKey}
          sortDirection={sortDirection}
          onSortChange={onSortChange}
          onReachEnd={onReachEnd}
          onRowSelect={onSelectUser}
          savingUserId={savingUserId}
        />
      )}

      <UserModal
        user={selectedUser}
        isSaving={savingUserId === selectedUser?.id}
        saveError={saveError}
        onClose={() => setSelectedUserId(null)}
        onSave={onSaveUser}
      />
    </main>
  );
}
