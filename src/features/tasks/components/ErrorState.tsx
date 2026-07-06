interface ErrorStateProps {
  message: string;
}

export function ErrorState({ message }: ErrorStateProps) {
  return (
    <div className="rounded-xl border border-rose-700 bg-rose-950/70 p-4 text-sm text-rose-200">
      {message}
    </div>
  );
}
