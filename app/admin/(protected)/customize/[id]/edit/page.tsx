import EditCustomize from "@/component/customize/edit-customize";
import { Card, CardHeader } from "@/component/ui/card";

export const instant = false;

type PageProps = {
  params: Promise<{ id: number }>;
};

export default async function Page({ params }: PageProps) {
  const { id } = await params;

  return (
    <Card>
      <CardHeader>
        <h1 className="text-2xl font-bold">Invitation Design Studio</h1>
      </CardHeader>

      <div className="p-4">
        <EditCustomize key={id} id={id} />
      </div>
    </Card>
  );
}
