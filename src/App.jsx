import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./components/layouts/MainLayout";
import NotFoundPage from "./pages/NotFoundPage";
import HomePage from "./pages/HomePage";
import Login from "./login/Login";
import Register from "./login/Register";
import Category from "./pages/CategoryPage";
import BrandPage from "./pages/BrandPage";
import ProductPage from "./pages/ProductPage";
import PosPage from "./pages/PosPage";
import UserPage from "./pages/UserPage";
import CustomerPage from "./pages/CustomerPage";
import OrderPage from "./pages/OrderPage";
import ProfilePage from "./pages/ProfilePage";
import SupplierPage from "./pages/SupplierPage";
import PurchasePage from "./pages/PurchasePage";
import PurchaseReportPage from "./pages/PurchaseReportPage";
import TeamPage from "./pages/Teampage";
function App(){
  return(
    <BrowserRouter>
      <Routes>
         <Route path="auth">
           <Route path="login" element={<Login/>}/>
            <Route path="register" element={<Register/>}/>
         </Route>
        <Route path="" element={<MainLayout/>}>
          <Route path="/" element={<HomePage/>}/>
          <Route path ="/category" element={<Category/>}/>
          <Route path ="/brand" element={<BrandPage/>}/>
          <Route path ="/product" element={<ProductPage/>}/>
          <Route path ="/pos" element={<PosPage/>}/>
          <Route path ="/customer" element={<CustomerPage/>}/>
          <Route path ="/order" element={<OrderPage/>}/>
          <Route path ="/user" element={<UserPage/>}/>
          <Route path ="/profile" element={<ProfilePage/>}/>
          <Route path ="/supplier" element={<SupplierPage/>}/>
          <Route path ="/purchase" element={<PurchasePage/>}/>
          <Route path ="/purchase-report" element={<PurchaseReportPage/>}/>
          <Route path ="/team" element={<TeamPage/>}/>
          <Route path="*" element={<NotFoundPage/>}/>
        </Route>
      </Routes>
    </BrowserRouter>
  ) 
  
}
export default App;