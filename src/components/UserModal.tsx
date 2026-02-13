import { useEffect, useMemo, useState } from "react";
import type { User, UserPatch, UserStatus } from "../types";

interface UserModalProps {
  user: User | null;
  isSaving: boolean;
  saveError: string;
  onClose: () => void;
  onSave: (patch: UserPatch) => Promise<void>;
}

const STATUS_OPTIONS: UserStatus[] = ["active", "inactive", "pending"];

export function UserModal({
  user,
  isSaving,
  saveError,
  onClose,
  onSave
}: UserModalProps): JSX.Element | null {
  const [draft, setDraft] = useState<UserPatch | null>(null);
  const [validationError, setValidationError] = useState("");

  useEffect(() => {
    if (!user) {
      setDraft(null);
      return;
    }
    setDraft({
      name: user.name,
      age: user.age,
      status: user.status,
      city: user.city
    });
    setValidationError("");
  }, [user]);

  const lastUpdated = useMemo(() => {
    if (!user) {
      return "";
    }
    return new Date(user.updatedAt).toLocaleString();
  }, [user]);

  if (!user || !draft) {
    return null;
  }

  const submit = async () => {
    if (!draft.name.trim()) {
      setValidationError("Name is required.");
      return;
    }
    if (draft.age < 18 || draft.age > 90) {
      setValidationError("Age must be between 18 and 90.");
      return;
    }
    setValidationError("");
    await onSave(draft);
  };

  return (
    <div className="modal-overlay" role="presentation" onClick={onClose}>
      <section
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label="User details"
        onClick={(event) => event.stopPropagation()}
      >
        <header>
          <h2>User #{user.id}</h2>
          <button type="button" onClick={onClose} className="ghost">
            Close
          </button>
        </header>

        <div className="modal-grid">
          <label>
            Name
            <input
              type="text"
              value={draft.name}
              onChange={(event) =>
                setDraft((current) =>
                  current ? { ...current, name: event.target.value } : current
                )
              }
            />
          </label>

          <label>
            Email (read only)
            <input type="text" value={user.email} readOnly />
          </label>

          <label>
            Age
            <input
              type="number"
              value={draft.age}
              min={18}
              max={90}
              onChange={(event) =>
                setDraft((current) =>
                  current
                    ? { ...current, age: Number(event.target.value || 0) }
                    : current
                )
              }
            />
          </label>

          <label>
            Status
            <select
              value={draft.status}
              onChange={(event) =>
                setDraft((current) =>
                  current
                    ? { ...current, status: event.target.value as UserStatus }
                    : current
                )
              }
            >
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>

          <label>
            City
            <input
              type="text"
              value={draft.city}
              onChange={(event) =>
                setDraft((current) =>
                  current ? { ...current, city: event.target.value } : current
                )
              }
            />
          </label>

          <label>
            Last Updated
            <input type="text" readOnly value={lastUpdated} />
          </label>
        </div>

        {(validationError || saveError) && (
          <p className="error-text">{validationError || saveError}</p>
        )}

        <footer>
          <button type="button" onClick={submit} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save (Optimistic)"}
          </button>
        </footer>
      </section>
    </div>
  );
}
