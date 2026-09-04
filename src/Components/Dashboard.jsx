import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

const COLORS = ["#10B981", "#3B82F6", "#F59E0B", "#EF4444", "#8B5CF6"];

export default function Dashboard() {
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    const [expenses, setExpenses] = useState([]);
    const [categories, setCategories] = useState([]);
    const [newCat, setNewCat] = useState(""); // FOR ADD CATEGORY
    const [expenseLimit, setExpenseLimit] = useState(() => {
        try {
            const saved = localStorage.getItem("expenseLimit");
            return saved? Number(saved) : 20000;
        } catch { return 20000; }
    });
    const [limitInput, setLimitInput] = useState("");
    const [form, setForm] = useState({
        title: "", amount: "", categoryId: "", date: new Date().toISOString().split("T")[0]
    });

    const auth = { headers: { Authorization: `Bearer ${token}` } };

    const loadData = async () => {
        try {
            const [expRes, catRes] = await Promise.all([
                axios.get("http://localhost:8080/api/expenses", auth),
                axios.get("http://localhost:8080/api/categories", auth)
            ]);
            const unique = [];
            const seen = new Set();
            for (const c of catRes.data) {
                const name = c.name.trim().toUpperCase();
                if (!seen.has(name)) { seen.add(name); unique.push({...c, name}); }
            }
            setExpenses(expRes.data);
            setCategories(unique);
        } catch (error) {
            if (error.response?.status === 401) {
                localStorage.removeItem("token");
                navigate('/login');
            }
        }
    };

    useEffect(() => {
        if (!token) { navigate('/login'); return; }
        loadData();
    }, []);

    const addCategory = async () => {
        if (!newCat.trim()) { alert("Enter category"); return; }
        const name = newCat.trim().toUpperCase();
        if (categories.some(c=>c.name.toUpperCase()===name)) { alert("Category already exists!"); return; }
        try {
            await axios.post("http://localhost:8080/api/categories", { name }, auth);
            setNewCat("");
            loadData();
        } catch { alert("Failed to add category"); }
    };

    const totalExpense = expenses.reduce((total, e) => total + Number(e.amount || 0), 0);
    const remainingAmount = expenseLimit - totalExpense;
    const percentage = expenseLimit > 0? Math.min((totalExpense / expenseLimit) * 100, 100) : 0;
    const limitExceeded = expenseLimit > 0 && totalExpense > expenseLimit;

    const pieData = Object.entries(expenses.reduce((acc, e) => {
        const cat = (e.categoryName || "Uncategorized").toUpperCase();
        acc[cat] = (acc[cat] || 0) + Number(e.amount || 0);
        return acc;
    }, {})).map(([name, value]) => ({ name, value }));

    const saveLimit = () => {
        const limit = Number(limitInput);
        if (!limit || limit <= 0) { alert("Enter a valid limit"); return; }
        localStorage.setItem("expenseLimit", limit);
        setExpenseLimit(limit);
        setLimitInput("");
    };

    const addExpense = async () => {
        if (!form.title ||!form.amount ||!form.categoryId) { alert("Fill all"); return; }
        await axios.post("http://localhost:8080/api/expenses", {
            description: form.title, amount: parseFloat(form.amount),
            categoryId: parseInt(form.categoryId), date: form.date
        }, auth);
        setForm({ title: "", amount: "", categoryId: "", date: form.date });
        loadData();
    };

    const deleteExp = async (id, title) => {
        if (!window.confirm(`Delete "${title}"?`)) return;
        await axios.delete(`http://localhost:8080/api/expenses/${id}`, auth);
        loadData();
    };

    return (
        <div className="min-h-screen py-8 px-4" style={{ background: "linear-gradient(135deg, #6869d9 0%, #7651b9 100%)" }}>
            <div className="max-w-5xl mx-auto">

                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-white">Expense Dashboard</h1>
                        <p className="text-white/80">Track and manage your spending</p>
                    </div>
                    <button onClick={()=>{ localStorage.removeItem('token'); navigate('/login'); }} className="bg-white text-red-600 px-5 py-2.5 rounded-xl font-bold shadow">Logout</button>
                </div>


                <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
                    <h2 className="text-2xl font-bold">Add Category</h2>
                    <p className="text-gray-500 mb-4">Create FOOD, SHOPPING etc</p>
                    <div className="flex gap-3">
                        <input className="px-4 py-3 rounded-xl border w-64" placeholder="e.g. FOOD" value={newCat} onChange={e=>setNewCat(e.target.value)} />
                        <button onClick={addCategory} className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold">Add Category</button>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                        <div><h2 className="text-2xl font-bold">Expense Limit</h2><p className="text-gray-500">Set a spending limit</p></div>
                        <div className="flex gap-2">
                            <input type="number" placeholder="20000" value={limitInput} onChange={(e) => setLimitInput(e.target.value)} className="border rounded-xl px-4 py-3 w-40" />
                            <button onClick={saveLimit} className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold">Set Limit</button>
                        </div>
                    </div>
                    <div className="mt-6">
                        <div className="grid grid-cols-3 gap-4">
                            <div className="bg-gray-50 rounded-xl p-4"><p className="text-sm text-gray-500">Expense Limit</p><p className="text-2xl font-bold">Rs.{expenseLimit.toLocaleString('en-IN')}</p></div>
                            <div className="bg-gray-50 rounded-xl p-4"><p className="text-sm text-gray-500">Total Spent</p><p className="text-2xl font-bold">Rs.{totalExpense.toLocaleString('en-IN')}</p></div>
                            <div className="bg-gray-50 rounded-xl p-4"><p className="text-sm text-gray-500">Remaining</p><p className={`text-2xl font-bold ${limitExceeded? "text-red-600" : "text-green-600"}`}>Rs.{remainingAmount.toLocaleString('en-IN')}</p></div>
                        </div>
                        <div className="mt-5"><div className="flex justify-between text-sm mb-2"><span>Spending Progress</span><span className="font-bold">{percentage.toFixed(0)}%</span></div><div className="w-full bg-gray-200 rounded-full h-3"><div className={`h-3 rounded-full ${limitExceeded? "bg-red-500" : "bg-green-500"}`} style={{ width: `${percentage}%` }} /></div></div>
                    </div>
                </div>

                {/* PIE CHART */}
                <div className="bg-white rounded-2xl p-6 shadow-xl mb-8">
                    <h2 className="text-2xl font-bold text-center mb-2">Spending by Category</h2>
                    {limitExceeded && <div className="bg-red-100 text-red-700 rounded-xl px-4 py-3 mb-4 text-center font-semibold">⚠ Exceeded by Rs.{(totalExpense - expenseLimit).toLocaleString('en-IN')}</div>}
                    {pieData.length > 0? (<ResponsiveContainer width="100%" height={350}><PieChart><Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={125} label={({ name, percent }) => `${name} ${Math.round(percent * 100)}%`}>{pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip formatter={(v) => `Rs.${Number(v).toLocaleString('en-IN')}`} /><Legend /></PieChart></ResponsiveContainer>) : <p className="text-center py-20">No expenses</p>}
                </div>

                {/* ADD EXPENSE + TABLE - same as before */}
                <h2 className="text-2xl font-bold text-white mb-4">Add Expense</h2>
                <div className="bg-white rounded-2xl shadow-xl p-5 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                        <input className="px-4 py-3 rounded-xl border" placeholder="Title" value={form.title} onChange={(e) => setForm({...form, title: e.target.value })} />
                        <input className="px-4 py-3 rounded-xl border" placeholder="Amount" type="number" value={form.amount} onChange={(e) => setForm({...form, amount: e.target.value })} />
                        <select className="px-4 py-3 rounded-xl border" value={form.categoryId} onChange={(e) => setForm({...form, categoryId: e.target.value })}><option value="">Category</option>{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
                        <input className="px-4 py-3 rounded-xl border" type="date" value={form.date} onChange={(e) => setForm({...form, date: e.target.value })} />
                        <button onClick={addExpense} className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold">Add</button>
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-white mb-4">My Expenses ({expenses.length})</h2>
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full"><thead className="bg-gray-50"><tr><th className="p-4 text-left">Title</th><th className="p-4">Amount</th><th className="p-4">Category</th><th className="p-4">Date</th><th className="p-4 text-center">Action</th></tr></thead>
                            <tbody>{expenses.map((e) => (<tr key={e.id} className="border-t"><td className="p-4">{e.description}</td><td className="p-4">Rs.{Number(e.amount).toLocaleString('en-IN')}</td><td className="p-4">{e.categoryName || "N/A"}</td><td className="p-4">{e.date}</td><td className="p-4 text-center"><button onClick={() => deleteExp(e.id, e.description)} className="bg-red-500 text-white px-4 py-2 rounded-lg">Delete</button></td></tr>))}</tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    );
}