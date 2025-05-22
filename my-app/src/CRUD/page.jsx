import React, { useState, useEffect } from 'react';
import UserManager from './UserManager';

// Funkcja do ładowania danych z localStorage
const loadData = () => {
  const storedData = localStorage.getItem('products');
  return storedData ? JSON.parse(storedData) : [];
};

// Funkcja do zapisywania danych do localStorage
const saveData = (data) => {
  localStorage.setItem('products', JSON.stringify(data));
};

// Funkcja do ustawiania danych domyślnych
const setDefaultData = () => {
  const defaultData = [
    {
      id: 1,
      name: "Product 1",
      description: "Description of Product 1",
      price: 19.99,
      category: "Electronics",
      stock: 50
    },
    {
      id: 2,
      name: "Product 2",
      description: "Description of Product 2",
      price: 29.99,
      category: "Clothing",
      stock: 100
    },
    {
      id: 3,
      name: "Product 3",
      description: "Description of Product 3",
      price: 15.49,
      category: "Books",
      stock: 200
    }
  ];
  saveData(defaultData);
};

const CrudPage = () => {
  const [data, setData] = useState([]);
  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: ''
  });
  const [editItem, setEditItem] = useState(null);
  const [user, setUser] = useState(null);

  // Ładowanie danych z localStorage przy starcie
  useEffect(() => {
    let products = loadData();
    if (products.length === 0) {
      setDefaultData();
      products = loadData();
    }
    setData(products);
    
    // Pobranie użytkownika z UserManager
    setUser(UserManager.getUser());
  }, []);

  // Dodawanie nowego produktu
  const addItem = () => {
    const newId = data.length ? data[data.length - 1].id + 1 : 1;
    const newData = [...data, { ...newItem, id: newId }];
    setData(newData);
    saveData(newData);
    setNewItem({
      name: '',
      description: '',
      price: '',
      category: '',
      stock: ''
    });
  };

  // Edytowanie istniejącego produktu
  const editItemHandler = (item) => {
    setEditItem(item);
    setNewItem({ ...item });
  };

  // Zatwierdzanie edycji produktu
  const saveItem = () => {
    const updatedData = data.map((item) =>
      item.id === editItem.id ? { ...item, ...newItem } : item
    );
    setData(updatedData);
    saveData(updatedData);
    setEditItem(null);
    setNewItem({
      name: '',
      description: '',
      price: '',
      category: '',
      stock: ''
    });
  };

  // Usuwanie produktu
  const deleteItem = (id) => {
    const filteredData = data.filter((item) => item.id !== id);
    setData(filteredData);
    saveData(filteredData);
  };

  return (
    <div className="crud-container">
      {user && (
        <div className="user-info">
          <p>Logged in as: <strong>{user.firstName} {user.lastName}</strong></p>
        </div>
      )}

      <h1 className="crud-title">Product CRUD</h1>

      <div className="form-container">
        <h2>{editItem ? 'Edit Product' : 'Add Product'}</h2>
        <input
          className="input-field"
          type="text"
          placeholder="Product Name"
          value={newItem.name}
          onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
        />
        <textarea
          className="input-field"
          placeholder="Description"
          value={newItem.description}
          onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
        />
        <input
          className="input-field"
          type="number"
          placeholder="Price"
          value={newItem.price}
          onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
        />
        <input
          className="input-field"
          type="text"
          placeholder="Category"
          value={newItem.category}
          onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
        />
        <input
          className="input-field"
          type="number"
          placeholder="Stock"
          value={newItem.stock}
          onChange={(e) => setNewItem({ ...newItem, stock: e.target.value })}
        />
        <button
          className="action-button"
          onClick={editItem ? saveItem : addItem}
        >
          {editItem ? 'Save Changes' : 'Add Product'}
        </button>
      </div>

      <h2 className="product-list-title">Products List</h2>
      <ul className="product-list">
        {data.length === 0 ? (
          <p>No products available</p>
        ) : (
          data.map((item) => (
            <li key={item.id} className="product-item">
              <h3 className="product-name">{item.name}</h3>
              <p className="product-description">{item.description}</p>
              <p className="product-price">Price: ${item.price}</p>
              <p className="product-category">Category: {item.category}</p>
              <p className="product-stock">Stock: {item.stock}</p>
              <div className="action-buttons">
                <button className="edit-button" onClick={() => editItemHandler(item)}>
                  Edit
                </button>
                <button className="delete-button" onClick={() => deleteItem(item.id)}>
                  Delete
                </button>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default CrudPage;



const style = ` 
  .crud-container { font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9; max-width: 900px; margin: 0 auto; border-radius: 8px; } 
  .user-info { background-color: #fff; padding: 10px; border-radius: 8px; margin-bottom: 15px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); text-align: center; font-size: 1.2rem; font-weight: bold; color: #333; } 
  .crud-title { text-align: center; font-size: 2rem; color: #333; } 
  .form-container { background-color: #fff; padding: 20px; border-radius: 8px; margin-top: 20px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1); } 
  .input-field { width: 100%; padding: 10px; margin-bottom: 15px; border: 1px solid #ddd; border-radius: 5px; } 
  .action-button { width: 100%; padding: 10px; background-color: #4CAF50; color: white; border: none; border-radius: 5px; cursor: pointer; } 
  .action-button:hover { background-color: #45a049; } 
  .product-list { list-style-type: none; padding: 0; } 
  .product-item { background-color: #fff; padding: 20px; margin: 10px 0; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); } 
  .product-name { font-size: 1.5rem; color: #333; } 
  .product-description { color: #555; margin: 10px 0; } 
  .product-price, .product-category, .product-stock { color: #666; font-size: 1rem; margin: 5px 0; } 
  .action-buttons { display: flex; justify-content: space-between; } 
  .edit-button, .delete-button { padding: 8px 15px; border-radius: 5px; border: none; cursor: pointer; } 
  .edit-button { background-color: #ff9800; color: white; } 
  .delete-button { background-color: #f44336; color: white; } 
  .edit-button:hover { background-color: #f57c00; } 
  .delete-button:hover { background-color: #d32f2f; } 
  .product-list-title { text-align: center; font-size: 1.5rem; color: #333; margin-top: 30px; }
`;

const styleElement = document.createElement('style');
styleElement.innerHTML = style;
document.head.appendChild(styleElement);

