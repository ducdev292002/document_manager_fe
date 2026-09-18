# Document Manager - Frontend

React (Vite) + TailwindCSS cho hệ thống Quản lý Tài liệu Cá nhân. Xem repo backend tại: https://github.com/ducdev292002/document_manager_be

## Chạy local

```bash
npm install
npm run dev
```

Mặc định gọi API tại `http://localhost:5000/api` (xem [`.env`](.env) / [`.env.example`](.env.example), sửa `VITE_API_URL` nếu backend chạy ở địa chỉ khác).

## Deploy lên Vercel

1. Vào [vercel.com](https://vercel.com) → **Add New → Project** → import repo GitHub này (`document_manager_fe`)
2. Vercel tự nhận diện Vite, không cần chỉnh Build/Output settings
3. Vào **Settings → Environment Variables** thêm:
   - `VITE_API_URL` = `/api` (đường dẫn tương đối — xem lý do bên dưới, **không** phải URL đầy đủ của Render)
4. Mở [vercel.json](vercel.json), sửa `destination` của rule `/api/:path*` thành đúng URL backend Render của bạn (VD: `https://document-manager-be.onrender.com/api/:path*`), commit + push lại
5. Deploy. File [vercel.json](vercel.json) cũng đã cấu hình rewrite để React Router hoạt động đúng khi refresh trang/deep-link (VD: vào thẳng `/dashboard/folder/abc123`)
6. Sau khi có URL Vercel (VD: `https://document-manager-fe.vercel.app`), quay lại backend trên Render, cập nhật biến `CLIENT_URL` = đúng URL này rồi deploy lại backend

### Vì sao gọi API qua đường dẫn tương đối `/api` thay vì domain Render trực tiếp?

`vercel.json` proxy toàn bộ request `/api/*` sang backend Render ngay tại tầng edge của Vercel, nên **trình duyệt chỉ thấy request gọi về đúng domain Vercel** (không phải domain Render) → cookie đăng nhập trở thành cookie **cùng domain (first-party)** thay vì cross-site. Nếu gọi thẳng domain Render (`https://document-manager-be.onrender.com/api`), nhiều trình duyệt (đặc biệt là **tab ẩn danh**) sẽ chặn cookie này vì xem nó là cookie bên thứ 3 — dẫn đến hiện tượng đăng nhập "thành công" nhưng ngay sau đó bị văng ra vì phiên không được lưu.

⚠️ Thứ tự deploy: nên deploy **backend trước** để có URL, điền vào `destination` trong `vercel.json`; sau khi frontend có URL, quay lại cập nhật `CLIENT_URL` bên backend và redeploy backend một lần nữa.
