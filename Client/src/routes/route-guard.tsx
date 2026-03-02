import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "@/hooks/use-auth";


interface Props {
    requireAuth?: boolean ;
}

const RouteGuard = ({requireAuth}:Props) => {
    const {user} = useAuth() ;
    if(requireAuth && !user) return <Navigate to="/" replace/>
    if(!requireAuth && user) return <Navigate to="/chat" replace/>

    return <Outlet/>;
};

export default RouteGuard ;
