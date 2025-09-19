# Reorganization Checklist

## Overview

Frontend được tổ chức thành 3 phần: `client/`, `admin/`, `shared/`

## Current Status

- ✅ **Step A**: Tạo folders và re-export wrappers
- ✅ **Step B**: AppClient wrapper
- ✅ **Step C**: Admin skeleton
- ✅ **Step D**: Shared ProtectedRoute và useAuth stub
- ✅ **Step E**: TSConfig aliases
- ✅ **Step F**: Checklist docs

## Testing Checklist

### Manual Tests

```bash
# Build test
npm run build

# Type check
npm run build -- --mode=production

# Dev server
npm run dev
```

### Functionality Tests

- [ ] Login/Register flow hoạt động
- [ ] Chat functionality hoạt động
- [ ] Logout redirect hoạt động
- [ ] Toast notifications hiển thị
- [ ] Protected routes hoạt động

## Next Steps (TODO_REORG)

### Phase 2: Gradual Migration

1. **Client App**: Từ từ migrate imports từ `src/` sang `@client/`
2. **Admin Integration**: Tích hợp admin routes vào main app
3. **Shared Optimization**: Move common utilities vào shared

### Phase 3: Clean Up

1. Remove original files sau khi đã migrate hết
2. Update all imports to use new aliases
3. Clean up TODO_REORG comments

## Revert Instructions

Nếu cần revert về trạng thái cũ:

```bash
# Quay về branch chính
git checkout dev

# Hoặc reset hard về commit trước khi bắt đầu reorg
git reset --hard <commit-hash>
```

## Architecture Overview

```
src/
├── client/          # Client-facing app
│   ├── components/  # Re-exports from ../components
│   ├── pages/       # Re-exports from ../pages
│   ├── hooks/       # Re-exports from ../hooks
│   └── AppClient.tsx
├── admin/           # Admin panel
│   └── AppAdmin.tsx # Admin skeleton
├── shared/          # Common utilities
│   ├── components/  # Shared components like ProtectedRoute
│   ├── hooks/       # Shared hooks like useAuth
│   ├── services/    # Re-exports from ../services
│   └── utils/       # Re-exports from ../utils
└── [original structure remains unchanged]
```

## Notes

- Hiện tại chỉ là re-export wrappers, chưa di chuyển code thực tế
- Original structure vẫn intact để đảm bảo app hoạt động bình thường
- TSConfig aliases đã được setup cho `@client/*`, `@admin/*`, `@shared/*`
