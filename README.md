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
   - `VITE_API_URL` = URL backend Render + `/api` (VD: `https://document-manager-api.onrender.com/api`)
4. Deploy. File [vercel.json](vercel.json) đã cấu hình rewrite để React Router hoạt động đúng khi refresh trang/deep-link (VD: vào thẳng `/dashboard/folder/abc123`)
5. Sau khi có URL Vercel (VD: `https://document-manager-fe.vercel.app`), quay lại backend trên Render, cập nhật biến `CLIENT_URL` = đúng URL này rồi deploy lại backend

⚠️ Thứ tự deploy: nên deploy **backend trước** để có URL, điền vào `VITE_API_URL` của frontend; sau khi frontend có URL, quay lại cập nhật `CLIENT_URL` bên backend và redeploy backend một lần nữa.
