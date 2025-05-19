import React from "react";
import { columns } from "./columns";
import DataTable from "@/components/DataTableComponents/DataTable";
import TableHeader from "../../../../components/dashboard/Tables/TableHeader";
import { getClients } from "@/actions/clients";
import { UserProps } from "@/types/types";

export default async function page() {
  const clients: UserProps[] = (await getClients()) || [];
  return (
    <div className="w-full max-w-full overflow-hidden">
      <div className="p-4 md:p-8">
        <TableHeader
          title="Clients"
          linkTitle="Add Client"
          href="/dashboard/clients/new"
          data={clients}
          model="client"
        />
        <div className="py-4 md:py-8">
          <div className="rounded-md border">
            <div className="overflow-x-auto">
              <div className="min-w-[800px]">
                <DataTable data={clients} columns={columns} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
