import { getUsers } from "@/features/users/queries/get-users";

export async function UsersList() {
  const items = await getUsers();
  return (
    <ul className="space-y-2">
      {items.length === 0 ? (
        <li className="text-sm text-zinc-600 dark:text-zinc-400">No users.</li>
      ) : (
        items.map((u) => (
          <li key={u.id} className="text-sm text-zinc-800 dark:text-zinc-200">
            <span className="font-mono text-xs mr-2">#{u.id}</span>
            <span>{u.email}</span>
            {u.name ? <span className="text-zinc-500 dark:text-zinc-400"> — {u.name}</span> : null}
          </li>
        ))
      )}
    </ul>
  );
}
