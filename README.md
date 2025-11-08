# 💬 Real-time Chat Application# 💬 Real-time Chat Application# 💬 Real-time Chat Application# 💬 Real-time Chat Application

Ứng dụng chat real-time với **React 19**, **TypeScript**, và **WebSocket**.

---Ứng dụng chat thời gian thực với **React 19**, **TypeScript**, và **WebSocket**. production-ready chat application built with **React 19**, **TypeScript**, and **WebSocket** for real-time messaging. Features include message caching, optimistic UI updates, typing indicators, and a responsive design with **TailwindCSS**.

## 🎯 Tính năng

- ✅ Real-time messaging qua WebSocket---## 🚀 Tech Stack

- ✅ Message cache - chuyển phòng tức thì

- ✅ Optimistic UI - tin nhắn hiện ngay 

- ✅ Typing indicator

- ✅ Auto reconnect khi mất kết nối## 🎯 Chức năng chính### Frontend------

- ✅ Authentication (JWT)

- ✅ Responsive design

---### ✅ Đã hoàn thành- **React 19.1.1** + **TypeScript** (Strict mode)

## 🚀 Tech Stack- **Real-time Messaging** - Nhắn tin thời gian thực qua WebSocket

- **React 19** + **TypeScript** + **Vite**- **Message Cache** - Chuyển phòng chat tức thì không cần reload- **Vite 7.1.2** - Build tool nhanh với Hot Module Replacement

- **TailwindCSS** - styling

- **React Router v6** - routing- **Optimistic UI** - Tin nhắn hiện ngay với status (⏳ → ✓ → ✓✓)

- **React Hook Form** - forms

- **Axios** + **WebSocket** - API- **Typing Indicator** - Hiển thị khi người dùng đang gõ- **TailwindCSS** - Utility-first CSS framework

- **Docker** + **nginx** - production (~80MB)

- **Auto Reconnect** - Tự động kết nối lại khi mất kết nối

---

- **Authentication** - Đăng ký, đăng nhập với JWT- **React Router v6** - Client-side routing<a name="english"></a>## 🚀 Tech Stack

## ⚙️ Quick Start

- **Room Management** - Tạo, tham gia, quản lý phòng chat

```bash

# Install- **Responsive Design** - Tương thích mobile & desktop- **React Hook Form 7.66.0** - Xử lý form hiệu năng cao

npm install



# Configure

cp .env.example .env### ⏳ Đang phát triển (cần Backend API)- **Axios** - HTTP client cho REST APIs## 🇬🇧 English Version



# Run dev- Infinite Scroll - Tải thêm tin nhắn khi cuộn

npm run dev  # → http://localhost:3000

- Unread Count - Đếm tin nhắn chưa đọc- **WebSocket** - Real-time bidirectional communication

# Docker

./docker-build.sh  # → http://localhost:3000- File Upload - Gửi ảnh/file


```
## Khi nào cần chạy lại script docker-build.sh để deploy:
✅ Cần chạy lại khi:
Thay đổi source code

Thêm tính năng mới
Sửa bug
Cập nhật UI/UX
Cập nhật dependencies

Thay đổi package.json
Cài thêm package mới
Update version của package
Thay đổi cấu hình

Chỉnh sửa .env file
Thay đổi vite.config.ts
Cập nhật Dockerfile hoặc nginx.conf
Tối ưu hóa build

Thay đổi build settings
Cập nhật Docker configuration
-❌ Không cần chạy lại khi:
Chỉ thay đổi development code (chưa commit)
Chỉ chạy npm run dev để test locally
Chỉ thay đổi documentation (README.md)
Chỉ thay đổi .gitignore hoặc config files không ảnh hưởng build
# Quick deploy
./docker-build.sh

# Hoặc manual rebuild
docker-compose down
docker-compose up -d --build