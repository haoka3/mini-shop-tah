import { useState } from "react";
import { db } from "../firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

export default function Admin() {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const save = async () => {
    if (!name || !price || !imageUrl) {
      alert("Vui lòng nhập đủ: Link ảnh + Tên + Giá");
      return;
    }

    await addDoc(collection(db, "products"), {
      name: name.trim(),
      price: Number(price),
      imageUrl: imageUrl.trim(),
      createdAt: serverTimestamp(),
    });

    setName("");
    setPrice("");
    setImageUrl("");
    alert("Đã đăng sản phẩm");
  };

  return (
    <div>
      <h2>Đăng sản phẩm</h2>

      <input
        placeholder="Link ảnh (https://...)"
        value={imageUrl}
        onChange={(e) => setImageUrl(e.target.value)}
        style={{ width: "100%", marginBottom: 8 }}
      />

      {imageUrl ? (
        <img
          src={imageUrl}
          alt="preview"
          style={{ width: 160, height: 160, objectFit: "cover", borderRadius: 8, marginBottom: 8 }}
          onError={(e) => (e.currentTarget.style.display = "none")}
        />
      ) : null}

      <input
        placeholder="Tên sản phẩm"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={{ width: "100%", marginBottom: 8 }}
      />

      <input
        placeholder="Giá"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        style={{ width: "100%", marginBottom: 8 }}
      />

      <button onClick={save}>Lưu</button>
    </div>
  );
}
