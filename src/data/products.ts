export interface Product {
  id: string;
  name: string;
  shortDescription: string;
  description: string;
  features: string[];
  image: string;
  color: string;
}

export const PRODUCTS: Product[] = [
  {
    id: 'ai-document-management',
    name: 'AI Document Management',
    shortDescription: 'Quản lý tài liệu thông minh với AI',
    description:
      'Giải pháp quản lý tài liệu doanh nghiệp tích hợp AI, tự động phân loại, trích xuất và tìm kiếm thông minh.',
    features: [
      'OCR đa ngôn ngữ',
      'Phân loại tài liệu tự động',
      'Tìm kiếm ngữ nghĩa',
      'Quy trình phê duyệt số',
    ],
    image: '/images/product-doc.svg',
    color: '#3b82f6',
  },
  {
    id: 'smart-import',
    name: 'Smart Import',
    shortDescription: 'Nhập liệu thông minh từ mọi nguồn',
    description:
      'Tự động hóa quy trình nhập liệu từ email, scan, API với khả năng xác thực và chuẩn hóa dữ liệu.',
    features: [
      'Nhập liệu đa định dạng',
      'Xác thực dữ liệu tự động',
      'Tích hợp ERP/CRM',
      'Báo cáo chất lượng dữ liệu',
    ],
    image: '/images/product-import.svg',
    color: '#10b981',
  },
  {
    id: 'ai-assistant',
    name: 'AI Assistant',
    shortDescription: 'Trợ lý AI cho doanh nghiệp',
    description:
      'Trợ lý ảo hỗ trợ nhân viên tra cứu thông tin, trả lời câu hỏi và thực hiện tác vụ nhanh chóng.',
    features: [
      'Hỏi đáp tự nhiên',
      'Tích hợp kiến thức nội bộ',
      'Đa kênh giao tiếp',
      'Học từ phản hồi người dùng',
    ],
    image: '/images/product-assistant.svg',
    color: '#8b5cf6',
  },
  {
    id: 'knowledge-graph',
    name: 'Knowledge Graph',
    shortDescription: 'Đồ thị tri thức doanh nghiệp',
    description:
      'Kết nối dữ liệu phân tán thành mạng tri thức, giúp khám phá mối quan hệ và insight ẩn.',
    features: [
      'Liên kết thực thể tự động',
      'Trực quan hóa mối quan hệ',
      'Truy vấn đồ thị',
      'Cập nhật thời gian thực',
    ],
    image: '/images/product-graph.svg',
    color: '#f59e0b',
  },
  {
    id: 'ai-analytics',
    name: 'AI Analytics',
    shortDescription: 'Phân tích dữ liệu nâng cao',
    description:
      'Nền tảng phân tích dữ liệu với AI, dự báo xu hướng và đề xuất hành động cho lãnh đạo.',
    features: [
      'Dashboard tương tác',
      'Dự báo ML',
      'Cảnh báo thông minh',
      'Xuất báo cáo tự động',
    ],
    image: '/images/product-analytics.svg',
    color: '#ef4444',
  },
  {
    id: 'supplier-intelligence',
    name: 'Supplier Intelligence',
    shortDescription: 'Thông tin nhà cung cấp thông minh',
    description:
      'Đánh giá và giám sát nhà cung cấp bằng AI, phân tích rủi ro và tối ưu chuỗi cung ứng.',
    features: [
      'Scoring nhà cung cấp',
      'Phân tích rủi ro',
      'Theo dõi hiệu suất',
      'Đề xuất thay thế',
    ],
    image: '/images/product-supplier.svg',
    color: '#06b6d4',
  },
];

export function getProductById(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id);
}
