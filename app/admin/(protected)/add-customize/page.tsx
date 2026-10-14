import AddCustomize from "@/component/customize/add-customize";
import { Card, CardHeader } from "@/component/ui/card";

const page = () => {
  return (
    <Card>
      <CardHeader>
        <h1 className="text-2xl font-bold">Add Customize</h1>
      </CardHeader>
      <div className="p-4">
        <AddCustomize />
      </div>
    </Card>
  );
};

export default page;
