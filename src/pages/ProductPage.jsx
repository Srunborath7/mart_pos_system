"use client";
import Logo from "@/assets/logo/Kh_Mart.png";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MoreHorizontalIcon, Search, SquarePen, Trash2, Eye, FileImage } from "lucide-react";
import { MdAdd } from "react-icons/md";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Image, Page, Document, PDFViewer, Text, View } from "@react-pdf/renderer";
import ProductReportStyles from "@/util/stylePdf/PdfReportStyles";
import { pdf } from "@react-pdf/renderer";
import {
  Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious
} from "@/components/ui/pagination";
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
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
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
import { use, useEffect, useRef, useState } from "react";
import { request } from "@/util/request/request";

import { Loader2 } from "lucide-react";
import { formatDate } from "@/util/helper/formatDate";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { config } from "@/util/configs/config";
import { Badge } from "@/components/ui/badge";

export default function ProductPage() {
  const [product, setProduct] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [deleteItem, setDeleteItem] = useState(null);
  const [query, setQuery] = useState("");
  const [isOpenPDF, setIsOpenPDF] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isOpenEditProductDetail, setOpenEditProductDetail] = useState(false);
  const [isOpenCreateProductDetail, setOpenCreateProductDetail] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(product.length / itemsPerPage);
  const paginatedProducts = product.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const [validate, setValidate] = useState({});
  const [form, setForm] = useState({
    id: "",
    name: "",
    price: "",
    qty: "",
    discount: "",
    status: true,
    image: null,
    description: "",
    category_id: "",
    brand_id: ""
  });
  const [formProductDetail, setFormProductDetail] = useState({
    barcode: "",
    unit: "",
    made_in: "",
    exp_date: "",
    product_id: "",
  });
  const fetchingData = async () => {
    setLoading(true);
    try {
      const res = await request("products", "get");
      const cate = await request("categories", "get");
      const brand = await request("brands", "get");

      if (res) {
        setProduct(res.data)
      };
      if (cate) {
        setCategories(cate.data)
      };
      if (brand) {
        setBrands(brand.data)
      };
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    };
  }
  useEffect(() => {
    fetchingData();
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setValidate({});
    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("price", form.price);
    formData.append("qty", form.qty);
    formData.append("discount", form.discount);
    formData.append("status", form.status ? 1 : 0);
    formData.append("description", form.description);
    formData.append("brand_id", form.brand_id);
    formData.append("category_id", form.category_id);

    if (form.image instanceof File) {
      formData.append("image", form.image);
    }

    try {
      let res;
      if (isEdit) {
        formData.append("_method", "put");
        res = await request(`products/${form.id}`, "post", formData);
      } else {
        res = await request("products", "post", formData);
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
        price: "",
        qty: "",
        discount: "",
        status: true,
        image: null,
        description: "",
        category_id: "",
        brand_id: ""
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
      await request(`products/${deleteItem.id}`, "delete");
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
    if (!product || product.length === 0) return;
    const dataToExport = product.map((item, index) => ({
      N: index + 1,
      Image: item.image ? `${config.image_url}/${item.image}` : "No Image",
      Name: item.name,
      Price: `$${Number(item.price || 0).toFixed(2)}`,
      Quantity: item.qty,
      Discount: item.discount ? `${item.discount}%` : "0%",
      Status: item.status ? "Available" : "Not Available",
      Description: item.description,
      "Created At": formatDate(item.created_at),
      "Updated At": formatDate(item.updated_at),
      Category: item.category.name,
      Brand: item.brand.name,
      Creator: item.user?.name || "Unknown",
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Products List");

    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([excelBuffer]), "products_list.xlsx");
  };

  const MyDocument = ({ data }) => (
    <Document>
      <Page size="A4" style={ProductReportStyles.page}>

        {Logo && <Image style={ProductReportStyles.logo} src={Logo} />}

        <Text style={ProductReportStyles.header}>Mart POS System</Text>
        <Text style={ProductReportStyles.subHeader}>Product Report</Text>

        <View style={ProductReportStyles.table}>
          <View style={ProductReportStyles.tableRow}>
            {[
              "No", "Image", "Name", "Price", "Quantity", "Discount", "Status",
              "Description", "Category", "Brand", "Created", "Updated", "Creator"
            ].map((col, i) => (
              <Text
                key={i}
                style={[
                  ProductReportStyles.tableHeader,
                  i === 12 && ProductReportStyles.tableHeaderLast
                ]}
              >
                {col}
              </Text>
            ))}
          </View>
          {data.map((item, index) => (
            <View
              key={index}
              style={[
                ProductReportStyles.tableRow,
                index % 2 === 0 && ProductReportStyles.rowEven
              ]}
            >
              <Text style={ProductReportStyles.tableCell}>{index + 1}</Text>
              {item.image ? (
                <Image
                  style={ProductReportStyles.tableImage}
                  src={`${config.image_url}/${item.image}`}
                />
              ) : (
                <Text style={ProductReportStyles.tableCell}>No Image</Text>
              )}

              <Text style={ProductReportStyles.tableCell}>{item.name}</Text>
              <Text style={ProductReportStyles.tableCell}>
                ${Number(item.price || 0).toFixed(2)}
              </Text>
              <Text style={ProductReportStyles.tableCell}>{item.qty}</Text>
              <Text style={ProductReportStyles.tableCell}>
                {item.discount ? `${item.discount}%` : "0%"}
              </Text>
              <Text style={ProductReportStyles.tableCell}>
                {item.status ? "Available" : "Not Available"}
              </Text>
              <Text style={ProductReportStyles.tableCell}>{item.description}</Text>
              <Text style={ProductReportStyles.tableCell}>{item.category?.name || ""}</Text>
              <Text style={ProductReportStyles.tableCell}>{item.brand?.name || ""}</Text>
              <Text style={ProductReportStyles.tableCell}>{formatDate(item.created_at)}</Text>
              <Text style={ProductReportStyles.tableCell}>{formatDate(item.updated_at)}</Text>
              <Text style={[ProductReportStyles.tableCell, ProductReportStyles.tableCellLast]}>
                {item.user?.name || "Unknown"}
              </Text>
            </View>
          ))}
        </View>

        <Text style={ProductReportStyles.footer}>Generated by Mart POS System</Text>

      </Page>
    </Document>
  );

  const downloadPDF = async () => {
    const blob = await pdf(<MyDocument data={product} />).toBlob();
    saveAs(blob, "products_report.pdf");
  };
  const handleOpenDrawer = (item) => {
    setSelectedItem(item);
    setIsDrawerOpen(true);
  };
  const onSubmitProductDetail = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const product_detail = await request("product_detail", "post", formProductDetail);

      if (product_detail) {
        setOpenCreateProductDetail(false);
        setFormProductDetail({
          barcode: "",
          unit: "",
          made_in: "",
          exp_date: "",
          product_id: ""
        });
        setIsDrawerOpen(false);
        await fetchingData();
      }

    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };
  const EditProductDetail = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await request(`product_detail/${selectedItem.product_detail.id}`, "put", formProductDetail);

      setOpenEditProductDetail(false);
      setIsDrawerOpen(false);
      await fetchingData();
    } catch (error) {
      console.log("Update Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const header_table = [
    "N",
    "Image",
    "Name",
    "Price",
    "Stock",
    "Discount",
    "Status",
    "Description",
    "Category",
    "Brand",
    "Create At",
    "Update At",
    "Creator",
    "Action",
  ];

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6 w-full">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold">Product</h1>
        <p className="text-muted-foreground mt-2">Manage your product information.</p>
      </motion.div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div className="flex flex-col md:flex-row md:items-center gap-4 w-full">
          <div className="relative w-full md:w-1/2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search product..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10 py-2 rounded-xl w-full"
            />
          </div>
          <Button
            variant="outline"
            onClick={async () => {
              try {
                const res = await request(`products/search/?q=${query}`, "get");
                if (res) setProduct(res.data);
              } catch (error) {
                console.error(error);
              }
            }}
            className="rounded-full w-full md:w-auto flex items-center justify-center gap-2"
          >
            <Search className="mr-2 h-4 w-4" /> Search
          </Button>
          <Button
            variant="outline"
            className="rounded-xl w-full md:w-auto flex items-center gap-2 justify-center"
            onClick={() => {
              setForm({ id: "", name: "", description: "" });
              setQuery("");
              fetchingData();
            }}
          >
            <Trash2 className="h-4 w-4" />
            Reset
          </Button>
        </div>
        <div className="flex gap-4 justify-items-center items-center">
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
                    price: "",
                    qty: "",
                    discount: "",
                    description: "",
                    image: null,
                    status: 1,
                    category_id: "",
                    brand_id: "",
                  });
                  setIsOpen(true);
                }}
              >
                <MdAdd size={22} />
                Add Product
              </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[60%] w-[60%] max-w-[70%] rounded-2xl">
              <DialogHeader>
                <DialogTitle>{isEdit ? "Edit Product" : "Add Product"}</DialogTitle>
                <DialogDescription>Fill in the product information below.</DialogDescription>
              </DialogHeader>
              <form onSubmit={onSubmit} className="space-y-6 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="flex flex-col items-center">
                    <Label>Product Image</Label>
                    {validate.image && <p className="text-red-500 text-sm">{validate.image}</p>}
                    <div className="mt-3 w-70 h-70 border-2 border-dashed border-gray-300 rounded-2xl flex items-center justify-center bg-gray-50">
                      {form.image ? (
                        <img
                          src={
                            form.image instanceof File
                              ? URL.createObjectURL(form.image)
                              : `${form.image_url}`
                          }
                          alt="Preview"
                          className="w-full h-full object-cover rounded-2xl"
                        />
                      ) : (
                        <Image className="text-gray-400 w-12 h-12" />
                      )}
                    </div>

                    <Input
                      type="file"
                      className="mt-4"
                      onChange={(e) =>
                        setForm({ ...form, image: e.target.files[0] })
                      }
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex flex-col gap-2">

                      <Label>Name</Label>
                      {validate.name && <p className="text-red-500 text-sm">{validate.name}</p>}
                      <Input
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="Enter product name"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-2">
                        <Label>Price</Label>
                        {validate.price && <p className="text-red-500 text-sm">{validate.price}</p>}
                        <Input
                          type="number"
                          step="0.01"
                          value={form.price}
                          onChange={(e) => setForm({ ...form, price: e.target.value })}
                          placeholder="0.00"
                        />
                      </div>

                      <div className="flex flex-col gap-2">
                        <Label>qty</Label>
                        {validate.qty && <p className="text-red-500 text-sm">{validate.qty}</p>}
                        <Input
                          type="number"
                          value={form.qty}
                          onChange={(e) => setForm({ ...form, qty: e.target.value })}
                          placeholder="0"
                        />
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label>Discount</Label>
                      {validate.discount && <p className="text-red-500 text-sm">{validate.discount}</p>}
                      <Input
                        type="number"
                        step="0.01"
                        value={form.discount}
                        onChange={(e) => setForm({ ...form, discount: e.target.value })}
                        placeholder="0.00"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <Label>Status</Label>
                      {validate.status && <p className="text-red-500 text-sm">{validate.status}</p>}
                      <select
                        className="border rounded-md px-3 py-2 w-full"
                        value={form.status ? "true" : "false"}
                        onChange={(e) =>
                          setForm({ ...form, status: e.target.value === "true" })
                        }
                      >
                        <option value="true">Available</option>
                        <option value="false">Not Available</option>
                      </select>



                    </div>

                    <div className="flex flex-col gap-2">
                      <Label>Category</Label>
                      {validate.category_id && <p className="text-red-500 text-sm">{validate.category_id}</p>}
                      <select
                        className="border rounded-md px-3 py-2 w-full"
                        value={form.category_id}
                        onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                      >
                        <option value="">Choose category</option>
                        {categories?.map((cat) => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label>Brand</Label>
                      {validate.brand_id && <p className="text-red-500 text-sm">{validate.brand_id}</p>}
                      <select
                        className="border rounded-md px-3 py-2 w-full"
                        value={form.brand_id}
                        onChange={(e) => setForm({ ...form, brand_id: e.target.value })}
                      >
                        <option value="">Choose brand</option>
                        {brands?.map((b) => (
                          <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                      </select>
                    </div>

                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Label>Description</Label>
                  {validate.description && <p className="text-red-500 text-sm">{validate.description}</p>}
                  <Textarea
                    rows={4}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Enter product description..."
                  />
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline"
                      onClick={() => {
                        setIsOpen(false);
                        setForm({
                          id: "",
                          name: "",
                          price: "",
                          qty: "",
                          discount: "",
                          status: true,
                          image: null,
                          description: "",
                          category_id: "",
                          brand_id: ""
                        });
                      }}>Cancel</Button>
                  </DialogClose>

                  <Button type="submit" disabled={loading}>
                    {loading ? (
                      <Loader2 className="animate-spin" />
                    ) : isEdit ? (
                      "Update"
                    ) : (
                      "Save"
                    )}
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
              <DropdownMenuLabel>Excel Actions</DropdownMenuLabel>
              <DropdownMenuGroup>
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
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white/60 backdrop-blur-lg shadow-2xs rounded-2xl border border-gray-100 p-4">
        <div className="block w-full overflow-x-auto rounded-xl">
          <Table className="min-w-[800px]">
            <TableCaption>List of products.</TableCaption>
            <TableHeader className="sticky top-0 bg-white z-10 shadow-sm">
              <TableRow>
                {header_table.map((header, i) => (<TableHead key={i} className="text-center">{header}</TableHead>))}
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={14} className="text-center py-6">
                    <Loader2 className="mx-auto animate-spin" />
                  </TableCell>
                </TableRow>
              ) : paginatedProducts.length > 0 ? (
                paginatedProducts.map((item, index) => (
                  <TableRow key={item.id}>
                    <TableCell>{(currentPage - 1) * itemsPerPage + index + 1}</TableCell>
                    <TableCell>
                      {item.image ? (
                        <div className="w-20 h-20 flex justify-center items-center rounded-lg">
                          <img src={`${item.image_url}`} alt={item.name} className="w-20 h-20 object-cover rounded-lg border border-red-900/80" />
                        </div>
                      ) : (
                        <div className="w-20 h-20 flex justify-center items-center rounded-lg border-2 border-red-900/80">
                          <FileImage className="text-red-900/80 opacity-90" size={32} />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-center">{item.name}</TableCell>
                    <TableCell className="text-center">{item.price}</TableCell>
                    <TableCell className="text-center">{item.qty}</TableCell>
                    <TableCell className="text-center">{item.discount}</TableCell>
                    <TableCell className="text-center">
                      {item.status ? <Badge variant="secondary" className="bg-blue-500 text-white dark:bg-blue-600">Available</Badge>
                        : <Badge variant="destructive">Not Available</Badge>}
                    </TableCell>
                    <TableCell className="text-center">{item.description}</TableCell>
                    <TableCell className="text-center">{item.category.name}</TableCell>
                    <TableCell className="text-center">{item.brand.name}</TableCell>
                    <TableCell className="text-center">{formatDate(item.created_at)}</TableCell>
                    <TableCell className="text-center">{formatDate(item.updated_at)}</TableCell>
                    <TableCell className="text-center">{item.user?.name || "Unknown"}</TableCell>
                    <TableCell>
                      <div className="flex gap-2 justify-center">
                        <Button variant="outline" onClick={() => handleOpenDrawer(item)}><Eye /></Button>
                        <Button variant="outline" onClick={() => onEdit(item)}><SquarePen /></Button>
                        <Button variant="destructive" onClick={() => confirmDelete(item)}><Trash2 /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={14} className="text-center py-6">No Products Found</TableCell>
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
                  <PaginationLink onClick={() => setCurrentPage(i + 1)} isActive={currentPage === i + 1}>{i + 1}</PaginationLink>
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
      <AlertDialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will permanently delete{" "}
              <b>{deleteItem?.name}</b>.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>

            <AlertDialogAction
              onClick={onDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {loading ? <Loader2 className="animate-spin" /> : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Dialog open={isOpenPDF} onOpenChange={setIsOpenPDF}>
        <DialogContent className="rounded-xl bg-white/90 backdrop-blur-md border border-gray-300 shadow-lg max-w-5xl w-full p-0 overflow-hidden">
          <DialogHeader className="p-4 border-b">
            <DialogTitle className="text-lg font-semibold text-gray-800">
              Brand Report PDF
            </DialogTitle>
          </DialogHeader>
          <div className="w-full" style={{ height: "80vh" }}>
            {isOpenPDF && (
              <PDFViewer style={{ width: "100%", height: "100%" }}>
                <MyDocument data={product} />
              </PDFViewer>
            )}
          </div>
        </DialogContent>
      </Dialog>
      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerContent
          data-vaul-drawer-direction="top"
          className="w-[50%] mx-auto p-6 rounded-xl border shadow-xl bg-white"
        >
          <DrawerHeader className="text-center">
            <DrawerTitle>Product Detail</DrawerTitle>
            <DrawerDescription>
              {selectedItem ? `Viewing: ${selectedItem.name}` : "No product selected."}
            </DrawerDescription>
          </DrawerHeader>

          {selectedItem && selectedItem.product_detail ? (
            <div className="flex flex-col md:flex-row gap-6 mt-4">
              <div className="flex-1 flex justify-center items-center border border-gray-300 rounded-xl p-6 shadow-sm bg-white">
                {selectedItem.image ? (
                  <img
                    src={`${selectedItem.image_url}`}
                    alt={selectedItem.name}
                    className="max-h-64 object-contain rounded-lg shadow-md"
                  />
                ) : (
                  <div className="w-64 h-64 bg-gray-100 flex items-center justify-center rounded-lg">
                    <FileImage className="text-red-900/80 opacity-90" size={64} />
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-2 border border-gray-300 rounded-xl p-6 shadow-sm bg-white">
                <div className="flex justify-end">
                  <Dialog
                    open={isOpenEditProductDetail}
                    onOpenChange={(open) => {
                      setOpenEditProductDetail(open);
                      if (open) {
                        setFormProductDetail({
                          id: selectedItem.product_detail.id,
                          barcode: selectedItem.product_detail.barcode,
                          unit: selectedItem.product_detail.unit,
                          made_in: selectedItem.product_detail.made_in,
                          exp_date: selectedItem.product_detail.exp_date,
                          product_id: selectedItem.id
                        });
                      }
                    }}
                  >
                    <DialogTrigger asChild>
                      <div>
                        <Button variant="outline">Edit</Button>
                      </div>
                    </DialogTrigger>
                    <DialogContent className="rounded-xl bg-white/90 p-6 max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Edit Product Detail</DialogTitle>
                        <DialogDescription>Update the details below.</DialogDescription>
                      </DialogHeader>

                      <form className="space-y-4 mt-4" onSubmit={EditProductDetail}>

                        <div className="flex flex-col gap-2">
                          <label className="font-semibold">Barcode</label>
                          <Input
                            type="text"
                            value={formProductDetail.barcode}
                            onChange={(e) =>
                              setFormProductDetail({ ...formProductDetail, barcode: e.target.value })
                            }
                          />
                        </div>

                        <div className="flex flex-col gap-2">
                          <label className="font-semibold">Unit</label>
                          <Input
                            type="text"
                            value={formProductDetail.unit}
                            onChange={(e) =>
                              setFormProductDetail({ ...formProductDetail, unit: e.target.value })
                            }
                          />
                        </div>

                        <div className="flex flex-col gap-2">
                          <label className="font-semibold">Made In</label>
                          <Input
                            type="text"
                            value={formProductDetail.made_in}
                            onChange={(e) =>
                              setFormProductDetail({ ...formProductDetail, made_in: e.target.value })
                            }
                          />
                        </div>

                        <div className="flex flex-col gap-2">
                          <label className="font-semibold">Expiry Date</label>
                          <Input
                            type="date"
                            value={formProductDetail.exp_date}
                            onChange={(e) =>
                              setFormProductDetail({ ...formProductDetail, exp_date: e.target.value })
                            }
                          />
                        </div>

                        <DialogFooter className="mt-6 flex justify-end gap-3">
                          <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                          </DialogClose>

                          <Button type="submit" disabled={loading}>
                            {loading ? "Saving..." : "Save"}
                          </Button>
                        </DialogFooter>

                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
                <p><b>SKU:</b> {selectedItem.product_detail.sku}</p>
                <p><b>Barcode:</b> {selectedItem.product_detail.barcode}</p>
                <p><b>Unit:</b> {selectedItem.product_detail.unit}</p>
                <p><b>Made In:</b> {selectedItem.product_detail.made_in}</p>
                <p><b>Exp Date:</b> {selectedItem.product_detail.exp_date}</p>
                <p><b>Price:</b> ${selectedItem.price}</p>
                <p><b>Quantity:</b> {selectedItem.qty}</p>

              </div>
            </div>
          ) : (
            <div>
              <div className="flex justify-end">
                <Dialog
                  open={isOpenCreateProductDetail}
                  onOpenChange={(open) => {
                    setOpenCreateProductDetail(open);
                    if (open && selectedItem) {
                      setFormProductDetail({
                        product_id: selectedItem.id,
                        barcode: "",
                        unit: "",
                        made_in: "",
                        exp_date: ""
                      });
                    }
                  }}
                >
                  <DialogTrigger>
                    <Button variant="outline">Create New</Button>
                  </DialogTrigger>

                  <DialogContent className="rounded-xl bg-white/90 p-6 max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Create Product Detail</DialogTitle>
                      <DialogDescription>Fill in the product detail.</DialogDescription>
                    </DialogHeader>

                    <form className="space-y-4 mt-4" onSubmit={onSubmitProductDetail}>

                      <div className="flex flex-col gap-2">
                        <label className="font-semibold">Barcode</label>
                        <Input
                          type="text"
                          value={formProductDetail.barcode}
                          onChange={(e) =>
                            setFormProductDetail({ ...formProductDetail, barcode: e.target.value })
                          }
                        />
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="font-semibold">Unit</label>
                        <Input
                          type="text"
                          value={formProductDetail.unit}
                          onChange={(e) =>
                            setFormProductDetail({ ...formProductDetail, unit: e.target.value })
                          }
                        />
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="font-semibold">Made In</label>
                        <Input
                          type="text"
                          value={formProductDetail.made_in}
                          onChange={(e) =>
                            setFormProductDetail({ ...formProductDetail, made_in: e.target.value })
                          }
                        />
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="font-semibold">Expiry Date</label>
                        <Input
                          type="date"
                          value={formProductDetail.exp_date}
                          onChange={(e) =>
                            setFormProductDetail({ ...formProductDetail, exp_date: e.target.value })
                          }
                        />
                      </div>
                      <DialogFooter>
                        <DialogClose>
                          <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button type="submit" disabled={loading}>
                          {loading ? "Saving..." : "Save"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
              <p className="text-red-500 text-center font-semibold">Product detail not found.</p>
            </div>
          )}
          <DrawerFooter className="flex justify-center mt-6">
            <DrawerClose asChild>
              <Button variant="outline">Close</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
