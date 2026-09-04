import { useEffect, useState } from "react";
import axios from "axios";
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
    Legend
} from "recharts";

const COLORS = [
    "#10B981",
    "#3B82F6",
    "#F59E0B",
    "#EF4444",
    "#8B5CF6"
];

export default function Dashboard() {

    // =========================
    // DATA
    // =========================

    const [expenses, setExpenses] = useState([]);
    const [categories, setCategories] = useState([]);

    // Add Category
    const [newCat, setNewCat] = useState("");

    // Add Expense form
    const [form, setForm] = useState({
        title: "",
        amount: "",
        categoryId: "",
        date: new Date().toISOString().split("T")[0]
    });

    // Monthly budget
    const monthlyBudget = 20000;

    // Category budgets
    const [categoryBudgets, setCategoryBudgets] = useState(
        JSON.parse(localStorage.getItem("categoryBudgets")) || {}
    );

    const [budgetCat, setBudgetCat] = useState("");
    const [budgetInput, setBudgetInput] = useState("");

    // Authentication
    const token = localStorage.getItem("token");

    const auth = {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };


    // =========================
    // LOAD EXPENSES + CATEGORIES
    // =========================

    const loadData = async () => {

        try {

            const [expRes, catRes] = await Promise.all([
                axios.get(
                    "http://localhost:8080/api/expenses",
                    auth
                ),

                axios.get(
                    "http://localhost:8080/api/categories",
                    auth
                )
            ]);

            // Remove duplicate categories
            const unique = [];
            const seen = new Set();

            for (const c of catRes.data) {

                const name = c.name.trim().toUpperCase();

                if (!seen.has(name)) {

                    seen.add(name);

                    unique.push({
                        ...c,
                        name
                    });
                }
            }

            setExpenses(expRes.data);
            setCategories(unique);

        } catch (err) {

            console.error(err);

        }
    };


    useEffect(() => {
        loadData();
    }, []);


    // =========================
    // SPENDING BY CATEGORY
    // =========================

    const spentByCategory = expenses.reduce(
        (acc, e) => {

            const cat =
                (e.categoryName || "UNCATEGORIZED")
                    .toUpperCase();

            acc[cat] =
                (acc[cat] || 0) + Number(e.amount);

            return acc;

        },
        {}
    );


    const pieData = Object.entries(
        spentByCategory
    ).map(([name, value]) => ({
        name,
        value
    }));


    // =========================
    // MONTHLY BUDGET
    // =========================

    const totalSpent = expenses.reduce(
        (sum, e) => sum + Number(e.amount),
        0
    );

    const remainingBudget =
        monthlyBudget - totalSpent;

    const budgetPercentage =
        Math.min(
            (totalSpent / monthlyBudget) * 100,
            100
        );


    // =========================
    // SET CATEGORY LIMIT
    // =========================

    const setCategoryLimit = () => {

        if (!budgetCat) {

            alert("Please select a category");

            return;
        }

        if (
            !budgetInput ||
            Number(budgetInput) <= 0
        ) {

            alert("Please enter a valid limit");

            return;
        }

        const updatedBudgets = {
            ...categoryBudgets,
            [budgetCat]: Number(budgetInput)
        };

        setCategoryBudgets(updatedBudgets);

        localStorage.setItem(
            "categoryBudgets",
            JSON.stringify(updatedBudgets)
        );

        setBudgetInput("");
    };


    // =========================
    // CATEGORY DROPDOWN CHANGE
    // =========================

    const handleBudgetCategoryChange = (e) => {

        const category = e.target.value;

        setBudgetCat(category);

        if (categoryBudgets[category]) {

            setBudgetInput(
                categoryBudgets[category]
            );

        } else {

            setBudgetInput("");
        }
    };


    // =========================
    // ADD CATEGORY
    // =========================

    const addCategory = async () => {

        if (!newCat.trim()) {

            alert("Please enter a category name");

            return;
        }

        const name =
            newCat.trim().toUpperCase();


        // Check duplicate

        if (
            categories.some(
                c =>
                    c.name.toUpperCase() === name
            )
        ) {

            alert("Category already exists!");

            return;
        }


        try {

            await axios.post(
                "http://localhost:8080/api/categories",
                {
                    name: name
                },
                auth
            );

            // Clear input
            setNewCat("");

            // Reload categories
            loadData();

        } catch (err) {

            console.error(err);

            alert("Could not add category");

        }
    };


    // =========================
    // ADD EXPENSE
    // =========================

    const addExpense = async () => {

        if (
            !form.title ||
            !form.amount ||
            !form.categoryId
        ) {

            alert(
                "Please fill Title, Amount and Category"
            );

            return;
        }


        try {

            await axios.post(
                "http://localhost:8080/api/expenses",
                {
                    description: form.title,
                    amount: Number(form.amount),
                    categoryId: Number(form.categoryId),
                    date: form.date
                },
                auth
            );


            setForm({
                title: "",
                amount: "",
                categoryId: "",
                date: form.date
            });


            loadData();

        } catch (err) {

            console.error(err);

            alert("Could not add expense");

        }
    };


    // =========================
    // DELETE EXPENSE
    // =========================

    const deleteExp = async (id, title) => {

        if (
            !window.confirm(
                `Delete "${title}"?`
            )
        ) {

            return;
        }


        try {

            await axios.delete(
                `http://localhost:8080/api/expenses/${id}`,
                auth
            );

            loadData();

        } catch (err) {

            console.error(err);

        }
    };


    // =========================
    // UI
    // =========================

    return (

        <div
            className="min-h-screen p-6"
            style={{
                background:
                    "linear-gradient(135deg,#6C63FF,#8B5CF6)"
            }}
        >

            <div className="max-w-6xl mx-auto">


                {/* ================= HEADER ================= */}

                <h1 className="text-4xl font-bold text-white mb-2">
                    Expense Dashboard
                </h1>

                <p className="text-white/80 mb-8">
                    Track and manage your spending
                </p>


                {/* ================= ADD CATEGORY ================= */}

                <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">

                    <div className="flex flex-wrap items-center justify-between gap-4">

                        <div>

                            <h2 className="text-2xl font-bold text-gray-800">
                                Add Category
                            </h2>

                            <p className="text-gray-500 text-sm mt-1">
                                Create a new expense category.
                            </p>

                        </div>


                        <div className="flex gap-3">

                            <input
                                className="px-4 py-3 rounded-xl border w-56"
                                placeholder="e.g. TRAVEL"
                                value={newCat}
                                onChange={e =>
                                    setNewCat(
                                        e.target.value
                                    )
                                }
                            />


                            <button
                                onClick={addCategory}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold"
                            >
                                Add Category
                            </button>

                        </div>

                    </div>

                </div>


                {/* ================= MONTHLY BUDGET ================= */}

                <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">

                    <div className="flex justify-between items-center mb-6">

                        <div>

                            <p className="text-gray-500 text-sm">
                                MONTHLY BUDGET
                            </p>

                            <h2 className="text-4xl font-bold text-gray-800">
                                ₹20,000
                            </h2>

                        </div>


                        <div className="text-right">

                            <p className="text-gray-500 text-sm">
                                TOTAL SPENT
                            </p>

                            <p className="text-2xl font-bold text-blue-600">
                                ₹{totalSpent.toLocaleString("en-IN")}
                            </p>

                        </div>

                    </div>


                    {/* Remaining + Used */}

                    <div className="grid grid-cols-2 gap-4 mb-4">

                        <div className="bg-gray-50 rounded-xl p-4">

                            <p className="text-gray-500 text-sm">
                                Remaining
                            </p>

                            <p
                                className={`text-xl font-bold ${
                                    remainingBudget < 0
                                        ? "text-red-600"
                                        : "text-green-600"
                                }`}
                            >
                                ₹{Math.max(
                                remainingBudget,
                                0
                            ).toLocaleString("en-IN")}
                            </p>

                        </div>


                        <div className="bg-gray-50 rounded-xl p-4">

                            <p className="text-gray-500 text-sm">
                                Budget Used
                            </p>

                            <p className="text-xl font-bold">
                                {budgetPercentage.toFixed(0)}%
                            </p>

                        </div>

                    </div>


                    {/* Progress */}

                    <div className="w-full bg-gray-200 rounded-full h-4">

                        <div
                            className={`h-4 rounded-full ${
                                totalSpent > monthlyBudget
                                    ? "bg-red-500"
                                    : "bg-green-500"
                            }`}
                            style={{
                                width:
                                    `${budgetPercentage}%`
                            }}
                        />

                    </div>


                    {/* Warning */}

                    {totalSpent >= monthlyBudget && (

                        <div className="mt-4 bg-red-100 text-red-700 rounded-xl p-3 font-semibold">

                            ⚠️ Monthly budget exceeded!

                        </div>

                    )}


                    {totalSpent >= monthlyBudget * 0.8 &&
                        totalSpent < monthlyBudget && (

                            <div className="mt-4 bg-yellow-100 text-yellow-700 rounded-xl p-3 font-semibold">

                                ⚠️ You have used more than 80% of your monthly budget.

                            </div>

                        )}

                </div>


                {/* ================= CATEGORY BUDGET ================= */}

                <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">

                    <h2 className="text-2xl font-bold text-gray-800 mb-1">
                        Category Budget
                    </h2>

                    <p className="text-gray-500 mb-5">
                        Set a different spending limit for each category.
                    </p>


                    {/* Category + Limit */}

                    <div className="flex flex-wrap gap-3">

                        <select
                            className="px-4 py-3 rounded-xl border w-48"
                            value={budgetCat}
                            onChange={
                                handleBudgetCategoryChange
                            }
                        >

                            <option value="">
                                Select Category
                            </option>


                            {categories.map(c => (

                                <option
                                    key={c.id}
                                    value={c.name}
                                >
                                    {c.name}
                                </option>

                            ))}

                        </select>


                        <input
                            className="px-4 py-3 rounded-xl border w-48"
                            placeholder="Enter limit"
                            type="number"
                            value={budgetInput}
                            onChange={e =>
                                setBudgetInput(
                                    e.target.value
                                )
                            }
                        />


                        <button
                            onClick={setCategoryLimit}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-7 py-3 rounded-xl font-bold"
                        >
                            Set Limit
                        </button>

                    </div>


                    {/* Category Cards */}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">

                        {Object.entries(
                            categoryBudgets
                        ).map(
                            ([cat, limit]) => {

                                const spent =
                                    spentByCategory[cat] || 0;

                                const remaining =
                                    limit - spent;

                                const percent =
                                    limit > 0
                                        ? (spent / limit) * 100
                                        : 0;


                                return (

                                    <div
                                        key={cat}
                                        className="border rounded-xl p-5 bg-gray-50"
                                    >

                                        <div className="flex justify-between mb-4">

                                            <h3 className="text-lg font-bold">
                                                {cat}
                                            </h3>

                                            <span className="font-bold">
                                                ₹{limit.toLocaleString("en-IN")}
                                            </span>

                                        </div>


                                        <div className="grid grid-cols-3 gap-3">

                                            <div>

                                                <p className="text-gray-500 text-sm">
                                                    Limit
                                                </p>

                                                <p className="font-bold">
                                                    ₹{limit.toLocaleString("en-IN")}
                                                </p>

                                            </div>


                                            <div>

                                                <p className="text-gray-500 text-sm">
                                                    Spent
                                                </p>

                                                <p className="font-bold">
                                                    ₹{spent.toLocaleString("en-IN")}
                                                </p>

                                            </div>


                                            <div>

                                                <p className="text-gray-500 text-sm">
                                                    Remaining
                                                </p>

                                                <p
                                                    className={`font-bold ${
                                                        remaining < 0
                                                            ? "text-red-600"
                                                            : "text-green-600"
                                                    }`}
                                                >
                                                    ₹{Math.max(
                                                    remaining,
                                                    0
                                                ).toLocaleString("en-IN")}
                                                </p>

                                            </div>

                                        </div>


                                        {/* Category progress */}

                                        <div className="mt-4">

                                            <div className="flex justify-between text-sm mb-1">

                                                <span>
                                                    Used
                                                </span>

                                                <span className="font-bold">
                                                    {percent.toFixed(0)}%
                                                </span>

                                            </div>


                                            <div className="w-full bg-gray-200 rounded-full h-3">

                                                <div
                                                    className={`h-3 rounded-full ${
                                                        percent > 100
                                                            ? "bg-red-500"
                                                            : "bg-green-500"
                                                    }`}
                                                    style={{
                                                        width:
                                                            `${Math.min(
                                                                percent,
                                                                100
                                                            )}%`
                                                    }}
                                                />

                                            </div>

                                        </div>


                                        {spent >= limit && (

                                            <p className="mt-3 text-red-600 font-semibold">

                                                ⚠️ {cat} limit exceeded!

                                            </p>

                                        )}

                                    </div>

                                );

                            }
                        )}

                    </div>

                </div>


                {/* ================= PIE CHART ================= */}

                <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">

                    <h2 className="text-2xl font-bold text-center mb-4">
                        Spending by Category
                    </h2>


                    {pieData.length > 0 ? (

                        <ResponsiveContainer
                            width="100%"
                            height={320}
                        >

                            <PieChart>

                                <Pie
                                    data={pieData}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={110}
                                    label={({
                                                name,
                                                percent
                                            }) =>
                                        `${name} ${Math.round(
                                            percent * 100
                                        )}%`
                                    }
                                >

                                    {pieData.map(
                                        (_, i) => (

                                            <Cell
                                                key={i}
                                                fill={
                                                    COLORS[
                                                    i %
                                                    COLORS.length
                                                        ]
                                                }
                                            />

                                        )
                                    )}

                                </Pie>


                                <Tooltip
                                    formatter={value =>
                                        `₹${Number(
                                            value
                                        ).toLocaleString(
                                            "en-IN"
                                        )}`
                                    }
                                />


                                <Legend />

                            </PieChart>

                        </ResponsiveContainer>

                    ) : (

                        <p className="text-center text-gray-500 py-10">
                            No expenses yet
                        </p>

                    )}

                </div>


                {/* ================= ADD EXPENSE ================= */}

                <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">

                    <h2 className="text-2xl font-bold mb-5">
                        Add Expense
                    </h2>


                    <div className="flex flex-wrap gap-3">

                        <input
                            className="px-4 py-3 rounded-xl border flex-1 min-w-40"
                            placeholder="Title"
                            value={form.title}
                            onChange={e =>
                                setForm({
                                    ...form,
                                    title: e.target.value
                                })
                            }
                        />


                        <input
                            className="px-4 py-3 rounded-xl border w-36"
                            placeholder="Amount"
                            type="number"
                            value={form.amount}
                            onChange={e =>
                                setForm({
                                    ...form,
                                    amount: e.target.value
                                })
                            }
                        />


                        <select
                            className="px-4 py-3 rounded-xl border w-44"
                            value={form.categoryId}
                            onChange={e =>
                                setForm({
                                    ...form,
                                    categoryId:
                                    e.target.value
                                })
                            }
                        >

                            <option value="">
                                Category
                            </option>


                            {categories.map(c => (

                                <option
                                    key={c.id}
                                    value={c.id}
                                >
                                    {c.name}
                                </option>

                            ))}

                        </select>


                        <input
                            className="px-4 py-3 rounded-xl border w-44"
                            type="date"
                            value={form.date}
                            onChange={e =>
                                setForm({
                                    ...form,
                                    date: e.target.value
                                })
                            }
                        />


                        <button
                            onClick={addExpense}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold"
                        >
                            Add Expense
                        </button>

                    </div>

                </div>


                {/* ================= EXPENSE TABLE ================= */}

                <h2 className="text-2xl font-bold text-white mb-4">
                    My Expenses ({expenses.length})
                </h2>


                <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-10">

                    <div className="overflow-x-auto">

                        <table className="w-full">

                            <thead className="bg-gray-50">

                            <tr>

                                <th className="p-4 text-left">
                                    Title
                                </th>

                                <th className="p-4 text-left">
                                    Amount
                                </th>

                                <th className="p-4 text-left">
                                    Category
                                </th>

                                <th className="p-4 text-left">
                                    Date
                                </th>

                                <th className="p-4 text-left">
                                    Action
                                </th>

                            </tr>

                            </thead>


                            <tbody>

                            {expenses.map(e => (

                                <tr
                                    key={e.id}
                                    className="border-t hover:bg-gray-50"
                                >

                                    <td className="p-4 font-medium">
                                        {e.description}
                                    </td>


                                    <td className="p-4">
                                        ₹{Number(
                                        e.amount
                                    ).toLocaleString(
                                        "en-IN"
                                    )}
                                    </td>


                                    <td className="p-4">
                                        {(e.categoryName ||
                                            "N/A").toUpperCase()}
                                    </td>


                                    <td className="p-4">
                                        {e.date}
                                    </td>


                                    <td className="p-4">

                                        <button
                                            onClick={() =>
                                                deleteExp(
                                                    e.id,
                                                    e.description
                                                )
                                            }
                                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
                                        >
                                            Delete
                                        </button>

                                    </td>

                                </tr>

                            ))}

                            </tbody>

                        </table>

                    </div>

                </div>

            </div>

        </div>
    );
}