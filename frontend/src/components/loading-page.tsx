import { Spinner } from "@/components/ui/spinner";

export function LoadingPage({ label }: { label?: string }) {
  return (
    <div className="flex justify-center items-center p-10">
      <div className="flex flex-col items-center gap-3 text-sm text-muted-foreground">
        <Spinner />
        {label && <span>{label}</span>}
      </div>
    </div>
  );
}
