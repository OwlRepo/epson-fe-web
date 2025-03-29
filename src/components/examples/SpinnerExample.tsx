import Spinner from "@/components/ui/spinner";

export function SpinnerExample() {
  return (
    <section className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col gap-4">
          <h2 className="text-2xl font-semibold">Basic Spinner</h2>
          <div className="flex items-center justify-center h-32 bg-muted rounded-lg">
            <Spinner size={40} color="#0066cc" />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <h2 className="text-2xl font-semibold">Spinner with Message</h2>
          <div className="flex items-center justify-center h-32 bg-muted rounded-lg">
            <Spinner size={40} color="#cc0000" message="Loading..." />
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-lg bg-muted p-4">
        <pre className="text-sm">
          {`// Basic spinner
<Spinner size={40} color="#0066cc" />

// Spinner with message
<Spinner size={40} color="#cc0000" message="Loading..." />`}
        </pre>
      </div>
    </section>
  );
}
