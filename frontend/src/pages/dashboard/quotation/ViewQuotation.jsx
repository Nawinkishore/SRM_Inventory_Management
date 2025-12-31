import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { TableHead, TableHeader, TableRow, Table } from "@/components/ui/table";
import { useGetQuotationById } from "@/features/quotation/useQuotation";
import { ChevronLeft } from "lucide-react";
import React from "react";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
const ViewQuotation = () => {
  const { id } = useParams();
  const { data, isLoading, isError, error } = useGetQuotationById(id);
  console.log(data);
  return (
    <div>
      <div>
        <Link to="/dashboard/quotation">
          <Button>
            <ChevronLeft /> Back
          </Button>
        </Link>
      </div>
      {isLoading ? (
        <div>Loading...</div>
      ) : isError ? (
        <div>Error: {error.message}</div>
      ) : (
        <div>
          <Card className={"mt-5 "}>
            <CardHeader className="font-bold">Quotation Details</CardHeader>
            <div className="flex px-5 gap-2">
              <Input
                type={"text"}
                value={data?.data.quotationNumber}
                readOnly
              />
              <Input
                type={"date"}
                value={new Date(data?.data.date).toISOString().split("T")[0]}
              />
            </div>
          </Card>
          <Card className={"mt-5 "}>
            <CardHeader className="font-bold">Customer Details</CardHeader>
            <div className="flex px-5 gap-2">
              <Input type={"text"} value={data?.data.customer.name} />
              <Input type={"text"} value={data?.data.customer.phone} />
            </div>
          </Card>
          <Card className={"mt-5 "}>
            <CardHeader className="font-bold">Items Details</CardHeader>
            <div className="px-5">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>S.No</TableHead>
                    <TableHead>Part Name</TableHead>
                    <TableHead>Part No</TableHead>
                    <TableHead>Part No</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>MRP</TableHead>
                    <TableHead>Actions</TableHead>

                  </TableRow>
                    

                  
                </TableHeader>
              </Table>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ViewQuotation;
