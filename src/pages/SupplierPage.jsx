"use client";
import Logo from "@/assets/logo/Kh_Mart.png";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MoreHorizontalIcon, Search, SquarePen, Trash2 } from "lucide-react";
import { MdAdd } from "react-icons/md";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Image, Page, Document, PDFViewer, pdf, Text, View } from "@react-pdf/renderer";
import supplierReportStyles from "@/util/stylePdf/PdfReportStyles";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useRef, useState } from "react";
import { request } from "@/util/request/request";
import { Loader2 } from "lucide-react";
import { formatDate } from "@/util/helper/formatDate";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import {
  Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious
} from "@/components/ui/pagination";
export default function SupplierPage() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [deleteItem, setDeleteItem] = useState(null);
  const [isOpenPDF, setIsOpenPDF] = useState(false);
  const [query, setQuery] = useState("");
  const fileInputRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [validate, setValidate] = useState({});
  const totalPages = Math.ceil(suppliers.length / itemsPerPage);

  const paginatedSuppliers = suppliers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleUploadClick = () => fileInputRef.current?.click();

  const [form, setForm] = useState({
    id: "",
    name: "",
    email: "",
    phone: "",
    address: "",
    website: "",
    remarks: "",
  });

  const fetchingData = async () => {
    setLoading(true);
    try {
      const res = await request("suppliers", "get");
      if (res) setSuppliers(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchingData();
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setValidate({});
    try {
      let res;
      if (isEdit) {
        res = await request(`suppliers/${form.id}`, "put", form);
      } else {
        res = await request("suppliers", "post", form);
      }

      if (res?.error) {
        setValidate(res.errors || {});
        return;
      }

      await fetchingData();
      setIsOpen(false);
      setForm({ id: "", name: "", email: "", phone: "", address: "", website: "", remarks: "" });
      setIsEdit(false);
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = (item) => {
    setDeleteItem(item);
    setDeleteDialog(true);
  };

  const onDelete = async () => {
    if (!deleteItem) return;
    setLoading(true);

    try {
      await request(`suppliers/${deleteItem.id}`, "delete");
      fetchingData();
    } finally {
      setLoading(false);
      setDeleteDialog(false);
      setDeleteItem(null);
    }
  };

  const onEdit = (itemEdit) => {
    setForm(itemEdit);
    setIsEdit(true);
    setIsOpen(true);
  };

  const exportToExcel = () => {
    if (!suppliers || suppliers.length === 0) return;
    const dataToExport = suppliers.map((item, index) => ({
      N: index + 1,
      Name: item.name,
      Email: item.email,
      Phone: item.phone,
      Address: item.address,
      Website: item.website,
      Remarks: item.remarks,
      "Created At": formatDate(item.created_at),
      "Updated At": formatDate(item.updated_at),
      Creator: item.user?.name || "Unknown",
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Suppliers List");
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([excelBuffer]), "suppliers_list.xlsx");
  };

  const importFromExcel = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: "binary" });
      const wsname = wb.SheetNames[0];
      const sheet = wb.Sheets[wsname];
      const jsonData = XLSX.utils.sheet_to_json(sheet);

      const mappedData = jsonData.map(item => ({
        name: item.Name || item.name,
        email: item.Email || item.email,
        phone: item.Phone || item.phone,
        address: item.Address || item.address,
        website: item.Website || item.website,
        remarks: item.Remarks || item.remarks,
        created_at: item.CreatedAt ? new Date(item.CreatedAt).toISOString() : undefined,
        updated_at: item.UpdatedAt ? new Date(item.UpdatedAt).toISOString() : undefined,
      }));

      try {
        const res = await request("suppliers/bulk", "post", { suppliers: mappedData });
        if (res) fetchingData();
      } catch (error) {
        console.error("Excel upload error:", error.response || error);
      }
    };
    reader.readAsBinaryString(file);
  };

  const MyDocument = ({ data }) => (
    <Document>
      <Page size="A4" style={supplierReportStyles.page}>
        {Logo && <Image style={supplierReportStyles.logo} src={Logo} />}
        <Text style={supplierReportStyles.header}>Mart POS System</Text>
        <Text style={supplierReportStyles.subHeader}>Supplier Report</Text>

        <View style={supplierReportStyles.table}>
          <View style={supplierReportStyles.tableRow}>
            {["No", "Name", "Email", "Phone", "Address", "Website", "Remarks", "Created", "Updated", "Creator"].map((col, i) => (
              <Text key={i} style={[supplierReportStyles.tableHeader, i === 9 && supplierReportStyles.tableHeaderLast]}>
                {col}
              </Text>
            ))}
          </View>

          {data.map((item, index) => (
            <View key={index} style={[supplierReportStyles.tableRow, index % 2 === 0 && supplierReportStyles.rowEven]}>
              <Text style={supplierReportStyles.tableCell}>{index + 1}</Text>
              <Text style={supplierReportStyles.tableCell}>{item.name}</Text>
              <Text style={supplierReportStyles.tableCell}>{item.email}</Text>
              <Text style={supplierReportStyles.tableCell}>{item.phone}</Text>
              <Text style={supplierReportStyles.tableCell}>{item.address}</Text>
              <Text style={supplierReportStyles.tableCell}>{item.website}</Text>
              <Text style={supplierReportStyles.tableCell}>{item.remarks}</Text>
              <Text style={supplierReportStyles.tableCell}>{formatDate(item.created_at)}</Text>
              <Text style={supplierReportStyles.tableCell}>{formatDate(item.updated_at)}</Text>
              <Text style={[supplierReportStyles.tableCell, supplierReportStyles.tableCellLast]}>{item.user?.name || "Unknown"}</Text>
            </View>
          ))}
        </View>

        <Text style={supplierReportStyles.footer}>Generated by Mart POS System</Text>
      </Page>
    </Document>
  );

  const downloadPDF = async () => {
    const blob = await pdf(<MyDocument data={suppliers} />).toBlob();
    saveAs(blob, "suppliers_report.pdf");
  };

  const header_table = ["N", "Name", "Email", "Phone", "Address", "Website", "Remarks", "Created At", "Updated At", "Creator", "Action"];

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6 w-full">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold">Suppliers</h1>
        <p className="text-muted-foreground mt-2">Manage your product suppliers.</p>
      </motion.div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col md:flex-row md:items-center gap-4 w-full">
          <div className="relative w-full md:w-1/2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input placeholder="Search suppliers..." value={query} onChange={(e) => setQuery(e.target.value)} className="pl-10 py-2 rounded-xl w-full" />
          </div>
          <Button variant="outline" onClick={async () => {
            try {
              const res = await request(`suppliers/search/?q=${query}`, "get");
              if (res) setSuppliers(res.data);
            } catch (error) { console.error(error); }
          }} className="rounded-full w-full md:w-auto flex items-center justify-center gap-2">
            <Search className="mr-2 h-4 w-4" /> Search
          </Button>
          <Button variant="outline" className="rounded-xl w-full md:w-auto flex items-center gap-2 justify-center" onClick={() => { setForm({ id: "", name: "", email: "", phone: "", address: "", website: "", remarks: "" }); setQuery(""); fetchingData(); }}>
            <Trash2 className="h-4 w-4" /> Reset
          </Button>
        </div>
        <div className="flex gap-4 justify-items-center items-center">
          <input type="file" accept=".xlsx, .xls" ref={fileInputRef} style={{ display: "none" }} onChange={importFromExcel} />
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="lg" className="rounded-xl px-6 py-2 text-base flex items-center gap-2 border-red-900/80 text-red-900/80 hover:bg-red-900/80 hover:text-white" onClick={() => { setIsEdit(false); setForm({ id: "", name: "", email: "", phone: "", address: "", website: "", remarks: "" }); setIsOpen(true); }}>
                <MdAdd size={22} /> Add Supplier
              </Button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>{isEdit ? "Edit Supplier" : "Add Supplier"}</DialogTitle>
                <DialogDescription>Fill in the supplier information.</DialogDescription>
              </DialogHeader>

              <form onSubmit={onSubmit} className="space-y-5 mt-2">
                <div className="flex flex-col gap-3">
                  <Label>Name</Label>
                  {validate.name && <p className="text-red-500 text-sm">{validate.name}</p>}
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Enter supplier name" />
                </div>
                <div className="flex flex-col gap-3">
                  <Label>Email</Label>
                  {validate.email && <p className="text-red-500 text-sm">{validate.email}</p>}
                  <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Enter email" />
                </div>
                <div className="flex flex-col gap-3">
                  <Label>Phone</Label>
                  {validate.phone && <p className="text-red-500 text-sm">{validate.phone}</p>}
                  <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Enter phone number" />
                </div>
                <div className="flex flex-col gap-3">
                  <Label>Address</Label>
                  {validate.address && <p className="text-red-500 text-sm">{validate.address}</p>}
                  <Textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Enter address" />
                </div>
                <div className="flex flex-col gap-3">
                  <Label>Website</Label>
                  {validate.website && <p className="text-red-500 text-sm">{validate.website}</p>}
                  <Input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="Enter website" />
                </div>
                <div className="flex flex-col gap-3">
                  <Label>Remarks</Label>
                  <Textarea value={form.remarks} onChange={(e) => setForm({ ...form, remarks: e.target.value })} placeholder="Enter remarks" />
                </div>

                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button type="submit" disabled={loading}>
                    {loading ? <Loader2 className="animate-spin" /> : isEdit ? "Edit" : "Save"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" aria-label="Open menu" size="icon-sm">
                <MoreHorizontalIcon />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-40" align="end">
              <DropdownMenuLabel>Excel / PDF Actions</DropdownMenuLabel>
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={handleUploadClick}>Upload Excel</DropdownMenuItem>
                <DropdownMenuItem onClick={exportToExcel}>Download Excel</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsOpenPDF(true)}>View PDF</DropdownMenuItem>
                <DropdownMenuItem onClick={downloadPDF}>Download PDF</DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </motion.div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white/60 backdrop-blur-lg shadow-2xs rounded-2xl border border-gray-100 p-4">
        <div className="block w-full overflow-x-auto rounded-xl">
          <Table className="min-w-[1000px]">
            <TableCaption>List of suppliers</TableCaption>
            <TableHeader className="sticky top-0 bg-white z-10 shadow-sm">
              <TableRow>
                {header_table.map((header, i) => <TableHead key={i}>{header}</TableHead>)}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={11} className="text-center py-6">
                    <Loader2 className="mx-auto animate-spin" />
                  </TableCell>
                </TableRow>
              ) : paginatedSuppliers.length > 0 ? (
                paginatedSuppliers.map((item, index) => (
                  <TableRow key={item.id}>
                    <TableCell>{(currentPage - 1) * itemsPerPage + index + 1}</TableCell>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.email}</TableCell>
                    <TableCell>{item.phone}</TableCell>
                    <TableCell>{item.address}</TableCell>
                    <TableCell>{item.website}</TableCell>
                    <TableCell>{item.remarks}</TableCell>
                    <TableCell>{formatDate(item.created_at)}</TableCell>
                    <TableCell>{formatDate(item.updated_at)}</TableCell>
                    <TableCell>{item.user?.name || "Unknown"}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" onClick={() => onEdit(item)}><SquarePen /></Button>
                        <Button variant="destructive" onClick={() => confirmDelete(item)}><Trash2 /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={11} className="text-center py-6 text-muted-foreground">
                    No suppliers found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>

          </Table>
        </div>
        <div className="flex justify-end my-4">
      <Pagination>
        <PaginationPrevious
          onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
        />

        <PaginationContent>
          {Array.from({ length: totalPages }).map((_, i) => {
            const page = i + 1;
            return (
              <PaginationItem key={page}>
                <PaginationLink
                  onClick={() => onPageChange(page)}
                  isActive={currentPage === page}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            );
          })}
        </PaginationContent>

        <PaginationNext
          onClick={() =>
            currentPage < totalPages && onPageChange(currentPage + 1)
          }
        />
      </Pagination>
    </div>
      </motion.div>
      <AlertDialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>This action will permanently delete <b>{deleteItem?.name}</b>.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onDelete} className="bg-red-600 hover:bg-red-700 text-white">
              {loading ? <Loader2 className="animate-spin" /> : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Dialog open={isOpenPDF} onOpenChange={setIsOpenPDF}>
        <DialogContent className="rounded-xl bg-white/90 backdrop-blur-md border border-gray-300 shadow-lg max-w-5xl w-full p-0 overflow-hidden">
          <DialogHeader className="p-4 border-b">
            <DialogTitle className="text-lg font-semibold text-gray-800">Supplier Report PDF</DialogTitle>
          </DialogHeader>
          <div className="w-full" style={{ height: "80vh" }}>
            {isOpenPDF && <PDFViewer style={{ width: "100%", height: "100%" }}><MyDocument data={suppliers} /></PDFViewer>}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
