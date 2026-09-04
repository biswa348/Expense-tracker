import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

export default function Register() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ name: "", email: "", password: "" });

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            await axios.post("http://localhost:8080/api/auth/register", form);
            alert("Registered! Now login");
            navigate("/login");
        } catch (err) {
            alert(err.response?.data || "Registration failed");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "linear-gradient(135deg, #6869d9 0%, #7651b9 100%)" }}>
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
                <h1 className="text-3xl font-bold text-center mb-2">Create Account</h1>
                <form onSubmit={handleRegister} className="space-y-4 mt-6">
                    <input className="w-full px-4 py-3 rounded-xl border" placeholder="Name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required />
                    <input className="w-full px-4 py-3 rounded-xl border" placeholder="Email" type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required />
                    <input className="w-full px-4 py-3 rounded-xl border" placeholder="Password" type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} required />
                    <button className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold">Register</button>
                </form>
                <p className="text-center mt-6">Already have account? <Link to="/login" className="text-indigo-600 font-bold">Login</Link></p>
            </div>
        </div>
    );
}