import { Route, Routes } from "react-router-dom"
import Layout from "./layouts/layout" 
import UploadPage from "./pages/UploadPage";
import WatchPage from "./pages/WatchPage";
import HomePage from "./pages/HomePage";


const AppRouter = () => {
    return(
        <Routes>
            <Route path="/" element={
            <Layout><HomePage/></Layout>} />

            <Route path="/upload" element={
            <Layout><UploadPage/></Layout>} />
             <Route path="/watch" element={
            <Layout><WatchPage/></Layout>} />
        </Routes>
    )}
export default AppRouter;