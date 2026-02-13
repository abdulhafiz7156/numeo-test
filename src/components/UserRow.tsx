import { memo, useMemo } from "react";
import type { User } from "../types";
import { computeExpensiveScore } from "../utils/expensiveScore";

interface UserRowProps {
  user: User;
  isSaving: boolean;
  onSelect: (userId: number) => void;
}

function UserRowBase({ user, isSaving, onSelect }: UserRowProps): JSX.Element {
  const score = useMemo(() => computeExpensiveScore(user), [user]);

  return (
    <button
      type="button"
      className={`row ${isSaving ? "saving" : ""}`}
      onClick={() => onSelect(user.id)}
      title="Click to open details"
    >
      <span>{user.id}</span>
      <span>{user.name}</span>
      <span>{user.email}</span>
      <span>{user.age}</span>
      <span className={`badge ${user.status}`}>{user.status}</span>
      <span>{score}</span>
    </button>
  );
}

export const UserRow = memo(UserRowBase);
