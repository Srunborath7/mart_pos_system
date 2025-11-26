"use client";
import Swal from "sweetalert2";
import Logo from "@/assets/logo/Kh_Mart.png";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MoreHorizontalIcon, Search, SquarePen, Trash2, Loader2 } from "lucide-react";
import { MdAdd } from "react-icons/md";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Image, Page, Document, PDFViewer, Text, View } from "@react-pdf/renderer";
import { pdf } from "@react-pdf/renderer";
import userReportStyles from "@/util/stylePdf/PdfReportStyles";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogClose,
    DialogDescription,
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
import { formatDate } from "@/util/helper/formatDate";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function UserPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState(false);
    const [deleteItem, setDeleteItem] = useState(null);
    const [isOpenPDF, setIsOpenPDF] = useState(false);
    const [query, setQuery] = useState("");
    const fileInputRef = useRef(null);
    const [form, setForm] = useState({
        id: "",
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
        role: "sale", 
    });

    const fetchingData = async () => {
        setLoading(true);
        try {
            const res = await request("auth/all", "get");
            if (res) setUsers(res.data);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchingData();
    }, []);

    const onSubmit = async (e) => {
        e.preventDefault();
        if (!isEdit) {
            if (!form.password || form.password.length < 6) {
                Swal.fire({
                    icon: "warning",
                    title: "Invalid Password",
                    text: "Password must be at least 6 characters.",
                });
                return;
            }
            if (form.password !== form.password_confirmation) {
                Swal.fire({
                    icon: "warning",
                    title: "Password Mismatch",
                    text: "Passwords do not match.",
                });
                return;
            }
        } else {
            if (form.password && form.password.length < 6) {
                Swal.fire({
                    icon: "warning",
                    title: "Invalid Password",
                    text: "New password must be at least 6 characters.",
                });
                return;
            }
            if (form.password !== form.password_confirmation) {
                Swal.fire({
                    icon: "warning",
                    title: "Password Mismatch",
                    text: "Passwords do not match.",
                });
                return;
            }
        }

        setLoading(true);
        try {
            if (isEdit) {
                await request(`auth/update/${form.id}`, "put", form);
                Swal.fire({
                    icon: "success",
                    title: "Updated!",
                    text: "User updated successfully.",
                });
            } else {
                await request("auth/register", "post", form);
                Swal.fire({
                    icon: "success",
                    title: "Saved!",
                    text: "User created successfully.",
                });
            }
            await fetchingData();
            setIsOpen(false);
            setIsEdit(false);
            setForm({
                id: "",
                name: "",
                email: "",
                password: "",
                password_confirmation: "",
                role: "sale",
            });
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: error?.response?.data?.message || "Something went wrong",
            });
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
            await request(`auth/delete/${deleteItem.id}`, "delete");
            fetchingData();
            Swal.fire({
                icon: "success",
                title: "Deleted",
                text: "User deleted successfully",
            });
        } finally {
            setLoading(false);
            setDeleteDialog(false);
            setDeleteItem(null);
        }
    };

    const onEdit = (item) => {
        setForm({
            id: item.id,
            name: item.name,
            email: item.email,
            password: "",
            password_confirmation: "",
            role: item.role,
        });
        setIsEdit(true);
        setIsOpen(true);
    };

    const exportToExcel = () => {
        if (!users || users.length === 0) return;

        const dataToExport = users.map((item, index) => ({
            N: index + 1,
            Name: item.name,
            Email: item.email,
            Role: item.role,
            "Created At": formatDate(item.created_at),
            "Updated At": formatDate(item.updated_at),
        }));

        const ws = XLSX.utils.json_to_sheet(dataToExport);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Users List");

        const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
        saveAs(new Blob([excelBuffer]), "users_list.xlsx");
    };
    const MyDocument = ({ data }) => (
        <Document>
            <Page size="A4" style={userReportStyles.page}>
                {Logo && <Image style={userReportStyles.logo} src={Logo} />}
                <Text style={userReportStyles.header}>Mart POS System</Text>
                <Text style={userReportStyles.subHeader}>User Report</Text>

                <View style={userReportStyles.table}>
                    <View style={userReportStyles.tableRow}>
                        {["No", "Name", "Email", "Role", "Created", "Updated"].map((col, i) => (
                            <Text key={i} style={userReportStyles.tableHeader}>{col}</Text>
                        ))}
                    </View>
                    {data.map((item, index) => (
                        <View key={index} style={userReportStyles.tableRow}>
                            <Text style={userReportStyles.tableCell}>{index + 1}</Text>
                            <Text style={userReportStyles.tableCell}>{item.name}</Text>
                            <Text style={userReportStyles.tableCell}>{item.email}</Text>
                            <Text style={userReportStyles.tableCell}>{item.role}</Text>
                            <Text style={userReportStyles.tableCell}>{formatDate(item.created_at)}</Text>
                            <Text style={userReportStyles.tableCell}>{formatDate(item.updated_at)}</Text>
                        </View>
                    ))}
                </View>

                <Text style={userReportStyles.footer}>Generated by Mart POS System</Text>
            </Page>
        </Document>
    );

    const downloadPDF = async () => {
        const blob = await pdf(<MyDocument data={users} />).toBlob();
        saveAs(blob, "users_report.pdf");
    };

    const header_table = ["N", "Name", "Email", "Role", "Create At", "Update At", "Action"];

    return (
        <div className="p-4 md:p-6 space-y-4 md:space-y-6 w-full">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-3xl font-bold">Users</h1>
                <p className="text-muted-foreground mt-2">Manage user accounts.</p>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
                <div className="flex flex-col md:flex-row md:items-center gap-4 w-full">
                    <div className="relative w-full md:w-1/2">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                            placeholder="Search user..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="pl-10 py-2 rounded-xl w-full"
                        />
                    </div>
                    <Button
                        variant="outline"
                        onClick={async () => {
                            const res = await request(`auth/search?q=${query}`, "get");
                            if (res) setUsers(res.data);
                        }}
                        className="rounded-full w-full md:w-auto flex items-center justify-center gap-2"
                    >
                        <Search className="mr-2 h-4 w-4" /> Search
                    </Button>
                    <Button
                        variant="outline"
                        className="rounded-xl w-full md:w-auto flex items-center gap-2 justify-center"
                        onClick={() => { setQuery(""); fetchingData(); }}
                    >
                        <Trash2 className="h-4 w-4" />
                        Reset
                    </Button>
                </div>

                <div className="flex gap-4 items-center">
                    <Dialog open={isOpen} onOpenChange={setIsOpen}>
                        <DialogTrigger asChild>
                            <Button
                                variant="outline"
                                className="rounded-xl px-6 py-2 border-red-900/80 text-red-900/80 hover:bg-red-900/80 hover:text-white"
                                onClick={() => {
                                    setIsEdit(false);
                                    setForm({
                                        id: "",
                                        name: "",
                                        email: "",
                                        password: "",
                                        password_confirmation: "",
                                        role: "sale",
                                    });
                                }}
                            >
                                <MdAdd size={22} /> Add User
                            </Button>
                        </DialogTrigger>

                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>{isEdit ? "Edit User" : "Add User"}</DialogTitle>
                                <DialogDescription>Fill in the user details.</DialogDescription>
                            </DialogHeader>

                            <form onSubmit={onSubmit} className="space-y-5 mt-2">
                                <div className="flex flex-col gap-2">
                                    <Label>Name</Label>
                                    <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Label>Email</Label>
                                    <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Label>{isEdit ? "New Password (leave blank to keep current)" : "Password"}</Label>
                                    <Input
                                        type="password"
                                        value={form.password}
                                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Label>{isEdit ? "Confirm New Password" : "Confirm Password"}</Label>
                                    <Input
                                        type="password"
                                        value={form.password_confirmation}
                                        onChange={(e) => setForm({ ...form, password_confirmation: e.target.value })}
                                    />
                                </div>

                                <div className="flex flex-col gap-2">
                                    <Label>Role</Label>
                                    <select
                                        className="border rounded-lg p-2"
                                        value={form.role}
                                        onChange={(e) => setForm({ ...form, role: e.target.value })}
                                    >
                                        <option value="admin">Admin</option>
                                        <option value="manager">Manager</option>
                                        <option value="sale">Sale</option>
                                    </select>
                                </div>

                                <DialogFooter>
                                    <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                                    <Button type="submit" disabled={loading}>
                                        {loading ? <Loader2 className="animate-spin" /> : isEdit ? "Update" : "Save"}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                    <DropdownMenu modal={false}>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon-sm"><MoreHorizontalIcon /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Excel Options</DropdownMenuLabel>
                            <DropdownMenuGroup>
                                <DropdownMenuItem onClick={exportToExcel}>Download Excel</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setIsOpenPDF(true)}>View PDF</DropdownMenuItem>
                                <DropdownMenuItem onClick={downloadPDF}>Download PDF</DropdownMenuItem>
                            </DropdownMenuGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </motion.div>
            <motion.div className="bg-white/60 backdrop-blur-lg shadow-2xs rounded-2xl border p-4">
                <div className="overflow-x-auto rounded-xl">
                    <Table className="min-w-[800px]">
                        <TableCaption>User List</TableCaption>
                        <TableHeader className="sticky top-0 bg-white z-10">
                            <TableRow>
                                {header_table.map((h, i) => (
                                    <TableHead key={i}>{h}</TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-6">
                                        <Loader2 className="mx-auto animate-spin" />
                                    </TableCell>
                                </TableRow>
                            ) : users.length > 0 ? (
                                users.map((item, index) => (
                                    <TableRow key={item.id}>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell>{item.name}</TableCell>
                                        <TableCell>{item.email}</TableCell>
                                        <TableCell>{item.role}</TableCell>
                                        <TableCell>{formatDate(item.created_at)}</TableCell>
                                        <TableCell>{formatDate(item.updated_at)}</TableCell>
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
                                    <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                                        No users found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </motion.div>
            <AlertDialog open={deleteDialog} onOpenChange={setDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete User?</AlertDialogTitle>
                        <AlertDialogDescription>
                            You are deleting <b>{deleteItem?.name}</b>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={onDelete} className="bg-red-600 text-white">
                            {loading ? <Loader2 className="animate-spin" /> : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>


                </AlertDialogContent>
            </AlertDialog>
            <Dialog open={isOpenPDF} onOpenChange={setIsOpenPDF}>
                <DialogContent className="rounded-xl bg-white/90 max-w-5xl w-full p-0 overflow-hidden">
                    <DialogHeader className="p-4 border-b">
                        <DialogTitle>User Report PDF</DialogTitle>
                    </DialogHeader>
                    <div className="w-full" style={{ height: "80vh" }}>
                        {isOpenPDF && (
                            <PDFViewer style={{ width: "100%", height: "100%" }}>
                                <MyDocument data={users} />
                            </PDFViewer>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

        </div>
    );
}
