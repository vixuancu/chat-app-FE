# Hướng dẫn Code Frontend

## Nguyên tắc chung

- Code phải rõ ràng, dễ đọc, dễ bảo trì.
- Tách biệt UI (component) và logic (hook, service).
- Luôn dùng TypeScript để tránh lỗi runtime.
- Comment bằng tiếng Việt ở các đoạn quan trọng để giải thích cho
  team.

# 🏗️ Project Structure Guideline

Đây là cấu trúc thư mục chuẩn cho frontend project sử dụng **React**.  
Mục tiêu: tách biệt **Client** (người dùng cuối) và **Admin** (quản trị hệ thống), đồng thời vẫn dùng chung được các phần tái sử dụng như UI component, hooks, utils.

---

## 1. Cấu trúc thư mục tổng thể

src/
├─ client/ # Ứng dụng dành cho người dùng (Client App)
│ ├─ components/ # UI component riêng của client
│ ├─ pages/ # Các trang chính (Home, Login, Profile, Chat, ...)
│ ├─ hooks/ # Custom hooks dành riêng cho client
│ ├─ services/ # API call cho client (auth, chat, product, ...)
│ ├─ contexts/ # React Context (AuthContext, ThemeContext, ...)
│ ├─ routes/ # Định nghĩa routing riêng cho client
│ └─ AppClient.tsx # Entry point cho client
│
├─ admin/ # Ứng dụng dành cho quản trị (Admin App)
│ ├─ components/ # UI component riêng của admin (Table, DashboardCard,...)
│ ├─ pages/ # Các trang quản trị (UserManagement, ProductManagement, ...)
│ ├─ hooks/ # Custom hooks dành riêng cho admin
│ ├─ services/ # API call cho admin (user, order, report,...)
│ ├─ contexts/ # Context riêng cho admin
│ ├─ routes/ # Định nghĩa routing riêng cho admin
│ └─ AppAdmin.tsx # Entry point cho admin
│
├─ shared/ # Phần tái sử dụng giữa client và admin
│ ├─ components/ # Button, Modal, Input, Form, Layout cơ bản
│ ├─ hooks/ # Custom hooks dùng chung (useFetch, useDebounce, ...)
│ ├─ utils/ # Hàm tiện ích, validate, format date,...
│ ├─ types/ # Định nghĩa type/interface chung
│ └─ assets/ # Hình ảnh, icon, font
│
├─ index.tsx # Entry point chính (chọn load AppClient hoặc AppAdmin tùy route)
└─ routes.tsx # Config route tổng hợp

## 2. Routing định hướng

### 2.1 Client routes

- `/` → Trang chủ (Home)
- `/login` → Đăng nhập
- `/register` → Đăng ký
- `/products` → Danh sách sản phẩm
- `/profile` → Thông tin cá nhân
- `/chat` → Chat

### 2.2 Admin routes

- `/admin` → Dashboard chính
- `/admin/users` → Quản lý người dùng
- `/admin/products` → Quản lý sản phẩm
- `/admin/orders` → Quản lý đơn hàng

> ⚠️ Lưu ý: Người dùng **không được phép** truy cập `/admin/*`.  
> Admin có thể truy cập cả `/client/*` và `/admin/*`.

---

Nguyên tắc bảo mật routing

- Sử dụng **ProtectedRoute** để chặn người dùng không có quyền vào admin.
- Context/Auth service sẽ quản lý role (`user`, `admin`).
- Khi `role = admin`, admin có thể load cả 2 app (client + admin).
- Khi `role = user`, chỉ load client app.

---

Ưu điểm của cách chia này
✅ Code rõ ràng, tách biệt trách nhiệm.  
✅ Admin và Client có thể phát triển độc lập.  
✅ Shared folder giúp tái sử dụng logic/UI.  
✅ Dễ mở rộng: sau này có thể thêm **mobile/** hoặc **partner/** tương tự client/admin.

## 3. Coding Style

- Sử dụng functional component (`React.FC`).
- Luôn destructuring props.
- Dùng async/await thay vì .then.
- Tách API call sang service, không gọi API trực tiếp trong component.
- Luôn xử lý loading, success, error state.

## 4. Xử lý lỗi & try-catch

- Mọi API call phải bọc trong `try/catch`.
- Có `errorHandler` chung trong `services/errorHandler.ts` để thống
  nhất cách log & hiển thị lỗi.

Ví dụ:

```ts
import { apiClient } from "./apiClient";
import { handleApiError } from "./errorHandler";

export async function fetchBooks() {
  try {
    const res = await apiClient.get("/books");
    return res.data;
  } catch (error) {
    handleApiError(error, "Lỗi khi lấy danh sách sách");
    throw error;
  }
}
```

## 5. UI/UX

- Loading: Luôn hiển thị spinner hoặc skeleton khi chờ dữ liệu.
- Empty state: Hiển thị thông báo khi không có dữ liệu.
- Error state: Hiển thị thông báo lỗi thân thiện với người dùng.
- có thông báo thành công khi cần (ví dụ: thêm/sửa/xoá thành công).hoặc các trường hợp cần thông báo khác .... ví dụ logout

## 6. Quy ước đặt tên

- Component: PascalCase (e.g., `BookList`, `ChatBox`).
- Hook: camelCase bắt đầu bằng `use` (e.g., `useAuth`, `useChat`).
- File: PascalCase cho component, camelCase cho utility.

## 7. Best Practices

- Code nhỏ gọn, mỗi component chỉ làm 1 nhiệm vụ.
- Tái sử dụng component càng nhiều càng tốt.
- Props phải có type rõ ràng.
- State management: dùng React Context hoặc Zustand/Redux nếu phức
  tạp.
- Routing: tách biệt route client và admin.
- Ưu tiên responsive design (mobile-first).

## 8. Ví dụ minh hoạ

```tsx
// components/books/BookList.tsx
import React from "react";
import { Book } from "@/types/book";

type Props = {
  books: Book[];
};

export const BookList: React.FC<Props> = ({ books }) => {
  if (!books.length) return <p>Không có sách nào.</p>;

  return (
    <ul>
      {books.map((book) => (
        <li key={book.id}>{book.title}</li>
      ))}
    </ul>
  );
};
```

---

👉 Với tài liệu này, GitHub Copilot có thể dựa vào để gợi ý code nhất
quán hơn cho toàn bộ dự án frontend.
