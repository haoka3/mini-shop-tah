import { useEffect, useMemo, useState } from "react";
import { db } from "../firebase";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

export default function Admin() {
  // Product form
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [categoryId, setCategoryId] = useState("");

  // Category form
  const [categoryName, setCategoryName] = useState("");
  const [categoryOrder, setCategoryOrder] = useState(0);

  // Data
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [orderFilter, setOrderFilter] = useState("all"); // all | unread | read

  // =========================
  // LOAD ORDERS (realtime)
  // =========================
  useEffect(() => {
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setOrders(data);
    });
    return () => unsub();
  }, []);

  // =========================
  // LOAD CATEGORIES (realtime)
  // =========================
  useEffect(() => {
    const q = query(collection(db, "categories"), orderBy("order", "asc"));
    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setCategories(data);
    });
    return () => unsub();
  }, []);

  // =========================
  // CATEGORY ACTIONS
  // =========================
  const addCategory = async () => {
    const nameTrim = categoryName.trim();
    if (!nameTrim) {
      alert("Nhập tên danh mục");
      return;
    }

    await addDoc(collection(db, "categories"), {
      name: nameTrim,
      order: Number.isFinite(Number(categoryOrder)) ? Number(categoryOrder) : 0,
      createdAt: serverTimestamp(),
    });

    setCategoryName("");
    setCategoryOrder(0);
    alert("Đã thêm danh mục");
  };

  const updateCategoryOrder = async (id, value) => {
    await updateDoc(doc(db, "categories", id), {
      order: Number.isFinite(Number(value)) ? Number(value) : 0,
    });
  };

  const deleteCategory = async (id) => {
    if (!window.confirm("Xóa danh mục này? (Sản phẩm đã gán vẫn còn, nhưng sẽ thành 'không danh mục')")) return;
    await deleteDoc(doc(db, "categories", id));
  };

  // =========================
  // PRODUCT ACTIONS
  // =========================
  const saveProduct = async () => {
    const nameTrim = name.trim();
    const imageTrim = imageUrl.trim();
    const priceNum = Number(price);

    if (!nameTrim || !imageTrim || !price) {
      alert("Vui lòng nhập đủ: Link ảnh + Tên + Giá");
      return;
    }
    if (!Number.isFinite(priceNum) || priceNum < 0) {
      alert("Giá không hợp lệ");
      return;
    }

    // ✅ Cho phép KHÔNG chọn danh mục
    const selectedCat = categories.find((c) => c.id === categoryId);

    const payload = {
      name: nameTrim,
      price: priceNum,
      imageUrl: imageTrim,
      createdAt: serverTimestamp(),
    };

    // nếu có danh mục thì lưu categoryId + categoryName
    if (selectedCat) {
      payload.categoryId = selectedCat.id;
      payload.categoryName = selectedCat.name || "";
    }

    await addDoc(collection(db, "products"), payload);

    setName("");
    setPrice("");
    setImageUrl("");
    setCategoryId("");
    alert("Đã đăng sản phẩm");
  };

  // =========================
  // ORDERS VIEW
  // =========================
  const newOrdersCount = useMemo(() => orders.filter((o) => !o.isRead).length, [orders]);

  const totalRevenue = useMemo(() => {
    return orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
  }, [orders]);

  const filteredOrders = useMemo(() => {
    if (orderFilter === "unread") return orders.filter((o) => !o.isRead);
    if (orderFilter === "read") return orders.filter((o) => o.isRead);
    return orders;
  }, [orders, orderFilter]);

  const formatDate = (ts) => {
    if (!ts?.toDate) return "";
    return ts.toDate().toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const markAsRead = async (orderId) => {
    try {
      await updateDoc(doc(db, "orders", orderId), {
        isRead: true,
        readAt: serverTimestamp(),
      });
    } catch (err) {
      console.error(err);
      alert("Không thể đánh dấu đã xem. Vui lòng thử lại!");
    }
  };

  const deleteOrder = async (orderId) => {
    if (!window.confirm("Bạn chắc chắn muốn xóa đơn hàng này?")) return;
    try {
      await deleteDoc(doc(db, "orders", orderId));
    } catch (err) {
      console.error(err);
      alert("Không thể xóa đơn. Vui lòng thử lại!");
    }
  };

  // =========================
  // UI
  // =========================
  return (
    <div style={{ display: "grid", gap: 24 }}>
      {/* DANH MỤC */}
      <div
        style={{
          padding: 16,
          border: "1px solid #e5e7eb",
          borderRadius: 12,
          boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
          background: "#fff",
        }}
      >
        <h2 style={{ marginTop: 0 }}>Danh mục (categories)</h2>

        <div style={{ display: "grid", gap: 8, marginBottom: 12 }}>
          <input
            placeholder="Tên danh mục"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #e5e7eb" }}
          />
          <input
            type="number"
            placeholder="Thứ tự hiển thị (số nhỏ đứng trước)"
            value={categoryOrder}
            onChange={(e) => setCategoryOrder(e.target.value)}
            style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #e5e7eb" }}
          />
          <button onClick={addCategory} style={{ padding: 10, borderRadius: 10, cursor: "pointer" }}>
            ➕ Thêm danh mục
          </button>
        </div>

        <div style={{ display: "grid", gap: 8 }}>
          {categories.length === 0 ? (
            <div style={{ color: "#6b7280" }}>Chưa có danh mục.</div>
          ) : (
            categories.map((cat) => (
              <div
                key={cat.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 12px",
                  border: "1px solid #e5e7eb",
                  borderRadius: 10,
                  background: "#f8fafc",
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800 }}>{cat.name}</div>
                  <div style={{ fontSize: 12, color: "#6b7280" }}>Thứ tự: {cat.order ?? 0}</div>
                </div>

                <input
                  type="number"
                  defaultValue={cat.order ?? 0}
                  style={{ width: 90, padding: 8, borderRadius: 8, border: "1px solid #e5e7eb" }}
                  onBlur={(e) => updateCategoryOrder(cat.id, e.target.value)}
                  title="Sửa thứ tự rồi bấm ra ngoài để lưu"
                />

                <button
                  onClick={() => deleteCategory(cat.id)}
                  style={{
                    padding: "8px 10px",
                    borderRadius: 10,
                    cursor: "pointer",
                    border: "1px solid #fecaca",
                    background: "#fff",
                    color: "#dc2626",
                    fontWeight: 700,
                  }}
                >
                  Xóa
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ĐĂNG SẢN PHẨM */}
      <div
        style={{
          padding: 16,
          border: "1px solid #e5e7eb",
          borderRadius: 12,
          boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
          background: "#fff",
        }}
      >
        <h2 style={{ marginTop: 0 }}>Đăng sản phẩm (products)</h2>

        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          style={{
            width: "100%",
            marginBottom: 8,
            padding: 10,
            borderRadius: 10,
            border: "1px solid #e5e7eb",
          }}
        >
          <option value="">-- Không chọn danh mục (sẽ hiện cuối trang) --</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <input
          placeholder="Link ảnh (https://...)"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          style={{ width: "100%", marginBottom: 8, padding: 10, borderRadius: 10, border: "1px solid #e5e7eb" }}
        />

        {imageUrl ? (
          <img
            src={imageUrl}
            alt="preview"
            style={{ width: 160, height: 160, objectFit: "cover", borderRadius: 10, marginBottom: 8 }}
            onError={(e) => (e.currentTarget.style.display = "none")}
          />
        ) : null}

        <input
          placeholder="Tên sản phẩm"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ width: "100%", marginBottom: 8, padding: 10, borderRadius: 10, border: "1px solid #e5e7eb" }}
        />

        <input
          placeholder="Giá"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          style={{ width: "100%", marginBottom: 8, padding: 10, borderRadius: 10, border: "1px solid #e5e7eb" }}
        />

        <button
          onClick={saveProduct}
          style={{
            padding: 12,
            borderRadius: 12,
            cursor: "pointer",
            background: "#16a34a",
            color: "#fff",
            border: "none",
            fontWeight: 800,
          }}
        >
          ✅ Lưu sản phẩm
        </button>
      </div>

      {/* ĐƠN HÀNG */}
      <div
        style={{
          padding: 16,
          border: "1px solid #e5e7eb",
          borderRadius: 12,
          boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
          background: "#fff",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <h2 style={{ marginTop: 0, marginBottom: 12 }}>Đơn hàng (orders)</h2>

          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <div style={{ background: "#ecfdf3", color: "#166534", padding: "8px 12px", borderRadius: 10, fontWeight: 800 }}>
              Doanh số: {totalRevenue.toLocaleString("vi-VN")}đ
            </div>
            <div style={{ background: "#f1f5f9", padding: "8px 12px", borderRadius: 10, fontWeight: 700 }}>
              Tổng: {orders.length}
            </div>
            {newOrdersCount > 0 && (
              <div style={{ background: "#ef4444", color: "#fff", padding: "8px 12px", borderRadius: 999, fontWeight: 900 }}>
                Mới: {newOrdersCount}
              </div>
            )}
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
          {[
            { key: "all", label: "Tất cả" },
            { key: "unread", label: `Chưa xem (${orders.filter((o) => !o.isRead).length})` },
            { key: "read", label: `Đã xem (${orders.filter((o) => o.isRead).length})` },
          ].map((opt) => (
            <button
              key={opt.key}
              onClick={() => setOrderFilter(opt.key)}
              style={{
                padding: "8px 12px",
                borderRadius: 10,
                border: "1px solid #e5e7eb",
                background: orderFilter === opt.key ? "#2563eb" : "#fff",
                color: orderFilter === opt.key ? "#fff" : "#111827",
                cursor: "pointer",
                fontWeight: 800,
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {filteredOrders.length === 0 ? (
          <div style={{ color: "#6b7280" }}>Chưa có đơn hàng nào.</div>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: 12,
                  padding: 12,
                  background: "#fafafa",
                  display: "grid",
                  gap: 8,
                  position: "relative",
                }}
                onClick={() => !order.isRead && markAsRead(order.id)}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                  <div style={{ fontWeight: 900 }}>Khách: {order.customer?.name || "N/A"}</div>
                  <div style={{ color: "#6b7280", fontSize: 13 }}>{formatDate(order.createdAt)}</div>
                </div>

                <div style={{ color: "#374151" }}>
                  <div>SĐT: {order.customer?.phone || "-"}</div>
                  <div>Địa chỉ: {order.customer?.address || "-"}</div>
                </div>

                <div>
                  <div style={{ fontWeight: 800, marginBottom: 6 }}>Sản phẩm:</div>
                  <div style={{ display: "grid", gap: 6 }}>
                    {(order.items || []).map((item, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: 8,
                          padding: "8px 10px",
                          background: "#fff",
                          border: "1px solid #e5e7eb",
                          borderRadius: 10,
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 800 }}>{item.name}</div>
                          <div style={{ color: "#6b7280", fontSize: 13 }}>
                            SL: {item.quantity} × {(item.price || 0).toLocaleString("vi-VN")}đ
                          </div>
                        </div>
                        <div style={{ fontWeight: 900, color: "#0ea5e9" }}>
                          {((item.price || 0) * (item.quantity || 0)).toLocaleString("vi-VN")}đ
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 6, flexWrap: "wrap", gap: 8 }}>
                  <div style={{ color: "#6b7280" }}>Mã đơn: {order.id}</div>
                  <div style={{ fontWeight: 900, color: "#16a34a" }}>
                    Tổng: {(order.totalPrice || 0).toLocaleString("vi-VN")}đ
                  </div>
                </div>

                <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", flexWrap: "wrap" }}>
                  {!order.isRead && (
                    <button
                      onClick={() => markAsRead(order.id)}
                      style={{
                        background: "#2563eb",
                        color: "#fff",
                        border: "none",
                        borderRadius: 10,
                        padding: "10px 12px",
                        cursor: "pointer",
                        fontWeight: 800,
                      }}
                    >
                      Đánh dấu đã xem
                    </button>
                  )}
                  <button
                    onClick={() => deleteOrder(order.id)}
                    style={{
                      background: "#ef4444",
                      color: "#fff",
                      border: "none",
                      borderRadius: 10,
                      padding: "10px 12px",
                      cursor: "pointer",
                      fontWeight: 800,
                    }}
                  >
                    Xóa đơn
                  </button>
                </div>

                {!order.isRead && (
                  <div
                    style={{
                      position: "absolute",
                      top: 10,
                      right: 10,
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      background: "#ef4444",
                      boxShadow: "0 0 0 4px rgba(239,68,68,0.15)",
                    }}
                    title="Chưa xem"
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
