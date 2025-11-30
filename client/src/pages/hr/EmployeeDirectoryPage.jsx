import { useEffect, useState } from "react";
import useDebounce from "../../hooks/useDebounce.js";
import api from "../../services/api.js";

const EmployeeDirectoryPage = () => {
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState([]);
  const [total, setTotal] = useState(0);
  const debounced = useDebounce(search);

  const loadEmployees = async (query) => {
    setLoading(true);
    try {
      const { data } = await api.get("/hr/employees", query ? { params: { search: query } } : undefined);
      setEmployees(data.employees);
      setTotal(data.total);
    } catch (error) {
      console.error("Failed to load employees", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees(debounced.trim());
  }, [debounced]);

  return (
    <section className="page-card">
      <h1 className="page-title">Employee Profiles</h1>
      <p className="helper-text">
        Total Employees: <strong>{total}</strong>
      </p>
      <input
        className="search-bar"
        placeholder="Search by name"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      {loading ? (
        <p>Loading employees...</p>
      ) : employees.length === 0 ? (
        <p>No employees found.</p>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>SSN</th>
                <th>Work Authorization</th>
                <th>Phone</th>
                <th>Email</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((employee) => (
                <tr key={employee.id}>
                  <td>
                    <a href={`/hr/employees/${employee.id}`} target="_blank" rel="noreferrer">
                      {employee.name}
                    </a>
                  </td>
                  <td>{employee.ssn}</td>
                  <td>{employee.workAuthorization}</td>
                  <td>{employee.phone}</td>
                  <td>{employee.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

export default EmployeeDirectoryPage;
