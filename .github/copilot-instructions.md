# Nguyên tắc làm việc cho AI Assistant

Mục tiêu của file này là đặt ra các quy tắc cốt lõi để đảm bảo mọi phản hồi và hành động đều dựa trên tư duy phản biện, thực tế và phục vụ đúng yêu cầu.

---

### 1. Nguyên tắc Tư duy Cốt lõi

Trước khi viết bất kỳ dòng code nào, hãy tuân thủ các nguyên tắc sau:

- **Tư duy Phản biện (Critical Thinking):**

  - Luôn đặt câu hỏi "Tại sao?" và "Nếu... thì sao?" để lường trước các vấn đề tiềm ẩn hoặc trường hợp biên (edge cases).
  - Nếu yêu cầu không rõ ràng hoặc có thể gây ra lỗi ngầm, **hãy đặt câu hỏi làm rõ** thay vì đưa ra giả định.
  - Đánh giá các giải pháp khác nhau, nêu rõ ưu và nhược điểm (trade-offs) về hiệu năng, bảo mật và độ phức tạp trước khi chọn một.
  - luôn chú ý những liên query liên quan đến database làm sao tạo ra các hàm học query tối ưu hiệu năng nhất.

- **Tư duy Thực tế (Practical Thinking):**
  - **Ưu tiên hàng đầu là sự nhất quán.** Code mới phải tuân thủ nghiêm ngặt style, convention và kiến trúc đã có trong dự án.
  - Viết code đơn giản, dễ hiểu và dễ bảo trì. Tránh các giải pháp phức tạp không cần thiết (over-engineering).
  - Luôn cân nhắc về bảo mật (security) và hiệu năng (performance) trong mọi giải pháp được đề xuất.

---

### 2. Quy trình Làm việc Bắt buộc

- **Hành động trước, Giải thích sau:**
  - **Chỉ thực hiện nhiệm vụ được yêu cầu.** Hoàn thành việc code, sửa lỗi, hoặc refactor trước.
  - **Tuyệt đối không tự ý tạo file tài liệu (.md, docs) hoặc viết giải thích** nếu không có yêu cầu rõ ràng từ tôi.
  - Khi được yêu cầu viết tài liệu hoặc giải thích, hãy thực hiện việc đó **sau khi** đã hoàn thành và kiểm tra xong phần code.

---

### 3. Architecture & Project Structure

#### Tech Stack

- **Frontend**: React 18 + TypeScript (strict mode)
- **Styling**: TailwindCSS
- **Routing**: React Router v6
- **Forms**: React Hook Form (for optimal UX)
- **Real-time**: WebSocket for chat
- **API**: Axios for REST endpoints
- **State**: Custom hooks (`useAuth`, `useMessages`, `useRooms`, `useWebSocket`)

#### Directory Structure

```
src/
├── admin/          # Admin panel (components, pages, routes)
├── client/         # Client app (components, pages, routes)
├── shared/         # Shared resources
    ├── components/ # Reusable UI components
    ├── hooks/      # Custom hooks
    ├── services/   # API services & types
    └── utils/      # Utilities & constants
```

#### Path Aliases (configured in tsconfig.app.json)

```typescript
@/*          → ./src/*
@client/*    → ./src/client/*
@admin/*     → ./src/admin/*
@shared/*    → ./src/shared/*
@/assets/*   → ./src/assets/*
```

---

### 4. Best Practices & Patterns

#### Form Handling - CRITICAL UX RULE

**NEVER use `setTimeout` before navigation after form submission!**

✅ **DO:**

```tsx
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

const onSubmit = async (data: FormData) => {
  try {
    await apiCall(data);
    navigate("/success", { replace: true }); // Immediate navigation
  } catch (error) {
    setError(error.message);
  }
};

return (
  <form onSubmit={handleSubmit(onSubmit)}>
    <input {...register("field", { required: "Error message" })} />
    {errors.field && <p>{errors.field.message}</p>}
    <button disabled={isSubmitting}>
      {isSubmitting ? "Loading..." : "Submit"}
    </button>
  </form>
);
```

❌ **DON'T:**

```tsx
// BAD: Delays navigation, poor UX
setTimeout(() => navigate('/success'), 2000);

// BAD: Manual state management instead of react-hook-form
const [field, setField] = useState('');
onChange={(e) => setField(e.target.value)}
```

#### WebSocket Integration

- Centralized in `src/shared/hooks/useWebSocket.ts`
- Automatic reconnection with exponential backoff
- Queue pending operations when disconnected
- Always cleanup on unmount

#### Component Patterns

- Use functional components + hooks
- TailwindCSS utility classes only
- `AdminLayout` for admin pages
- `MainApp` for client entry point
- Place shared components in `src/shared/components`

#### API Integration

- Define endpoints in `src/shared/services/api.ts`
- Types in `src/shared/services/types.ts`
- Consistent error handling with toast notifications

---

### 5. Developer Workflows

#### Development

```bash
npm run dev          # Start dev server (port 3000)
lsof -i :3000       # Check port usage
kill -9 <PID>       # Kill process
```

#### TailwindCSS

```bash
npx @tailwindcss/upgrade  # Upgrade TailwindCSS
```

---

### 6. Common Pitfalls to Avoid

1. **Form submissions causing page reload** → Use `handleSubmit(onSubmit)` from react-hook-form
2. **Delayed navigation with setTimeout** → Navigate immediately after success
3. **Manual form state management** → Use react-hook-form's `register` and validation
4. **Missing loading states** → Always show `isSubmitting` state in forms
5. **Circular dependencies** → Follow directory structure strictly
6. **Not cleaning up WebSocket connections** → Always return cleanup function

---

### 7. Example Implementations

See the following files for reference implementations:

- Forms: `src/client/components/auth/LoginForm.tsx`
- Modals: `src/shared/components/modals/CreateRoomModal.tsx`
- WebSocket: `src/shared/hooks/useWebSocket.ts`
- Real-time updates: `src/shared/hooks/useMessages.ts`
