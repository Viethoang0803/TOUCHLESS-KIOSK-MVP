# Touchless Kiosk

Ứng dụng web kiosk điều khiển bằng cử chỉ bàn tay qua webcam — không cần chạm màn hình, chuột hay bàn phím. Toàn bộ xử lý chạy phía client; không gửi video hoặc hình ảnh lên server.

## Mục tiêu

- Điều khiển con trỏ ảo bằng đầu ngón trỏ (MediaPipe Hand Landmarker)
- Chọn nút bằng **dwell selection** (giữ cursor ~800ms)
- Duyệt danh mục sản phẩm demo, xem chi tiết, hiển thị QR liên hệ
- Tự quay về màn hình chờ sau 30 giây không tương tác

## Kiến trúc tổng quan

```
src/
├── vision/          # Camera, MediaPipe, landmark utils
├── gestures/        # Point detection, gesture stabilization
├── interaction/     # Smoothing, mapping, hit test, dwell
├── kiosk/           # Session, inactivity, logging
├── components/      # UI: cursor, buttons, debug panel
├── screens/         # Idle, catalog, product, contact, test
├── hooks/           # React hooks kết nối engine
└── config/          # Cấu hình tập trung
```

Luồng xử lý mỗi frame:

1. Webcam → MediaPipe Hand Landmarker (21 landmarks)
2. Point detector + stabilizer (4 frame)
3. Map tọa độ (mirror X, active region) → EMA smoothing
4. Hit test → dwell progress → selection

## Yêu cầu môi trường

- Node.js 18+
- Chrome hoặc Chromium (khuyến nghị)
- Webcam
- Quyền truy cập camera

## Cài đặt

```bash
npm install
```

## Tải model MediaPipe (bắt buộc)

Tải file `hand_landmarker.task` và đặt vào `public/models/`:

```bash
curl -L -o public/models/hand_landmarker.task "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task"
```

Hoặc tải thủ công từ [MediaPipe Hand Landmarker](https://developers.google.com/mediapipe/solutions/vision/hand_landmarker).

## Chạy ứng dụng

```bash
npm run dev
```

Mở URL hiển thị trong terminal (thường `http://localhost:5173`).

## Build production

```bash
npm run build
npm run preview
```

## Deploy lên Netlify

Project có sẵn `netlify.toml`:

- **Build command:** `npm run build`
- **Publish directory:** `dist`

Sau khi import repo trên Netlify, deploy sẽ tự build ra JavaScript production. **Không** deploy thư mục gốc (source `.tsx`) — trình duyệt không chạy được file TypeScript trực tiếp.

Kiểm tra deploy thành công: mở site → View Source → phải thấy `<script src="/assets/index-....js">`, **không** phải `/src/main.tsx`.

### Test trên iPhone

1. Public site trên Netlify (Make public)
2. Mở URL HTTPS trên Safari
3. Bấm **Bắt đầu** → cho phép Camera
4. Giơ ngón trỏ để điều khiển

## Chạy unit test

```bash
npm run test
```

## Cấp quyền webcam

1. Mở ứng dụng trong Chrome/Chromium
2. Trình duyệt sẽ hỏi quyền camera — chọn **Allow**
3. Nếu bị từ chối: nhấn biểu tượng khóa/camera trên thanh địa chỉ → cho phép camera → **Thử lại**

## Debug mode

- Nhấn phím **D** hoặc nút **Debug** trên màn hình Idle
- Xem FPS, inference latency, tọa độ cursor, gesture, dwell progress
- Bật/tắt camera preview và landmark overlay
- Chỉnh smoothing alpha, dwell duration
- Xem và tải interaction logs (JSON)

Cài đặt debug được lưu vào `localStorage`.

## Target test (3×3)

- Truy cập `/test` hoặc mở từ Debug Panel
- Chọn lần lượt: **5 → 1 → 9 → 3 → 7 → 5**
- Xem báo cáo thời gian, độ chính xác, FPS, inference latency

## Cấu hình

File `src/config/touchless-config.ts`:

| Tham số | Mặc định | Ý nghĩa |
|---------|----------|---------|
| `smoothingAlpha` | 0.25 | Hệ số làm mượt EMA (cao = ít trễ, nhiều rung) |
| `dwellDurationMs` | 800 | Thời gian giữ cursor để chọn |
| `selectionCooldownMs` | 600 | Cooldown sau khi chọn |
| `gestureEnterFrames` | 4 | Frame liên tục để vào POINTING |
| `inactivityTimeoutMs` | 30000 | Timeout quay về Idle |
| `activeRegion` | 0.15–0.85 / 0.15–0.8 | Vùng điều khiển trong khung camera |

## Kiểm tra thủ công

1. **Camera**: Màn Idle hiển thị trạng thái camera xanh
2. **Landmarks**: Bật Debug → landmark overlay trên preview
3. **Cursor**: Giơ bàn tay, duỗi ngón trỏ → cursor xuất hiện và theo ngón trỏ
4. **Mirror X**: Di chuyển tay sang trái → cursor sang phải màn hình
5. **Dwell**: Giữ cursor trên nút ~0.8s → vòng progress đầy → nút kích hoạt
6. **Inactivity**: Không tương tác 30s → quay về Idle

## Lỗi thường gặp

### Camera không mở

- Kiểm tra quyền camera trong trình duyệt
- Đóng ứng dụng khác đang dùng webcam
- Nhấn **Thử lại camera** trên banner lỗi

### Model không load

- Kiểm tra file `public/models/hand_landmarker.task` tồn tại
- Xem tab Network: request `/models/hand_landmarker.task` phải trả 200
- Tải lại model theo hướng dẫn trên

### Cursor không xuất hiện

- Chỉ hiện khi gesture **POINTING** (ngón trỏ duỗi, 3 ngón kia gập)
- Giữ tay trong vùng active region (giữa khung camera)
- Bật Debug để xem trạng thái gesture

### FPS thấp

- Đóng tab không cần thiết
- Thử trình duyệt Chromium mới
- Model tự fallback CPU nếu GPU delegate lỗi

## Quyền riêng tư

- Video webcam **không** được upload lên server
- Interaction logger chỉ ghi sự kiện kỹ thuật (không lưu video/landmark đầy đủ)
- Logs lưu trong bộ nhớ trình duyệt, có thể tải/xóa từ Debug Panel

## Giới hạn MVP

- Chỉ nhận diện 1 bàn tay
- Chỉ gesture pointing (không pinch/click)
- Không điều khiển con trỏ hệ điều hành
- WASM load từ CDN (cần internet lần đầu)
- Model phải tải thủ công vào `public/models/`

## Công nghệ

- React + TypeScript + Vite
- @mediapipe/tasks-vision (Hand Landmarker)
- Vitest (unit test)
- qrcode (tạo QR client-side)
