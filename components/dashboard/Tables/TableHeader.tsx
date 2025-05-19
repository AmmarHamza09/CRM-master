"use client";
import { Button } from "@/components/ui/button";
import * as XLSX from "xlsx";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Check,
  CloudUpload,
  Delete,
  File,
  ListFilter,
  Loader2,
  PlusCircle,
  Search,
  X,
} from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";
import { RiFileExcel2Line } from "react-icons/ri";
import Select from "react-tailwindcss-select";
import {
  Options,
  SelectValue,
} from "react-tailwindcss-select/dist/components/type";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { formatBytes } from "@/lib/formatBytes";
import { generateSlug } from "@/lib/generateSlug";
import { createBulkCategories } from "@/actions/categories";
import toast from "react-hot-toast";
import exportDataToExcel from "@/lib/exportDataToExcel";

type TableHeaderProps = {
  title: string;
  href: string;
  linkTitle: string;
  data: any;
  model: string;
  showImport?: boolean;
};

export default function TableHeader({
  title,
  href,
  linkTitle,
  data,
  model,
  showImport = true,
}: TableHeaderProps) {
  const [status, setStatus] = useState<SelectValue>(null);
  const [date, setDate] = useState<SelectValue>(null);
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [jsonData, setJsonData] = useState("");
  const [preview, setPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  let excelDownload = "#";
  if (model === "category") {
    excelDownload = "/Categories.xlsx";
  } else if (model === "brand") {
    excelDownload = "/Brands.xlsx";
  } else if (model === "warehouse") {
    excelDownload = "/Warehouses.xlsx";
  } else if (model === "supplier") {
    excelDownload = "/Suppliers.xlsx";
  } else if (model === "unit") {
    excelDownload = "/Units.xlsx";
  } else if (model === "product") {
    excelDownload = "/Products.xlsx";
  }

  const options: Options = [
    { value: "true", label: "Active" },
    { value: "false", label: "Disabled" },
  ];

  const dateOptions: Options = [
    { value: "lastMonth", label: "Last Month" },
    { value: "thisMonth", label: "This Month" },
  ];

  const handleStatusChange = (item: SelectValue) => {
    setStatus(item);
  };

  const handleDateChange = (item: SelectValue) => {
    setDate(item);
  };

  function previewData() {
    setPreview(true);
    if (excelFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet);
        setJsonData(JSON.stringify(json, null, 2));
      };
      reader.readAsArrayBuffer(excelFile);
    }
  }

  function saveData() {
    setLoading(true);
    try {
      const parsedData = JSON.parse(jsonData);
      if (model === "category") {
        createBulkCategories(parsedData)
          .then(() => {
            setLoading(false);
            setUploadSuccess(true);
            toast.success("Categories imported successfully");
          })
          .catch((error) => {
            setLoading(false);
            toast.error("Error importing categories");
            console.error(error);
          });
      }
    } catch (error) {
      setLoading(false);
      toast.error("Error parsing data");
      console.error(error);
    }
  }

  function handleExportData() {
    exportDataToExcel(data, title);
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <Link href={href}>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            {linkTitle}
          </Button>
        </Link>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Select
            value={status}
            onChange={handleStatusChange}
            options={options}
            isSearchable={false}
            placeholder="Status"
            classNames={{
              menuButton: () =>
                "flex h-10 w-40 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
              menu: "absolute z-10 w-full bg-white shadow-lg border rounded py-1 mt-1.5 text-sm text-gray-700",
              listItem: ({ isSelected }) =>
                `block transition duration-200 px-2 py-2 cursor-pointer select-none truncate rounded ${
                  isSelected
                    ? `text-white bg-blue-500`
                    : `text-gray-500 hover:bg-blue-100 hover:text-blue-500`
                }`,
            }}
          />
          <Select
            value={date}
            onChange={handleDateChange}
            options={dateOptions}
            isSearchable={false}
            placeholder="Date"
            classNames={{
              menuButton: () =>
                "flex h-10 w-40 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
              menu: "absolute z-10 w-full bg-white shadow-lg border rounded py-1 mt-1.5 text-sm text-gray-700",
              listItem: ({ isSelected }) =>
                `block transition duration-200 px-2 py-2 cursor-pointer select-none truncate rounded ${
                  isSelected
                    ? `text-white bg-blue-500`
                    : `text-gray-500 hover:bg-blue-100 hover:text-blue-500`
                }`,
            }}
          />
        </div>
        {showImport && (
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <CloudUpload className="mr-2 h-4 w-4" />
                Import
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Import Data</DialogTitle>
                <DialogDescription>
                  Upload an Excel file to import data.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid w-full max-w-sm items-center gap-1.5">
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setExcelFile(file);
                      }
                    }}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {excelFile && (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <File className="h-4 w-4" />
                      <span>{excelFile.name}</span>
                      <span className="text-gray-400">
                        ({formatBytes(excelFile.size)})
                      </span>
                    </div>
                  )}
                </div>
                {jsonData && (
                  <ScrollArea className="h-[300px] rounded-md border p-4">
                    <pre className="text-sm">{jsonData}</pre>
                  </ScrollArea>
                )}
              </div>
              <DialogFooter className="sticky bottom-0 bg-background border-t pt-4">
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                {!preview && excelFile && (
                  <Button onClick={previewData}>
                    <Search className="mr-2 h-4 w-4" />
                    Preview
                  </Button>
                )}
                {preview && (
                  <Button onClick={saveData} disabled={loading}>
                    {loading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Check className="mr-2 h-4 w-4" />
                    )}
                    Import
                  </Button>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
        <Button variant="outline" onClick={handleExportData}>
          <RiFileExcel2Line className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>
    </div>
  );
}
