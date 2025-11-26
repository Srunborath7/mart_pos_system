"use client";
import Logo from "@/assets/logo/Kh_Mart.png";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, SquarePen, Trash2, MoreHorizontalIcon } from "lucide-react";
import { MdAdd } from "react-icons/md";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Image, Page, Document, PDFViewer, StyleSheet, Text, View } from "@react-pdf/renderer";
import { pdf } from "@react-pdf/renderer";
import customerReportStyles from "@/util/stylePdf/PdfReportStyles";

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
import { useEffect, useRef, useState } from "react";
import { request } from "@/util/request/request";

import { Loader2 } from "lucide-react";
import { formatDate } from "@/util/helper/formatDate";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import {
    Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious
} from "@/components/ui/pagination";
export default function CustomerPage() {

    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState(false);
    const [deleteItem, setDeleteItem] = useState(null);
    const [isOpenPDF, setIsOpenPDF] = useState(false);
    const [query, setQuery] = useState("");
    const [validate, setValidate] = useState({});
    const fileInputRef = useRef(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const paginatedCustomers = customers.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const totalPages = Math.ceil(customers.length / itemsPerPage);

    const handleUploadClick = () => fileInputRef.current?.click();

    const [form, setForm] = useState({
        id: "",
        name: "",
        phone: "",
        email: "",
        gender: "",
        address: "",
        remark: "",
    });

    const fetchingData = async () => {
        setLoading(true);
        try {
            const res = await request("customers", "get");
            if (res) setCustomers(res.data);
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
                res = await request(`customers/${form.id}`, "put", form);
            } else {
                res = await request("customers", "post", form);
            }

            if (res?.error) {
                setValidate(res.errors || {});
                return;
            }

            await fetchingData();
            setIsOpen(false);
            setForm({
                id: "",
                name: "",
                phone: "",
                email: "",
                gender: "",
                address: "",
                remark: "",
            });
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
            await request(`customers/${deleteItem.id}`, "delete");
            fetchingData();
        } finally {
            setLoading(false);
            setDeleteDialog(false);
            setDeleteItem(null);
        }
    };

    const onEdit = (item) => {
        setForm(item);
        setIsEdit(true);
        setIsOpen(true);
    };

    const exportToExcel = () => {
        if (!customers || customers.length === 0) return;

        const dataToExport = customers.map((item, i) => ({
            N: i + 1,
            Name: item.name,
            Phone: item.phone,
            Email: item.email,
            Gender: item.gender,
            Address: item.address,
            Remark: item.remark,
            "Created At": formatDate(item.created_at),
            "Updated At": formatDate(item.updated_at),
            Creator: item.user?.name || "Unknown",
        }));

        const ws = XLSX.utils.json_to_sheet(dataToExport);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Customers");

        const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
        saveAs(new Blob([excelBuffer]), "customers.xlsx");
    };

    const importFromExcel = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();

        reader.onload = async (evt) => {
            const wb = XLSX.read(evt.target.result, { type: "binary" });
            const sheet = wb.Sheets[wb.SheetNames[0]];

            const jsonData = XLSX.utils.sheet_to_json(sheet);

            const mappedData = jsonData.map((item) => ({
                name: item.Name,
                phone: item.Phone,
                email: item.Email,
                gender: item.Gender,
                address: item.Address,
                remark: item.Remark,
            }));

            try {
                await request("customers/bulk", "post", { customers: mappedData });
                fetchingData();
            } catch (err) {
                console.error("Excel upload error:", err);
            }
        };

        reader.readAsBinaryString(file);
    };

    const MyDocument = ({ data }) => (
        <Document>
            <Page size="A4" style={customerReportStyles.page}>

                {Logo && <Image style={customerReportStyles.logo} src={Logo} />}

                <Text style={customerReportStyles.header}>Mart POS System</Text>
                <Text style={customerReportStyles.subHeader}>Customer Report</Text>

                <View style={customerReportStyles.table}>
                    <View style={customerReportStyles.tableRow}>
                        {["No", "Name", "Phone", "Email", "Gender", "Address", "Remark", "Created", "Updated", "Creator"].map(
                            (col, i) => (
                                <Text key={i} style={customerReportStyles.tableHeader}>
                                    {col}
                                </Text>
                            )
                        )}
                    </View>

                    {data.map((item, index) => (
                        <View key={index} style={customerReportStyles.tableRow}>
                            <Text style={customerReportStyles.tableCell}>{index + 1}</Text>
                            <Text style={customerReportStyles.tableCell}>{item.name}</Text>
                            <Text style={customerReportStyles.tableCell}>{item.phone}</Text>
                            <Text style={customerReportStyles.tableCell}>{item.email}</Text>
                            <Text style={customerReportStyles.tableCell}>{item.gender}</Text>
                            <Text style={customerReportStyles.tableCell}>{item.address}</Text>
                            <Text style={customerReportStyles.tableCell}>{item.remark}</Text>
                            <Text style={customerReportStyles.tableCell}>{formatDate(item.created_at)}</Text>
                            <Text style={customerReportStyles.tableCell}>{formatDate(item.updated_at)}</Text>
                            <Text style={customerReportStyles.tableCell}>{item.user?.name || "Unknown"}</Text>
                        </View>
                    ))}
                </View>

                <Text style={customerReportStyles.footer}>Generated by Mart POS System</Text>

            </Page>
        </Document>
    );

    const downloadPDF = async () => {
        const blob = await pdf(<MyDocument data={customers} />).toBlob();
        saveAs(blob, "customers_report.pdf");
    };

    const tableHeaders = [
        "N", "Name", "Phone", "Email", "Gender", "Address", "Remark", "Create At", "Update At", "Creator", "Action"
    ];

    return (
        <div className="p-4 md:p-6 space-y-4 md:space-y-6 w-full">

            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-3xl font-bold">Customers</h1>
                <p className="text-muted-foreground mt-2">Manage your customers.</p>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
                <div className="flex flex-col md:flex-row md:items-center gap-4 w-full">

                    <div className="relative w-full md:w-1/2">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                            placeholder="Search customers..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="pl-10 py-2 rounded-xl w-full"
                        />
                    </div>

                    <Button
                        variant="outline"
                        onClick={async () => {
                            const res = await request(`customers/search/?q=${query}`, "get");
                            if (res) setCustomers(res.data);
                        }}
                        className="rounded-full w-full md:w-auto flex items-center justify-center gap-2"
                    >
                        <Search className="mr-2 h-4 w-4" /> Search
                    </Button>

                    <Button
                        variant="outline"
                        className="rounded-xl w-full md:w-auto flex items-center gap-2 justify-center"
                        onClick={() => {
                            setForm({
                                id: "",
                                name: "",
                                phone: "",
                                email: "",
                                gender: "",
                                address: "",
                                remark: "",
                            });
                            setQuery("");
                            fetchingData();
                        }}
                    >
                        <Trash2 className="h-4 w-4" />
                        Reset
                    </Button>
                </div>

                {/* Add Customer Dialog */}
                <div className="flex gap-4 items-center">
                    <input
                        type="file"
                        accept=".xlsx, .xls"
                        ref={fileInputRef}
                        style={{ display: "none" }}
                        onChange={importFromExcel}
                    />

                    <Dialog open={isOpen} onOpenChange={setIsOpen}>
                        <DialogTrigger asChild>
                            <Button
                                variant="outline"
                                size="lg"
                                className="rounded-xl px-6 py-2 text-base flex items-center gap-2 border-red-900/80 text-red-900/80 hover:bg-red-900/80 hover:text-white"
                                onClick={() => {
                                    setIsEdit(false);
                                    setForm({
                                        id: "",
                                        name: "",
                                        phone: "",
                                        email: "",
                                        gender: "",
                                        address: "",
                                        remark: "",
                                    });
                                    setIsOpen(true);
                                }}
                            >
                                <MdAdd size={22} /> Add Customer
                            </Button>
                        </DialogTrigger>

                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>{isEdit ? "Edit Customer" : "Add Customer"}</DialogTitle>
                                <DialogDescription>Fill customer information.</DialogDescription>
                            </DialogHeader>

                            <form onSubmit={onSubmit} className="space-y-5 mt-2">

                                <div className="flex flex-col gap-3">
                                    <Label>Name</Label>
                                    {validate.name && <p className="text-red-500 text-sm">{validate.name}</p>}
                                    <Input
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        placeholder="Enter customer name"
                                    />
                                </div>

                                <div className="flex flex-col gap-3">
                                    <Label>Phone</Label>
                                    {validate.phone && <p className="text-red-500 text-sm">{validate.phone}</p>}
                                    <Input
                                        value={form.phone}
                                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                        placeholder="Enter phone number"
                                    />
                                </div>

                                <div className="flex flex-col gap-3">
                                    <Label>Email</Label>
                                    {validate.email && <p className="text-red-500 text-sm">{validate.email}</p>}
                                    <Input
                                        value={form.email}
                                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                                        placeholder="Enter email"
                                    />
                                </div>

                                <div className="flex flex-col gap-3">
                                    <Label>Gender</Label>
                                    {validate.gender && <p className="text-red-500 text-sm">{validate.gender}</p>}
                                    <select
                                        value={form.gender}
                                        onChange={(e) => setForm({ ...form, gender: e.target.value })}
                                        className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">Select gender</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>

                                <div className="flex flex-col gap-3">
                                    <Label>Address</Label>
                                    {validate.address && <p className="text-red-500 text-sm">{validate.address}</p>}
                                    <Input
                                        value={form.address}
                                        onChange={(e) => setForm({ ...form, address: e.target.value })}
                                        placeholder="Enter address"
                                    />
                                </div>

                                <div className="flex flex-col gap-3">
                                    <Label>Remark</Label>
                                    <Textarea
                                        value={form.remark}
                                        onChange={(e) => setForm({ ...form, remark: e.target.value })}
                                        placeholder="Optional note"
                                    />
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

                    {/* Menu */}
                    <DropdownMenu modal={false}>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon-sm">
                                <MoreHorizontalIcon />
                            </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent className="w-42" align="end">
                            <DropdownMenuLabel>Excel / PDF</DropdownMenuLabel>
                            <DropdownMenuGroup>
                                <DropdownMenuItem onClick={handleUploadClick}>
                                    Upload Excel
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={exportToExcel}>
                                    Download Excel
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setIsOpenPDF(true)}>
                                    View PDF
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={downloadPDF}>
                                    Download PDF
                                </DropdownMenuItem>
                            </DropdownMenuGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </motion.div>

            {/* Table */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="bg-white/60 backdrop-blur-lg shadow-2xs rounded-2xl border border-gray-100 p-4">

                <div className="block w-full overflow-x-auto rounded-xl">
                    <Table className="min-w-[950px]">
                        <TableCaption>List of customers</TableCaption>

                        <TableHeader className="sticky top-0 bg-white z-10 shadow-sm">
                            <TableRow>
                                {tableHeaders.map((h, i) => <TableHead key={i}>{h}</TableHead>)}
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={11} className="text-center py-6">
                                        <Loader2 className="mx-auto animate-spin" />
                                    </TableCell>
                                </TableRow>
                            ) : customers.length > 0 ? (
                                paginatedCustomers.map((item, index) => (
                                    <TableRow key={item.id}>
                                        <TableCell>{(currentPage - 1) * itemsPerPage + index + 1}</TableCell>
                                        <TableCell>{item.name}</TableCell>
                                        <TableCell>{item.phone}</TableCell>
                                        <TableCell>{item.email}</TableCell>
                                        <TableCell>{item.gender}</TableCell>
                                        <TableCell>{item.address}</TableCell>
                                        <TableCell>{item.remark}</TableCell>
                                        <TableCell>{formatDate(item.created_at)}</TableCell>
                                        <TableCell>{formatDate(item.updated_at)}</TableCell>
                                        <TableCell>{item.user?.name || "Unknown"}</TableCell>
                                        <TableCell>
                                            <div className="flex gap-2">
                                                <Button variant="outline" onClick={() => onEdit(item)}>
                                                    <SquarePen />
                                                </Button>
                                                <Button variant="destructive" onClick={() => confirmDelete(item)}>
                                                    <Trash2 />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={11} className="text-center py-6 text-muted-foreground">
                                        No customers found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>

                    </Table>
                </div>
                <Pagination className="mt-4 justify-center">
                    <PaginationPrevious
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    >
                        Previous
                    </PaginationPrevious>

                    <PaginationContent>
                        {[...Array(totalPages)].map((_, i) => (
                            <PaginationItem
                                key={i}
                                onClick={() => setCurrentPage(i + 1)}
                                active={currentPage === i + 1}
                            >
                                <PaginationLink>{i + 1}</PaginationLink>
                            </PaginationItem>
                        ))}
                    </PaginationContent>

                    <PaginationNext
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    >
                        Next
                    </PaginationNext>
                </Pagination>

            </motion.div>

            {/* PDF View Dialog */}
            <Dialog open={isOpenPDF} onOpenChange={setIsOpenPDF}>
                <DialogContent className="rounded-xl bg-white/90 backdrop-blur-md border border-gray-300 shadow-lg max-w-5xl w-full p-0 overflow-hidden">
                    <DialogHeader className="p-4 border-b">
                        <DialogTitle className="text-lg font-semibold text-gray-800">
                            Customer Report PDF
                        </DialogTitle>
                    </DialogHeader>

                    <div className="w-full" style={{ height: "80vh" }}>
                        {isOpenPDF && (
                            <PDFViewer style={{ width: "100%", height: "100%" }}>
                                <MyDocument data={customers} />
                            </PDFViewer>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
            <AlertDialog open={deleteDialog} onOpenChange={setDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the customer:
                            <br />
                            <span className="font-bold text-red-600">{deleteItem?.name}</span>
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-red-600 hover:bg-red-700 text-white"
                            onClick={onDelete}
                            disabled={loading}
                        >
                            {loading ? (
                                <Loader2 className="animate-spin h-4 w-4" />
                            ) : (
                                "Delete"
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
