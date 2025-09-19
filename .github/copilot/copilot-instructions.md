# Hướng dẫn Code Frontend

## 1. Nguyên tắc chung

- Code phải rõ ràng, dễ đọc, dễ bảo trì.
- Tách biệt UI (component) và logic (hook, service).
- Luôn dùng TypeScript để tránh lỗi runtime.
- Comment bằng tiếng Việt ở các đoạn quan trọng để giải thích cho
  team.

## 2. Cấu trúc thư mục frontend chuẩn

    src/
    ├─ components/        # Các UI component tái sử dụng
    │  ├─ common/         # Button, Modal, Input, ...
    │  ├─ layout/         # Header, Sidebar, Footer
    │
    ├─ pages/             # Các trang chính (Home, Login, Chat, Admin,...)
    │
    ├─ hooks/             # Custom hooks (useAuth, useChat, useFetch,...)
    │
    ├─ services/          # API call, tách biệt logic gọi backend
    │
    ├─ contexts/          # React Context (AuthContext, ThemeContext,...)
    │
    ├─ utils/             # Hàm tiện ích, validate, format date, ...
    │
    ├─ types/             # Định nghĩa type, interface dùng chung
    │
    ├─ assets/            # Hình ảnh, icon, font, ...
    │
    └─ App.tsx            # Entry point chính

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
