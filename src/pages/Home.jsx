import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, onSnapshot, addDoc, serverTimestamp } from "firebase/firestore";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("none"); // none | price-asc | price-desc
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [info, setInfo] = useState({ name: "", phone: "", address: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    return onSnapshot(collection(db, "products"), (s) =>
      setProducts(s.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
  }, []);

  useEffect(() => {
    return onSnapshot(collection(db, "categories"), (s) =>
      setCategories(
        s.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .sort((a, b) => (a.order || 0) - (b.order || 0))
      )
    );
  }, []);

  const addToCart = (product) => {
    const existingItem = cart.find((item) => item.id === product.id);
    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      );
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
    setShowCart(true);
  };

  const updateQuantity = (productId, change) => {
    setCart(
      cart
        .map((item) =>
          item.id === productId
            ? { ...item, quantity: Math.max(1, item.quantity + change) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter((item) => item.id !== productId));
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price || 0) * item.quantity, 0);
  };

  const order = async () => {
    if (cart.length === 0) {
      alert("Vui lòng chọn ít nhất một sản phẩm!");
      return;
    }
    if (!info.name || !info.phone || !info.address) {
      alert("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "orders"), {
        items: cart.map((item) => ({
          productId: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          imageUrl: item.imageUrl,
        })),
        customer: info,
        totalPrice: getTotalPrice(),
        createdAt: serverTimestamp(),
      });
      alert("Đặt hàng thành công! Cảm ơn bạn đã mua sắm.");
      setCart([]);
      setInfo({ name: "", phone: "", address: "" });
      setShowCart(false);
    } catch (error) {
      alert("Có lỗi xảy ra. Vui lòng thử lại!");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const normalizeText = (text) =>
    (text || "")
      .toString()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

  const filteredProducts = (() => {
    const term = normalizeText(search);
    let result = products.filter((p) => {
      if (!term) return true;
      const name = normalizeText(p.name);
      const priceString = (p.price || 0).toString();
      return name.includes(term) || priceString.includes(term);
    });

    if (sortBy === "price-asc") {
      result = [...result].sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sortBy === "price-desc") {
      result = [...result].sort((a, b) => (b.price || 0) - (a.price || 0));
    }
    return result;
  })();

  const productsByCategory = (() => {
    const catList = categories.length
      ? categories
      : [{ id: "other", name: "Khác", order: 999 }];

    // Gom sản phẩm không có categoryId vào danh mục "Khác"
    const categorized = catList.map((cat) => ({
      ...cat,
      items: filteredProducts.filter((p) =>
        cat.id === "other"
          ? !p.categoryId
          : p.categoryId === cat.id
      ),
    }));

    // Nếu vẫn còn sản phẩm không match (do categories rỗng), thêm fallback
    const remaining = filteredProducts.filter((p) => !p.categoryId);
    const hasOther = categorized.some((c) => c.id === "other");
    if (remaining.length && !hasOther) {
      categorized.push({ id: "other", name: "Khác", order: 999, items: remaining });
    }
    return categorized;
  })();

  const styles = {
    container: {
      maxWidth: 1200,
      margin: "0 auto",
      padding: "20px",
      fontFamily: "system-ui, -apple-system, sans-serif",
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 30,
      flexWrap: "wrap",
      gap: 15,
    },
    filterBar: {
      display: "flex",
      flexWrap: "wrap",
      gap: 10,
      marginBottom: 20,
    },
    searchInput: {
      flex: 1,
      minWidth: 220,
      padding: "10px 12px",
      borderRadius: 8,
      border: "1px solid #d1d5db",
      fontSize: "1rem",
      boxSizing: "border-box",
    },
    select: {
      minWidth: 180,
      padding: "10px 12px",
      borderRadius: 8,
      border: "1px solid #d1d5db",
      fontSize: "1rem",
      boxSizing: "border-box",
    },
    categoryBlock: {
      marginTop: 10,
      marginBottom: 26,
      display: "grid",
      gap: 12,
    },
    categoryHeader: {
      display: "flex",
      alignItems: "center",
      gap: 10,
    },
    categoryTitle: {
      fontSize: "1.3rem",
      fontWeight: 800,
      margin: 0,
      color: "#111827",
    },
    title: {
      fontSize: "2rem",
      fontWeight: "bold",
      margin: 0,
      color: "#333",
    },
    cartButton: {
      position: "relative",
      padding: "12px 24px",
      backgroundColor: "#007bff",
      color: "white",
      border: "none",
      borderRadius: 8,
      fontSize: "1rem",
      cursor: "pointer",
      fontWeight: 600,
      display: "flex",
      alignItems: "center",
      gap: 8,
    },
    badge: {
      position: "absolute",
      top: -8,
      right: -8,
      backgroundColor: "#ff4444",
      color: "white",
      borderRadius: "50%",
      width: 24,
      height: 24,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "0.75rem",
      fontWeight: "bold",
    },
    productsGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
      gap: 14,
      marginBottom: 40,
    },
    productCard: {
      backgroundColor: "#fff",
      borderRadius: 12,
      overflow: "hidden",
      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      transition: "transform 0.2s, box-shadow 0.2s",
      cursor: "pointer",
      border: "1px solid #e0e0e0",
    },
    productImage: {
      width: "100%",
      height: 200,
      objectFit: "cover",
      backgroundColor: "#f5f5f5",
    },
    productInfo: {
      padding: 16,
    },
    productName: {
      fontSize: "1.1rem",
      fontWeight: 600,
      margin: "0 0 8px 0",
      color: "#333",
    },
    productPrice: {
      fontSize: "1.25rem",
      fontWeight: "bold",
      color: "#007bff",
      margin: "0 0 12px 0",
    },
    addButton: {
      width: "100%",
      padding: "10px",
      backgroundColor: "#28a745",
      color: "white",
      border: "none",
      borderRadius: 6,
      fontSize: "1rem",
      cursor: "pointer",
      fontWeight: 600,
      transition: "background-color 0.2s",
    },
    cartSidebar: {
      position: "fixed",
      top: 0,
      right: showCart ? 0 : "-100%",
      width: "100%",
      maxWidth: 400,
      height: "100vh",
      backgroundColor: "#fff",
      boxShadow: "-2px 0 10px rgba(0,0,0,0.1)",
      transition: "right 0.3s ease",
      zIndex: 1000,
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
    },
    cartHeader: {
      padding: 20,
      borderBottom: "1px solid #e0e0e0",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      backgroundColor: "#f8f9fa",
    },
    closeButton: {
      background: "none",
      border: "none",
      fontSize: "1.5rem",
      cursor: "pointer",
      color: "#666",
      padding: 0,
      width: 32,
      height: 32,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    cartContent: {
      flex: 1,
      overflowY: "auto",
      padding: 20,
    },
    cartItem: {
      display: "flex",
      gap: 12,
      padding: 12,
      borderBottom: "1px solid #e0e0e0",
      marginBottom: 12,
    },
    cartItemImage: {
      width: 80,
      height: 80,
      objectFit: "cover",
      borderRadius: 8,
      backgroundColor: "#f5f5f5",
    },
    cartItemInfo: {
      flex: 1,
    },
    cartItemName: {
      fontSize: "0.9rem",
      fontWeight: 600,
      margin: "0 0 4px 0",
      color: "#333",
    },
    cartItemPrice: {
      fontSize: "0.9rem",
      color: "#007bff",
      fontWeight: 600,
      margin: "0 0 8px 0",
    },
    quantityControls: {
      display: "flex",
      alignItems: "center",
      gap: 10,
    },
    quantityButton: {
      width: 28,
      height: 28,
      border: "1px solid #ddd",
      backgroundColor: "#fff",
      borderRadius: 4,
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "1.2rem",
    },
    quantityInput: {
      width: 40,
      textAlign: "center",
      border: "1px solid #ddd",
      borderRadius: 4,
      padding: "4px",
      fontSize: "0.9rem",
    },
    removeButton: {
      background: "none",
      border: "none",
      color: "#ff4444",
      cursor: "pointer",
      fontSize: "0.85rem",
      padding: "4px 8px",
      marginTop: 4,
    },
    cartFooter: {
      padding: 20,
      borderTop: "1px solid #e0e0e0",
      backgroundColor: "#f8f9fa",
    },
    totalPrice: {
      fontSize: "1.25rem",
      fontWeight: "bold",
      marginBottom: 16,
      display: "flex",
      justifyContent: "space-between",
    },
    formGroup: {
      marginBottom: 16,
    },
    formLabel: {
      display: "block",
      marginBottom: 6,
      fontSize: "0.9rem",
      fontWeight: 600,
      color: "#333",
    },
    formInput: {
      width: "100%",
      padding: "10px",
      border: "1px solid #ddd",
      borderRadius: 6,
      fontSize: "1rem",
      boxSizing: "border-box",
    },
    orderButton: {
      width: "100%",
      padding: "14px",
      backgroundColor: "#28a745",
      color: "white",
      border: "none",
      borderRadius: 6,
      fontSize: "1.1rem",
      cursor: isSubmitting ? "not-allowed" : "pointer",
      fontWeight: 600,
      opacity: isSubmitting ? 0.6 : 1,
    },
    overlay: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0,0,0,0.5)",
      zIndex: 999,
      display: showCart ? "block" : "none",
    },
    emptyCart: {
      textAlign: "center",
      padding: "40px 20px",
      color: "#999",
    },
    emptyProducts: {
      textAlign: "center",
      padding: "40px 20px",
      color: "#999",
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>🛍️ Cửa hàng</h1>
        <button style={styles.cartButton} onClick={() => setShowCart(true)}>
          🛒 Giỏ hàng
          {cart.length > 0 && <span style={styles.badge}>{cart.reduce((sum, item) => sum + item.quantity, 0)}</span>}
        </button>
      </div>

      <div style={styles.filterBar}>
        <input
          style={styles.searchInput}
          placeholder="Tìm kiếm sản phẩm theo tên hoặc giá..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          style={styles.select}
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="none">Sắp xếp</option>
          <option value="price-asc">Giá: Thấp → Cao</option>
          <option value="price-desc">Giá: Cao → Thấp</option>
        </select>
        <div style={{ alignSelf: "center", color: "#6b7280", fontWeight: 600 }}>
          {filteredProducts.length} sản phẩm
        </div>
      </div>

      {categories.length === 0 ? (
        <div style={styles.emptyProducts}>
          <p>Chưa có danh mục hoặc sản phẩm. Vui lòng quay lại sau!</p>
        </div>
      ) : (
        productsByCategory.map((cat) => (
          <div key={cat.id || cat.name} style={styles.categoryBlock}>
            <div style={styles.categoryHeader}>
              <h2 style={styles.categoryTitle}>{cat.name}</h2>
              <span style={{ color: "#6b7280", fontWeight: 600 }}>
                {cat.items.length} sản phẩm
              </span>
            </div>
            {cat.items.length === 0 ? (
              <div style={{ color: "#9ca3af", fontStyle: "italic" }}>Chưa có sản phẩm.</div>
            ) : (
              <div style={styles.productsGrid}>
                {cat.items.map((product) => (
                  <div key={product.id} style={styles.productCard}>
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      style={styles.productImage}
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/250x200?text=No+Image";
                      }}
                    />
                    <div style={styles.productInfo}>
                      <h3 style={styles.productName}>{product.name}</h3>
                      <p style={styles.productPrice}>
                        {product.price?.toLocaleString("vi-VN") || 0}đ
                      </p>
                      <button
                        style={styles.addButton}
                        onClick={() => addToCart(product)}
                        onMouseOver={(e) => (e.target.style.backgroundColor = "#218838")}
                        onMouseOut={(e) => (e.target.style.backgroundColor = "#28a745")}
                      >
                        ➕ Thêm vào giỏ
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))
      )}

      {/* Overlay */}
      <div style={styles.overlay} onClick={() => setShowCart(false)} />

      {/* Cart Sidebar */}
      <div style={styles.cartSidebar}>
        <div style={styles.cartHeader}>
          <h2 style={{ margin: 0 }}>Giỏ hàng</h2>
          <button style={styles.closeButton} onClick={() => setShowCart(false)}>
            ✕
          </button>
        </div>

        <div style={styles.cartContent}>
          {cart.length === 0 ? (
            <div style={styles.emptyCart}>
              <p>Giỏ hàng trống</p>
              <p style={{ fontSize: "0.9rem", marginTop: 8 }}>
                Thêm sản phẩm để bắt đầu mua sắm!
              </p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} style={styles.cartItem}>
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  style={styles.cartItemImage}
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/80?text=No+Image";
                  }}
                />
                <div style={styles.cartItemInfo}>
                  <h4 style={styles.cartItemName}>{item.name}</h4>
                  <p style={styles.cartItemPrice}>
                    {(item.price || 0).toLocaleString("vi-VN")}đ
                  </p>
                  <div style={styles.quantityControls}>
                    <button
                      style={styles.quantityButton}
                      onClick={() => updateQuantity(item.id, -1)}
                    >
                      −
                    </button>
                    <input
                      type="number"
                      value={item.quantity}
                      readOnly
                      style={styles.quantityInput}
                      min="1"
                    />
                    <button
                      style={styles.quantityButton}
                      onClick={() => updateQuantity(item.id, 1)}
                    >
                      +
                    </button>
                  </div>
                  <button
                    style={styles.removeButton}
                    onClick={() => removeFromCart(item.id)}
                  >
                    Xóa
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div style={styles.cartFooter}>
            <div style={styles.totalPrice}>
              <span>Tổng tiền:</span>
              <span style={{ color: "#28a745" }}>
                {getTotalPrice().toLocaleString("vi-VN")}đ
              </span>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Họ tên *</label>
              <input
                type="text"
                placeholder="Nhập họ tên"
                value={info.name}
                onChange={(e) => setInfo({ ...info, name: e.target.value })}
                style={styles.formInput}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Số điện thoại *</label>
              <input
                type="tel"
                placeholder="Nhập số điện thoại"
                value={info.phone}
                onChange={(e) => setInfo({ ...info, phone: e.target.value })}
                style={styles.formInput}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Địa chỉ *</label>
              <input
                type="text"
                placeholder="Nhập địa chỉ giao hàng"
                value={info.address}
                onChange={(e) => setInfo({ ...info, address: e.target.value })}
                style={styles.formInput}
              />
            </div>

            <button
              style={styles.orderButton}
              onClick={order}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Đang xử lý..." : "✅ Đặt hàng"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
