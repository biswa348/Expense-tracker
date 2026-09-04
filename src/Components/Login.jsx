import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

export default function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("biswa1@test.com");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await axios.post("http://localhost:8080/api/auth/login", {
                email,
                password
            });
            // Save token
            localStorage.setItem("token", res.data.token || res.data);
            navigate("/");
        } catch (err) {
            alert(err.response?.data?.message || "Login failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "linear-gradient(135deg, #6869d9 0%, #7651b9 100%)" }}>
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
                <h1 className="text-3xl font-bold text-center mb-2">Expense Tracker</h1>
                <p className="text-gray-500 text-center mb-8">Login to your account</p>

                <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                        <label className="text-sm font-semibold text-gray-600">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-300 outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="biswa1@test.com"
                            required
                        />
                    </div>

                    <div>
                        <label className="text-sm font-semibold text-gray-600">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-300 outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="Enter password"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold text-lg transition"
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>
                </form>

                <p className="text-center mt-6 text-gray-600">
                    New? <Link to="/register" className="text-indigo-600 font-bold hover:underline">Register</Link>
                </p>
            </div>
        </div>
    );
}