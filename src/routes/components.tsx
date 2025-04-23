import { AxiosExample } from "@/components/examples/AxiosExample";
import { BasicInformationFormExample } from "@/components/examples/BasicInformationFormExample";
import { BasicTableExample } from "@/components/examples/BasicTableExample";
import { ButtonExample } from "@/components/examples/ButtonExample";
import { CardExamples } from "@/components/examples/CardExamples";
import { DynamicTableExample } from "@/components/examples/DynamicTableExample";
import EmpInfoDialogExample from "@/components/examples/EmpInfoDialogExample";
import { SidebarExample } from "@/components/examples/SidebarExample";
import { SpinnerExample } from "@/components/examples/SpinnerExample";
import { SocketHooksExample } from "@/components/examples/SocketHooksExample";
import { createFileRoute } from "@tanstack/react-router";

interface SearchParams {
  q?: string;
  page?: string;
  pageSize?: string;
  filter_role?: string;
  filter_status?: string;
  [key: string]: string | undefined;
}

export const Route = createFileRoute("/components")({
  validateSearch: (search: Record<string, unknown>): SearchParams => ({
    q: search.q as string,
    page: search.page as string,
    pageSize: search.pageSize as string,
    filter_role: search.filter_role as string,
    filter_status: search.filter_status as string,
    ...Object.entries(search)
      .filter(
        ([key]) =>
          key.startsWith("filter_") &&
          key !== "filter_role" &&
          key !== "filter_status"
      )
      .reduce((acc, [key, value]) => ({ ...acc, [key]: value as string }), {}),
  }),
  component: ComponentsShowcase,
});

function ComponentsShowcase() {
  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-8">Components Showcase</h1>

      {/* Button Examples */}
      <section className="mb-12">
        <ButtonExample />
      </section>

      {/* Spinner Examples */}
      <section className="mb-12">
        <SpinnerExample />
      </section>

      {/* Basic Table Examples */}
      <section className="mb-12">
        <BasicTableExample />
      </section>

      {/* Dynamic Table Example */}
      <section className="mb-12">
        <DynamicTableExample />
      </section>

      {/* Axios Example */}
      <section className="mb-12">
        <AxiosExample />
      </section>

      {/* Sidebar Example */}
      <section className="mb-12">
        <SidebarExample />
      </section>

      {/* Card Examples */}
      <section className="mb-12">
        <CardExamples />
      </section>

      {/* Employee Info Dialog Example */}
      <section className="mb-12">
        <EmpInfoDialogExample />
      </section>

      {/* Employee Info Dialog Example */}
      <section className="mb-12">
        <BasicInformationFormExample />
      </section>

      {/* Socket Hooks Example */}
      <section className="mb-12">
        <SocketHooksExample />
      </section>
    </div >
  );
}
