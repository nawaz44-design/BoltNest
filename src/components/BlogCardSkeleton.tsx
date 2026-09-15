export default function BlogCardSkeleton() {
  return (
    <div className="card overflow-hidden">
      <div className="h-40 skeleton rounded-t-2xl" />
      <div className="p-5 space-y-3">
        <div className="h-5 w-3/4 skeleton rounded" />
        <div className="h-3 w-full skeleton rounded" />
        <div className="h-3 w-2/3 skeleton rounded" />
        <div className="flex justify-between pt-2">
          <div className="h-3 w-24 skeleton rounded" />
          <div className="h-3 w-8 skeleton rounded" />
        </div>
      </div>
    </div>
  );
}
