"use client";

import Logo from "@/assets/logo/Kh_Mart.png";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  MoreHorizontalIcon,
  Search,
  SquarePen,
  Trash2,
  Loader2,
  ArrowDownToLine,
} from "lucide-react";
import { MdAdd } from "react-icons/md";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Image, Page, Document, PDFViewer, Text, View, pdf } from "@react-pdf/renderer";
import orderReportStyles from "@/util/stylePdf/PdfReportStyles";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useEffect, useRef, useState } from "react";
import { request } from "@/util/request/request";
import { formatDate } from "@/util/helper/formatDate";

export default function OrdersPage() {
  // State
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpenForm, setIsOpenForm] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState(null);
  const [isPdfViewerOpen, setIsPdfViewerOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const fileInputRef = useRef(null);

  const emptyForm = {
    id: "",
    invoice_number: "",
    total_amount: "",
    payment_method: "",
    cash_received: "",
    customer_id: "",
  };
  const [form, setForm] = useState(emptyForm);

  const totalPages = Math.max(1, Math.ceil(orders.length / itemsPerPage));
  const paginatedOrders = orders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Fetch orders
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await request("orders", "get");
      const data = Array.isArray(res?.data) ? res.data : res?.data || res || [];
      setOrders(data);
      setCurrentPage(1);
    } catch (err) {
      console.error("Fetch orders error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Search
  const handleSearch = async () => {
    setLoading(true);
    try {
      const res = await request(`orders/search?q=${encodeURIComponent(query)}`, "get");
      const data = Array.isArray(res?.data) ? res.data : res?.data || res || [];
      setOrders(data);
      setCurrentPage(1);
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Add/Edit
  const openAddForm = () => {
    setForm(emptyForm);
    setIsEdit(false);
    setIsOpenForm(true);
  };

  const onEdit = (order) => {
    setForm({
      id: order.id,
      invoice_number: order.invoice_number ?? "",
      total_amount: order.total_amount ?? "",
      payment_method: order.payment_method ?? "",
      cash_received: order.cash_received ?? "",
      customer_id: order.customer?.id ?? "",
    });
    setIsEdit(true);
    setIsOpenForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        invoice_number: form.invoice_number,
        total_amount: Number(form.total_amount) || 0,
        payment_method: form.payment_method,
        cash_received: Number(form.cash_received) || 0,
        customer_id: form.customer_id || undefined,
      };
      if (isEdit && form.id) {
        await request(`orders/${form.id}`, "put", payload);
      } else {
        await request("orders", "post", payload);
      }
      await fetchOrders();
      setIsOpenForm(false);
      setIsEdit(false);
      setForm(emptyForm);
    } catch (err) {
      console.error("Save order error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Delete
  const confirmDelete = (order) => {
    setDeleteItem(order);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    setLoading(true);
    try {
      await request(`orders/${deleteItem.id}`, "delete");
      await fetchOrders();
    } catch (err) {
      console.error("Delete order error:", err);
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
      setDeleteItem(null);
    }
  };

  // Excel
  const exportToExcel = () => {
    const dataToExport = orders.map((it, idx) => ({
      N: idx + 1,
      "Invoice Number": it.invoice_number,
      "Total Amount": it.total_amount,
      "Payment Method": it.payment_method,
      "Cash Received": it.cash_received,
      "Created At": formatDate(it.created_at),
      "Updated At": formatDate(it.updated_at),
      Customer: it.customer?.name || "Walk-in-Customer",
      "Created By": it.user?.name || "Unknown",
    }));
    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Orders");
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([excelBuffer]), "orders_list.xlsx");
  };

  

  // PDF
  const MyDocument = ({ data }) => (
    <Document>
      <Page size="A4" style={orderReportStyles.page}>
        {Logo && <Image style={orderReportStyles.logo} src={Logo} />}
        <Text style={orderReportStyles.header}>Mart POS System</Text>
        <Text style={orderReportStyles.subHeader}>Orders Report</Text>

        <View style={orderReportStyles.table}>
          <View style={orderReportStyles.tableRow}>
            {[
              "No",
              "Invoice #",
              "Total Amount",
              "Payment Method",
              "Cash Received",
              "Created At",
              "Updated At",
              "Customer",
              "Created By",
            ].map((col, i) => (
              <Text key={i} style={orderReportStyles.tableHeader}>{col}</Text>
            ))}
          </View>

          {data.map((it, idx) => (
            <View key={idx} style={orderReportStyles.tableRow}>
              <Text style={orderReportStyles.tableCell}>{idx + 1}</Text>
              <Text style={orderReportStyles.tableCell}>{it.invoice_number}</Text>
              <Text style={orderReportStyles.tableCell}>{it.total_amount}</Text>
              <Text style={orderReportStyles.tableCell}>{it.payment_method}</Text>
              <Text style={orderReportStyles.tableCell}>{it.cash_received}</Text>
              <Text style={orderReportStyles.tableCell}>{formatDate(it.created_at)}</Text>
              <Text style={orderReportStyles.tableCell}>{formatDate(it.updated_at)}</Text>
              <Text style={orderReportStyles.tableCell}>{it.customer?.name || "Walk-in-Customer"}</Text>
              <Text style={orderReportStyles.tableCell}>{it.user?.name || "Unknown"}</Text>
            </View>
          ))}
        </View>

        <Text style={orderReportStyles.footer}>Generated by Mart POS System</Text>
      </Page>
    </Document>
  );

  const downloadPDF = async () => {
    try {
      const blob = await pdf(<MyDocument data={orders} />).toBlob();
      saveAs(blob, "orders_report.pdf");
    } catch (err) {
      console.error("Download PDF failed:", err);
    }
  };

  const downloadInvoice = async (order) => {
  if (!order?.id) return;

  try {
    const res = await fetch(`https://mart-pos-api.onrender.com/api/orders/${order.id}/invoice`, {
      method: "GET",
      headers: { "Content-Type": "application/pdf" },
    });

    if (!res.ok) throw new Error(`Failed to fetch invoice PDF: ${res.status}`);

    const blob = await res.blob();
    saveAs(blob, `invoice_${order.invoice_number || order.id}.pdf`);
  } catch (err) {
    console.error("Download invoice PDF failed:", err);
  }
};


  const headers = [
    "N",
    "Invoice Number",
    "Total Amount",
    "Payment Method",
    "Cash Received",
    "Created At",
    "Updated At",
    "Customer",
    "Created By",
    "Action",
  ];

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6 w-full">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold">Orders</h1>
        <p className="text-muted-foreground mt-2">Manage customer orders.</p>
      </motion.div>

      {/* Toolbar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        {/* Search */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 w-full">
          <div className="relative w-full md:w-1/2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search orders..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10 py-2 rounded-xl w-full"
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>
          <Button variant="outline" onClick={handleSearch}>
            <Search className="h-4 w-4 mr-2" /> Search
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setQuery("");
              fetchOrders();
            }}
          >
            Reset
          </Button>
        </div>
        <div className="flex gap-4 items-center">
          <Dialog open={isOpenForm} onOpenChange={setIsOpenForm}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{isEdit ? "Edit Order" : "Add Order"}</DialogTitle>
                <DialogDescription>Fill in order information.</DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-5 mt-2">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label>Invoice Number</Label>
                    <Input
                      value={form.invoice_number}
                      onChange={(e) => setForm({ ...form, invoice_number: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Total Amount</Label>
                    <Input
                      type="number"
                      value={form.total_amount}
                      onChange={(e) => setForm({ ...form, total_amount: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Payment Method</Label>
                    <Input
                      value={form.payment_method}
                      onChange={(e) => setForm({ ...form, payment_method: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Cash Received</Label>
                    <Input
                      type="number"
                      value={form.cash_received}
                      onChange={(e) => setForm({ ...form, cash_received: e.target.value })}
                    />
                  </div>
                </div>

                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button type="submit" disabled={loading}>
                    {loading ? <Loader2 className="animate-spin" /> : isEdit ? "Update" : "Save"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon-sm">
                <MoreHorizontalIcon />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-44" align="end">
              <DropdownMenuLabel>Excel & PDF</DropdownMenuLabel>
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={exportToExcel}>Download Excel</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsPdfViewerOpen(true)}>View PDF</DropdownMenuItem>
                <DropdownMenuItem onClick={downloadPDF}>Download PDF</DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </motion.div>

      {/* Table */}
      <motion.div className="bg-white/60 backdrop-blur-md shadow-2xs rounded-2xl border p-4">
        <div className="block w-full overflow-x-auto rounded-xl">
          <Table className="min-w-[900px]">
            <TableCaption>List of Orders</TableCaption>
            <TableHeader className="sticky top-0 bg-white z-10 shadow-sm">
              <TableRow>
                {headers.map((hdr, i) => (
                  <TableHead key={i}>{hdr}</TableHead>
                ))}
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={headers.length} className="text-center py-6">
                    <Loader2 className="animate-spin mx-auto" />
                  </TableCell>
                </TableRow>
              ) : paginatedOrders.length > 0 ? (
                paginatedOrders.map((it, idx) => (
                  <TableRow key={it.id || idx}>
                    <TableCell>{(currentPage - 1) * itemsPerPage + idx + 1}</TableCell>
                    <TableCell>{it.invoice_number}</TableCell>
                    <TableCell>{it.total_amount}</TableCell>
                    <TableCell>{it.payment_method}</TableCell>
                    <TableCell>{it.cash_received}</TableCell>
                    <TableCell>{formatDate(it.created_at)}</TableCell>
                    <TableCell>{formatDate(it.updated_at)}</TableCell>
                    <TableCell>{it.customer?.name || "Walk-in-Customer"}</TableCell>
                    <TableCell>{it.user?.name || "Unknown"}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => downloadInvoice(it)}
                          title="Download Invoice PDF"
                        >
                          <ArrowDownToLine />
                        </Button>
                        <Button variant="outline" onClick={() => onEdit(it)} title="Edit">
                          <SquarePen />
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => confirmDelete(it)}
                          title="Delete"
                        >
                          <Trash2 />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={headers.length} className="text-center py-6 text-muted-foreground">
                    No orders found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="mt-4 flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
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
              <PaginationItem>
                <PaginationNext
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </motion.div>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete order <b>{deleteItem?.invoice_number}</b>.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white">
              {loading ? <Loader2 className="animate-spin" /> : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* PDF Viewer */}
      <Dialog open={isPdfViewerOpen} onOpenChange={setIsPdfViewerOpen}>
        <DialogContent className="rounded-xl bg-white/90 backdrop-blur-md border shadow-lg max-w-5xl w-full p-0 overflow-hidden">
          <DialogHeader className="p-4 border-b">
            <DialogTitle className="text-lg font-semibold">Order Report PDF</DialogTitle>
            <DialogDescription>
              {selectedOrder ? `Invoice #${selectedOrder.invoice_number}` : "All orders"}
            </DialogDescription>
          </DialogHeader>
          <div className="w-full" style={{ height: "80vh" }}>
            {isPdfViewerOpen && (
              <PDFViewer style={{ width: "100%", height: "100%" }}>
                {selectedOrder ? <MyDocument data={[selectedOrder]} /> : <MyDocument data={orders} />}
              </PDFViewer>
            )}
          </div>

          <div className="p-4 border-t flex justify-end gap-2">
            <Button variant="outline" onClick={() => { setIsPdfViewerOpen(false); setSelectedOrder(null); }}>
              Close
            </Button>
            <Button onClick={() => {
              if (selectedOrder) {
                pdf(<MyDocument data={[selectedOrder]} />).toBlob().then((blob) =>
                  saveAs(blob, `order_${selectedOrder.invoice_number || selectedOrder.id}.pdf`)
                );
              } else {
                downloadPDF();
              }
            }}>
              Download
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
