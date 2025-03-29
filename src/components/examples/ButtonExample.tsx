import { Button } from "@/components/ui/button";
import Spinner from "@/components/ui/spinner";

export function ButtonExample() {
  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4">
        <h2 className="text-2xl font-semibold">Button Variants</h2>
        <div className="flex flex-wrap gap-4">
          <Button>Default</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="text-2xl font-semibold">Button Sizes</h2>
        <div className="flex flex-wrap items-center gap-4">
          <Button size="sm">Small</Button>
          <Button>Default</Button>
          <Button size="lg">Large</Button>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="text-2xl font-semibold">Button States</h2>
        <div className="flex flex-wrap items-center gap-4">
          <Button disabled>Disabled</Button>
          <Button variant="destructive" disabled>
            Disabled Destructive
          </Button>
          <Button className="gap-2">
            <Spinner size={16} color="currentColor" />
            Loading
          </Button>
        </div>
      </div>

      <div className="mt-6 rounded-lg bg-muted p-4">
        <pre className="text-sm">
          {`<Button>Default</Button>
<Button variant="destructive">Destructive</Button>
<Button variant="outline">Outline</Button>
<Button size="sm">Small</Button>
<Button disabled>Disabled</Button>
<Button className="gap-2">
  <Spinner size={16} color="currentColor" />
  Loading
</Button>`}
        </pre>
      </div>
    </section>
  );
}
