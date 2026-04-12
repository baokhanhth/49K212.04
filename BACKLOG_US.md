# BACKLOG - CURRENT USER STORY

## US-04 - Khôi phục mật khẩu

### User story
Là một người dùng, tôi muốn khôi phục mật khẩu qua email xác thực để tôi lấy lại quyền truy cập khi quên mật khẩu.

## Mục tiêu
Cho phép người dùng lấy lại mật khẩu khi quên bằng cách:
1. nhập email
2. hệ thống gửi mã OTP qua email
3. người dùng nhập OTP và mật khẩu mới
4. hệ thống cập nhật mật khẩu mới

## Phạm vi triển khai
Chỉ triển khai backend tối giản cho chức năng khôi phục mật khẩu.

## Flow nghiệp vụ
### Bước 1
Người dùng gửi email khôi phục mật khẩu.

### Bước 2
Hệ thống kiểm tra email có tồn tại hay không.

### Bước 3
Nếu email tồn tại, hệ thống sinh mã OTP.

### Bước 4
Hệ thống gửi OTP qua email cho người dùng.

### Bước 5
Người dùng nhập:
- email
- otp
- mật khẩu mới

### Bước 6
Hệ thống kiểm tra:
- email hợp lệ
- otp đúng
- otp chưa hết hạn
- otp chưa được sử dụng

### Bước 7
Nếu hợp lệ, hệ thống cập nhật mật khẩu mới.

## API dự kiến
### 1. Gửi OTP
`POST /api/auth/forgot-password`

Body:
```json
{
  "email": "user@example.com"
}