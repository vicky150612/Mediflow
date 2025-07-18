import "../index.css";
import Doctor3D from "../components/Doctor3D";
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
    const navigate = useNavigate();
    return (
        <div>
            <div>
                <Doctor3D />
            </div>
            <div className="flex flex-row items-center justify-center">
                <button className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded" onClick={() => navigate('/login')}>
                    login
                </button>
                <button className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded" onClick={() => navigate('/signup')}>
                    signup
                </button>
            </div>
        </div>
    );
};

export default LandingPage;
