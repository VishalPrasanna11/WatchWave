import { Route, Routes } from "react-router-dom"
import Layout from "./layouts/layout" // Import the 'Layout' component
import HomePage from "./pages/HomePage";
import UploadPage from "./pages/UploadPage";
import WatchPage from "./pages/WatchPage";


const AppRouter = () => {
    return(
        <Routes>
            <Route path="/" element={
            <Layout showHero><HomePage/></Layout>} />
            <Route path="/upload" element={
            <Layout showHero={false}><UploadPage/></Layout>} />
            <Route path="/watch" element={
            <Layout showHero={false}><WatchPage/></Layout>} />
        </Routes>
    )}
export default AppRouter;