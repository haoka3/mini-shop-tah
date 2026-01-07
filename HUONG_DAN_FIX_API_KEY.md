# Hướng dẫn khắc phục lỗi Firebase API Key

## Lỗi: `auth/api-key-not-valid`

## ⚡ CÁCH KHẮC PHỤC NHANH:

### Phương án 1: Cập nhật trực tiếp trong firebase.js (Nhanh nhất)

1. **Lấy lại API Key từ Firebase Console:**
   - Truy cập: https://console.firebase.google.com/
   - Chọn project **mini-shop-tah**
   - Vào **Project Settings** (biểu tượng bánh răng ⚙️ ở góc trên bên trái)
   - Cuộn xuống phần **Your apps** → chọn app Web của bạn
   - Copy lại toàn bộ thông tin trong `firebaseConfig`

2. **Mở file `src/firebase.js`** và thay thế các giá trị:
   ```javascript
   const firebaseConfig = {
     apiKey: "DÁN_API_KEY_MỚI_VÀO_ĐÂY",
     authDomain: "mini-shop-tah.firebaseapp.com",
     projectId: "mini-shop-tah",
     messagingSenderId: "492904606460",
     appId: "1:492904606460:web:24bd9783b4edea97e60579",
   };
   ```

3. **Lưu file và restart server:**
   ```bash
   # Dừng server (Ctrl+C) và chạy lại:
   npm run dev
   ```

---

### Phương án 2: Sử dụng biến môi trường (An toàn hơn)

1. **Tạo file `.env.local`** trong thư mục gốc của project:
   ```
   VITE_FIREBASE_API_KEY=API_KEY_MỚI_CỦA_BẠN
   VITE_FIREBASE_AUTH_DOMAIN=mini-shop-tah.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=mini-shop-tah
   VITE_FIREBASE_MESSAGING_SENDER_ID=492904606460
   VITE_FIREBASE_APP_ID=1:492904606460:web:24bd9783b4edea97e60579
   ```

2. **Restart server** để áp dụng thay đổi

---

## 🔍 KIỂM TRA API KEY RESTRICTIONS (Nếu vẫn lỗi)

1. Vào **Google Cloud Console**: https://console.cloud.google.com/
2. Chọn project **mini-shop-tah**
3. Vào **APIs & Services** → **Credentials**
4. Tìm API Key của bạn (search theo API Key string)
5. Click vào API Key để mở settings
6. Kiểm tra phần **API restrictions**:
   - ✅ Nếu có restrictions, đảm bảo **Firebase Authentication API** được bật
   - ✅ Hoặc tạm thời đặt **Don't restrict key** để test
7. Kiểm tra phần **Application restrictions**:
   - ✅ Nếu đang chạy localhost, đảm bảo **HTTP referrers** bao gồm:
     - `http://localhost:*`
     - `http://127.0.0.1:*`
     - Domain production của bạn (nếu có)

---

## ✅ KIỂM TRA FIREBASE AUTHENTICATION

1. Vào Firebase Console → **Authentication**
2. Đảm bảo **Sign-in method** đã bật **Email/Password**
3. Nếu chưa bật:
   - Click vào **Email/Password**
   - Bật **Enable**
   - Click **Save**

---

## 👤 TẠO TÀI KHOẢN ADMIN (Nếu chưa có)

1. Vào Firebase Console → **Authentication** → **Users**
2. Click **Add user**
3. Nhập email và mật khẩu cho admin
4. Click **Add user**
5. Lưu lại thông tin để dùng đăng nhập

---

## 🛡️ LƯU Ý BẢO MẬT:

- ⚠️ Không commit API key vào Git public
- ✅ File `.env.local` đã được thêm vào `.gitignore` (an toàn)
- ✅ Nên giới hạn API key theo domain trong production

---

## 📝 TÓM TẮT CÁC BƯỚC:

1. ✅ Lấy API Key mới từ Firebase Console
2. ✅ Cập nhật vào `firebase.js` hoặc `.env.local`
3. ✅ Kiểm tra API Key restrictions (nếu cần)
4. ✅ Bật Email/Password authentication
5. ✅ Tạo tài khoản admin
6. ✅ Restart server và test lại
