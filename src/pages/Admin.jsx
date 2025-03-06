import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Admin = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('categories');
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });
  const [editingCategory, setEditingCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // Check if user is logged in
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8000/api/categories/');
      setCategories(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load categories');
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (editingCategory) {
      setEditingCategory({
        ...editingCategory,
        [name]: value
      });
    } else {
      setNewCategory({
        ...newCategory,
        [name]: value
      });
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.name.trim()) {
      setError('Category name is required');
      return;
    }

    try {
      setLoading(true);
      await axios.post('http://localhost:8000/api/categories/', newCategory);
      setNewCategory({ name: '', description: '' });
      setSuccess('Category added successfully');
      fetchCategories();
    } catch (err) {
      setError('Failed to add category');
      setLoading(false);
    }
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setNewCategory({ name: '', description: '' });
  };

  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    if (!editingCategory.name.trim()) {
      setError('Category name is required');
      return;
    }

    try {
      setLoading(true);
      await axios.put(`http://localhost:8000/api/categories/${editingCategory.id}/`, editingCategory);
      setEditingCategory(null);
      setSuccess('Category updated successfully');
      fetchCategories();
    } catch (err) {
      setError('Failed to update category');
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) {
      return;
    }

    try {
      setLoading(true);
      await axios.delete(`http://localhost:8000/api/categories/${id}/`);
      setSuccess('Category deleted successfully');
      fetchCategories();
    } catch (err) {
      setError('Failed to delete category');
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
  };

  // Clear messages after 3 seconds
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess(null);
        setError(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  return (
    <div className="container py-4">
      <h1 className="mb-4">Admin Dashboard</h1>

      {/* Navigation Tabs */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'categories' ? 'active' : ''}`}
            onClick={() => setActiveTab('categories')}
          >
            Manage Categories
          </button>
        </li>
        {/* Add more tabs as needed */}
      </ul>

      {/* Success and Error Messages */}
      {success && (
        <div className="alert alert-success alert-dismissible fade show" role="alert">
          {success}
          <button type="button" className="btn-close" onClick={() => setSuccess(null)}></button>
        </div>
      )}
      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          {error}
          <button type="button" className="btn-close" onClick={() => setError(null)}></button>
        </div>
      )}

      {/* Categories Management */}
      {activeTab === 'categories' && (
        <div className="row">
          {/* Form for adding/editing categories */}
          <div className="col-md-4">
            <div className="card">
              <div className="card-header">
                <h5 className="card-title mb-0">
                  {editingCategory ? 'Edit Category' : 'Add New Category'}
                </h5>
              </div>
              <div className="card-body">
                <form onSubmit={editingCategory ? handleUpdateCategory : handleAddCategory}>
                  <div className="mb-3">
                    <label htmlFor="name" className="form-label">Category Name</label>
                    <input
                      type="text"
                      className="form-control"
                      id="name"
                      name="name"
                      value={editingCategory ? editingCategory.name : newCategory.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="description" className="form-label">Description (Optional)</label>
                    <textarea
                      className="form-control"
                      id="description"
                      name="description"
                      value={editingCategory ? editingCategory.description : newCategory.description}
                      onChange={handleInputChange}
                      rows="3"
                    />
                  </div>
                  <div className="d-grid gap-2">
                    <button type="submit" className="btn btn-primary">
                      {editingCategory ? 'Update Category' : 'Add Category'}
                    </button>
                    {editingCategory && (
                      <button 
                        type="button" 
                        className="btn btn-outline-secondary"
                        onClick={handleCancelEdit}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* List of existing categories */}
          <div className="col-md-8">
            <div className="card">
              <div className="card-header">
                <h5 className="card-title mb-0">Existing Categories</h5>
              </div>
              <div className="card-body">
                {loading && <p>Loading categories...</p>}
                {!loading && categories.length === 0 && (
                  <div className="alert alert-info">
                    No categories found. Add your first category!
                  </div>
                )}
                {!loading && categories.length > 0 && (
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Description</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {categories.map(category => (
                          <tr key={category.id}>
                            <td>{category.name}</td>
                            <td>{category.description || <em className="text-muted">No description</em>}</td>
                            <td>
                              <div className="btn-group btn-group-sm">
                                <button
                                  className="btn btn-outline-primary"
                                  onClick={() => handleEditCategory(category)}
                                >
                                  Edit
                                </button>
                                <button
                                  className="btn btn-outline-danger"
                                  onClick={() => handleDeleteCategory(category.id)}
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
