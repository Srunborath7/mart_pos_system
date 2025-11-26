"use client";
import Logo from "@/assets/logo/Kh_Mart.png";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SquarePen, Trash2, Loader2, Search, MoreHorizontalIcon } from "lucide-react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { pdf, PDFViewer, Document, Page, Text, View, Image } from "@react-pdf/renderer";
import purchaseReportStyles from "@/util/stylePdf/PdfReportStyles";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";
import { request } from "@/util/request/request";
import { formatDate } from "@/util/helper/formatDate";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from "@/components/ui/pagination";

export default function PurchaseReportPage() {
  const [purchases, setPurchases] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpenPDF, setIsOpenPDF] = useState(false);
  const [isEditDialog, setIsEditDialog] = useState(false);
  const [editForm, setEditForm] = useState({
    id: "",
    supplier_id: "",
    shipping_cost: "",
    paid: "",
    paid_date: "",
    create_by: "",
  });
  const [query, setQuery] = useState("");
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [deleteItem, setDeleteItem] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const totalPages = Math.ceil(purchases.length / itemsPerPage);

  const paginatedPurchases = purchases.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const fetchingPurchases = async () => {
    setLoading(true);
    try {
      const res = await request("purchases", "get");
      if (res) setPurchases(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchingSuppliers = async () => {
    try {
      const res = await request("suppliers", "get");
      if (res) setSuppliers(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchingPurchases();
    fetchingSuppliers();
  }, []);

  const handleSearch = async () => {
    if (!query.trim()) {
      setCurrentPage(1);
      return fetchingPurchases();
    }

    setLoading(true);
    try {
      const res = await request(`purchases/search/?query=${encodeURIComponent(query)}`, "get");
      if (res) {
        setPurchases(res.data);
        setCurrentPage(1); 
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const onEditPurchase = (item) => {
    setEditForm(item);
    setIsEditDialog(true);
  };

  const onSubmitEdit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await request(`purchases/${editForm.id}`, "put", editForm);
      setIsEditDialog(false);
      fetchingPurchases();
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
      await request(`purchases/${deleteItem.id}`, "delete");
      fetchingPurchases();
    } finally {
      setLoading(false);
      setDeleteDialog(false);
      setDeleteItem(null);
    }
  };

  const exportToExcel = () => {
    if (!purchases || purchases.length === 0) return;
    const dataToExport = purchases.map((item, index) => ({
      N: index + 1,
      Supplier: suppliers.find(s => s.id === item.supplier_id)?.name || item.supplier_id,
      ShippingCost: item.shipping_cost,
      Paid: item.paid,
      PaidDate: formatDate(item.paid_date),
      CreatedAt: formatDate(item.created_at),
      UpdatedAt: formatDate(item.updated_at),
      CreatedBy: item.create_by,
    }));
    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Purchase Report");
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([excelBuffer]), "purchase_report.xlsx");
  };

  const MyDocument = ({ data }) => (
    <Document>
      <Page size="A4" style={purchaseReportStyles.page}>
        {Logo && <Image style={purchaseReportStyles.logo} src={Logo} />}
        <Text style={purchaseReportStyles.header}>Mart POS System</Text>
        <Text style={purchaseReportStyles.subHeader}>Purchase Report</Text>
        <View style={purchaseReportStyles.table}>
          <View style={purchaseReportStyles.tableRow}>
            {["No", "Supplier", "Shipping Cost", "Paid", "Paid Date", "Created At", "Updated At", "Created By"].map((col, i) => (
              <Text key={i} style={[purchaseReportStyles.tableHeader, i === 7 && purchaseReportStyles.tableHeaderLast]}>{col}</Text>
            ))}
          </View>
          {data.map((item, index) => (
            <View key={index} style={[purchaseReportStyles.tableRow, index % 2 === 0 && purchaseReportStyles.rowEven]}>
              <Text style={purchaseReportStyles.tableCell}>{index + 1}</Text>
              <Text style={purchaseReportStyles.tableCell}>{suppliers.find(s => s.id === item.supplier_id)?.name || item.supplier_id}</Text>
              <Text style={purchaseReportStyles.tableCell}>{item.shipping_cost}</Text>
              <Text style={purchaseReportStyles.tableCell}>{item.paid}</Text>
              <Text style={purchaseReportStyles.tableCell}>{formatDate(item.paid_date)}</Text>
              <Text style={purchaseReportStyles.tableCell}>{formatDate(item.created_at)}</Text>
              <Text style={purchaseReportStyles.tableCell}>{formatDate(item.updated_at)}</Text>
              <Text style={[purchaseReportStyles.tableCell, purchaseReportStyles.tableCellLast]}>{item.create_by}</Text>
            </View>
          ))}
        </View>
        <Text style={purchaseReportStyles.footer}>Generated by Mart POS System</Text>
      </Page>
    </Document>
  );

  const downloadPDF = async () => {
    const blob = await pdf(<MyDocument data={purchases} />).toBlob();
    saveAs(blob, "purchase_report.pdf");
  };

  const header_table = ["No", "Supplier", "Shipping Cost", "Paid", "Paid Date", "Created At", "Updated At", "Created By", "Action"];

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6 w-full">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold">Purchase Report</h1>
        <p className="text-muted-foreground mt-2">Manage and export your purchases.</p>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col md:flex-row md:items-center gap-4 w-full">
          <div className="relative w-full md:w-1/2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search purchases..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="pl-10 py-2 rounded-xl w-full"
            />
          </div>
          <Button variant="outline" onClick={handleSearch} className="rounded-full w-full md:w-auto flex items-center justify-center gap-2">
            <Search className="mr-2 h-4 w-4" /> Search
          </Button>
          <Button variant="outline" className="rounded-xl w-full md:w-auto flex items-center gap-2 justify-center" onClick={() => { setQuery(""); fetchingPurchases(); setCurrentPage(1); }}>
            <Trash2 className="h-4 w-4" /> Reset
          </Button>
        </div>

        <div className="flex gap-4 justify-items-center items-center">
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" aria-label="Open menu" size="icon-sm">
                <MoreHorizontalIcon />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-40" align="end">
              <DropdownMenuLabel>Excel / PDF Actions</DropdownMenuLabel>
              <DropdownMenuGroup>
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
            <TableCaption>List of purchases</TableCaption>
            <TableHeader className="sticky top-0 bg-white z-10 shadow-sm">
              <TableRow>
                {header_table.map((header, i) => <TableHead key={i}>{header}</TableHead>)}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-6">
                    <Loader2 className="mx-auto animate-spin" />
                  </TableCell>
                </TableRow>
              ) : paginatedPurchases.length > 0 ? (
                paginatedPurchases.map((item, index) => (
                  <TableRow key={item.id}>
                    <TableCell>{(currentPage - 1) * itemsPerPage + index + 1}</TableCell>
                    <TableCell>{suppliers.find(s => s.id === item.supplier_id)?.name || item.supplier_id}</TableCell>
                    <TableCell>{item.shipping_cost}</TableCell>
                    <TableCell>{item.paid}</TableCell>
                    <TableCell>{formatDate(item.paid_date)}</TableCell>
                    <TableCell>{formatDate(item.created_at)}</TableCell>
                    <TableCell>{formatDate(item.updated_at)}</TableCell>
                    <TableCell>{item.user?.name || "Unknown"}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" onClick={() => onEditPurchase(item)}><SquarePen /></Button>
                        <Button variant="destructive" onClick={() => confirmDelete(item)}><Trash2 /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-6 text-muted-foreground">No purchases found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex justify-end mt-4">
          <Pagination>
            <PaginationPrevious disabled={currentPage === 1} onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}>Previous</PaginationPrevious>
            <PaginationContent>
              {[...Array(totalPages)].map((_, i) => (
                <PaginationItem key={i}>
                  <PaginationLink 
                    onClick={() => setCurrentPage(i + 1)} 
                    isActive={currentPage === i + 1}
                  >
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
            </PaginationContent>
            <PaginationNext disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}>Next</PaginationNext>
          </Pagination>
        </div>
      </motion.div>

      <Dialog open={isEditDialog} onOpenChange={setIsEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Purchase</DialogTitle>
          </DialogHeader>
          <form onSubmit={onSubmitEdit} className="space-y-5 mt-2">
            <div className="flex flex-col gap-3">
              <Label>Supplier</Label>
              <select className="border p-2 rounded" value={editForm.supplier_id} onChange={(e) => setEditForm({ ...editForm, supplier_id: e.target.value })} required>
                <option value="">Select Supplier</option>
                {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-3">
              <Label>Shipping Cost</Label>
              <Input type="number" value={editForm.shipping_cost} onChange={(e) => setEditForm({ ...editForm, shipping_cost: e.target.value })} required />
            </div>
            <div className="flex flex-col gap-3">
              <Label>Paid Amount</Label>
              <Input type="number" value={editForm.paid} onChange={(e) => setEditForm({ ...editForm, paid: e.target.value })} required />
            </div>
            <div className="flex flex-col gap-3">
              <Label>Paid Date</Label>
              <Input type="date" value={editForm.paid_date} onChange={(e) => setEditForm({ ...editForm, paid_date: e.target.value })} required />
            </div>
            <DialogFooter>
              <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
              <Button type="submit" disabled={loading}>{loading ? <Loader2 className="animate-spin" /> : "Save"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>This action will permanently delete purchase <b>{deleteItem?.supplier?.name}</b>.</AlertDialogDescription>
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
          <div className="w-full" style={{ height: "80vh" }}>
            {isOpenPDF && <PDFViewer style={{ width: "100%", height: "100%" }}><MyDocument data={purchases} /></PDFViewer>}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
