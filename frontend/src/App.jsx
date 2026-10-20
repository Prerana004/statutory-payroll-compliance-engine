import { useEffect, useState } from "react";
import axios from "axios";
import Dashboard from "./Dashboard";
import "./App.css";
import { isSuperAdmin } from "./utils/auth";
import MobileNav from "./components/MobileNav";

function App() {
  const [form, setForm] = useState({
    country: "",
    pf: "",
    esi: "",
    pt: "",
  });

  const [rules, setRules] = useState([]);
  const [dark, setDark] = useState(false);

  // 🔐 COMMON JWT HEADER (VERY IMPORTANT)
  const authHeader = {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  };

  // 🔹 Handle input change
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ✅ SAVE STATUTORY RULE (JWT PROTECTED)
  const handleSubmit = async () => {
    try {
      await axios.post(
        "http://localhost:5000/api/statutory",
        {
          country: form.country,
          pfPercentage: Number(form.pf),
          esiPercentage: Number(form.esi),
          professionalTax: Number(form.pt),
        },
        authHeader
      );

      alert("Statutory rule saved successfully ✅");
      setForm({ country: "", pf: "", esi: "", pt: "" });
      fetchRules();
    } catch (err) {
      console.error(err);
      alert("❌ Error saving data. Please login again.");
    }
  };

  // ✅ FETCH RULES (JWT PROTECTED)
  const fetchRules = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/statutory",
        authHeader
      );
      setRules(res.data);
    } catch (err) {
      console.error(err);
      alert("❌ Failed to load rules. Token may be invalid.");
    }
  };

  // ❌ DELETE RULE (SUPER ADMIN ONLY – BACKEND ENFORCED)
  const deleteRule = async (id) => {
    if (!window.confirm("Are you sure you want to delete this rule?")) return;

    try {
      await axios.delete(
        `http://localhost:5000/api/statutory/${id}`,
        authHeader
      );
      fetchRules();
    } catch (err) {
      console.error(err);
      alert("❌ Only Super Admin can delete");
    }
  };

  // 🔄 LOAD DATA ON PAGE LOAD
  useEffect(() => {
    fetchRules();
  }, []);

  return (
    <div className={`page ${dark ? "dark" : ""}`}>
      {/* 🔹 FORM CARD */}
      <div className="card fade-in">
        <div className="header">
          <h2>Module 2</h2>
          <p>Statutory & Compliance Configuration</p>
          <button className="toggle" onClick={() => setDark(!dark)}>
            {dark ? "☀️ Light" : "🌙 Dark"}
          </button>
        </div>

        <input
          name="country"
          placeholder="Country"
          value={form.country}
          onChange={handleChange}
        />
        <input
          name="pf"
          placeholder="PF %"
          value={form.pf}
          onChange={handleChange}
        />
        <input
          name="esi"
          placeholder="ESI %"
          value={form.esi}
          onChange={handleChange}
        />
        <input
          name="pt"
          placeholder="Professional Tax"
          value={form.pt}
          onChange={handleChange}
        />

        <button className="save-btn" onClick={handleSubmit}>
          Save
        </button>
      </div>

      {/* 📊 DASHBOARD */}
      {rules.length > 0 && <Dashboard rules={rules} />}

      {/* 📋 TABLE */}
      <div className="table-card fade-in">
        <h3>Saved Statutory Rules</h3>
        <table>
          <thead>
            <tr>
              <th>Country</th>
              <th>PF %</th>
              <th>ESI %</th>
              <th>PT</th>
              {isSuperAdmin() && <th>Action</th>}
            </tr>
          </thead>
          <tbody>
            {rules.map((r) => (
              <tr key={r._id}>
                <td>{r.country}</td>
                <td>{r.pfPercentage}</td>
                <td>{r.esiPercentage}</td>
                <td>{r.professionalTax}</td>

                {isSuperAdmin() && (
                  <td>
                    <button
                      className="danger-btn"
                      onClick={() => deleteRule(r._id)}
                    >
                      Delete
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
  <>
  {/* existing App JSX */}
  <MobileNav />
</>

}

export default App;
